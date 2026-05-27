# CoderUp - Plataforma de Cursos Online

## Descripción
Plataforma e-learning profesional desarrollada como Trabajo Fin de Grado (DAW). Permite registro, autenticación, compra de cursos y gestión de órdenes. Arquitectura moderna con frontend Astro en Vercel y backend PHP en Railway.

## Tecnologías
- **Frontend**: Astro, React, TypeScript, Tailwind CSS
- **Backend**: PHP 8.3, API REST
- **Base de datos**: MySQL 8.0
- **Hosting**: Vercel (frontend), Railway (backend + BD)
- **Email**: Brevo API

## Arquitectura

### Frontend (Vercel)
- Astro para SSR/SSG
- Componentes React para interactividad
- TypeScript para type safety
- Comunicación fetch con backend

### Backend (Railway)
- PHP 8.3
- API REST JSON
- JWT/Tokens para autenticación
- Bcrypt para contraseñas

### Base de datos (Railway MySQL)
- 8 tablas relacionadas
- Diseño normalizado (3NF)
- Integridad referencial con FKs

## URLs en Producción
- **Frontend**: https://coderup-tfg.vercel.app
- **Backend API**: https://coderup-tfg-production.up.railway.app
- **GitHub**: https://github.com/Dariixx/coderup-TFG

## Funcionalidades Implementadas

### Autenticación
- Registro con email único
- Login con token
- Logout
- Recuperación de contraseña (email real con Brevo)
- Reset password con token temporal (1 hora)

### Ecommerce
- Catálogo de cursos
- Carrito de compras
- Crear órdenes
- Historial de compras
- Descuentos con cupones

### Seguridad
- Contraseñas hasheadas con bcrypt
- Validación en servidor
- CORS configurado
- Sanitización contra XSS
- Tokens con expiración

### Roles y Permisos
- **admin**: acceso total
- **editor**: crear/editar contenido
- **client**: comprar cursos
- **guest**: ver catálogo

## Endpoints API

### Autenticación
- POST /auth/register.php
- POST /auth/login.php
- GET /auth/me.php
- POST /auth/logout.php
- POST /auth/forgot-password.php
- POST /auth/reset-password.php

### Cursos
- GET /api/courses.php
- GET /api/courses/show.php?slug=react-avanzado

### Órdenes
- POST /api/orders/create.php
- GET /api/orders.php
- GET /orders/index.php

### Contenido
- GET /api/instructors.php
- GET /api/instructors/show.php?id=1
- GET /api/posts.php
- GET /api/posts/show.php?slug=guia-completa-hooks-react
- POST /api/coupons/validate.php

## Instalación Local

### Backend
```bash
# 1. Clonar repo
git clone https://github.com/Dariixx/coderup-TFG.git
cd coderup-TFG

# 2. Importar BD
mysql -u root coderup < database/schema.sql
mysql -u root coderup < database/seed.sql

# 3. Arrancar servidor PHP
php -S localhost:8000 -t backend
```

### Frontend
```bash
# En otra terminal
npm install
npm run dev
# Abre http://localhost:4321
```

## Variables de Entorno (Railway)

```env
DB_HOST=railway.internal
DB_PORT=3306
DB_NAME=railway
DB_USER=root
DB_PASS=tu_contraseña
APP_ENV=production
BREVO_API_KEY=tu_api_key
SMTP_FROM_EMAIL=tu@email.com
SMTP_FROM_NAME=CoderUp
RESET_PASSWORD_URL=https://tu-url.vercel.app/reset-password
FRONTEND_URL=https://tu-url.vercel.app
```

## Diagrama de Base de Datos

```text
users (id, email, password, name, role, reset_token, reset_token_expires_at, created_at)
├── orders (id, user_id, order_number, total, status, created_at)
│   └── order_items (id, order_id, course_id, price_at_purchase)
├── enrollments (id, user_id, course_id, progress, status, created_at)
└── roles (id, name, description)

categories (id, name, slug, icon)
└── courses (id, title, slug, price, level, category_id, created_at)

coupons (id, code, discount_type, discount_value, active)
```

## Flujo de Compra

1. Usuario se registra / inicia sesión
2. Navega catálogo de cursos
3. Agrega cursos al carrito
4. Realiza checkout
5. Sistema crea orden en MySQL
6. Se enrolla el usuario en los cursos
7. Usuario ve historial en /mi-cuenta/pedidos

## Flujo de Recuperación de Contraseña

1. Usuario va a /forgot-password
2. Ingresa email
3. Backend genera token + expiración
4. Envía email real por Brevo
5. Usuario abre enlace: /reset-password?token=XXX
6. Introduce nueva contraseña
7. Backend valida token y actualiza password en MySQL
8. Usuario puede loguearse con nueva contraseña

## Testing / Demostración

### Crear cuenta
```text
Email: test@example.com
Contraseña: Test123456
```

### Usuarios de prueba (seed)

```text
Admin:
Email: admin@coderup.com
Contraseña: password

Editor:
Email: editor@coderup.com
Contraseña: password

Cliente:
Email: cliente@coderup.com
Contraseña: password

Guest/demo:
Email: guest@coderup.com
Contraseña: password
```

