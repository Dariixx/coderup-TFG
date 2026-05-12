# Fase 3: Ejecución del Proyecto — CoderUp

**Proyecto**: CoderUp — Plataforma de Cursos Online  
**Fase**: 3 — Ejecución del Proyecto  
**Fecha**: 2026-05-12  
**Estado**: ✅ Completado y listo para defensa

---

## Introducción

CoderUp es una plataforma web de cursos de programación desarrollada como Trabajo de Fin de Grado del ciclo DAW. La Fase 3 demuestra la integración completa entre frontend (Astro + React) y backend real (PHP + MySQL), con autenticación, CRUD de cursos, sistema de pedidos y roles de usuario.

### Objetivos de la Fase 3

1. ✅ Proyecto ejecutable localmente con instrucciones claras
2. ✅ Base de datos MySQL configurada con datos de prueba
3. ✅ Backend PHP con 20 endpoints REST funcionando
4. ✅ Frontend conectado al backend mediante `fetch()` con fallback
5. ✅ CRUD completo de cursos operativo
6. ✅ Login/Registro real con contraseñas hasheadas
7. ✅ Sistema de roles (admin, editor, client, guest)
8. ✅ Plan de pruebas documentado
9. ✅ Capturas de evidencias preparadas

---

## Arquitectura del Proyecto

```
coderup-TFG/
├── src/                    # Frontend Astro + React (TypeScript)
│   ├── components/react/   # Componentes interactivos React
│   ├── lib/                # Lógica de negocio: auth, orders, cart…
│   │   ├── api.ts          # 🆕 Cliente fetch centralizado → backend
│   │   ├── auth.ts         # 🔄 Login/Registro → backend + fallback
│   │   ├── orders.ts       # 🔄 Pedidos → backend + fallback
│   │   └── …
│   └── pages/              # Rutas Astro (SSG)
├── backend/                # API REST PHP
│   ├── auth/               # login, register, logout, me
│   ├── courses/            # CRUD cursos
│   ├── orders/             # Gestión pedidos
│   ├── users/              # Gestión usuarios (admin)
│   ├── admin/              # Estadísticas
│   ├── config/db.php       # Conexión PDO MySQL
│   └── helpers/            # cors, response, validators, auth
├── database/
│   ├── schema.sql          # 8 tablas con relaciones FK
│   └── seed.sql            # Datos de prueba + usuarios + contraseñas
└── .env                    # URL del backend (PUBLIC_API_URL)
```

### Integración Frontend-Backend

El fichero `src/lib/api.ts` centraliza todos los fetch al backend PHP:

```typescript
// src/lib/api.ts
export const API_BASE = import.meta.env.PUBLIC_API_URL ?? "http://localhost:8000";

export async function apiFetch<T>(path, options) {
  // Si el backend no responde → retorna { ok: false, message: "Backend no disponible" }
  // → El código llamante usa fallback a localStorage (modo demo/desarrollo)
}
```

Esto permite que la web funcione aunque el backend PHP no esté corriendo, útil para demostrar el frontend sin MySQL.

---

## Cómo Ejecutar el Proyecto

### Paso 1: Dependencias

```bash
cd coderup-TFG
node --version    # Requiere 18+
npm install
```

### Paso 2: Base de Datos MySQL

```bash
# Crear base de datos
mysql -u root -p -e "CREATE DATABASE coderup CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Importar esquema y datos
mysql -u root coderup < database/schema.sql
mysql -u root coderup < database/seed.sql

# Verificar
mysql -u root -e "USE coderup; SELECT COUNT(*) usuarios FROM users; SELECT COUNT(*) cursos FROM courses;"
```

### Paso 3: Configurar la URL del Backend

```bash
# El archivo .env ya tiene el valor por defecto:
cat .env
# PUBLIC_API_URL=http://localhost:8000
```

### Paso 4: Arrancar el Backend PHP

```bash
# Desde la raíz del proyecto (IMPORTANTE: -t backend apunta al directorio correcto)
php -S localhost:8000 -t backend

# Comprobar que funciona:
curl http://localhost:8000/auth/me.php
# Debe devolver: {"success":false,"message":"No autenticado"}
```

### Paso 5: Arrancar el Frontend

```bash
# En otra terminal:
npm run dev
# → http://localhost:4321
```

---

## Usuarios de Prueba

| Rol | Email | Contraseña | Permisos |
|-----|-------|-----------|----------|
| **Admin** | admin@coderup.com | Admin1234! | Todo: gestión usuarios, cursos, pedidos, estadísticas |
| **Editor** | editor@coderup.com | Editor1234! | Crear y editar cursos |
| **Cliente** | cliente@coderup.com | Cliente1234! | Comprar cursos, ver pedidos |
| **Invitado** | invitado@coderup.com | Invitado1234! | Solo navegación y registro |

