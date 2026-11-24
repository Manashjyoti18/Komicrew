<?php
/**
 * Komicrew — Comics API Endpoint
 * Direct database access for public catalog, search, category filters, and reader chapters.
 */

declare(strict_types=1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';

session_start();

$loggedUser  = $_SESSION['user'] ?? null;
$isAdmin     = !empty($_SESSION['is_admin']) || ($loggedUser && ($loggedUser['role'] ?? '') === 'admin');
$action      = $_GET['action'] ?? 'list';
$comicId     = $_GET['id'] ?? null;
$chapterNum  = (int)($_GET['chapter'] ?? 1);
$category    = $_GET['category'] ?? null;
$genre       = $_GET['genre'] ?? null;
$style       = $_GET['style'] ?? null;
$searchQuery = $_GET['q'] ?? null;
$trending    = isset($_GET['trending']) ? (int)$_GET['trending'] : null;
$includeDrafts = isset($_GET['include_drafts']) ? (bool)$_GET['include_drafts'] : $isAdmin;

try {
    $pdo = DB::connect();

    // 1. Get Single Comic with Chapter details
    if ($action === 'get' || $comicId) {
        $stmt = $pdo->prepare("SELECT * FROM comics WHERE slug = ? OR id = ? LIMIT 1");
        $stmt->execute([$comicId, $comicId]);
        $comic = $stmt->fetch();

        if (!$comic) {
            jsonError("Comic not found.", 404);
        }

        // Increment views
        $incStmt = $pdo->prepare("UPDATE comics SET views_count = views_count + 1 WHERE id = ?");
        $incStmt->execute([$comic['id']]);

        // Get chapters
        $chStmt = $pdo->prepare("SELECT * FROM chapters WHERE comic_id = ? ORDER BY chapter_number ASC");
        $chStmt->execute([$comic['id']]);
        $chapters = $chStmt->fetchAll();

        // Get panels for current chapter
        $panels = [];
        if (!empty($chapters)) {
            $currChapter = $chapters[0];
            foreach ($chapters as $ch) {
                if ((int)$ch['chapter_number'] === $chapterNum) {
                    $currChapter = $ch;
                    break;
                }
            }
            $pStmt = $pdo->prepare("SELECT * FROM panels WHERE chapter_id = ? ORDER BY panel_number ASC");
            $pStmt->execute([$currChapter['id']]);
            $panels = $pStmt->fetchAll();
        }

        $comic['chapters'] = $chapters;
        $comic['current_chapter'] = [
            'number'      => $chapterNum,
            'title'       => !empty($chapters) ? "Chapter {$chapterNum}" : 'Chapter 1',
            'total_pages' => count($panels) > 0 ? count($panels) : 1,
            'pages'       => count($panels) > 0 ? $panels : [
                ['page_number' => 1, 'image_url' => $comic['cover_url'] ?: 'assets/img/cover-placeholder.png']
            ]
        ];

        jsonSuccess(['comic' => $comic]);
    }

    // 2. List & Query Comics from DB (filtering drafts for guest readers)
    $params = [];
    if (!$includeDrafts) {
        if ($loggedUser) {
            $sql = "SELECT * FROM comics WHERE status != 'archived' AND (status != 'draft' OR creator = ? OR creator_id = ?)";
            $params[] = '@' . ltrim($loggedUser['username'], '@');
            $params[] = (int)$loggedUser['id'];
        } else {
            $sql = "SELECT * FROM comics WHERE status != 'archived' AND status != 'draft'";
        }
    } else {
        $sql = "SELECT * FROM comics WHERE status != 'archived'";
    }

    if (!empty($category) && $category !== 'all') {
        $sql .= " AND LOWER(category) = ?";
        $params[] = strtolower($category);
    }
    if (!empty($genre) && $genre !== 'all') {
        $sql .= " AND LOWER(genre) = ?";
        $params[] = strtolower($genre);
    }
    if (!empty($style) && $style !== 'all') {
        $sql .= " AND LOWER(art_style) = ?";
        $params[] = strtolower($style);
    }
    if ($trending !== null) {
        $sql .= " AND (is_trending = 1 OR status = 'featured')";
    }
    if (!empty($searchQuery)) {
        $sql .= " AND (LOWER(title) LIKE ? OR LOWER(creator) LIKE ? OR LOWER(synopsis) LIKE ?)";
        $wild = '%' . strtolower($searchQuery) . '%';
        $params[] = $wild;
        $params[] = $wild;
        $params[] = $wild;
    }

    $sql .= " ORDER BY created_at DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $comics = $stmt->fetchAll();

    // Check Hero Spotlight
    $heroStmt = $pdo->query("SELECT comic_slug FROM hero_spotlights ORDER BY id DESC LIMIT 1");
    $heroSlug = $heroStmt ? $heroStmt->fetchColumn() : null;

    jsonSuccess([
        'total'          => count($comics),
        'comics'         => $comics,
        'hero_spotlight' => $heroSlug
    ]);

} catch (Exception $e) {
    jsonError("Database query failed: " . $e->getMessage(), 500);
}
