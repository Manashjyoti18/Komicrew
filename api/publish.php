<?php
/**
 * Comicsense / Komicrew — Enhanced Comic Publishing & Saving API
 * Handles:
 * - Creating new comics & chapters
 * - Editing & updating existing comics (User/Creator & Admin)
 * - Persisting AI-generated panels and chapter pages
 * - Safe Base64 cover image saving to disk (data/uploads)
 * - Setting draft vs published vs featured status
 */

declare(strict_types=1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';

session_start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonError('Only POST requests are supported.', 405);
}

$input = getJsonInput();
$pdo   = DB::connect();

// 1. Identify User & Privileges
$loggedUser = $_SESSION['user'] ?? null;
$isAdmin    = !empty($_SESSION['is_admin']) || ($loggedUser && ($loggedUser['role'] ?? '') === 'admin');

// 2. Parse Comic Metadata
$comicId     = !empty($input['comic_id']) ? $input['comic_id'] : (!empty($input['id']) ? $input['id'] : null);
$title       = trim((string)($input['title'] ?? ($input['publish_title'] ?? '')));
$synopsis    = trim((string)($input['synopsis'] ?? ($input['publish_synopsis'] ?? '')));
$category    = trim((string)($input['category'] ?? 'Superheroes'));
$genre       = trim((string)($input['genre'] ?? 'Action'));
$artStyle    = trim((string)($input['style'] ?? ($input['art_style'] ?? 'Tactile Neo-Comic')));
$coverInput  = trim((string)($input['cover'] ?? ($input['cover_url'] ?? ($input['cover_image'] ?? 'assets/img/cover-placeholder.png'))));
$isAi        = (int)($input['is_ai'] ?? ($input['ai_disclosure'] ?? 1));
$status      = trim((string)($input['status'] ?? 'published'));
$panels      = $input['panels'] ?? [];

// Determine Creator Attribution
$creator = trim((string)($input['creator'] ?? ''));
if (empty($creator) || $creator === '@creator') {
    if ($loggedUser && !empty($loggedUser['username'])) {
        $creator = '@' . ltrim($loggedUser['username'], '@');
    } else {
        $creator = '@creator';
    }
}
$creatorId = isset($input['creator_id']) ? (int)$input['creator_id'] : ($loggedUser ? (int)$loggedUser['id'] : null);

if (empty($title)) {
    jsonError('Comic title is required.');
}

// 3. Helper to save Base64 canvas preview as real image file
function saveCoverImage(string $coverInput, string $slug): string {
    if (str_starts_with($coverInput, 'data:image/')) {
        $parts = explode(',', $coverInput, 2);
        if (count($parts) === 2) {
            $binary = base64_decode($parts[1]);
            if ($binary !== false) {
                $uploadDir = __DIR__ . '/../data/uploads';
                if (!is_dir($uploadDir)) {
                    @mkdir($uploadDir, 0777, true);
                }
                $cleanSlug = preg_replace('/[^a-z0-9_-]/i', '', $slug);
                $filename = 'cover_' . $cleanSlug . '_' . time() . '.png';
                $destPath = $uploadDir . '/' . $filename;
                if (file_put_contents($destPath, $binary) !== false) {
                    return 'data/uploads/' . $filename;
                }
            }
        }
        return 'assets/img/cover-placeholder.png';
    }
    return !empty($coverInput) ? $coverInput : 'assets/img/cover-placeholder.png';
}