---

## Endpoints API REST — Resumen

| Método | Endpoint | Autenticación | Descripción |
|--------|----------|---------------|-------------|
| POST | `/auth/login.php` | No | Iniciar sesión |
| POST | `/auth/register.php` | No | Registrarse |
| POST | `/auth/logout.php` | Sesión | Cerrar sesión |
| GET | `/auth/me.php` | Sesión | Usuario actual |
| GET | `/courses/index.php` | No | Listar cursos |
| GET | `/courses/show.php?id=1` | No | Detalle curso |
| POST | `/courses/create.php` | Admin/Editor | Crear curso |
| PUT | `/courses/update.php?id=1` | Admin/Editor | Actualizar curso |
| DELETE | `/courses/delete.php?id=1` | Admin | Eliminar curso |
| POST | `/orders/create.php` | Cliente | Crear pedido |
| GET | `/orders/user-orders.php` | Sesión | Pedidos del usuario |
| GET | `/orders/index.php` | Admin | Todos los pedidos |
| GET | `/users/index.php` | Admin | Listar usuarios |
| PUT | `/users/update-role.php?id=1` | Admin | Cambiar rol |
| GET | `/admin/stats.php` | Admin | Estadísticas |

---

## Seguridad Implementada

- **password_hash()** con `PASSWORD_BCRYPT` (coste 12) para almacenar contraseñas
- **password_verify()** para validar en cada login
- **PDO Prepared Statements** en todas las queries (protección SQL injection)
- **Validación de entrada** en servidor (validators.php) y en cliente (AuthForm.tsx)
- **Gestión de sesión PHP** con `session_start()` y `$_SESSION`
- **Cabeceras CORS** configuradas para el origen del frontend (cors.php)
- **Roles y permisos** verificados en cada endpoint protegido
- **Sanitización** de strings y emails antes de persistir

---

## Elemento Diferenciador

El proyecto incluye **dos elementos diferenciadores**:

1. **Diseño dark/neon único** (`#00FF66` verde neón sobre fondo oscuro) con animaciones CSS propias y modo visual consistente, que aporta identidad de marca memorable.

2. **Arquitectura con fallback inteligente**: el frontend detecta si el backend PHP está disponible y, si no lo está, opera en modo demo con localStorage. Esto demuestra capacidad de diseño robusto y es útil para demostrar el proyecto sin infraestructura.

---

## Limitaciones Conocidas

| Limitación | Explicación | Impacto |
|-----------|-------------|---------|
| No hay JWT | Se usa `$_SESSION` de PHP, válido para TFG académico | Bajo |
| No hay envío de emails | Fuera del scope del TFG | Ninguno |
| Panel admin sin UI propia | Los endpoints admin existen; la UI se puede mostrar vía Postman/curl | Bajo |
| Frontend SPA vs SSG | Algunas rutas son estáticas, la dinámica va vía React | Documentado |

---

## Evidencias para Recopilar (Capturas)

Usar `docs/plan-pruebas-fase-3.md` como guía. Mínimo indispensable:

- [ ] Home en escritorio y móvil (360px)
- [ ] Listado de cursos y detalle
- [ ] Registro de usuario exitoso
- [ ] Login con credencial correcta e incorrecta (manejo de error)
- [ ] Tablas MySQL en phpMyAdmin/terminal (users, courses, orders)
- [ ] Contraseña hasheada en tabla users
- [ ] Response JSON de `/auth/login.php` (curl o Postman)
- [ ] Response JSON de `/courses/index.php`
- [ ] Carrito con descuento WELCOME20
- [ ] Checkout completado → pedido creado
- [ ] Sección "Mis Cursos" con curso comprado
- [ ] VS Code mostrando estructura del proyecto

---

## Para la Defensa — Guion Sugerido

1. **Arrancar** el proyecto (frontend + backend + DB) en vivo
2. **Mostrar estructura** en VS Code: separación frontend/backend, lib/api.ts
3. **Navegar** la web: home, cursos, categorías, blog
4. **Responsive**: redimensionar ventana a 360px
5. **Registro** de usuario nuevo → mostrar registro en MySQL
6. **Login** → demostrar sesión PHP activa
7. **Carrito**: añadir curso, aplicar WELCOME20, hacer checkout
8. **Mostrar DB**: `SELECT * FROM orders; SELECT * FROM users;`
9. **Endpoints**: curl a login y courses (JSON response)
10. **Código PHP**: mostrar password_hash, prepared statements, cors.php
11. **Build**: `npm run build` → 62 páginas compiladas

