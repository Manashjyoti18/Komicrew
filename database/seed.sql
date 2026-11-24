-- ============================================================
-- Comicsense — Real Marvel Comics Database Seed Data
-- ============================================================

-- 1. Default Users
INSERT IGNORE INTO `users` (`id`, `username`, `email`, `password_hash`, `role`, `tier`, `avatar_url`, `bio`) VALUES
(1, 'admin', 'admin@komicrew.app', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'Superadmin', 'assets/img/avatar-user.jpg', 'Komicrew Lead Platform Admin & Operations HQ.'),
(2, 'stan_lee', 'stan@marvel.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'creator', 'Pro', 'assets/img/avatar-user.jpg', 'Excelsior! Co-creator of Spider-Man, Avengers, X-Men & Iron Man.'),
(3, 'jack_kirby', 'kirby@marvel.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'creator', 'Pro', 'assets/img/avatar-user.jpg', 'The King of Comics. Co-creator of Captain America, Thor & Fantastic Four.');

-- 2. Real Marvel Comics
INSERT IGNORE INTO `comics` (`id`, `slug`, `title`, `creator`, `category`, `genre`, `art_style`, `synopsis`, `cover_url`, `backdrop_url`, `is_ai`, `status`, `is_trending`, `is_hero`, `age_rating`, `views_count`, `likes_count`, `rating_avg`) VALUES
(1, 'amazing-fantasy-15', 'Amazing Fantasy #15: Spider-Man!', 'Stan Lee & Steve Ditko', 'Superheroes', 'Action', 'Vintage 60s Marvel', 'Introducing the amazing Spider-Man! High school student Peter Parker is bitten by a radioactive spider, gaining superhuman agility and wall-crawling power. When tragedy strikes Uncle Ben, Peter learns the eternal lesson: With great power comes great responsibility.', 'assets/img/cover-amazing-fantasy-15.jpg', 'assets/img/cover-amazing-fantasy-15.jpg', 0, 'featured', 1, 1, 'teen', 48500, 3820, 5.00),
(2, 'marvel-comics-1', 'Marvel Comics #1 (1939)', 'Carl Burgos & Bill Everett', 'Classic', 'Sci-Fi', 'Golden Age Classic', 'The historic genesis of the entire Marvel Universe! Featuring the groundbreaking debuts of Carl Burgos Human Torch, Bill Everett Sub-Mariner (Prince Namor of Atlantis), Paul Gustavson The Angel, and Ka-Zar the Great.', 'assets/img/cover-marvel-comics-1.jpg', 'assets/img/cover-marvel-comics-1.jpg', 0, 'featured', 1, 0, 'teen', 31200, 2450, 4.95),
(3, 'captain-america-13', 'Captain America Comics #13 (1942)', 'Joe Simon & Jack Kirby', 'Golden Age', 'Action', 'Golden Age Classic', 'Captain America and Bucky battle the secret League of the Unicorn and brave the eerie Lighthouse of Horror in classic World War II superhero adventures created by legends Joe Simon and Jack Kirby.', 'assets/img/cover-captain-america-13.jpg', 'assets/img/cover-captain-america-13.jpg', 0, 'published', 1, 0, 'teen', 21900, 1640, 4.88);

-- 3. Chapters
INSERT IGNORE INTO `chapters` (`id`, `comic_id`, `chapter_number`, `title`, `pages_count`) VALUES
(1, 1, 1, 'Spider-Man! (Complete Origin Issue)', 39),
(2, 2, 1, 'The Human Torch & Sub-Mariner Genesis', 68),
(3, 3, 1, 'The League of the Unicorn & Lighthouse of Horror', 68);

-- 4. Hero Spotlight
INSERT IGNORE INTO `hero_spotlights` (`id`, `comic_slug`) VALUES
(1, 'amazing-fantasy-15');

-- 5. Panels
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (1, 1, 'assets/comics/amazing-fantasy-15/page-01.jpg', 'Amazing Fantasy #15 Page 1');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (1, 2, 'assets/comics/amazing-fantasy-15/page-02.jpg', 'Amazing Fantasy #15 Page 2');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (1, 3, 'assets/comics/amazing-fantasy-15/page-03.jpg', 'Amazing Fantasy #15 Page 3');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (1, 4, 'assets/comics/amazing-fantasy-15/page-04.jpg', 'Amazing Fantasy #15 Page 4');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (1, 5, 'assets/comics/amazing-fantasy-15/page-05.jpg', 'Amazing Fantasy #15 Page 5');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (1, 6, 'assets/comics/amazing-fantasy-15/page-06.jpg', 'Amazing Fantasy #15 Page 6');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (1, 7, 'assets/comics/amazing-fantasy-15/page-07.jpg', 'Amazing Fantasy #15 Page 7');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (1, 8, 'assets/comics/amazing-fantasy-15/page-08.jpg', 'Amazing Fantasy #15 Page 8');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (1, 9, 'assets/comics/amazing-fantasy-15/page-09.jpg', 'Amazing Fantasy #15 Page 9');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (1, 10, 'assets/comics/amazing-fantasy-15/page-10.jpg', 'Amazing Fantasy #15 Page 10');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (1, 11, 'assets/comics/amazing-fantasy-15/page-11.jpg', 'Amazing Fantasy #15 Page 11');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (1, 12, 'assets/comics/amazing-fantasy-15/page-12.jpg', 'Amazing Fantasy #15 Page 12');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (1, 13, 'assets/comics/amazing-fantasy-15/page-13.jpg', 'Amazing Fantasy #15 Page 13');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (1, 14, 'assets/comics/amazing-fantasy-15/page-14.jpg', 'Amazing Fantasy #15 Page 14');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (1, 15, 'assets/comics/amazing-fantasy-15/page-15.jpg', 'Amazing Fantasy #15 Page 15');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (1, 16, 'assets/comics/amazing-fantasy-15/page-16.jpg', 'Amazing Fantasy #15 Page 16');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (1, 17, 'assets/comics/amazing-fantasy-15/page-17.jpg', 'Amazing Fantasy #15 Page 17');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (1, 18, 'assets/comics/amazing-fantasy-15/page-18.jpg', 'Amazing Fantasy #15 Page 18');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (1, 19, 'assets/comics/amazing-fantasy-15/page-19.jpg', 'Amazing Fantasy #15 Page 19');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (1, 20, 'assets/comics/amazing-fantasy-15/page-20.jpg', 'Amazing Fantasy #15 Page 20');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (1, 21, 'assets/comics/amazing-fantasy-15/page-21.jpg', 'Amazing Fantasy #15 Page 21');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (1, 22, 'assets/comics/amazing-fantasy-15/page-22.jpg', 'Amazing Fantasy #15 Page 22');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (1, 23, 'assets/comics/amazing-fantasy-15/page-23.jpg', 'Amazing Fantasy #15 Page 23');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (1, 24, 'assets/comics/amazing-fantasy-15/page-24.jpg', 'Amazing Fantasy #15 Page 24');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (1, 25, 'assets/comics/amazing-fantasy-15/page-25.jpg', 'Amazing Fantasy #15 Page 25');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (1, 26, 'assets/comics/amazing-fantasy-15/page-26.jpg', 'Amazing Fantasy #15 Page 26');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (1, 27, 'assets/comics/amazing-fantasy-15/page-27.jpg', 'Amazing Fantasy #15 Page 27');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (1, 28, 'assets/comics/amazing-fantasy-15/page-28.jpg', 'Amazing Fantasy #15 Page 28');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (1, 29, 'assets/comics/amazing-fantasy-15/page-29.jpg', 'Amazing Fantasy #15 Page 29');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (1, 30, 'assets/comics/amazing-fantasy-15/page-30.jpg', 'Amazing Fantasy #15 Page 30');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (1, 31, 'assets/comics/amazing-fantasy-15/page-31.jpg', 'Amazing Fantasy #15 Page 31');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (1, 32, 'assets/comics/amazing-fantasy-15/page-32.jpg', 'Amazing Fantasy #15 Page 32');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (1, 33, 'assets/comics/amazing-fantasy-15/page-33.jpg', 'Amazing Fantasy #15 Page 33');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (1, 34, 'assets/comics/amazing-fantasy-15/page-34.jpg', 'Amazing Fantasy #15 Page 34');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (1, 35, 'assets/comics/amazing-fantasy-15/page-35.jpg', 'Amazing Fantasy #15 Page 35');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (1, 36, 'assets/comics/amazing-fantasy-15/page-36.jpg', 'Amazing Fantasy #15 Page 36');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (1, 37, 'assets/comics/amazing-fantasy-15/page-37.jpg', 'Amazing Fantasy #15 Page 37');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (1, 38, 'assets/comics/amazing-fantasy-15/page-38.jpg', 'Amazing Fantasy #15 Page 38');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (1, 39, 'assets/comics/amazing-fantasy-15/page-39.jpg', 'Amazing Fantasy #15 Page 39');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (2, 1, 'assets/comics/marvel-comics-1/page-01.jpg', 'Marvel Comics #1 Page 1');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (2, 2, 'assets/comics/marvel-comics-1/page-02.jpg', 'Marvel Comics #1 Page 2');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (2, 3, 'assets/comics/marvel-comics-1/page-03.jpg', 'Marvel Comics #1 Page 3');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (2, 4, 'assets/comics/marvel-comics-1/page-04.jpg', 'Marvel Comics #1 Page 4');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (2, 5, 'assets/comics/marvel-comics-1/page-05.jpg', 'Marvel Comics #1 Page 5');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (2, 6, 'assets/comics/marvel-comics-1/page-06.jpg', 'Marvel Comics #1 Page 6');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (2, 7, 'assets/comics/marvel-comics-1/page-07.jpg', 'Marvel Comics #1 Page 7');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (2, 8, 'assets/comics/marvel-comics-1/page-08.jpg', 'Marvel Comics #1 Page 8');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (2, 9, 'assets/comics/marvel-comics-1/page-09.jpg', 'Marvel Comics #1 Page 9');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (2, 10, 'assets/comics/marvel-comics-1/page-10.jpg', 'Marvel Comics #1 Page 10');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (2, 11, 'assets/comics/marvel-comics-1/page-11.jpg', 'Marvel Comics #1 Page 11');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (2, 12, 'assets/comics/marvel-comics-1/page-12.jpg', 'Marvel Comics #1 Page 12');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (2, 13, 'assets/comics/marvel-comics-1/page-13.jpg', 'Marvel Comics #1 Page 13');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (2, 14, 'assets/comics/marvel-comics-1/page-14.jpg', 'Marvel Comics #1 Page 14');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (2, 15, 'assets/comics/marvel-comics-1/page-15.jpg', 'Marvel Comics #1 Page 15');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (2, 16, 'assets/comics/marvel-comics-1/page-16.jpg', 'Marvel Comics #1 Page 16');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (2, 17, 'assets/comics/marvel-comics-1/page-17.jpg', 'Marvel Comics #1 Page 17');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (2, 18, 'assets/comics/marvel-comics-1/page-18.jpg', 'Marvel Comics #1 Page 18');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (2, 19, 'assets/comics/marvel-comics-1/page-19.jpg', 'Marvel Comics #1 Page 19');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (2, 20, 'assets/comics/marvel-comics-1/page-20.jpg', 'Marvel Comics #1 Page 20');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (2, 21, 'assets/comics/marvel-comics-1/page-21.jpg', 'Marvel Comics #1 Page 21');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (2, 22, 'assets/comics/marvel-comics-1/page-22.jpg', 'Marvel Comics #1 Page 22');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (2, 23, 'assets/comics/marvel-comics-1/page-23.jpg', 'Marvel Comics #1 Page 23');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (2, 24, 'assets/comics/marvel-comics-1/page-24.jpg', 'Marvel Comics #1 Page 24');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (2, 25, 'assets/comics/marvel-comics-1/page-25.jpg', 'Marvel Comics #1 Page 25');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (2, 26, 'assets/comics/marvel-comics-1/page-26.jpg', 'Marvel Comics #1 Page 26');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (2, 27, 'assets/comics/marvel-comics-1/page-27.jpg', 'Marvel Comics #1 Page 27');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (2, 28, 'assets/comics/marvel-comics-1/page-28.jpg', 'Marvel Comics #1 Page 28');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (2, 29, 'assets/comics/marvel-comics-1/page-29.jpg', 'Marvel Comics #1 Page 29');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (2, 30, 'assets/comics/marvel-comics-1/page-30.jpg', 'Marvel Comics #1 Page 30');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (2, 31, 'assets/comics/marvel-comics-1/page-31.jpg', 'Marvel Comics #1 Page 31');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (2, 32, 'assets/comics/marvel-comics-1/page-32.jpg', 'Marvel Comics #1 Page 32');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (2, 33, 'assets/comics/marvel-comics-1/page-33.jpg', 'Marvel Comics #1 Page 33');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (2, 34, 'assets/comics/marvel-comics-1/page-34.jpg', 'Marvel Comics #1 Page 34');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (2, 35, 'assets/comics/marvel-comics-1/page-35.jpg', 'Marvel Comics #1 Page 35');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (2, 36, 'assets/comics/marvel-comics-1/page-36.jpg', 'Marvel Comics #1 Page 36');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (2, 37, 'assets/comics/marvel-comics-1/page-37.jpg', 'Marvel Comics #1 Page 37');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (2, 38, 'assets/comics/marvel-comics-1/page-38.jpg', 'Marvel Comics #1 Page 38');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (2, 39, 'assets/comics/marvel-comics-1/page-39.jpg', 'Marvel Comics #1 Page 39');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (2, 40, 'assets/comics/marvel-comics-1/page-40.jpg', 'Marvel Comics #1 Page 40');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (2, 41, 'assets/comics/marvel-comics-1/page-41.jpg', 'Marvel Comics #1 Page 41');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (2, 42, 'assets/comics/marvel-comics-1/page-42.jpg', 'Marvel Comics #1 Page 42');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (2, 43, 'assets/comics/marvel-comics-1/page-43.jpg', 'Marvel Comics #1 Page 43');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (2, 44, 'assets/comics/marvel-comics-1/page-44.jpg', 'Marvel Comics #1 Page 44');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (2, 45, 'assets/comics/marvel-comics-1/page-45.jpg', 'Marvel Comics #1 Page 45');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (2, 46, 'assets/comics/marvel-comics-1/page-46.jpg', 'Marvel Comics #1 Page 46');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (2, 47, 'assets/comics/marvel-comics-1/page-47.jpg', 'Marvel Comics #1 Page 47');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (2, 48, 'assets/comics/marvel-comics-1/page-48.jpg', 'Marvel Comics #1 Page 48');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (2, 49, 'assets/comics/marvel-comics-1/page-49.jpg', 'Marvel Comics #1 Page 49');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (2, 50, 'assets/comics/marvel-comics-1/page-50.jpg', 'Marvel Comics #1 Page 50');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (2, 51, 'assets/comics/marvel-comics-1/page-51.jpg', 'Marvel Comics #1 Page 51');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (2, 52, 'assets/comics/marvel-comics-1/page-52.jpg', 'Marvel Comics #1 Page 52');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (2, 53, 'assets/comics/marvel-comics-1/page-53.jpg', 'Marvel Comics #1 Page 53');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (2, 54, 'assets/comics/marvel-comics-1/page-54.jpg', 'Marvel Comics #1 Page 54');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (2, 55, 'assets/comics/marvel-comics-1/page-55.jpg', 'Marvel Comics #1 Page 55');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (2, 56, 'assets/comics/marvel-comics-1/page-56.jpg', 'Marvel Comics #1 Page 56');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (2, 57, 'assets/comics/marvel-comics-1/page-57.jpg', 'Marvel Comics #1 Page 57');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (2, 58, 'assets/comics/marvel-comics-1/page-58.jpg', 'Marvel Comics #1 Page 58');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (2, 59, 'assets/comics/marvel-comics-1/page-59.jpg', 'Marvel Comics #1 Page 59');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (2, 60, 'assets/comics/marvel-comics-1/page-60.jpg', 'Marvel Comics #1 Page 60');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (2, 61, 'assets/comics/marvel-comics-1/page-61.jpg', 'Marvel Comics #1 Page 61');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (2, 62, 'assets/comics/marvel-comics-1/page-62.jpg', 'Marvel Comics #1 Page 62');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (2, 63, 'assets/comics/marvel-comics-1/page-63.jpg', 'Marvel Comics #1 Page 63');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (2, 64, 'assets/comics/marvel-comics-1/page-64.jpg', 'Marvel Comics #1 Page 64');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (2, 65, 'assets/comics/marvel-comics-1/page-65.jpg', 'Marvel Comics #1 Page 65');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (2, 66, 'assets/comics/marvel-comics-1/page-66.jpg', 'Marvel Comics #1 Page 66');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (2, 67, 'assets/comics/marvel-comics-1/page-67.jpg', 'Marvel Comics #1 Page 67');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (2, 68, 'assets/comics/marvel-comics-1/page-68.jpg', 'Marvel Comics #1 Page 68');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (3, 1, 'assets/comics/captain-america-13/page-01.jpg', 'Captain America Comics #13 Page 1');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (3, 2, 'assets/comics/captain-america-13/page-02.jpg', 'Captain America Comics #13 Page 2');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (3, 3, 'assets/comics/captain-america-13/page-03.jpg', 'Captain America Comics #13 Page 3');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (3, 4, 'assets/comics/captain-america-13/page-04.jpg', 'Captain America Comics #13 Page 4');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (3, 5, 'assets/comics/captain-america-13/page-05.jpg', 'Captain America Comics #13 Page 5');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (3, 6, 'assets/comics/captain-america-13/page-06.jpg', 'Captain America Comics #13 Page 6');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (3, 7, 'assets/comics/captain-america-13/page-07.jpg', 'Captain America Comics #13 Page 7');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (3, 8, 'assets/comics/captain-america-13/page-08.jpg', 'Captain America Comics #13 Page 8');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (3, 9, 'assets/comics/captain-america-13/page-09.jpg', 'Captain America Comics #13 Page 9');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (3, 10, 'assets/comics/captain-america-13/page-10.jpg', 'Captain America Comics #13 Page 10');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (3, 11, 'assets/comics/captain-america-13/page-11.jpg', 'Captain America Comics #13 Page 11');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (3, 12, 'assets/comics/captain-america-13/page-12.jpg', 'Captain America Comics #13 Page 12');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (3, 13, 'assets/comics/captain-america-13/page-13.jpg', 'Captain America Comics #13 Page 13');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (3, 14, 'assets/comics/captain-america-13/page-14.jpg', 'Captain America Comics #13 Page 14');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (3, 15, 'assets/comics/captain-america-13/page-15.jpg', 'Captain America Comics #13 Page 15');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (3, 16, 'assets/comics/captain-america-13/page-16.jpg', 'Captain America Comics #13 Page 16');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (3, 17, 'assets/comics/captain-america-13/page-17.jpg', 'Captain America Comics #13 Page 17');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (3, 18, 'assets/comics/captain-america-13/page-18.jpg', 'Captain America Comics #13 Page 18');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (3, 19, 'assets/comics/captain-america-13/page-19.jpg', 'Captain America Comics #13 Page 19');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (3, 20, 'assets/comics/captain-america-13/page-20.jpg', 'Captain America Comics #13 Page 20');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (3, 21, 'assets/comics/captain-america-13/page-21.jpg', 'Captain America Comics #13 Page 21');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (3, 22, 'assets/comics/captain-america-13/page-22.jpg', 'Captain America Comics #13 Page 22');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (3, 23, 'assets/comics/captain-america-13/page-23.jpg', 'Captain America Comics #13 Page 23');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (3, 24, 'assets/comics/captain-america-13/page-24.jpg', 'Captain America Comics #13 Page 24');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (3, 25, 'assets/comics/captain-america-13/page-25.jpg', 'Captain America Comics #13 Page 25');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (3, 26, 'assets/comics/captain-america-13/page-26.jpg', 'Captain America Comics #13 Page 26');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (3, 27, 'assets/comics/captain-america-13/page-27.jpg', 'Captain America Comics #13 Page 27');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (3, 28, 'assets/comics/captain-america-13/page-28.jpg', 'Captain America Comics #13 Page 28');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (3, 29, 'assets/comics/captain-america-13/page-29.jpg', 'Captain America Comics #13 Page 29');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (3, 30, 'assets/comics/captain-america-13/page-30.jpg', 'Captain America Comics #13 Page 30');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (3, 31, 'assets/comics/captain-america-13/page-31.jpg', 'Captain America Comics #13 Page 31');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (3, 32, 'assets/comics/captain-america-13/page-32.jpg', 'Captain America Comics #13 Page 32');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (3, 33, 'assets/comics/captain-america-13/page-33.jpg', 'Captain America Comics #13 Page 33');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (3, 34, 'assets/comics/captain-america-13/page-34.jpg', 'Captain America Comics #13 Page 34');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (3, 35, 'assets/comics/captain-america-13/page-35.jpg', 'Captain America Comics #13 Page 35');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (3, 36, 'assets/comics/captain-america-13/page-36.jpg', 'Captain America Comics #13 Page 36');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (3, 37, 'assets/comics/captain-america-13/page-37.jpg', 'Captain America Comics #13 Page 37');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (3, 38, 'assets/comics/captain-america-13/page-38.jpg', 'Captain America Comics #13 Page 38');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (3, 39, 'assets/comics/captain-america-13/page-39.jpg', 'Captain America Comics #13 Page 39');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (3, 40, 'assets/comics/captain-america-13/page-40.jpg', 'Captain America Comics #13 Page 40');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (3, 41, 'assets/comics/captain-america-13/page-41.jpg', 'Captain America Comics #13 Page 41');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (3, 42, 'assets/comics/captain-america-13/page-42.jpg', 'Captain America Comics #13 Page 42');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (3, 43, 'assets/comics/captain-america-13/page-43.jpg', 'Captain America Comics #13 Page 43');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (3, 44, 'assets/comics/captain-america-13/page-44.jpg', 'Captain America Comics #13 Page 44');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (3, 45, 'assets/comics/captain-america-13/page-45.jpg', 'Captain America Comics #13 Page 45');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (3, 46, 'assets/comics/captain-america-13/page-46.jpg', 'Captain America Comics #13 Page 46');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (3, 47, 'assets/comics/captain-america-13/page-47.jpg', 'Captain America Comics #13 Page 47');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (3, 48, 'assets/comics/captain-america-13/page-48.jpg', 'Captain America Comics #13 Page 48');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (3, 49, 'assets/comics/captain-america-13/page-49.jpg', 'Captain America Comics #13 Page 49');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (3, 50, 'assets/comics/captain-america-13/page-50.jpg', 'Captain America Comics #13 Page 50');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (3, 51, 'assets/comics/captain-america-13/page-51.jpg', 'Captain America Comics #13 Page 51');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (3, 52, 'assets/comics/captain-america-13/page-52.jpg', 'Captain America Comics #13 Page 52');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (3, 53, 'assets/comics/captain-america-13/page-53.jpg', 'Captain America Comics #13 Page 53');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (3, 54, 'assets/comics/captain-america-13/page-54.jpg', 'Captain America Comics #13 Page 54');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (3, 55, 'assets/comics/captain-america-13/page-55.jpg', 'Captain America Comics #13 Page 55');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (3, 56, 'assets/comics/captain-america-13/page-56.jpg', 'Captain America Comics #13 Page 56');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (3, 57, 'assets/comics/captain-america-13/page-57.jpg', 'Captain America Comics #13 Page 57');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (3, 58, 'assets/comics/captain-america-13/page-58.jpg', 'Captain America Comics #13 Page 58');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (3, 59, 'assets/comics/captain-america-13/page-59.jpg', 'Captain America Comics #13 Page 59');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (3, 60, 'assets/comics/captain-america-13/page-60.jpg', 'Captain America Comics #13 Page 60');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (3, 61, 'assets/comics/captain-america-13/page-61.jpg', 'Captain America Comics #13 Page 61');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (3, 62, 'assets/comics/captain-america-13/page-62.jpg', 'Captain America Comics #13 Page 62');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (3, 63, 'assets/comics/captain-america-13/page-63.jpg', 'Captain America Comics #13 Page 63');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (3, 64, 'assets/comics/captain-america-13/page-64.jpg', 'Captain America Comics #13 Page 64');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (3, 65, 'assets/comics/captain-america-13/page-65.jpg', 'Captain America Comics #13 Page 65');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (3, 66, 'assets/comics/captain-america-13/page-66.jpg', 'Captain America Comics #13 Page 66');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (3, 67, 'assets/comics/captain-america-13/page-67.jpg', 'Captain America Comics #13 Page 67');
INSERT IGNORE INTO `panels` (`chapter_id`, `panel_number`, `image_url`, `ai_prompt`) VALUES (3, 68, 'assets/comics/captain-america-13/page-68.jpg', 'Captain America Comics #13 Page 68');
