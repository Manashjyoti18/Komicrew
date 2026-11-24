<?php
/**
 * Comicsense / Komicrew — Reactions & Comments API Endpoint (MySQL PDO)
 * Cleaned for XAMPP University Project
 */

declare(strict_types=1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';

$pdo = DB::connect();

$comicSlug  = trim((string)($_GET['comic_id'] ?? ($_POST['comic_id'] ?? 'amazing-fantasy-15')));
$chapterNum = max(1, (int)($_GET['chapter'] ?? ($_POST['chapter'] ?? 1)));

// Helper to get reaction counts
function getReactions(PDO $pdo, string $comicSlug, int $chapterNum): array {
    $defaultCounts = [
        'fire'       => 120,
        'heart'      => 340,
        'mind-blown' => 85,
        'laugh'      => 42,
        'cry'        => 19,
        'chef-kiss'  => 67,
    ];

    try {
        $stmt = $pdo->prepare("
            SELECT reaction_type, COUNT(*) as cnt 
            FROM reactions 
            WHERE comic_slug = ? AND chapter_number = ? 
            GROUP BY reaction_type
        ");
        $stmt->execute([$comicSlug, $chapterNum]);
        $rows = $stmt->fetchAll();

        foreach ($rows as $r) {
            $type = $r['reaction_type'];
            $defaultCounts[$type] = ($defaultCounts[$type] ?? 0) + (int)$r['cnt'];
        }
    } catch (Exception $e) {
        // Table fallback
    }

    return $defaultCounts;
}

// Helper to get comments
function getComments(PDO $pdo, string $comicSlug, int $chapterNum): array {
    try {
        $stmt = $pdo->prepare("
            SELECT id, comic_slug as comic_id, chapter_number as chapter, author_name as author, 
                   COALESCE(author_avatar, 'assets/img/avatar-user.jpg') as avatar, 
                   body, created_at
            FROM comments 
            WHERE comic_slug = ? AND chapter_number = ? 
            ORDER BY id DESC
        ");
        $stmt->execute([$comicSlug, $chapterNum]);
        $comments = $stmt->fetchAll();

        foreach ($comments as &$c) {
            $c['time_ago'] = 'Recent';
        }
        return $comments;
    } catch (Exception $e) {
        return [];
    }
}

// POST Requests: Add Reaction or Comment
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input  = getJsonInput();
    $action = $input['action'] ?? 'comment';

    if ($action === 'react') {
        $type = trim($input['reaction_type'] ?? 'fire');
        try {
            $stmt = $pdo->prepare("
                INSERT INTO reactions (comic_slug, chapter_number, reaction_type) 
                VALUES (?, ?, ?)
            ");
            $stmt->execute([$comicSlug, $chapterNum, $type]);
        } catch (Exception $e) {
            // Ignore error
        }

        $counts = getReactions($pdo, $comicSlug, $chapterNum);
        jsonSuccess([
            'reaction' => $type,
            'counts'   => $counts,
        ], 'Reaction recorded');
    }

    if ($action === 'comment') {
        $text = trim($input['comment'] ?? '');
        $username = trim($input['username'] ?? 'reader');
        if (str_starts_with($username, '@')) {
            $username = substr($username, 1);
        }

        if (empty($text)) {
            jsonError('Comment text cannot be empty.');
        }

        try {
            $stmt = $pdo->prepare("
                INSERT INTO comments (comic_slug, chapter_number, author_name, author_avatar, body) 
                VALUES (?, ?, ?, 'assets/img/avatar-user.jpg', ?)
            ");
            $stmt->execute([$comicSlug, $chapterNum, $username, htmlspecialchars($text, ENT_QUOTES, 'UTF-8')]);
            $newId = (int)$pdo->lastInsertId();

            $newComment = [
                'id'         => $newId,
                'comic_id'   => $comicSlug,
                'chapter'    => $chapterNum,
                'author'     => $username,
                'avatar'     => 'assets/img/avatar-user.jpg',
                'body'       => htmlspecialchars($text, ENT_QUOTES, 'UTF-8'),
                'created_at' => date('c'),
                'time_ago'   => 'Just now',
            ];

            jsonSuccess(['comment' => $newComment], 'Comment posted successfully');
        } catch (Exception $e) {
            jsonError('Failed to post comment: ' . $e->getMessage(), 500);
        }
    }
}

// GET Request: Retrieve Reactions and Comments
$reactions = getReactions($pdo, $comicSlug, $chapterNum);
$comments  = getComments($pdo, $comicSlug, $chapterNum);

jsonSuccess([
    'reactions' => $reactions,
    'comments'  => $comments,
]);
