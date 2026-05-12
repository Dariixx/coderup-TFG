-- Railway SQL directo — Fase 4
-- Ejecuta este archivo en Railway MySQL antes de cargar seed.sql si ya tienes una BD creada.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS remember_token VARCHAR(128) NULL UNIQUE,
  ADD COLUMN IF NOT EXISTS reset_token VARCHAR(64) NULL,
  ADD COLUMN IF NOT EXISTS reset_token_expires_at TIMESTAMP NULL;

CREATE INDEX idx_reset_token ON users (reset_token);

CREATE TABLE IF NOT EXISTS instructors (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  bio TEXT NOT NULL,
  avatar_url VARCHAR(500),
  linkedin_url VARCHAR(500),
  github_url VARCHAR(500),
  twitter_url VARCHAR(500),
  specialty VARCHAR(255) NOT NULL,
  years_experience INT DEFAULT 0,
  total_students INT DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 4.80,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_slug (slug),
  INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS instructor_id INT NULL,
  ADD COLUMN IF NOT EXISTS thumbnail_url VARCHAR(500),
  ADD COLUMN IF NOT EXISTS duration_hours DECIMAL(5, 1) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_lessons INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_students INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rating DECIMAL(3, 2) DEFAULT 4.80,
  ADD COLUMN IF NOT EXISTS requirements JSON,
  ADD COLUMN IF NOT EXISTS what_you_learn JSON,
  ADD COLUMN IF NOT EXISTS curriculum JSON;

CREATE TABLE IF NOT EXISTS posts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  excerpt TEXT NOT NULL,
  content LONGTEXT NOT NULL,
  cover_image_url VARCHAR(500),
  author_id INT NULL,
  category VARCHAR(100) NOT NULL,
  tags JSON,
  read_time INT DEFAULT 5,
  is_published BOOLEAN DEFAULT TRUE,
  published_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_slug (slug),
  INDEX idx_category (category),
  INDEX idx_published (is_published, published_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

