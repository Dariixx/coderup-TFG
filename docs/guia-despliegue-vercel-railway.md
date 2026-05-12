# Guía de Despliegue — Vercel + Railway

**CoderUp** = Frontend en Vercel (gratis) + Backend PHP + MySQL en Railway (gratis)

---

## Visión General

```
Usuario
  │
  ▼
Vercel (Frontend Astro — HTML/CSS/JS estático)
  │  fetch() a la API
  ▼
Railway (Backend PHP)
  │  PDO MySQL
  ▼
Railway (MySQL 8.0)
```

---

## PASO 1 — Preparar el repositorio en GitHub

Primero necesitas el código en GitHub (Railway y Vercel se conectan desde ahí).

```bash
# En la carpeta del proyecto
git init
git add .
git commit -m "CoderUp TFG — Fase 3 lista para despliegue"

# Crear repositorio en github.com (sin README, sin .gitignore)
# Luego:
git remote add origin https://github.com/TU-USUARIO/coderup-tfg.git
git branch -M main
git push -u origin main
```

> ⚠️ Asegúrate de que `.env` NO está en el commit (está en `.gitignore`)

---

## PASO 2 — Railway: MySQL (Base de Datos)

1. Entra en [railway.app](https://railway.app) → **New Project**
2. Elige **Deploy MySQL** (el plugin de base de datos, no un servicio propio)
3. Railway crea la BD automáticamente y te da variables:
   - `MYSQLHOST`, `MYSQLPORT`, `MYSQLDATABASE`, `MYSQLUSER`, `MYSQLPASSWORD`

### Importar el schema y datos

En Railway → tu servicio MySQL → pestaña **Data** → **Connect** → copia el comando de conexión. Luego:

```bash
# Desde tu máquina local, importar schema:
mysql -h MYSQLHOST -P MYSQLPORT -u MYSQLUSER -pMYSQLPASSWORD MYSQLDATABASE < database/schema.sql

# Importar datos de prueba:
mysql -h MYSQLHOST -P MYSQLPORT -u MYSQLUSER -pMYSQLPASSWORD MYSQLDATABASE < database/seed.sql
```

O bien usa el editor SQL de Railway (botón **Query**) y pega el contenido de ambos archivos.

---

## PASO 3 — Railway: Backend PHP

1. En el mismo proyecto Railway → **New Service** → **GitHub Repo**
2. Selecciona tu repositorio → Railway detecta `nixpacks.toml` en `backend/`
3. En **Settings → Root Directory** pon: `backend`
4. En **Variables**, añade estas variables (copia los valores del servicio MySQL):

| Variable | Valor |
|----------|-------|
| `DB_HOST` | valor de `MYSQLHOST` del servicio MySQL |
| `DB_PORT` | valor de `MYSQLPORT` |
| `DB_NAME` | valor de `MYSQLDATABASE` |
| `DB_USER` | valor de `MYSQLUSER` |
| `DB_PASS` | valor de `MYSQLPASSWORD` |
| `FRONTEND_URL` | (lo añadirás después, cuando tengas la URL de Vercel) |

5. Railway despliega el backend. Ve a **Settings → Networking → Generate Domain**
6. Copia la URL pública, algo como: `https://coderup-backend.up.railway.app`

### Verificar que funciona

```bash
curl https://coderup-backend.up.railway.app/index.php
# Debe devolver: {"status":"ok","app":"CoderUp API","version":"1.0.0"}

curl https://coderup-backend.up.railway.app/auth/me.php
# Debe devolver: {"success":false,"message":"No autenticado"}
```

---

## PASO 4 — Vercel: Frontend Astro

1. Entra en [vercel.com](https://vercel.com) → **New Project**
2. Importa tu repositorio de GitHub
3. Vercel detecta Astro automáticamente
4. En **Environment Variables**, añade:

| Variable | Valor |
|----------|-------|
| `PUBLIC_API_URL` | `https://coderup-backend.up.railway.app` (sin slash final) |

5. Haz clic en **Deploy**
6. Copia tu URL de Vercel: `https://coderup-tfg.vercel.app`

---

## PASO 5 — Conectar Vercel ↔ Railway (CORS)

Vuelve a Railway → tu servicio PHP → **Variables** → añade:

| Variable | Valor |
|----------|-------|
| `FRONTEND_URL` | `https://coderup-tfg.vercel.app` (tu URL real de Vercel) |

Railway redespliega automáticamente al guardar variables.

---

## PASO 6 — Verificación Final

Abre tu web en Vercel y prueba:

- [ ] La web carga correctamente
- [ ] Ve a `/login` → inicia sesión con `cliente@coderup.com` / `Cliente1234!`
- [ ] Ve a `/register` → crea una cuenta nueva → aparece en Railway MySQL
- [ ] Añade un curso al carrito → completa el checkout → aparece en `/mi-cuenta/pedidos`
- [ ] Prueba desde el móvil (responsive)

### Comprobar endpoints desde el navegador o curl

```bash
# Listar cursos (sin autenticación)
curl https://coderup-backend.up.railway.app/courses/index.php

# Login
curl -X POST https://coderup-backend.up.railway.app/auth/login.php \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@coderup.com","password":"Admin1234!"}'
```

---

## Usuarios de Prueba (ya en la BD tras el seed)

| Email | Contraseña | Rol |
|-------|-----------|-----|
| admin@coderup.com | Admin1234! | Admin |
| editor@coderup.com | Editor1234! | Editor |
| cliente@coderup.com | Cliente1234! | Cliente |
| invitado@coderup.com | Invitado1234! | Invitado |

---

## Troubleshooting

**La web carga pero el login no funciona**
→ Comprueba que `PUBLIC_API_URL` en Vercel apunta a Railway exactamente (sin slash al final)
→ Abre DevTools → Network → mira si el fetch a `/auth/login.php` devuelve error CORS
→ Verifica que `FRONTEND_URL` en Railway tiene el dominio exacto de Vercel

**Railway dice "Build failed"**
→ Comprueba que el Root Directory está en `backend`
→ Revisa los logs de build en Railway

**MySQL no conecta en Railway**
→ Las variables `DB_*` deben venir del servicio MySQL del mismo proyecto
→ Puedes usar las variables de referencia de Railway: `${{MySQL.MYSQLHOST}}`

**El seed no se importó**
→ Repite el import desde local con las credenciales de Railway
→ O usa el Query editor de Railway y pega el SQL directamente

---

## Para la Defensa

Puedes mostrar:
1. La URL de Vercel funcionando en el navegador
2. La URL del backend Railway respondiendo JSON
3. Railway dashboard con los servicios activos (MySQL + PHP)
4. Una compra en vivo → aparece en la BD de Railway en tiempo real

