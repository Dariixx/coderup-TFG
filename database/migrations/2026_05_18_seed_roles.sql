CREATE TABLE IF NOT EXISTS roles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO roles (id, name, description) VALUES
(1, 'admin', 'Administrador del sistema'),
(2, 'editor', 'Editor de cursos y contenidos'),
(3, 'client', 'Cliente que puede comprar cursos'),
(4, 'guest', 'Visitante sin compras');

UPDATE users SET role = 'client' WHERE role IS NULL OR role = '';
