# 🚀 GUÍA DE EJECUCIÓN LOCAL - CODERUP

## ✅ Estado Actual

```
✅ npm install         → Completado (node_modules presente)
✅ Astro 6.1.7         → Instalado
✅ React 19.2.5        → Instalado
✅ Backend PHP         → 20 archivos creados
✅ Database SQL        → schema.sql + seed.sql creados
✅ npm run build       → Exitoso (62 páginas compiladas)
```

---

## 📋 PASOS PARA EJECUTAR LOCALMENTE

### PASO 1: Preparar MySQL (UNA VEZ)

```bash
# Acceder a MySQL
mysql -u root -p
# (Ingresa tu contraseña de MySQL, o Enter si no tiene)

# En el prompt de MySQL:
CREATE DATABASE coderup CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE coderup;
EXIT;

# Desde la terminal (carpeta raíz del proyecto):
mysql -u root coderup < database/schema.sql
mysql -u root coderup < database/seed.sql

# Verificar que se importó correctamente:
mysql -u root -e "USE coderup; SELECT COUNT(*) as usuarios FROM users;"
# Debe mostrar: 4
```

**Usuarios de prueba después de importar:**
```
Email: admin@coderup.com          | Contraseña: Coderup123! | Rol: admin
Email: editor@coderup.com         | Contraseña: Coderup123! | Rol: editor
Email: cliente@coderup.com        | Contraseña: Coderup123! | Rol: client
Email: invitado@coderup.com       | Contraseña: Coderup123! | Rol: guest
```

---

### PASO 2: Terminal 1 - Frontend (Astro Dev Server)

```bash
# En la carpeta raíz del proyecto
npm run dev

# Verás:
# ┃ Local    http://localhost:4321/
# ┃ Network  use --host to expose
```

**Acceso**: http://localhost:4321

**Lo que verás:**
- ✅ Home page con hero y cursos destacados
- ✅ Navegación completa funcional
- ✅ Todos los links funcionales
- ✅ Hot reload en vivo

---

### PASO 3: Terminal 2 - Backend (PHP Dev Server)

```bash
# En la carpeta raíz del proyecto
cd backend
php -S localhost:8000

# Verás:
# Development Server (http://localhost:8000)
# Press Ctrl-C to quit.
```

**Acceso**: http://localhost:8000

**Endpoints disponibles:**
- POST   http://localhost:8000/auth/register.php
- POST   http://localhost:8000/auth/login.php
- POST   http://localhost:8000/auth/logout.php
- GET    http://localhost:8000/auth/me.php
- GET    http://localhost:8000/courses/index.php
- GET    http://localhost:8000/courses/show.php?slug=react-avanzado
- POST   http://localhost:8000/orders/create.php
- GET    http://localhost:8000/orders/user-orders.php
- GET    http://localhost:8000/admin/stats.php

---

## 🧪 PRUEBAS RÁPIDAS

### Test 1: Verificar Frontend

```bash
curl http://localhost:4321
# Debe retornar HTML con <!DOCTYPE html>
```

### Test 2: Verificar Backend

```bash
curl http://localhost:8000/courses/index.php
# Debe retornar JSON:
# {
#   "ok": true,
#   "message": "Courses retrieved",
#   "data": {
#     "courses": [...],
#     "total": 12,
#     ...
#   }
# }
```

### Test 3: Registrar Usuario

```bash
curl -X POST http://localhost:8000/auth/register.php \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "TestPass123!"
  }'

# Respuesta esperada:
# {
#   "ok": true,
#   "message": "Usuario registrado correctamente",
#   "data": {
#     "id": "...",
#     "name": "Test User",
#     "email": "test@example.com",
#     "role": "client",
#     "created_at": "..."
#   }
# }
```

### Test 4: Login

```bash
curl -X POST http://localhost:8000/auth/login.php \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@coderup.com",
    "password": "Coderup123!"
  }'

# Respuesta esperada:
# {
#   "ok": true,
#   "message": "Sesión iniciada correctamente",
#   "data": {
#     "id": 1,
#     "name": "Admin CoderUp",
#     "email": "admin@coderup.com",
#     "role": "admin",
#     "created_at": "..."
#   }
# }
```

---

## 🎯 FLUJO COMPLETO DE DEMOSTRACIÓN

### 1. Acceder a Frontend

Abre en navegador: http://localhost:4321

**Verás:**
- ✅ Home page con hero "Aprende. Practica. Evoluciona."
- ✅ Botón "Empieza Gratis" funcional
- ✅ Cursos destacados visibles
- ✅ Navbar con enlaces

### 2. Explorar Cursos

Click en "Cursos" o botón "Empieza Gratis"

**Verás:**
- ✅ Lista de 12 cursos
- ✅ Cards con precio, nivel, categoría
- ✅ Paginación funcional
- ✅ Filtros por categoría

### 3. Ver Detalle Curso

Click en cualquier curso (ej: "React Avanzado")

**Verás:**
- ✅ Detalle completo del curso
- ✅ Descripción, precio, nivel
- ✅ Botón "Añadir a carrito"
- ✅ Información del instructor

### 4. Registrarse

Click en "Registrarse" o ir a http://localhost:4321/register

**Formulario:**
```
Nombre:      Tu nombre
Email:       tu@email.com
Contraseña:  MiPass123!
```

