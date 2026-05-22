SET NAMES utf8mb4;

-- Sincroniza las cuentas demo sin borrar cursos, pedidos ni usuarios reales.
-- Password comun: CoderUp2026!
INSERT INTO users (name, email, password, role, created_at) VALUES
('Admin CoderUp', 'admin@coderup.com', '$2y$12$CYz/PPvyBPTaRiQSLkiL/.z45Kuk35hjDEYGxl0nbDjdvaG3I97Je', 'admin', NOW()),
('Editor CoderUp', 'editor@coderup.com', '$2y$12$CYz/PPvyBPTaRiQSLkiL/.z45Kuk35hjDEYGxl0nbDjdvaG3I97Je', 'editor', NOW()),
('Cliente CoderUp', 'cliente@coderup.com', '$2y$12$CYz/PPvyBPTaRiQSLkiL/.z45Kuk35hjDEYGxl0nbDjdvaG3I97Je', 'client', NOW()),
('Guest CoderUp', 'guest@coderup.com', '$2y$12$CYz/PPvyBPTaRiQSLkiL/.z45Kuk35hjDEYGxl0nbDjdvaG3I97Je', 'guest', NOW())
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  password = VALUES(password),
  role = VALUES(role);
