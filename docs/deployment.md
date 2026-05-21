# Despliegue CoderUp

Guia rapida para desplegar CoderUp con frontend en Vercel y backend PHP + MySQL en Railway.

## URLs De Produccion

- Frontend: https://coderup-tfg.vercel.app
- Backend Railway: https://coderup-tfg-production.up.railway.app

## Vercel

Configura el proyecto como Astro:

```text
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

Variable obligatoria:

```env
PUBLIC_API_URL=https://coderup-tfg-production.up.railway.app
```

Despues de desplegar, comprueba:

```text
https://coderup-tfg.vercel.app
https://coderup-tfg.vercel.app/cursos
https://coderup-tfg.vercel.app/login
```

## Railway

El backend se despliega como servicio PHP con Nixpacks. La configuracion vive en:

- `backend/railway.json`
- `backend/nixpacks.toml`

Comando de arranque esperado:

```bash
php -S 0.0.0.0:$PORT -t /app router.php
```

Variables obligatorias:

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

## Base De Datos

Importa esquema y datos iniciales una vez contra la base MySQL de Railway:

```bash
mysql -h <DB_HOST> -P <DB_PORT> -u <DB_USER> -p <DB_NAME> < database/schema.sql
mysql -h <DB_HOST> -P <DB_PORT> -u <DB_USER> -p <DB_NAME> < database/seed.sql
```

## Pruebas Basicas

Backend:

```bash
curl https://coderup-tfg-production.up.railway.app/index.php
curl https://coderup-tfg-production.up.railway.app/api/courses.php
curl "https://coderup-tfg-production.up.railway.app/api/courses/show.php?slug=react-avanzado"
```

Frontend:

```text
https://coderup-tfg.vercel.app
https://coderup-tfg.vercel.app/cursos
https://coderup-tfg.vercel.app/forgot-password
```

Validacion local antes de desplegar:

```bash
npm run build
find backend -type f -name '*.php' -maxdepth 4 -print0 | xargs -0 -n1 php -l
```
