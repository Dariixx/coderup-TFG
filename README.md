# CoderUp

Plataforma e-learning desarrollada como Trabajo Fin de Grado de DAW. Incluye catalogo de cursos, autenticacion, carrito, checkout, pedidos, inscripciones y panel de administracion.

## URLs

- Frontend: https://coderup-tfg.vercel.app
- Backend API Railway: https://coderup-tfg-production.up.railway.app
- Repositorio: https://github.com/Dariixx/coderup-TFG

## Stack

- Frontend: Astro, React, TypeScript, Tailwind CSS
- Backend: PHP 8.3, API REST JSON
- Base de datos: MySQL
- Deploy: Vercel para frontend, Railway para backend y MySQL
- Email: Brevo API para recuperacion de contraseña

## Variables De Entorno

El archivo [.env.example](.env.example) contiene las variables esperadas. No subas valores reales de secretos al repositorio.

### Vercel

Solo el frontend necesita conocer la API publica:

```env
PUBLIC_API_URL=https://coderup-tfg-production.up.railway.app
```

### Railway

El backend PHP necesita base de datos, CORS, recuperacion de contraseña y firma de tokens:

```env
APP_ENV=production
FRONTEND_URL=https://coderup-tfg.vercel.app
RESET_PASSWORD_URL=https://coderup-tfg.vercel.app/reset-password

DB_HOST=railway.internal
DB_PORT=3306
DB_NAME=railway
DB_USER=root
DB_PASS=replace_with_railway_mysql_password

AUTH_SECRET=replace_with_a_long_random_secret

BREVO_API_KEY=replace_with_brevo_api_key
SMTP_FROM_EMAIL=no-reply@coderup-tfg.vercel.app
SMTP_FROM_NAME=CoderUp
RESET_EMAIL_DEBUG=false
```

Railway puede inyectar nombres equivalentes de MySQL segun el plugin, pero el codigo actual lee `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` y `DB_PASS`.

## Instalacion Local

Requisitos:

- Node.js 22.12 o superior
- PHP 8.3 con `pdo_mysql`, `mbstring` y `curl`
- MySQL 8 o compatible

1. Clona el repositorio e instala dependencias:

```bash
git clone https://github.com/Dariixx/coderup-TFG.git
cd coderup-TFG
npm install
```

2. Crea la base de datos local e importa esquema y datos:

```bash
mysql -u root -e "CREATE DATABASE IF NOT EXISTS coderup CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root coderup < database/schema.sql
mysql -u root coderup < database/seed.sql
```

3. Crea un `.env` local:

```env
PUBLIC_API_URL=http://localhost:8000
APP_ENV=development
FRONTEND_URL=http://localhost:4321
RESET_PASSWORD_URL=http://localhost:4321/reset-password
DB_HOST=localhost
DB_PORT=3306
DB_NAME=coderup
DB_USER=root
DB_PASS=
AUTH_SECRET=local-development-secret-change-me
RESET_EMAIL_DEBUG=true
```

4. Arranca el backend:

```bash
php -S localhost:8000 -t backend
```

5. En otra terminal, arranca el frontend:

```bash
npm run dev
```

Abre http://localhost:4321.

## Despliegue

### Frontend En Vercel

1. Importa el repositorio en Vercel.
2. Usa framework `Astro`.
3. Configura:

