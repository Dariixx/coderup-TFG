# CoderUp - Plataforma de Cursos Online

> Una plataforma educativa moderna para programadores, con diseño dark/neon único y stack tech profesional.

[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-green)](https://nodejs.org)
[![PHP](https://img.shields.io/badge/php-%3E%3D7.4-blue)](https://php.net)
[![MySQL](https://img.shields.io/badge/mysql-%3E%3D5.7-orange)](https://mysql.com)
[![Astro](https://img.shields.io/badge/astro-6.1.7-purple)](https://astro.build)
[![React](https://img.shields.io/badge/react-19.2.5-cyan)](https://react.dev)

---

## 📋 Características

- ✅ **Frontend Responsivo**: Astro 6 + React 19 + TypeScript 5
- ✅ **Backend PHP**: API REST con endpoints JSON
- ✅ **Base de Datos**: MySQL 5.7+ con 8 tablas relacionadas
- ✅ **Autenticación Real**: password_hash() + sessions
- ✅ **Carrito y Checkout**: Sistema de compra funcional
- ✅ **Admin Panel**: Gestión de cursos, usuarios y pedidos
- ✅ **Seguridad**: Prepared statements, validaciones, CORS
- ✅ **Diseño Único**: Dark mode con acentos neon #00FF66

---

## 🚀 Inicio Rápido

### Requisitos Previos

```bash
# Verificar versiones instaladas
node --version    # Requiere 18+
npm --version     # Requiere 8+
php --version     # Requiere 7.4+
mysql --version   # Requiere 5.7+
```

### Instalación

```bash
# 1. Clonar repositorio
git clone https://github.com/tu-usuario/coderup-tfg.git
cd coderup-tfg

# 2. Instalar dependencias Node.js
npm install

# 3. Configurar base de datos
mysql -u root -p
```

```sql
-- En MySQL:
CREATE DATABASE coderup CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE coderup;
EXIT;
```

```bash
# 4. Importar esquema y datos
mysql -u root coderup < database/schema.sql
mysql -u root coderup < database/seed.sql

# 5. Verificar importación
mysql -u root -e "USE coderup; SHOW TABLES;"
```

### Ejecutar el Proyecto

```bash
# Terminal 1: Iniciar Frontend (http://localhost:4321)
npm run dev

# Terminal 2: Iniciar Backend (http://localhost:8000)
cd backend
php -S localhost:8000

# Terminal 3 (Opcional): Build production
npm run build
```

---

## 📦 Estructura del Proyecto

```
coderup-tfg/
├── frontend/                          # Aplicación Astro + React
│   ├── src/
│   │   ├── pages/                    # Rutas Astro (SSG)
│   │   │   ├── index.astro           # Home
│   │   │   ├── cursos/[slug].astro   # Detalle curso
│   │   │   ├── login.astro           # Formulario login
│   │   │   ├── register.astro        # Formulario registro
│   │   │   ├── carrito.astro         # Página carrito
│   │   │   ├── checkout.astro        # Checkout
│   │   │   └── mi-cuenta/            # Dashboard usuario
│   │   │
│   │   ├── components/               # Componentes Astro + React
│   │   │   ├── layout/               # Header, Footer, Navbar
│   │   │   └── react/                # Lógica interactiva
│   │   │       ├── AuthForm.tsx      # Login/Registro
│   │   │       ├── CartPage.tsx      # Carrito
│   │   │       └── CheckoutPage.tsx  # Checkout
│   │   │
│   │   ├── lib/                      # Librerías y utilidades
│   │   │   ├── auth.ts               # Lógica autenticación
│   │   │   ├── cart.ts               # Lógica carrito
│   │   │   ├── types.ts              # Tipos TypeScript
│   │   │   └── utils.ts              # Funciones auxiliares
│   │   │
│   │   ├── styles/                   # CSS global
│   │   └── data/                     # Datos estáticos
│   │
│   ├── public/                       # Recursos estáticos
│   ├── package.json
│   └── astro.config.mjs
│
├── backend/                          # API REST en PHP
│   ├── config/
│   │   └── db.php                   # Conexión MySQL (PDO)
│   │
│   ├── helpers/
│   │   ├── response.php             # Funciones JSON helper
│   │   ├── auth.php                 # Autenticación helper
│   │   └── validators.php           # Validaciones
│   │
│   ├── auth/
│   │   ├── register.php             # POST - Registro
│   │   ├── login.php                # POST - Login
│   │   ├── logout.php               # POST - Logout
│   │   └── me.php                   # GET - Usuario actual
│   │
│   ├── courses/
│   │   ├── index.php                # GET - Listar cursos
│   │   ├── show.php                 # GET - Detalle curso
│   │   ├── create.php               # POST - Crear (admin/editor)
│   │   ├── update.php               # PUT - Actualizar (admin/editor)
│   │   └── delete.php               # DELETE - Eliminar (admin)
│   │
│   ├── orders/
│   │   ├── create.php               # POST - Crear pedido
│   │   ├── user-orders.php          # GET - Mis órdenes
│   │   └── index.php                # GET - Todas (admin)
│   │
│   ├── users/
│   │   ├── index.php                # GET - Listar (admin)
│   │   ├── show.php                 # GET - Ver usuario
│   │   └── update-role.php          # PUT - Cambiar rol (admin)
│   │
│   └── admin/
│       └── stats.php                # GET - Estadísticas
│
├── database/
│   ├── schema.sql                   # Creación de tablas
│   └── seed.sql                     # Datos de prueba
│
├── docs/
│   ├── fase-3-ejecucion.md          # Esta fase explicada
│   ├── plan-pruebas-fase-3.md       # Todas las pruebas
│   ├── checklist-fase-3.md          # Validación
│   └── ARQUITECTURA.md              # Documentación técnica (optional)
│
├── README.md                         # Este archivo
├── package.json
└── .gitignore
```

---

## 🔐 Usuarios de Prueba

Después de importar `seed.sql`, están disponibles estos usuarios:

```
┌─────────────────────────────────────────────────────────────┐
│ Email                  │ Password     │ Rol      │
├─────────────────────────────────────────────────────────────┤
│ admin@coderup.com      │ Coderup123!  │ admin    │
│ editor@coderup.com     │ Coderup123!  │ editor   │
│ cliente@coderup.com    │ Coderup123!  │ client   │
│ invitado@coderup.com   │ Coderup123!  │ guest    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧪 Pruebas de Funcionalidades

### Verificar Instalación

```bash
# Frontend arranca correctamente
npm run dev
# → Debe abrir http://localhost:4321 sin errores

# Backend responde
curl http://localhost:8000/auth/me.php
# → Debe retornar JSON

# Base de datos accesible
mysql -u root coderup -e "SELECT COUNT(*) FROM users;"
# → Debe mostrar 4 (usuarios de prueba)
```

### Registrar Nuevo Usuario

1. Ir a http://localhost:4321/register
2. Llenar formulario con:
   - Nombre: Tu nombre
   - Email: tuEmail@example.com
   - Contraseña: MiPassword123!
3. Click en "Crear cuenta"
4. Debe redirigir a `/mi-cuenta`

### Login

1. Ir a http://localhost:4321/login
2. Email: `cliente@coderup.com`
3. Contraseña: `Coderup123!`
4. Click en "Iniciar sesión"
5. Header debe mostrar "Mi cuenta" en lugar de "Registrarse"

### Comprar Curso

1. Ir a http://localhost:4321/cursos
2. Click en "Añadir a carrito" en cualquier curso premium
3. Ir a http://localhost:4321/carrito
4. Código cupón: `WELCOME20` (20% descuento, solo nuevos usuarios)
5. Click en "Finalizar compra"
6. Ir a http://localhost:4321/mi-cuenta/pedidos
7. Debe verse el pedido creado

### Probar API PHP

```bash
# Listar cursos
curl http://localhost:8000/courses/index.php

# Detalle de curso
curl http://localhost:8000/courses/show.php?slug=react-avanzado

# Registrar usuario (POST)
curl -X POST http://localhost:8000/auth/register.php \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"123456"}'

# Login (POST)
curl -X POST http://localhost:8000/auth/login.php \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@coderup.com","password":"Coderup123!"}'
```

---

## 🛒 Rutas Principales

### Público
| Ruta | Descripción |
|------|-------------|
| `/` | Home page |
| `/cursos` | Catálogo de cursos |
| `/cursos/[slug]` | Detalle de curso |
| `/categorias` | Categorías de cursos |
| `/blog` | Blog/Artículos (si existe) |
| `/sobre-nosotros` | Información empresa |
| `/contacto` | Formulario contacto |

### Autenticación
| Ruta | Descripción |
|------|-------------|
| `/login` | Iniciar sesión |
| `/register` o `/registro` | Crear cuenta |

### Usuario Autenticado
| Ruta | Descripción |
|------|-------------|
| `/carrito` | Tu carrito de compra |
| `/checkout` | Finalizar compra |
| `/mi-cuenta` | Dashboard personal |
| `/mi-cuenta/pedidos` | Historial de pedidos |
| `/mi-cuenta/mis-cursos` | Cursos comprados |

### Admin
| Ruta | Descripción |
|------|-------------|
| `/admin` | Panel administrador |
| `/admin/cursos` | Gestionar cursos |
| `/admin/usuarios` | Gestionar usuarios |
| `/admin/pedidos` | Ver todas las órdenes |

---

## 📡 API Endpoints

### Autenticación
```
POST   /backend/auth/register.php    → Registrar usuario
POST   /backend/auth/login.php       → Iniciar sesión
POST   /backend/auth/logout.php      → Cerrar sesión
GET    /backend/auth/me.php          → Usuario actual
```

### Cursos
```
GET    /backend/courses/index.php    → Listar cursos (paginado)
GET    /backend/courses/show.php     → Detalle curso (por id o slug)
POST   /backend/courses/create.php   → Crear curso (admin/editor)
PUT    /backend/courses/update.php   → Actualizar curso (admin/editor)
DELETE /backend/courses/delete.php   → Eliminar curso (admin)
```

### Órdenes
```
POST   /backend/orders/create.php    → Crear pedido
GET    /backend/orders/user-orders.php → Mis órdenes
GET    /backend/orders/index.php     → Todas las órdenes (admin)
```

### Usuarios
```
GET    /backend/users/index.php      → Listar usuarios (admin)
GET    /backend/users/show.php       → Ver usuario
PUT    /backend/users/update-role.php → Cambiar rol (admin)
```

### Admin
```
GET    /backend/admin/stats.php      → Estadísticas (admin)
```

---

## 🔒 Seguridad Implementada

### Frontend
- ✅ Validación de formularios en cliente
- ✅ Password no se almacena en localStorage
- ✅ Sesión limitada a navegador actual
- ✅ CORS headers configurados

### Backend PHP
- ✅ **password_hash()** - Contraseñas hasheadas con bcrypt
- ✅ **password_verify()** - Verificación segura de contraseñas
- ✅ **Prepared Statements (PDO)** - Prevención de SQL Injection
- ✅ **Input Sanitization** - sanitizeString(), sanitizeEmail()
- ✅ **Validaciones** - Email, longitud contraseña, campos obligatorios
- ✅ **Role-based Access Control** - admin, editor, client, guest
- ✅ **Session Management** - PHP sessions with user data
- ✅ **Error Handling** - Mensajes genéricos, sin exponer BD

### Base de Datos
- ✅ Constraints y Foreign Keys
- ✅ Índices en columnas frecuentes
- ✅ Charset UTF-8mb4 (emojis)
- ✅ Timestamps (created_at, updated_at)

---

## 📊 Requisitos Académicos Demostrados

| # | Requisito | Implementación |
|---|-----------|-----------------|
| 1 | Frontend responsive | Astro + React + Tailwind (breakpoints 360-1440px) |
| 2 | Validación formularios cliente | AuthForm.tsx con validaciones regex |
| 3 | Comunicación fetch | src/lib/auth.ts, cart.ts |
| 4 | Backend PHP propio | `/backend/` con 20+ endpoints |
| 5 | API JSON | Todos endpoints retornan JSON válido |
| 6 | MySQL | database/schema.sql (8 tablas) |
| 7 | BD relacional | Foreign Keys entre tablas |
| 8 | Script SQL creación | database/schema.sql listo |
| 9 | CRUD completo | courses/ endpoints (create, read, update, delete) |
| 10 | 4+ usuarios roles | seed.sql (admin, editor, client, guest) |
| 11 | Login real | backend/auth/login.php con sesiones |
| 12 | password_hash() | backend/helpers/auth.php, seed.sql |
| 13 | password_verify() | backend/auth/login.php |
| 14 | Validaciones servidor | backend/helpers/validators.php |
| 15 | Prepared Statements | Todos los endpoints PDO |
| 16 | Manejo errores | response.php con JSON standardizado |
| 17 | Documentación ejecución | Este README + docs/fase-3-ejecucion.md |
| 18 | Evidencias/Capturas | docs/plan-pruebas-fase-3.md |
| 19 | README profesional | ✅ Este archivo |
| 20 | Elemento diferenciador | Diseño dark/neon único con #00FF66 |

---

## 🚀 Build para Producción

```bash
# Generar sitio estático optimizado
npm run build

# Verificar salida
ls -la dist/

# Servir localmente para verificar
npm run preview
# → http://localhost:3000

# Para deployment:
# 1. Copiar carpeta dist/ a servidor
# 2. Configurar backend/ en servidor
# 3. Asegurar MySQL disponible en servidor
```

---

## 🐛 Troubleshooting

### Error: "Cannot find module..."
```bash
rm -rf node_modules package-lock.json
npm install
```

### Error: "Connection refused" (MySQL)
```bash
# Verificar MySQL está corriendo
# macOS:
brew services list | grep mysql

# Linux:
sudo systemctl status mysql

# Windows:
# Verificar servicios o abrir MySQL Workbench
```

### Error: "Headers already sent" (PHP)
```bash
# Asegurar no hay espacios en blanco antes de <?php
# o después de ?>
```

### Carrito no guarda datos
```bash
# Verificar localStorage está habilitado
# DevTools > Application > LocalStorage
# localStorage.clear() para limpiar
```

---

## 📚 Documentación Adicional

- **[Fase 3: Ejecución](docs/fase-3-ejecucion.md)** - Explicación completa fase 3
- **[Plan de Pruebas](docs/plan-pruebas-fase-3.md)** - 70+ casos de prueba
- **[Checklist](docs/checklist-fase-3.md)** - Validación completa
- **[Schema SQL](database/schema.sql)** - Estructura base de datos
- **[Seed SQL](database/seed.sql)** - Datos de prueba

---

## 📄 Licencia

MIT - Ver LICENSE file para detalles

---

## 👨‍💻 Autor

**Alumno TFG** - Trabajo de Fin de Grado  
Proyecto CoderUp - Plataforma de Cursos Online

**Año**: 2026  
**Versión**: 1.0  
**Estado**: Listo para defensa Fase 3

---

## 🙏 Agradecimientos

- Astro team por framework moderno
- React community por componentes
- PHP community por backend sólido
- MySQL por base de datos confiable
- Tailwind CSS por estilos rápidos

---

**Última actualización**: 2026-05-12  
**Próxima revisión**: Después de defensa Fase 3
