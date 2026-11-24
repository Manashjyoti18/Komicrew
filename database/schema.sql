-- ============================================================
-- Comicsense / Komicrew — Production MySQL Database Schema
-- Compatible with MAMP (MySQL 8.0+, port 8889) and XAMPP (port 3306)
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS `komicrew` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `komicrew`;

-- 1. Users & Creators
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
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Comics Catalog
CREATE TABLE IF NOT EXISTS `comics` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `slug` VARCHAR(120) NOT NULL UNIQUE,
    `title` VARCHAR(191) NOT NULL,
    `creator` VARCHAR(100) NOT NULL,
    `creator_id` BIGINT UNSIGNED NULL,
    `category` VARCHAR(60) NOT NULL DEFAULT 'Superheroes',
    `genre` VARCHAR(60) NOT NULL DEFAULT 'Action',
    `art_style` VARCHAR(60) NOT NULL DEFAULT 'Vintage 60s Marvel',
    `synopsis` TEXT NULL,
    `cover_url` VARCHAR(500) NULL,
    `backdrop_url` VARCHAR(500) NULL,
    `is_ai` TINYINT(1) NOT NULL DEFAULT 0,
    `status` ENUM('draft', 'published', 'featured', 'archived') NOT NULL DEFAULT 'published',
    `is_trending` TINYINT(1) NOT NULL DEFAULT 0,
    `is_hero` TINYINT(1) NOT NULL DEFAULT 0,
    `age_rating` VARCHAR(20) NOT NULL DEFAULT 'teen',
    `views_count` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `likes_count` BIGINT UNSIGNED NOT NULL DEFAULT 0,
    `rating_avg` DECIMAL(3,2) NOT NULL DEFAULT 5.00,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX `idx_comics_status` (`status`),
    INDEX `idx_comics_rating` (`rating_avg`),
    INDEX `idx_comics_views` (`views_count`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Chapters
CREATE TABLE IF NOT EXISTS `chapters` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `comic_id` BIGINT UNSIGNED NOT NULL,
    `chapter_number` INT UNSIGNED NOT NULL DEFAULT 1,
    `title` VARCHAR(191) NOT NULL DEFAULT 'Chapter 1',
    `pages_count` INT UNSIGNED NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_chapters_comic` (`comic_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Panels (Pages)
CREATE TABLE IF NOT EXISTS `panels` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `chapter_id` BIGINT UNSIGNED NOT NULL,
    `panel_number` INT UNSIGNED NOT NULL DEFAULT 1,
    `image_url` VARCHAR(500) NOT NULL,
    `ai_prompt` TEXT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_panels_chapter` (`chapter_id`, `panel_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Taxonomies (Categories, Genres, Art Styles)
CREATE TABLE IF NOT EXISTS `taxonomies` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `type` ENUM('category', 'genre', 'style') NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Hero Spotlight
CREATE TABLE IF NOT EXISTS `hero_spotlights` (
    `id` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `comic_slug` VARCHAR(120) NOT NULL,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Reactions
CREATE TABLE IF NOT EXISTS `reactions` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `comic_slug` VARCHAR(120) NOT NULL,
    `chapter_number` INT UNSIGNED NOT NULL DEFAULT 1,
    `reaction_type` VARCHAR(30) NOT NULL DEFAULT 'heart',
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_reactions_slug` (`comic_slug`, `chapter_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Comments
CREATE TABLE IF NOT EXISTS `comments` (
    `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `comic_slug` VARCHAR(120) NOT NULL,
    `chapter_number` INT UNSIGNED NOT NULL DEFAULT 1,
    `author_name` VARCHAR(100) NOT NULL DEFAULT 'Anonymous',
    `author_avatar` VARCHAR(500) NULL,
    `body` TEXT NOT NULL,
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_comments_slug` (`comic_slug`, `chapter_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
