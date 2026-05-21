# Roles Y Usuarios Demo

El seed crea cuatro roles y cuatro usuarios de prueba. Todos usan la misma password demo:

```text
CoderUp2026!
```

Estas credenciales son para desarrollo, pruebas y demo academica. En produccion deben cambiarse o eliminarse.

## Usuarios Seed

| Rol | Email | Password | Uso principal |
| --- | --- | --- | --- |
| admin | admin@coderup.com | CoderUp2026! | Administracion completa |
| editor | editor@coderup.com | CoderUp2026! | Gestion editorial de cursos |
| client | cliente@coderup.com | CoderUp2026! | Compra y consumo de cursos |
| guest | guest@coderup.com | CoderUp2026! | Cuenta demo sin privilegios |

## Permisos En Frontend

| Rol | Puede hacer |
| --- | --- |
| admin | Entrar en `/admin`, ver resumen, gestionar cursos, gestionar usuarios y roles, ver pedidos globales. En `/admin/cursos` tambien puede eliminar cursos desde la UI. |
| editor | Entrar directamente en `/admin/cursos`, crear y editar cursos. La UI no muestra la accion de eliminar. No puede gestionar usuarios, pedidos globales ni resumen admin. |
| client | Comprar cursos premium, usar carrito, aplicar cupones, hacer checkout, ver pedidos propios y acceder a sus cursos inscritos. |
| guest | Iniciar sesion como cuenta demo sin permisos administrativos. Puede navegar catalogo; para comprar o inscribirse debe seguir los mismos flujos de cuenta que un usuario normal, pero no tiene permisos admin/editor. |

## Permisos En Backend

| Rol | Endpoints permitidos |
| --- | --- |
| admin | Todo lo protegido: `/admin/stats.php`, `/users/index.php`, `/users/update-role.php`, `/orders/index.php`, `/courses/create.php`, `/courses/update.php`, `/courses/delete.php`, endpoints de cuenta, carrito, checkout y enrollments. |
| editor | Endpoints protegidos por `requireAdminOrEditor()`: listado completo de cursos con `all=1`, crear, actualizar y eliminar cursos en backend. No puede acceder a usuarios, pedidos globales ni estadisticas admin. |
| client | Endpoints autenticados de cliente: `/auth/me.php`, `/api/cart/checkout.php`, `/api/orders.php`, `/api/enrollments.php` y operaciones de carrito con token/sesion. No puede acceder a endpoints admin/editor. |
| guest | Tiene token valido tras login, pero no pasa controles `admin` ni `editor`. Se comporta como cuenta autenticada sin privilegios de gestion. |

## Origen De Los Datos

- `database/seed.sql` inserta roles y usuarios demo al cargar datos iniciales.
- `backend/helpers/auth.php` reasegura esas cuentas en login si faltan, manteniendo roles y password demo sincronizados.
- `backend/helpers/auth.php` define los valid roles: `admin`, `editor`, `client`, `guest`.
