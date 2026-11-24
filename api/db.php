<?php
/**
 * Comicsense / Komicrew — Smart Database Connection (MySQL with SQLite Auto-Fallback)
 * Default: XAMPP MySQL (127.0.0.1:3306)
 * Fallback: Embedded SQLite (runs immediately even if XAMPP is stopped)
 */

declare(strict_types=1);

require_once __DIR__ . '/config.php';

class DB {
    private static ?PDO $pdo = null;

    public static function connect(): PDO {
        if (self::$pdo !== null) {
            return self::$pdo;
        }

        $dbName = 'komicrew';

        // 1. Candidate MySQL connection configurations (MAMP & XAMPP auto-detection)
        $mysqlConfigs = [
            // MAMP default (port 8889, user: root, pass: root)
            ['host' => '127.0.0.1', 'port' => '8889', 'user' => 'root', 'password' => 'root', 'socket' => ''],
            // MAMP unix socket
            ['host' => 'localhost', 'port' => '8889', 'user' => 'root', 'password' => 'root', 'socket' => '/Applications/MAMP/tmp/mysql/mysql.sock'],
            // XAMPP default (port 3306, user: root, pass: '')
            ['host' => '127.0.0.1', 'port' => '3306', 'user' => 'root', 'password' => '', 'socket' => ''],
            // Standard MySQL with root password (port 3306)
            ['host' => '127.0.0.1', 'port' => '3306', 'user' => 'root', 'password' => 'root', 'socket' => ''],
        ];

        foreach ($mysqlConfigs as $cfg) {
            try {
                $hasSocket = !empty($cfg['socket']) && file_exists($cfg['socket']);
                $initDsn = $hasSocket
                    ? "mysql:unix_socket={$cfg['socket']};charset=utf8mb4"
                    : "mysql:host={$cfg['host']};port={$cfg['port']};charset=utf8mb4";

                $initPdo = new PDO($initDsn, $cfg['user'], $cfg['password'], [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_TIMEOUT => 2,
                ]);
                $initPdo->exec("CREATE DATABASE IF NOT EXISTS `{$dbName}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");

                $dsn = $hasSocket
                    ? "mysql:unix_socket={$cfg['socket']};dbname={$dbName};charset=utf8mb4"
                    : "mysql:host={$cfg['host']};port={$cfg['port']};dbname={$dbName};charset=utf8mb4";

                self::$pdo = new PDO($dsn, $cfg['user'], $cfg['password'], [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES   => false,
                ]);

                self::initTables(self::$pdo, 'mysql');
                return self::$pdo;
            } catch (Throwable $e) {
                // Try next MySQL configuration
            }
        }

        // 2. Fallback: Embedded SQLite
        $sqliteDir = __DIR__ . '/../data';
        if (!is_dir($sqliteDir)) {
            @mkdir($sqliteDir, 0777, true);
        }
        $sqlitePath = $sqliteDir . '/comicsense.sqlite';
        self::$pdo = new PDO("sqlite:{$sqlitePath}", null, null, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);

        self::initTables(self::$pdo, 'sqlite');
        return self::$pdo;
    }

