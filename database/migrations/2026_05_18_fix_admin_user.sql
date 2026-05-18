INSERT INTO users (name, email, password, role, created_at)
VALUES (
  'Admin CoderUp',
  'admin@coderup.com',
  '$2y$12$AwkZO5rK4mfp0gc0XndV8uZR/IJpwYkfzdXrHIMqJqhC2.3jvz9N6',
  'admin',
  NOW()
)
ON DUPLICATE KEY UPDATE
  name = 'Admin CoderUp',
  role = 'admin',
  password = '$2y$12$AwkZO5rK4mfp0gc0XndV8uZR/IJpwYkfzdXrHIMqJqhC2.3jvz9N6';

UPDATE users
SET role = 'client'
WHERE email = 'dleonardomartos@gmail.com';

SELECT id, name, email, role
FROM users
ORDER BY role;
