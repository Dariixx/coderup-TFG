INSERT INTO users (name, email, password, role, created_at)
VALUES
('Admin CoderUp', 'admin@coderup.com', '$2y$12$5SSktEND/8hWA8xZbEelueOlbtTvnqSVGabsGoV7Y8DKY9PGxgCU.', 'admin', NOW()),
('Editor CoderUp', 'editor@coderup.com', '$2y$12$POEyqluPrPRN7kSWikC9RefQC799cgOnh1F5MDe6Qs.YSe7s2Vbdq', 'editor', NOW()),
('Cliente CoderUp', 'cliente@coderup.com', '$2y$12$POEyqluPrPRN7kSWikC9RefQC799cgOnh1F5MDe6Qs.YSe7s2Vbdq', 'client', NOW()),
('Guest CoderUp', 'guest@coderup.com', '$2y$12$POEyqluPrPRN7kSWikC9RefQC799cgOnh1F5MDe6Qs.YSe7s2Vbdq', 'guest', NOW())
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  role = VALUES(role),
  password = VALUES(password);

UPDATE users
SET role = 'client'
WHERE email = 'dleonardomartos@gmail.com';

SELECT id, name, email, role
FROM users
ORDER BY role;