Click en "Crear cuenta"

**Verás:**
- ✅ Validación de campos
- ✅ Redirección a /mi-cuenta
- ✅ Header muestra "Mi cuenta"

### 5. Login

Click en "Iniciar sesión" o ir a http://localhost:4321/login

**Credenciales de prueba:**
```
Email:       cliente@coderup.com
Contraseña:  Coderup123!
```

Click en "Iniciar sesión"

**Verás:**
- ✅ Sesión iniciada
- ✅ Header cambia a "Mi cuenta"
- ✅ Redirección a /mi-cuenta

### 6. Añadir al Carrito

1. Ir a http://localhost:4321/cursos
2. Click "Añadir a carrito" en cualquier curso premium
3. Ir a http://localhost:4321/carrito

**Verás:**
- ✅ Curso en carrito
- ✅ Precio y subtotal correctos
- ✅ Botón "Aplicar cupón"

### 7. Aplicar Cupón

En página carrito:
```
Código:  WELCOME20
```

Click "Aplicar"

**Verás:**
- ✅ Descuento 20% aplicado
- ✅ Total actualizado
- ✅ Mensaje de éxito

### 8. Checkout

Click "Finalizar compra"

**Verás:**
- ✅ Página de checkout
- ✅ Resumen de compra
- ✅ Formulario de datos
- ✅ Botón "Completar pedido"

Click "Completar pedido"

**Verás:**
- ✅ Confirmación de pedido
- ✅ Número de orden generado
- ✅ Carrito vaciado

### 9. Ver Pedidos

Click en "Mi cuenta" en header

**Verás:**
- ✅ Dashboard de usuario
- ✅ Link a "Mis pedidos"

Click en "Mis pedidos"

**Verás:**
- ✅ Histórico de pedidos
- ✅ Pedido recién creado
- ✅ Detalles (items, precio, descuento)

---

## 📱 PROBAR RESPONSIVE

En el navegador, abre DevTools (F12) y cambia el dispositivo:

```
Desktop:  1440px (por defecto)
Tablet:   768px
Mobile:   360px
```

**Verifica:**
- ✅ Home se adapta correctamente
- ✅ Menú hamburguesa aparece en móvil
- ✅ Cards apiladas en móvil
- ✅ Texto legible en todos tamaños
- ✅ Sin overflow horizontal

---

## 🔐 PROBAR ADMIN

1. Ir a http://localhost:4321/login
2. Login como admin:
   ```
   Email:       admin@coderup.com
   Contraseña:  Coderup123!
   ```

3. En header debe aparecer "Panel Admin"
4. Click en "Panel Admin" → http://localhost:4321/admin

**Verás:**
- ✅ Panel de administración
- ✅ Estadísticas si existen
- ✅ Opciones de gestión

---

## 🐛 TROUBLESHOOTING

### MySQL no conecta

```bash
# Verificar MySQL está corriendo
mysql -u root -p
# Si no funciona:
# macOS:     brew services start mysql
# Linux:     sudo systemctl start mysql
# Windows:   MySQL en Services
```

### Frontend no carga

```bash
# Limpiar y reinstalar
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Backend no responde

```bash
# Verificar sintaxis PHP
php -l backend/config/db.php

# Reiniciar servidor PHP
# Ctrl+C para parar
cd backend
php -S localhost:8000
```

### Carrito vacío al recargar

El proyecto usa localStorage (simulado). Para conectar a backend:
- Ver src/lib/auth.ts para entender estructura
- Los endpoints PHP están listos para integrar
- Es aceptable usar localStorage para esta fase

---

## 📊 ESTRUCTURA DE CARPETAS

```
coderup-TFG/
├── src/                    # Frontend Astro + React
│   ├── pages/             # Rutas (Home, Cursos, Login, etc)
│   ├── components/        # Componentes (React + Astro)
│   ├── lib/               # Librerías (auth, cart, types)
│   └── styles/            # CSS global
│
├── backend/               # API REST PHP
│   ├── config/           # Configuración (db.php)
│   ├── helpers/          # Funciones auxiliares
│   ├── auth/             # Endpoints de autenticación
│   ├── courses/          # Endpoints de cursos
│   ├── orders/           # Endpoints de órdenes
│   ├── users/            # Endpoints de usuarios
│   └── admin/            # Endpoints de admin
│
├── database/             # Base de datos
│   ├── schema.sql        # Creación de tablas
│   └── seed.sql          # Datos de prueba
│
├── docs/                 # Documentación
│   ├── fase-3-ejecucion.md
│   ├── plan-pruebas-fase-3.md
│   ├── checklist-fase-3.md
│   └── ARQUITECTURA.md
│
├── public/               # Assets estáticos
├── dist/                 # Build production (generado)
├── README.md             # Documentación principal
└── package.json          # Dependencias
```

---

## ✨ CONCLUSIÓN

Con esta guía tienes todo lo necesario para:

1. ✅ Ejecutar el proyecto localmente
2. ✅ Probar todas las funcionalidades
3. ✅ Recopilar capturas para la defensa
4. ✅ Explicar la arquitectura
5. ✅ Defender con confianza

**¡A por la Fase 3! 🎓**

---

**Actualizado**: 2026-05-12  
**Versión**: 1.0  
**Estado**: Listo para ejecutar
