<?php
/**
 * Komicrew — Admin Control Center API Endpoint
 * Provides full database operations for:
 * - Metrics & Statistics
 * - Catalog Listing, Publishing & Status Toggling
 * - User Role & Premium Tier Access Management
 * - Trending & Hero Visibility Management
 * - All Uploaded Images/Panels review & deletion
 * - Taxonomy Management
 */

declare(strict_types=1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';

$action = $_GET['action'] ?? ($_POST['action'] ?? 'stats');
$pdo    = DB::connect();

try {
    // 1. Live Platform Metrics
    if ($action === 'stats') {
        $totalComics = (int)$pdo->query("SELECT COUNT(*) FROM comics")->fetchColumn();
        $totalUsers  = (int)$pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
        $totalPanels = (int)$pdo->query("SELECT COUNT(*) FROM panels")->fetchColumn();
        $proUsers    = (int)$pdo->query("SELECT COUNT(*) FROM users WHERE tier IN ('Pro', 'Creator', 'Superadmin')")->fetchColumn();
        $trendingCnt = (int)$pdo->query("SELECT COUNT(*) FROM comics WHERE is_trending = 1 OR status = 'featured'")->fetchColumn();

        $heroStmt = $pdo->query("SELECT comic_slug FROM hero_spotlights ORDER BY id DESC LIMIT 1");
        $heroSlug = $heroStmt ? $heroStmt->fetchColumn() : null;

        jsonSuccess([
            'stats' => [
                'total_comics'   => $totalComics,
                'total_users'    => $totalUsers,
                'total_panels'   => $totalPanels,
                'pro_users'      => $proUsers,
                'trending_count' => $trendingCnt,
                'trending_hero'  => $heroSlug ?: 'None set',
                'system_status'  => 'online'
            ]
        ]);
    }

    // 2. Full Admin Catalog
    if ($action === 'catalog') {
        $stmt = $pdo->query("SELECT * FROM comics ORDER BY id DESC");
        $comics = $stmt->fetchAll();
        jsonSuccess(['comics' => $comics]);
    }

    // 3. Toggle Status (published / featured / draft)
    if ($action === 'toggle_status') {
        $input = getJsonInput();
        $comicId = $input['comic_id'] ?? null;
        $status = $input['status'] ?? 'published';

        if (!$comicId) {
            jsonError('Missing comic identifier.');
        }

        $stmt = $pdo->prepare("UPDATE comics SET status = ? WHERE slug = ? OR id = ?");
        $stmt->execute([$status, $comicId, $comicId]);

        jsonSuccess([
            'comic_id'   => $comicId,
            'new_status' => $status
        ], "Status updated to " . strtoupper($status));
    }

    // 4. Toggle Trending Visibility on Trending/Hero Page
    if ($action === 'toggle_trending') {
        $input = getJsonInput();
        $comicId = $input['comic_id'] ?? null;
        $isTrending = (int)($input['is_trending'] ?? 1);

        if (!$comicId) {
            jsonError('Missing comic identifier.');
        }

        $stmt = $pdo->prepare("UPDATE comics SET is_trending = ? WHERE slug = ? OR id = ?");
        $stmt->execute([$isTrending, $comicId, $comicId]);

        jsonSuccess([
            'comic_id'    => $comicId,
            'is_trending' => $isTrending
        ], $isTrending ? "Comic added to Trending Spotlights!" : "Comic removed from Trending.");
    }

    // 5. Set #1 Trending Hero Spotlight
    if ($action === 'set_hero') {
        $input = getJsonInput();
        $comicSlug = $input['comic_id'] ?? '';

        if (!$comicSlug) {
            jsonError('Missing comic slug.');
        }

        // Mark in hero_spotlights
        $stmt = $pdo->prepare("INSERT INTO hero_spotlights (comic_slug) VALUES (?)");
        $stmt->execute([$comicSlug]);

        // Update comics flags
        $pdo->query("UPDATE comics SET is_hero = 0");
        $upd = $pdo->prepare("UPDATE comics SET is_hero = 1, is_trending = 1, status = 'featured' WHERE slug = ? OR id = ?");
        $upd->execute([$comicSlug, $comicSlug]);

        jsonSuccess([
            'hero_comic_id' => $comicSlug
        ], "⭐ Comic '{$comicSlug}' is now the #1 Trending Hero Spotlight!");
    }

    // 6. User Management (List, Role Change, Premium Tier Access)
    if ($action === 'users') {
        $stmt = $pdo->query("SELECT id, username, email, role, tier, avatar_url, bio, created_at FROM users ORDER BY id DESC");
        $users = $stmt->fetchAll();
        jsonSuccess(['users' => $users]);
    }

    if ($action === 'update_user') {
        $input = getJsonInput();
        $userId = $input['user_id'] ?? null;
        $role   = $input['role'] ?? 'reader';
        $tier   = $input['tier'] ?? 'Free';
        $bio    = isset($input['bio']) ? trim((string)$input['bio']) : null;

        if (!$userId) {
            jsonError('Missing user ID.');
        }

        if ($bio !== null) {
            $stmt = $pdo->prepare("UPDATE users SET role = ?, tier = ?, bio = ? WHERE id = ?");
            $stmt->execute([$role, $tier, $bio, $userId]);
        } else {
            $stmt = $pdo->prepare("UPDATE users SET role = ?, tier = ? WHERE id = ?");
            $stmt->execute([$role, $tier, $userId]);
        }

        jsonSuccess([
            'user_id' => $userId,
            'role'    => $role,
            'tier'    => $tier
        ], "User permissions and Tier access updated successfully!");
    }

    if ($action === 'delete_user') {
        $input = getJsonInput();
        $userId = $input['user_id'] ?? null;
        if (!$userId || (int)$userId === 1) {
            jsonError('Cannot delete main administrator user.');
        }
        $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        jsonSuccess([], "User deleted successfully.");
    }

    // 7. Delete Comic
    if ($action === 'delete_comic') {
        $input = getJsonInput();
        $comicId = $input['comic_id'] ?? null;

        if (!$comicId) {
            jsonError('Missing comic identifier.');
        }

        $stmt = $pdo->prepare("DELETE FROM comics WHERE slug = ? OR id = ?");
        $stmt->execute([$comicId, $comicId]);

        jsonSuccess([], "Comic removed from database.");
    }

    // 8. Uploads & Gallery Management
    if ($action === 'uploads') {
        $stmt = $pdo->query("
            SELECT p.id as panel_id, p.image_url, p.panel_number, p.ai_prompt, p.created_at, c.title as comic_title, c.slug as comic_slug, c.creator
            FROM panels p
            JOIN chapters ch ON p.chapter_id = ch.id
            JOIN comics c ON ch.comic_id = c.id
            ORDER BY p.id DESC
        ");
        $panels = $stmt ? $stmt->fetchAll() : [];
        jsonSuccess(['uploads' => $panels]);
    }

    if ($action === 'delete_panel') {
        $input = getJsonInput();
        $panelId = $input['panel_id'] ?? null;
        if ($panelId) {
            $stmt = $pdo->prepare("DELETE FROM panels WHERE id = ?");
            $stmt->execute([$panelId]);
        }
        jsonSuccess([], "Panel deleted from database.");
    }

    // 9. Taxonomy Management
    if ($action === 'taxonomies') {
        $stmt = $pdo->query("SELECT * FROM taxonomies ORDER BY type, name ASC");
        $tax = $stmt ? $stmt->fetchAll() : [];
        jsonSuccess(['taxonomies' => $tax]);
    }

    if ($action === 'add_taxonomy') {
        $input = getJsonInput();
        $type = $input['type'] ?? 'genre';
        $name = trim($input['name'] ?? '');
        if ($name) {
            $stmt = $pdo->prepare("INSERT INTO taxonomies (type, name) VALUES (?, ?)");
            $stmt->execute([$type, $name]);
        }
        jsonSuccess([], "Added {$name} to {$type} taxonomies.");
    }

    if ($action === 'delete_taxonomy') {
        $input = getJsonInput();
        $taxId = $input['id'] ?? null;
        if ($taxId) {
            $stmt = $pdo->prepare("DELETE FROM taxonomies WHERE id = ?");
            $stmt->execute([$taxId]);
        }
        jsonSuccess([], "Taxonomy tag removed.");
    }

    jsonError('Unrecognized admin action.');

} catch (Exception $e) {
    jsonError("Admin action failed: " . $e->getMessage(), 500);
}