> Nota: estas credenciales son solo para demostración académica. En un entorno real deben cambiarse por contraseñas únicas y robustas.

### Matriz de permisos para la defensa

| Rol | Puede hacer | No debe poder hacer | Rutas clave |
| --- | --- | --- | --- |
| admin | Gestionar cursos, usuarios, pedidos, estadísticas y roles | - | `/admin`, `/admin/cursos`, `/admin/usuarios`, `/admin/pedidos` |
| editor | Crear y editar cursos/contenido | Gestionar usuarios, pedidos, estadísticas globales o eliminar cursos | `/admin/cursos` |
| client | Comprar cursos, ver sus pedidos e inscripciones | Acceder a panel admin/editor o endpoints administrativos | `/cursos`, `/carrito`, `/checkout`, `/mi-cuenta` |
| guest | Navegar y probar la demo | Comprar, inscribirse, gestionar cursos, usuarios o pedidos | `/cursos`, `/blog`, `/mi-cuenta` |

### Pruebas finales Fase 4

Checklist mínimo de entrega:

- Home, catálogo, detalle de curso, blog, carrito, checkout, cuenta y admin cargan en producción.
- API Railway responde en `/index.php`, `/api/courses.php`, `/api/posts.php` y `/api/github-projects.php`.
- Rutas protegidas sin token devuelven 401.
- Admin puede ver estadísticas, usuarios, pedidos y gestionar cursos.
- Editor puede crear/editar cursos, pero no gestionar usuarios ni pedidos.
- Cliente puede comprar cursos, consultar pedidos y ver sus inscripciones.
- Guest/demo puede navegar, pero no completar checkout ni inscribirse.
- Página 404 responde para rutas inexistentes.
- Páginas legales disponibles: `/privacidad`, `/aviso-legal` y `/cookies`.
- Prueba de carga básica recomendada: 10 peticiones GET a `/api/courses.php` sin errores.
- Copia de seguridad recomendada antes de la defensa: exportar MySQL desde Railway y conservar `database/schema.sql` + `database/seed.sql`.

### Incidencias conocidas y mantenimiento

- La pasarela de pago y el formulario de contacto son simulados para la demo académica.
- El token se almacena en `localStorage`; para producción real sería recomendable valorar cookies `HttpOnly`.
- Mantener actualizadas las variables `PUBLIC_API_URL`, `FRONTEND_URL`, `AUTH_SECRET` y credenciales SMTP en Vercel/Railway.
- Revisar logs de Railway tras cada despliegue y ejecutar `npm run build` antes de publicar.

### Flujo completo
1. /register -> crear usuario -> aparece en MySQL
2. /login -> iniciar sesión -> redirige a /mi-cuenta
3. /cursos -> ver catálogo
4. Carrito -> agregar cursos -> checkout
5. /forgot-password -> reset password -> email real

## Estructura del Proyecto

```text
coderup-TFG/
├── backend/
│   ├── auth/
│   │   ├── login.php
│   │   ├── register.php
│   │   ├── logout.php
│   │   ├── me.php
│   │   ├── forgot-password.php
│   │   └── reset-password.php
│   ├── courses/
│   │   ├── index.php
│   │   ├── show.php
│   │   ├── create.php
│   │   ├── update.php
│   │   └── delete.php
│   ├── orders/
│   │   ├── create.php
│   │   ├── index.php
│   │   └── user-orders.php
│   ├── config/
│   │   └── db.php
│   ├── helpers/
│   │   ├── cors.php
│   │   ├── response.php
│   │   ├── validators.php
│   │   ├── auth.php
│   │   └── mail.php
│   ├── index.php
│   ├── nixpacks.toml
│   └── railway.json
├── src/
│   ├── components/
│   │   ├── react/
│   │   │   ├── AuthForm.tsx
│   │   │   ├── CartPage.tsx
│   │   │   ├── CheckoutPage.tsx
│   │   │   ├── PasswordRecoveryForms.tsx
│   │   │   └── ...
│   │   └── layout/
│   │       ├── Header.astro
│   │       ├── Footer.astro
│   │       └── ...
│   ├── pages/
│   │   ├── index.astro
│   │   ├── register.astro
│   │   ├── login.astro
│   │   ├── forgot-password.astro
│   │   ├── reset-password.astro
│   │   ├── cursos.astro
│   │   ├── carrito.astro
│   │   └── mi-cuenta/
│   ├── layouts/
│   │   └── Layout.astro
│   └── lib/
│       ├── api.ts
│       ├── auth.ts
│       ├── content.ts
│       ├── types.ts
│       └── utils.ts
├── database/
│   ├── schema.sql
│   └── seed.sql
├── .env.example
├── README.md
├── package.json
├── astro.config.mjs
├── tsconfig.json
└── tailwind.config.js
```

## Notas de Seguridad

- Contraseñas nunca se guardan en texto plano
- Tokens expiran automáticamente
- CORS permite solo origen de Vercel
- Inputs validados en servidor
- SQL prepared statements (sin inyección)
- Rate limiting recomendado en producción

## Autores
- Desarrollado por: Dario Martos
- Proyecto Final: DAW (Desarrollo de Aplicaciones Web)
- Centro: Digitech FP

## Licencia
Proyecto académico - 2026