```text
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

4. Añade la variable `PUBLIC_API_URL` con el backend de Railway:

```env
PUBLIC_API_URL=https://coderup-tfg-production.up.railway.app
```

5. Despliega y comprueba que el dominio final sea:

```text
https://coderup-tfg.vercel.app
```

### Backend En Railway

1. Crea un servicio Railway para el backend PHP desde este repositorio.
2. Añade un servicio MySQL y copia sus credenciales a las variables `DB_*`.
3. Configura las variables de Railway indicadas en la seccion anterior.
4. Railway usa [backend/railway.json](backend/railway.json) y [backend/nixpacks.toml](backend/nixpacks.toml). El comando de arranque esperado es:

```bash
php -S 0.0.0.0:$PORT -t /app router.php
```

5. Importa la base de datos una vez:

```bash
mysql -h <DB_HOST> -P <DB_PORT> -u <DB_USER> -p <DB_NAME> < database/schema.sql
mysql -h <DB_HOST> -P <DB_PORT> -u <DB_USER> -p <DB_NAME> < database/seed.sql
```

6. Comprueba el health check:

```text
GET https://coderup-tfg-production.up.railway.app/index.php
```

## Endpoints Principales

### Auth

- `POST /auth/register.php`
- `POST /auth/login.php`
- `GET /auth/me.php`
- `POST /auth/logout.php`
- `POST /auth/forgot-password.php`
- `POST /auth/reset-password.php`

### Cursos, Posts E Instructores

- `GET /api/courses.php`
- `GET /api/courses/show.php?slug=react-avanzado`
- `GET /api/posts.php`
- `GET /api/posts/show.php?slug=guia-completa-hooks-react`
- `GET /api/instructors.php`
- `GET /api/instructors/show.php?slug=juan-garcia-lopez-1`

### Carrito, Pedidos Y Cuenta

- `GET /api/cart.php`
- `POST /api/cart.php`
- `DELETE /api/cart.php?item_id=1`
- `POST /api/cart/checkout.php`
- `GET /api/orders.php`
- `POST /api/orders/create.php`
- `GET /api/enrollments.php`
- `POST /api/enrollments.php`
- `PUT /api/enrollments.php`
- `POST /api/coupons/validate.php`
- `GET /api/github-projects.php`

### Admin

- `GET /admin/stats.php`
- `GET /courses/index.php?all=1`
- `POST /courses/create.php`
- `POST /courses/update.php`
- `POST /courses/delete.php`
- `GET /orders/index.php`
- `GET /users/index.php`
- `POST /users/update-role.php`

## Pruebas Basicas

### Build Frontend

```bash
npm run build
```

### Sintaxis PHP

```bash
find backend -type f -name '*.php' -maxdepth 4 -print0 | xargs -0 -n1 php -l
```

### Endpoints Publicos

```bash
curl https://coderup-tfg-production.up.railway.app/index.php
curl https://coderup-tfg-production.up.railway.app/api/courses.php
curl "https://coderup-tfg-production.up.railway.app/api/courses/show.php?slug=react-avanzado"
```

### Flujo Manual

1. Abre https://coderup-tfg.vercel.app.
2. Registra una cuenta en `/register`.
3. Inicia sesion en `/login`.
4. Añade un curso premium al carrito.
5. Completa checkout.
6. Revisa `/mi-cuenta/pedidos` y `/mi-cuenta/mis-cursos`.
7. Prueba `/forgot-password` si `BREVO_API_KEY` esta configurado.

Usuarios de prueba cargados por `database/seed.sql`:

```text
admin@coderup.com
editor@coderup.com
cliente@coderup.com
guest@coderup.com
```

## Estructura

```text
coderup-TFG/
├── backend/
│   ├── api/
│   ├── auth/
│   ├── courses/
│   ├── orders/
│   ├── users/
│   ├── config/
│   ├── helpers/
│   ├── router.php
│   ├── railway.json
│   └── nixpacks.toml
├── database/
│   ├── migrations/
│   ├── schema.sql
│   └── seed.sql
├── docs/
│   └── deployment.md
├── src/
│   ├── components/
│   ├── layouts/
│   ├── lib/
│   ├── pages/
│   └── styles/
├── .env.example
├── astro.config.mjs
├── package.json
└── vercel.json
```

## Notas De Seguridad

- Las contraseñas se guardan con bcrypt.
- Los tokens Bearer se firman con `AUTH_SECRET`.
- CORS permite el dominio de Vercel y localhost.
- Las consultas SQL usan prepared statements.
- Los secretos deben vivir en Vercel/Railway, no en Git.

## Autor

- Dario Martos
- Proyecto Final DAW
- Digitech FP
