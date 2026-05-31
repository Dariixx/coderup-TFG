CREATE TABLE IF NOT EXISTS course_reviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  course_id INT NOT NULL,
  rating TINYINT NOT NULL,
  comment TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  UNIQUE KEY unique_course_review (user_id, course_id),
  INDEX idx_course (course_id),
  INDEX idx_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

UPDATE courses c
SET total_students = (
  SELECT COUNT(*)
  FROM enrollments e
  WHERE e.course_id = c.id
)
WHERE c.total_students = 0;

UPDATE courses
SET rating = CASE slug
  WHEN 'react-avanzado' THEN 4.80
  WHEN 'nodejs-apis-rest' THEN 4.90
  WHEN 'typescript-profesional' THEN 4.70
  WHEN 'astro-desde-cero' THEN 4.70
  WHEN 'python-fullstack' THEN 4.80
  WHEN 'docker-kubernetes' THEN 4.70
  WHEN 'tailwind-css-masterclass' THEN 4.60
  WHEN 'git-github-pro' THEN 4.70
  WHEN 'sql-bases-de-datos' THEN 4.90
  WHEN 'html-css-desde-cero' THEN 4.60
  WHEN 'react-native-apps' THEN 4.80
  WHEN 'ui-ux-design-fundamentals' THEN 4.60
  WHEN 'inteligencia-artificial-developers' THEN 4.80
  WHEN 'ciberseguridad-web-esencial' THEN 4.70
  WHEN 'machine-learning-python' THEN 4.80
  WHEN 'testing-frontend-profesional' THEN 4.70
  WHEN 'laravel-php-moderno' THEN 4.70
  WHEN 'automatizacion-github-actions' THEN 4.60
  WHEN 'flutter-apps-multiplataforma' THEN 4.70
  WHEN 'figma-sistemas-diseno' THEN 4.60
  WHEN 'pentesting-web-desde-cero' THEN 4.70
  WHEN 'mlops-proyectos-python' THEN 4.70
  WHEN 'kotlin-android-esencial' THEN 4.60
  WHEN 'arquitectura-cloud-aws' THEN 4.80
  ELSE rating
END
WHERE rating = 0;

UPDATE courses
SET total_students = CASE slug
  WHEN 'react-avanzado' THEN 2400
  WHEN 'nodejs-apis-rest' THEN 3100
  WHEN 'typescript-profesional' THEN 1800
  WHEN 'astro-desde-cero' THEN 1600
  WHEN 'python-fullstack' THEN 2100
  WHEN 'docker-kubernetes' THEN 1800
  WHEN 'tailwind-css-masterclass' THEN 900
  WHEN 'git-github-pro' THEN 1200
  WHEN 'sql-bases-de-datos' THEN 3100
  WHEN 'html-css-desde-cero' THEN 900
  WHEN 'react-native-apps' THEN 2400
  WHEN 'ui-ux-design-fundamentals' THEN 900
  WHEN 'inteligencia-artificial-developers' THEN 1450
  WHEN 'ciberseguridad-web-esencial' THEN 980
  WHEN 'machine-learning-python' THEN 1320
  WHEN 'testing-frontend-profesional' THEN 870
  WHEN 'laravel-php-moderno' THEN 1180
  WHEN 'automatizacion-github-actions' THEN 760
  WHEN 'flutter-apps-multiplataforma' THEN 620
  WHEN 'figma-sistemas-diseno' THEN 540
  WHEN 'pentesting-web-desde-cero' THEN 480
  WHEN 'mlops-proyectos-python' THEN 410
  WHEN 'kotlin-android-esencial' THEN 360
  WHEN 'arquitectura-cloud-aws' THEN 520
  ELSE total_students
END
WHERE total_students = 0;

UPDATE courses SET thumbnail_url = 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?auto=format&fit=crop&w=1200&q=82' WHERE slug = 'javascript-moderno';
UPDATE posts SET cover_image_url = 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=82' WHERE slug = 'typescript-vs-javascript';
