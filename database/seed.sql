-- CoderUp Database Seed
-- Datos de prueba para demostración

-- Limpiar tablas (cuidado con el orden debido a las claves foráneas)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE enrollments;
TRUNCATE TABLE order_items;
TRUNCATE TABLE orders;
TRUNCATE TABLE coupons;
TRUNCATE TABLE courses;
TRUNCATE TABLE categories;
TRUNCATE TABLE users;
TRUNCATE TABLE roles;
SET FOREIGN_KEY_CHECKS = 1;

-- Insertar roles
INSERT INTO roles (name, description) VALUES
('admin', 'Administrador del sistema'),
('editor', 'Editor de cursos'),
('client', 'Cliente/Usuario pagador'),
('guest', 'Usuario invitado sin compras');

-- Insertar usuarios de prueba
-- Las contraseñas están hasheadas con password_hash('Coderup123!', PASSWORD_BCRYPT)
-- Hash: $2y$12$JjNRzT0Z0X0XyB0Z0X0XyB0Z0X0XyB0Z0X0XyB0Z0X0XyB0Z0X0X
INSERT INTO users (name, email, password, role) VALUES
('Admin CoderUp', 'admin@coderup.com', '$2y$12$JjNRzT0Z0X0XyB0Z0X0XyB0Z0X0XyB0Z0X0XyB0Z0X0XyB0Z0X0X', 'admin'),
('Editor CoderUp', 'editor@coderup.com', '$2y$12$JjNRzT0Z0X0XyB0Z0X0XyB0Z0X0XyB0Z0X0XyB0Z0X0XyB0Z0X0X', 'editor'),
('Juan Cliente', 'cliente@coderup.com', '$2y$12$JjNRzT0Z0X0XyB0Z0X0XyB0Z0X0XyB0Z0X0XyB0Z0X0XyB0Z0X0X', 'client'),
('Invitado Demo', 'invitado@coderup.com', '$2y$12$JjNRzT0Z0X0XyB0Z0X0XyB0Z0X0XyB0Z0X0XyB0Z0X0XyB0Z0X0X', 'guest');

-- Insertar categorías
INSERT INTO categories (name, slug, description, icon) VALUES
('Frontend', 'frontend', 'Desarrollo de interfaces y experiencia de usuario', 'lucide:code'),
('Backend', 'backend', 'Desarrollo de servidores y APIs', 'lucide:hexagon'),
('DevOps', 'devops', 'Infraestructura, CI/CD y deployment', 'lucide:container'),
('Mobile', 'mobile', 'Desarrollo de aplicaciones móviles', 'lucide:smartphone'),
('Fullstack', 'fullstack', 'Desarrollo completo front y back', 'lucide:globe'),
('Diseño UI/UX', 'diseno-ui-ux', 'Diseño de interfaces y experiencia', 'lucide:figma');

-- Insertar cursos
INSERT INTO courses (title, description, slug, price, level, category_id, created_by) VALUES
('React Avanzado', 'Aprende hooks, context, patrones avanzados y arquitectura de aplicaciones React profesionales.', 'react-avanzado', 49.99, 'Avanzado', 1, 2),
('Node.js & APIs REST', 'Crea APIs robustas con Express, autenticación JWT, validación y bases de datos.', 'nodejs-apis-rest', 39.99, 'Intermedio', 2, 2),
('JavaScript Moderno', 'ES6+, async/await, DOM, y todo lo necesario para dominar JavaScript completamente.', 'javascript-moderno', 29.99, 'Desde cero', 1, 2),
('TypeScript Profesional', 'Tipos avanzados, generics, decorators y patrones enterprise con TypeScript.', 'typescript-profesional', 44.99, 'Intermedio', 1, 2),
('Astro desde Cero', 'Crea sitios web ultra rápidos con Astro, islands architecture y contenido estático.', 'astro-desde-cero', 34.99, 'Desde cero', 1, 2),
('Python Fullstack', 'Django, FastAPI, bases de datos y despliegue de aplicaciones Python profesionales.', 'python-fullstack', 54.99, 'Intermedio', 2, 2),
('Docker & Kubernetes', 'Contenedores, orquestación, CI/CD y despliegue en la nube de forma profesional.', 'docker-kubernetes', 59.99, 'Avanzado', 3, 2),
('React Native Apps', 'Crea apps móviles nativas para iOS y Android con React Native y Expo.', 'react-native-apps', 49.99, 'Intermedio', 4, 2),
('Tailwind CSS Masterclass', 'Domina Tailwind CSS: responsive, dark mode, animaciones y componentes profesionales.', 'tailwind-css-masterclass', 24.99, 'Intermedio', 1, 2),
('Git & GitHub Pro', 'Control de versiones, branching, pull requests, GitHub Actions y workflows profesionales.', 'git-github-pro', 19.99, 'Desde cero', 3, 2),
('SQL & Bases de Datos', 'MySQL, PostgreSQL, queries avanzadas, optimización y diseño de esquemas.', 'sql-bases-de-datos', 29.99, 'Desde cero', 2, 2),
('HTML & CSS desde Cero', 'Fundamentos web, flexbox, grid, responsive design y buenas prácticas.', 'html-css-desde-cero', 0, 'Desde cero', 1, 2);

-- Insertar cupones
INSERT INTO coupons (code, discount_type, discount_value, only_new_users, active) VALUES
('WELCOME20', 'percentage', 20, TRUE, TRUE),
('DESCUENTO10', 'percentage', 10, FALSE, TRUE),
('PROMO5', 'fixed', 5, FALSE, TRUE);

-- Insertar órdenes de prueba
INSERT INTO orders (user_id, order_number, subtotal, discount, total, coupon_code, status) VALUES
(3, 'ORD-20240115-1234', 99.98, 19.99, 79.99, 'WELCOME20', 'completed'),
(3, 'ORD-20240120-5678', 49.99, 0, 49.99, NULL, 'completed');

-- Insertar items de órdenes
INSERT INTO order_items (order_id, course_id, price_at_purchase) VALUES
(1, 1, 49.99),
(1, 2, 39.99),
(2, 5, 34.99);

-- Insertar enrollments (inscripciones)
INSERT INTO enrollments (user_id, course_id, progress, status) VALUES
(3, 1, 50, 'enrolled'),
(3, 2, 100, 'completed'),
(3, 5, 25, 'enrolled');
