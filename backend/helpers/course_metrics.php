<?php

function ensureCourseReviewsTable(PDO $conn) {
    $conn->exec('
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
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ');
}

function incrementCourseStudentCount(PDO $conn, int $courseId) {
    $stmt = $conn->prepare('UPDATE courses SET total_students = total_students + 1 WHERE id = ?');
    $stmt->execute([$courseId]);

    $stmt = $conn->prepare('
        UPDATE instructors i
        JOIN courses c ON c.instructor_id = i.id
        SET i.total_students = i.total_students + 1
        WHERE c.id = ?
    ');
    $stmt->execute([$courseId]);
}

function syncCourseRating(PDO $conn, int $courseId) {
    $stmt = $conn->prepare('
        UPDATE courses c
        SET rating = COALESCE((
            SELECT ROUND(AVG(r.rating), 2)
            FROM course_reviews r
            WHERE r.course_id = c.id
        ), 0)
        WHERE c.id = ?
    ');
    $stmt->execute([$courseId]);
}
