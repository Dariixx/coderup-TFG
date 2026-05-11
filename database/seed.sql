USE coderup_db;

-- Contraseña de prueba para todos los usuarios:
-- CoderUp123!
-- Hash generado con password_hash('CoderUp123!', PASSWORD_DEFAULT)

INSERT INTO roles (id, name, description) VALUES
    (1, 'admin', 'Acceso completo al panel y a la gestión académica del proyecto.'),
    (2, 'editor', 'Puede crear y editar cursos, pero no eliminar usuarios ni cursos críticos.'),
    (3, 'cliente', 'Usuario registrado que compra cursos y consulta sus pedidos.'),
    (4, 'invitado', 'Perfil de acceso limitado para demostraciones y pruebas.');

INSERT INTO users (id, role_id, name, email, password, created_at, updated_at) VALUES
    (1, 1, 'Administrador CoderUp', 'admin@coderup.com', '$2y$12$IUN38ZDad1xUBWW8MrPXYOl.8M5MBifSjsCIOpZnB/VnQvhwJ4eTq', NOW(), NOW()),
    (2, 2, 'Editor CoderUp', 'editor@coderup.com', '$2y$12$IUN38ZDad1xUBWW8MrPXYOl.8M5MBifSjsCIOpZnB/VnQvhwJ4eTq', NOW(), NOW()),
    (3, 3, 'Cliente Demo', 'cliente@coderup.com', '$2y$12$IUN38ZDad1xUBWW8MrPXYOl.8M5MBifSjsCIOpZnB/VnQvhwJ4eTq', NOW(), NOW()),
    (4, 4, 'Invitado Demo', 'invitado@coderup.com', '$2y$12$IUN38ZDad1xUBWW8MrPXYOl.8M5MBifSjsCIOpZnB/VnQvhwJ4eTq', NOW(), NOW());

INSERT INTO categories (id, name, slug, description) VALUES
    (1, 'Desarrollo Web', 'desarrollo-web', 'Fundamentos para crear interfaces y sitios web modernos.'),
    (2, 'JavaScript', 'javascript', 'Programación moderna en el ecosistema frontend y fullstack.'),
    (3, 'Backend', 'backend', 'APIs, lógica de negocio y servicios de servidor con PHP y Node.js.'),
    (4, 'Bases de Datos', 'bases-de-datos', 'Modelado relacional, SQL y persistencia de datos.'),
    (5, 'Diseño UX/UI', 'diseno-ux-ui', 'Diseño centrado en el usuario, accesibilidad y responsive design.');

INSERT INTO courses (id, category_id, title, slug, description, short_description, image, level, duration, price, is_premium, created_at, updated_at) VALUES
    (1, 1, 'HTML y CSS desde cero', 'html-css-desde-cero', 'Curso de introducción al desarrollo web con estructura HTML semántica y maquetación responsive con CSS moderno.', 'Aprende a crear páginas web responsive con HTML y CSS.', '/logo.webp', 'Inicial', '18 horas', 19.99, 1, NOW(), NOW()),
    (2, 2, 'JavaScript moderno', 'javascript-moderno', 'Curso práctico sobre ES6+, manipulación del DOM, asincronía y buenas prácticas para proyectos reales.', 'Domina JavaScript actual con ejercicios reales.', '/logo.webp', 'Inicial', '22 horas', 24.99, 1, NOW(), NOW()),
    (3, 1, 'React práctico', 'react-practico', 'Construcción de interfaces reactivas con componentes, estados, formularios y consumo de APIs.', 'Construye interfaces modernas con React.', '/logo.webp', 'Intermedio', '20 horas', 34.99, 1, NOW(), NOW()),
    (4, 3, 'PHP y MySQL para principiantes', 'php-mysql-principiantes', 'Introducción a PHP, formularios, sesiones, PDO y desarrollo de una pequeña aplicación CRUD conectada a MySQL.', 'Backend académico con PHP y MySQL paso a paso.', '/logo.webp', 'Inicial', '24 horas', 29.99, 1, NOW(), NOW()),
    (5, 3, 'Node.js básico', 'nodejs-basico', 'Fundamentos del desarrollo backend con Node.js, rutas, controladores y APIs básicas.', 'Aprende backend básico con Node.js.', '/logo.webp', 'Inicial', '16 horas', 21.99, 1, NOW(), NOW()),
    (6, 4, 'SQL esencial', 'sql-esencial', 'Consultas SQL, modelado relacional y optimización básica de bases de datos para proyectos web.', 'Consultas SQL y modelado relacional para web.', '/logo.webp', 'Inicial', '14 horas', 18.99, 1, NOW(), NOW()),
    (7, 5, 'Diseño responsive', 'diseno-responsive', 'Diseño de interfaces adaptativas, grid, flexbox, componentes accesibles y pruebas responsive.', 'Responsive design y accesibilidad para interfaces web.', '/logo.webp', 'Inicial', '12 horas', 17.99, 1, NOW(), NOW()),
    (8, 1, 'Git y GitHub profesional', 'git-github-profesional', 'Flujo de trabajo con ramas, pull requests, revisión de código y control de versiones para equipos.', 'Control de versiones profesional para equipos.', '/logo.webp', 'Inicial', '10 horas', 15.99, 1, NOW(), NOW());

INSERT INTO orders (id, user_id, total, discount_code, discount_amount, status, created_at) VALUES
    (1, 3, 43.98, 'WELCOME20', 11.00, 'completed', NOW()),
    (2, 1, 29.99, NULL, 0.00, 'completed', NOW());

INSERT INTO order_items (id, order_id, course_id, price, created_at) VALUES
    (1, 1, 2, 24.99, NOW()),
    (2, 1, 8, 15.99, NOW()),
    (3, 1, 7, 17.99, NOW()),
    (4, 2, 4, 29.99, NOW());