try {
    // 4. Update Existing Comic Mode
    if ($comicId) {
        $stmtFind = $pdo->prepare("SELECT * FROM comics WHERE id = ? OR slug = ? LIMIT 1");
        $stmtFind->execute([$comicId, $comicId]);
        $existing = $stmtFind->fetch();

        if ($existing) {
            $targetId = (int)$existing['id'];
            $targetSlug = $existing['slug'];
            $finalCover = saveCoverImage($coverInput, $targetSlug);

            $stmtUpdate = $pdo->prepare("
                UPDATE comics SET 
                    title = ?, synopsis = ?, category = ?, genre = ?, art_style = ?, 
                    cover_url = ?, status = ?, is_ai = ?
                WHERE id = ?
            ");
            $stmtUpdate->execute([
                $title, $synopsis, ucfirst($category), ucfirst($genre), $artStyle,
                $finalCover, $status, $isAi, $targetId
            ]);

            // If new panels provided, update or add them
            if (!empty($panels) && is_array($panels)) {
                // Find or create chapter 1
                $chStmt = $pdo->prepare("SELECT id FROM chapters WHERE comic_id = ? AND chapter_number = 1 LIMIT 1");
                $chStmt->execute([$targetId]);
                $chapterId = $chStmt->fetchColumn();

                if (!$chapterId) {
                    $insertCh = $pdo->prepare("INSERT INTO chapters (comic_id, chapter_number, title, pages_count) VALUES (?, 1, 'Chapter 1', ?)");
                    $insertCh->execute([$targetId, count($panels)]);
                    $chapterId = (int)$pdo->lastInsertId();
                } else {
                    $updCh = $pdo->prepare("UPDATE chapters SET pages_count = ? WHERE id = ?");
                    $updCh->execute([count($panels), $chapterId]);
                    // Clear old panels to replace with updated set
                    $pdo->prepare("DELETE FROM panels WHERE chapter_id = ?")->execute([$chapterId]);
                }

                $pStmt = $pdo->prepare("INSERT INTO panels (chapter_id, panel_number, image_url, ai_prompt) VALUES (?, ?, ?, ?)");
                $pNum = 1;
                foreach ($panels as $p) {
                    $imgUrl = is_string($p) ? $p : ($p['image_url'] ?? $p['url'] ?? '');
                    $prompt = is_array($p) ? ($p['prompt'] ?? '') : '';
                    if (!empty($imgUrl)) {
                        $pStmt->execute([$chapterId, $pNum, $imgUrl, $prompt]);
                        $pNum++;
                    }
                }
            }

            jsonSuccess([
                'comic' => [
                    'id'      => $targetId,
                    'slug'    => $targetSlug,
                    'title'   => $title,
                    'creator' => $existing['creator'],
                    'status'  => $status,
                    'cover'   => $finalCover
                ],
                'url' => "index.html#reader?comicId={$targetSlug}"
            ], "✏️ Comic '{$title}' updated successfully!");
            exit;
        }
    }

    // 5. Create New Comic Mode
    $baseSlug = preg_replace('/[^a-z0-9]+/i', '-', strtolower($title));
    $baseSlug = trim($baseSlug, '-');
    if (empty($baseSlug)) {
        $baseSlug = 'comic-' . time();
    }
    $slug = $baseSlug . '-' . bin2hex(random_bytes(3));
    $finalCover = saveCoverImage($coverInput, $slug);

    // If first panel image is available and cover was placeholder, use panel 1 as cover
    if ($finalCover === 'assets/img/cover-placeholder.png' && !empty($panels) && is_array($panels)) {
        $firstP = $panels[0];
        $firstImg = is_string($firstP) ? $firstP : ($firstP['image_url'] ?? $firstP['url'] ?? '');
        if (!empty($firstImg)) {
            $finalCover = $firstImg;
        }
    }

    $stmtInsert = $pdo->prepare("
        INSERT INTO comics (
            slug, title, creator, creator_id, category, genre, art_style, 
            synopsis, cover_url, backdrop_url, is_ai, status, is_trending
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
    ");
    $stmtInsert->execute([
        $slug,
        $title,
        $creator,
        $creatorId,
        ucfirst($category),
        ucfirst($genre),
        $artStyle,
        $synopsis,
        $finalCover,
        $finalCover,
        $isAi,
        $status
    ]);
    $newComicId = (int)$pdo->lastInsertId();

    // Insert Chapter 1
    $pageCount = !empty($panels) ? count($panels) : 1;
    $chStmt = $pdo->prepare("INSERT INTO chapters (comic_id, chapter_number, title, pages_count) VALUES (?, 1, 'Chapter 1', ?)");
    $chStmt->execute([$newComicId, $pageCount]);
    $chapterId = (int)$pdo->lastInsertId();

    // Insert Panels
    if (!empty($panels) && is_array($panels)) {
        $pStmt = $pdo->prepare("INSERT INTO panels (chapter_id, panel_number, image_url, ai_prompt) VALUES (?, ?, ?, ?)");
        $pNum = 1;
        foreach ($panels as $p) {
            $imgUrl = is_string($p) ? $p : ($p['image_url'] ?? $p['url'] ?? '');
            $prompt = is_array($p) ? ($p['prompt'] ?? '') : '';
            if (!empty($imgUrl)) {
                $pStmt->execute([$chapterId, $pNum, $imgUrl, $prompt]);
                $pNum++;
            }
        }
    } else {
        // Fallback single panel so reader opens cleanly
        $pStmt = $pdo->prepare("INSERT INTO panels (chapter_id, panel_number, image_url, ai_prompt) VALUES (?, 1, ?, 'Comic Cover Panel')");
        $pStmt->execute([$chapterId, $finalCover]);
    }

    jsonSuccess([
        'comic' => [
            'id'       => $newComicId,
            'slug'     => $slug,
            'title'    => $title,
            'creator'  => $creator,
            'status'   => $status,
            'cover'    => $finalCover,
            'pages'    => $pageCount
        ],
        'url' => "index.html#reader?comicId={$slug}"
    ], "🚀 Comic '{$title}' successfully published to Komicrew live database!");

} catch (Exception $e) {
    jsonError("Failed to save comic to database: " . $e->getMessage(), 500);
}
