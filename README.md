# CoderUp

CoderUp es una plataforma web de cursos online centrada en programación y desarrollo web. Este repositorio corresponde al proyecto final DAW y queda preparado para la Fase 3: ejecución del proyecto, con frontend en Astro/React/TypeScript y backend propio en PHP + MySQL.

## Objetivo académico

El objetivo es demostrar una arquitectura web completa y defendible:

- Frontend responsive con Astro y React.
- Validación de formularios en cliente.
- Backend PHP con endpoints JSON.
- Comunicación mediante `fetch()`.
- Base de datos relacional MySQL.
- Autenticación real con sesiones, `password_hash()` y `password_verify()`.
- CRUD funcional de cursos.
- Roles y permisos diferenciados.

## Tecnologías usadas

- Astro
- React
- TypeScript
- Tailwind CSS / estilos actuales del proyecto
- PHP 8+
- MySQL
- PDO

## Arquitectura

- `src/`: frontend Astro + React.
- `backend/`: API propia en PHP organizada por dominio.
- `database/`: scripts SQL de esquema y datos de prueba.
- `docs/`: documentación académica y evidencias.

## Estructura de carpetas

```text
.
├── backend/
│   ├── admin/
│   ├── auth/
│   ├── config/
│   ├── courses/
│   ├── helpers/
│   ├── orders/
│   └── users/
├── database/
│   ├── schema.sql
│   └── seed.sql
├── docs/
│   ├── capturas/fase-3/
│   └── fase-3-ejecucion.md
├── src/
│   ├── components/
│   ├── data/
│   ├── layouts/
│   ├── lib/
│   ├── pages/
│   └── styles/
├── .env.example
└── AGENTS.md
```

## Instalación frontend

```bash
npm install
npm run dev
```

Build de producción:

```bash
npm run build
```

## Configuración backend PHP

El backend está pensado para ejecutarse en un entorno local tipo XAMPP, MAMP, Laragon o servidor PHP/Apache/Nginx apuntando a la carpeta `backend/`.

Variables recomendadas:

- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `DB_CHARSET`
- `APP_FRONTEND_URL`

En frontend:

- `PUBLIC_API_BASE_URL`

## Configuración MySQL

1. Crear la base de datos importando `database/schema.sql`.
2. Importar después `database/seed.sql`.
3. Ajustar las credenciales de conexión para que coincidan con tu entorno.

## Cómo importar `schema.sql` y `seed.sql`

Con phpMyAdmin:

1. Crear o seleccionar una base de datos.
2. Importar `database/schema.sql`.
3. Importar `database/seed.sql`.

Con consola:

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p coderup_db < database/seed.sql
```

## Variables de entorno

Consulta `.env.example` para la plantilla base.

## Usuarios de prueba

Todos los usuarios del seed comparten la contraseña:

- `CoderUp123!`

Usuarios disponibles:

- `admin@coderup.com`
- `editor@coderup.com`
- `cliente@coderup.com`
- `invitado@coderup.com`

## Endpoints principales

Autenticación:

- `POST /backend/auth/register.php`
- `POST /backend/auth/login.php`
- `POST /backend/auth/logout.php`
- `GET /backend/auth/me.php`

Cursos:

- `GET /backend/courses/index.php`
- `GET /backend/courses/show.php?slug=...`
- `POST /backend/courses/create.php`
- `POST /backend/courses/update.php` con `_method=PUT`
- `POST /backend/courses/delete.php` con `_method=DELETE`

Pedidos:

- `POST /backend/orders/create.php`
- `GET /backend/orders/user-orders.php`
- `GET /backend/orders/index.php`

Usuarios y administración:

- `GET /backend/users/index.php`
- `GET /backend/users/show.php?id=...`
- `POST /backend/users/update-role.php`
- `GET /backend/admin/stats.php`

## Funcionalidades implementadas

- Catálogo de cursos con fallback a datos locales durante desarrollo.
- Registro e inicio de sesión reales.
- Carrito con cupón de bienvenida.
- Checkout conectado con backend y persistencia de pedidos.
- Historial de pedidos del usuario autenticado.
- Panel admin básico para estadísticas, cursos, pedidos y usuarios.

## Seguridad aplicada

- Contraseñas almacenadas con `password_hash()`.
- Verificación mediante `password_verify()`.
- Consultas preparadas con PDO.
- Validación de campos en cliente y servidor.
- Sesiones PHP para autenticación.
- Respuestas JSON controladas con manejo de errores.

## Capturas recomendadas para Fase 3

- Inicio de sesión correcto con usuario `admin`.
- Registro de usuario nuevo.
- Tabla `users` en phpMyAdmin mostrando roles.
- Listado de cursos cargado desde base de datos.
- Creación y edición de un curso desde `/admin/cursos`.
- Pedido creado correctamente desde checkout.
- Historial de pedidos del usuario.
- Panel `/admin` con estadísticas.

## Cómo ejecutar el proyecto

1. Instalar dependencias con `npm install`.
2. Importar `database/schema.sql`.
3. Importar `database/seed.sql`.
4. Configurar el servidor PHP apuntando a `backend/`.
5. Definir `PUBLIC_API_BASE_URL` hacia el backend.
6. Ejecutar `npm run dev`.

## Autor

Proyecto académico DAW sobre la plataforma CoderUp.