    public static function initTables(PDO $pdo, string $engine = 'mysql'): void {
        if ($engine === 'mysql') {
            $pdo->exec("
                CREATE TABLE IF NOT EXISTS `users` (
                    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                    `username` VARCHAR(60) NOT NULL UNIQUE,
                    `email` VARCHAR(191) NOT NULL UNIQUE,
                    `password_hash` VARCHAR(255) NOT NULL,
                    `role` ENUM('reader', 'creator', 'admin') NOT NULL DEFAULT 'reader',
                    `tier` VARCHAR(50) NOT NULL DEFAULT 'Free',
                    `avatar_url` VARCHAR(500) NULL,
                    `bio` TEXT NULL,
                    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

                CREATE TABLE IF NOT EXISTS `comics` (
                    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                    `slug` VARCHAR(120) NOT NULL UNIQUE,
                    `title` VARCHAR(191) NOT NULL,
                    `creator` VARCHAR(100) NOT NULL,
                    `creator_id` BIGINT UNSIGNED NULL,
                    `category` VARCHAR(60) NOT NULL DEFAULT 'Seinen',
                    `genre` VARCHAR(60) NOT NULL DEFAULT 'Action',
                    `art_style` VARCHAR(60) NOT NULL DEFAULT 'Tactile Neo-Comic',
                    `synopsis` TEXT NULL,
                    `cover_url` VARCHAR(500) NULL,
                    `backdrop_url` VARCHAR(500) NULL,
                    `is_ai` TINYINT(1) NOT NULL DEFAULT 1,
                    `status` ENUM('draft', 'published', 'featured', 'archived') NOT NULL DEFAULT 'published',
                    `is_trending` TINYINT(1) NOT NULL DEFAULT 0,
                    `is_hero` TINYINT(1) NOT NULL DEFAULT 0,
                    `age_rating` VARCHAR(20) NOT NULL DEFAULT 'teen',
                    `views_count` BIGINT UNSIGNED NOT NULL DEFAULT 0,
                    `likes_count` BIGINT UNSIGNED NOT NULL DEFAULT 0,
                    `rating_avg` DECIMAL(3,2) NOT NULL DEFAULT 5.00,
                    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

                CREATE TABLE IF NOT EXISTS `chapters` (
                    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                    `comic_id` BIGINT UNSIGNED NOT NULL,
                    `chapter_number` INT UNSIGNED NOT NULL DEFAULT 1,
                    `title` VARCHAR(191) NOT NULL DEFAULT 'Chapter 1',
                    `pages_count` INT UNSIGNED NOT NULL DEFAULT 1,
                    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

                CREATE TABLE IF NOT EXISTS `panels` (
                    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                    `chapter_id` BIGINT UNSIGNED NOT NULL,
                    `panel_number` INT UNSIGNED NOT NULL DEFAULT 1,
                    `image_url` VARCHAR(500) NOT NULL,
                    `ai_prompt` TEXT NULL,
                    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

                CREATE TABLE IF NOT EXISTS `taxonomies` (
                    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                    `type` ENUM('category', 'genre', 'style') NOT NULL,
                    `name` VARCHAR(100) NOT NULL,
                    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

                CREATE TABLE IF NOT EXISTS `hero_spotlights` (
                    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                    `comic_slug` VARCHAR(120) NOT NULL,
                    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

                CREATE TABLE IF NOT EXISTS `reactions` (
                    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                    `comic_slug` VARCHAR(120) NOT NULL,
                    `chapter_number` INT UNSIGNED NOT NULL DEFAULT 1,
                    `reaction_type` VARCHAR(30) NOT NULL DEFAULT 'heart',
                    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

                CREATE TABLE IF NOT EXISTS `comments` (
                    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
                    `comic_slug` VARCHAR(120) NOT NULL,
                    `chapter_number` INT UNSIGNED NOT NULL DEFAULT 1,
                    `author_name` VARCHAR(100) NOT NULL DEFAULT 'Anonymous',
                    `author_avatar` VARCHAR(500) NULL,
                    `body` TEXT NOT NULL,
                    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ");
        } else {
            $pdo->exec("
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    role TEXT NOT NULL DEFAULT 'reader',
                    tier TEXT NOT NULL DEFAULT 'Free',
                    avatar_url TEXT,
                    bio TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS comics (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    slug TEXT UNIQUE NOT NULL,
                    title TEXT NOT NULL,
                    creator TEXT NOT NULL,
                    creator_id INTEGER NULL,
                    category TEXT NOT NULL DEFAULT 'Seinen',
                    genre TEXT NOT NULL DEFAULT 'Action',
                    art_style TEXT NOT NULL DEFAULT 'Tactile Neo-Comic',
                    synopsis TEXT,
                    cover_url TEXT,
                    backdrop_url TEXT,
                    is_ai INTEGER NOT NULL DEFAULT 1,
                    status TEXT NOT NULL DEFAULT 'published',
                    is_trending INTEGER NOT NULL DEFAULT 0,
                    is_hero INTEGER NOT NULL DEFAULT 0,
                    age_rating TEXT DEFAULT 'teen',
                    views_count INTEGER DEFAULT 0,
                    likes_count INTEGER DEFAULT 0,
                    rating_avg REAL DEFAULT 5.0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS chapters (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    comic_id INTEGER NOT NULL,
                    chapter_number INTEGER NOT NULL DEFAULT 1,
                    title TEXT NOT NULL DEFAULT 'Chapter 1',
                    pages_count INTEGER NOT NULL DEFAULT 1,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS panels (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    chapter_id INTEGER NOT NULL,
                    panel_number INTEGER NOT NULL DEFAULT 1,
                    image_url TEXT NOT NULL,
                    ai_prompt TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS taxonomies (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    type TEXT NOT NULL,
                    name TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS hero_spotlights (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    comic_slug TEXT NOT NULL,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS reactions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    comic_slug TEXT NOT NULL,
                    chapter_number INTEGER NOT NULL DEFAULT 1,
                    reaction_type TEXT NOT NULL DEFAULT 'heart',
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS comments (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    comic_slug TEXT NOT NULL,
                    chapter_number INTEGER NOT NULL DEFAULT 1,
                    author_name TEXT NOT NULL DEFAULT 'Anonymous',
                    author_avatar TEXT,
                    body TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
            ");
        }

        // Ensure default Admin user exists if users table is empty
        $stmt = $pdo->query("SELECT COUNT(*) FROM users");
        $userCount = (int)$stmt->fetchColumn();
        if ($userCount === 0) {
            $adminPass = password_hash('AdminPassword2026!', PASSWORD_BCRYPT);
            $stmtInsert = $pdo->prepare("
                INSERT INTO users (username, email, password_hash, role, tier, bio) 
                VALUES ('admin', 'admin@komicrew.app', ?, 'admin', 'Superadmin', 'Komicrew Lead Operations Administrator')
            ");
            $stmtInsert->execute([$adminPass]);
        }

        // Ensure Marvel Comics catalog is seeded if comics table is empty
        $comicCount = (int)$pdo->query("SELECT COUNT(*) FROM comics")->fetchColumn();
        if ($comicCount === 0) {
            $pdo->exec("
                INSERT INTO comics (id, slug, title, creator, category, genre, art_style, synopsis, cover_url, backdrop_url, is_ai, status, is_trending, is_hero, age_rating, views_count, likes_count, rating_avg) VALUES
                (1, 'amazing-fantasy-15', 'Amazing Fantasy #15: Spider-Man!', 'Stan Lee & Steve Ditko', 'Superheroes', 'Action', 'Vintage 60s Marvel', 'Introducing the amazing Spider-Man! High school student Peter Parker is bitten by a radioactive spider, gaining superhuman agility and wall-crawling power. When tragedy strikes Uncle Ben, Peter learns the eternal lesson: With great power comes great responsibility.', 'assets/img/cover-amazing-fantasy-15.jpg', 'assets/img/cover-amazing-fantasy-15.jpg', 0, 'featured', 1, 1, 'teen', 48502, 3820, 5.00),
                (2, 'marvel-comics-1', 'Marvel Comics #1 (1939)', 'Carl Burgos & Bill Everett', 'Classic', 'Sci-Fi', 'Golden Age Classic', 'The historic genesis of the entire Marvel Universe! Featuring the groundbreaking debuts of Carl Burgos Human Torch, Bill Everett Sub-Mariner (Prince Namor of Atlantis), Paul Gustavson The Angel, and Ka-Zar the Great.', 'assets/img/cover-marvel-comics-1.jpg', 'assets/img/cover-marvel-comics-1.jpg', 0, 'featured', 1, 0, 'teen', 31201, 2450, 4.95),
                (3, 'captain-america-13', 'Captain America Comics #13 (1942)', 'Joe Simon & Jack Kirby', 'Golden Age', 'Action', 'Golden Age Classic', 'Captain America and Bucky battle the secret League of the Unicorn and brave the eerie Lighthouse of Horror in classic World War II superhero adventures created by legends Joe Simon and Jack Kirby.', 'assets/img/cover-captain-america-13.jpg', 'assets/img/cover-captain-america-13.jpg', 0, 'published', 1, 0, 'teen', 21901, 1640, 4.88);

                INSERT INTO chapters (id, comic_id, chapter_number, title, pages_count) VALUES
                (1, 1, 1, 'Spider-Man! (Complete Origin Issue)', 39),
                (2, 2, 1, 'The Human Torch & Sub-Mariner Genesis', 68),
                (3, 3, 1, 'The League of the Unicorn & Lighthouse of Horror', 68);

                INSERT INTO hero_spotlights (id, comic_slug) VALUES (1, 'amazing-fantasy-15');
            ");

            $panelStmt = $pdo->prepare("INSERT INTO panels (chapter_id, panel_number, image_url) VALUES (?, ?, ?)");
            for ($p = 1; $p <= 39; $p++) {
                $numStr = str_pad((string)$p, 2, '0', STR_PAD_LEFT);
                $panelStmt->execute([1, $p, "assets/comics/amazing-fantasy-15/page-{$numStr}.jpg"]);
            }
            for ($p = 1; $p <= 68; $p++) {
                $numStr = str_pad((string)$p, 2, '0', STR_PAD_LEFT);
                $panelStmt->execute([2, $p, "assets/comics/marvel-comics-1/page-{$numStr}.jpg"]);
            }
            for ($p = 1; $p <= 68; $p++) {
                $numStr = str_pad((string)$p, 2, '0', STR_PAD_LEFT);
                $panelStmt->execute([3, $p, "assets/comics/captain-america-13/page-{$numStr}.jpg"]);
            }
        }
    }
}
