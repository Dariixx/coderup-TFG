# Checklist Fase 3: Ejecución - CoderUp

**Proyecto**: CoderUp - Plataforma de Cursos Online  
**Fase**: 3 - Ejecución del Proyecto  
**Fecha**: 2026-05-12  
**Estado**: En preparación para ejecución  

---

## ✅ REQUISITOS PREVIOS

- [ ] Node.js 18+ instalado
- [ ] npm actualizado
- [ ] MySQL 5.7+ instalado y corriendo
- [ ] Cliente MySQL (línea de comandos o GUI como phpMyAdmin)
- [ ] Editor de código (VS Code recomendado)
- [ ] Terminal/CMD accesible
- [ ] Git instalado (para seguimiento)

---

## 📦 INSTALACIÓN Y SETUP INICIAL

- [ ] Ejecutar `npm install` sin errores
- [ ] Carpeta `node_modules/` creada correctamente
- [ ] `package-lock.json` generado
- [ ] No hay mensajes de advertencia críticos (warnings de peer dependencies son OK)

---

## 🗄️ BASE DE DATOS

- [ ] Base de datos `coderup` creada
- [ ] Schema importado correctamente: `mysql -u root coderup < database/schema.sql`
- [ ] Seed importado correctamente: `mysql -u root coderup < database/seed.sql`
- [ ] Todas 8 tablas presentes: users, courses, orders, order_items, categories, coupons, enrollments, roles
- [ ] Índices creados correctamente
- [ ] 4 usuarios de prueba existentes
- [ ] 12 cursos insertados
- [ ] 6 categorías presentes
- [ ] Coupones activos creados (WELCOME20, DESCUENTO10, PROMO5)

---

## 🚀 FRONTEND - DESARROLLO LOCAL

- [ ] `npm run dev` inicia sin errores
- [ ] Astro dev server accesible en http://localhost:4321
- [ ] Hot reload funciona (cambios se reflejan inmediatamente)
- [ ] No hay errores en consola del navegador al cargar home
- [ ] Estilos Tailwind cargan correctamente (tema dark/neon visible)

---

## 🌐 NAVEGACIÓN Y RUTAS

### Páginas Principales
- [ ] `/` (home) - Carga correctamente
- [ ] `/cursos` - Lista de cursos visible
- [ ] `/cursos/[slug]` - Detalle de curso funciona
- [ ] `/categorias` - Categorías visibles
- [ ] `/blog` - Blog visible (si aplica)
- [ ] `/sobre-nosotros` - Página presente
- [ ] `/contacto` - Formulario contacto presente

### Autenticación
- [ ] `/login` - Formulario login accesible
- [ ] `/register` - Formulario registro accesible
- [ ] `/registro` - Alternativa registro funciona

### Carrito y Compra
- [ ] `/carrito` - Página carrito accesible
- [ ] `/checkout` - Página checkout accesible

### Cuenta Personal
- [ ] `/mi-cuenta` - Dashboard accesible cuando logueado
- [ ] `/mi-cuenta/pedidos` - Historial de pedidos visible
- [ ] `/mi-cuenta/mis-cursos` - Cursos del usuario (si aplica)

### Administración
- [ ] `/admin` - Panel admin visible para admin
- [ ] `/admin/cursos` - Gestión de cursos (si existe)
- [ ] `/admin/pedidos` - Historial de pedidos admin (si existe)
- [ ] `/admin/usuarios` - Gestión de usuarios (si existe)

---

## 🎨 RESPONSIVE DESIGN

- [ ] **Móvil (360px)**:
  - [ ] Sin overflow horizontal
  - [ ] Texto legible sin zoom
  - [ ] Botones clickeables (mín. 44px)
  - [ ] Menú adaptado (hamburguesa o colapsado)

- [ ] **Tablet (768px)**:
  - [ ] Layout intermedio correcto
  - [ ] Cards en 2 columnas
  - [ ] Espacios adecuados

- [ ] **Desktop (1024-1440px)**:
  - [ ] Layout completo correcto
  - [ ] Cards en 3+ columnas
  - [ ] Máx-width respetado

---

## 🔐 AUTENTICACIÓN Y SESIONES

- [ ] Registro de nuevo usuario funciona
- [ ] Email no puede registrarse 2 veces (validación de duplicado)
- [ ] Contraseña <6 caracteres rechazada
- [ ] Login con credenciales correctas funciona: admin@coderup.com / Coderup123!
- [ ] Login con credenciales incorrectas rechazado
- [ ] Logout destruye sesión correctamente
- [ ] Header cambia cuando está logueado (muestra "Mi cuenta" en lugar de "Registrarse")
- [ ] Usuario no logueado no puede acceder a `/mi-cuenta` (redirección a login)
- [ ] Sesión persiste en la página (localStorage o backend)

---

## 🛒 CARRITO Y CHECKOUT

- [ ] Añadir curso al carrito funciona
- [ ] Carrito actualiza cantidad/total correctamente
- [ ] Quitar curso del carrito funciona
- [ ] Carrito se vacía correctamente
- [ ] Página carrito muestra mensaje cuando está vacío
- [ ] Descuento WELCOME20 aplica para nuevos usuarios
- [ ] Descuento calcula correctamente (20% de subtotal)
- [ ] Checkout muestra resumen de compra
- [ ] Crear pedido genera orden en base de datos
- [ ] Carrito se vacía después de compra completada
- [ ] Pedido aparece en `/mi-cuenta/pedidos`

---

## 🛍️ GESTIÓN DE CURSOS (ADMIN/EDITOR)

- [ ] Listar cursos endpoint funciona: GET `/backend/courses/index.php`
- [ ] Ver detalle curso endpoint funciona: GET `/backend/courses/show.php?slug=react-avanzado`
- [ ] Crear curso endpoint funciona: POST `/backend/courses/create.php`
- [ ] Actualizar curso endpoint funciona: PUT/POST `/backend/courses/update.php`
- [ ] Eliminar curso endpoint funciona: DELETE/POST `/backend/courses/delete.php`
- [ ] Curso inexistente retorna 404
- [ ] Cliente no puede crear cursos (error 403)
- [ ] Editor puede crear cursos (si aplica)
- [ ] Admin puede crear cursos

---

## 📋 PEDIDOS Y HISTORIAL

- [ ] Usuario logueado ve sus pedidos en `/mi-cuenta/pedidos`
- [ ] Usuario sin pedidos ve mensaje claro
- [ ] Endpoint `/backend/orders/user-orders.php` retorna pedidos del usuario
- [ ] Endpoint `/backend/orders/index.php` (admin) retorna todos los pedidos
- [ ] Detalles de pedido incluyen items y precios

---

## 👥 ROLES Y PERMISOS

- [ ] Admin puede acceder a `/admin`
- [ ] Editor puede acceder a panel editor (si existe)
- [ ] Cliente (usuario normal) NO puede acceder a `/admin`
- [ ] Guest NO puede acceder a áreas protegidas
- [ ] Cliente solo ve sus propios pedidos
- [ ] Admin puede ver pedidos de todos
- [ ] Admin puede cambiar roles de usuarios: POST `/backend/users/update-role.php`

---

## 📄 FORMULARIOS

- [ ] Formulario login valida campos vacíos
- [ ] Formulario registro valida campos vacíos
- [ ] Formulario contacto muestra confirmación (puede ser simulada)
- [ ] Formulario newsletter funciona (puede ser simulado)
- [ ] Validaciones muestran mensajes claros
- [ ] Diseño responsive de formularios en móvil

---

## 🔒 SEGURIDAD BÁSICA

- [ ] Contraseñas no se guardan en localStorage (solo sesión o token)
- [ ] Endpoint login no retorna contraseña en JSON
- [ ] Contraseñas en BD están hasheadas (bcrypt $2y$)
- [ ] Consultas preparadas en todos los endpoints (prevención SQL Injection)
- [ ] Sanitización de inputs (sanitizeString, sanitizeEmail)
- [ ] Validación de métodos HTTP (POST/GET)
- [ ] Headers CORS presentes en endpoints
- [ ] Admin endpoints protegidos (requieren rol admin)
- [ ] No se muestran errores internos de BD al usuario (solo mensajes genéricos)

---

## 📊 PANEL ADMIN (OPCIONAL PERO RECOMENDADO)

- [ ] Endpoint `/backend/admin/stats.php` retorna estadísticas
- [ ] Estadísticas incluyen: totalUsers, totalCourses, totalOrders, totalRevenue
- [ ] Panel muestra usuarios registrados
- [ ] Panel muestra pedidos recientes
- [ ] Panel muestra cursos

---

## 🏗️ BUILD PRODUCTION

- [ ] `npm run build` ejecuta sin errores
- [ ] Carpeta `dist/` creada correctamente
- [ ] `dist/index.html` existe
- [ ] Archivos CSS/JS bundleados en `dist/`
- [ ] Tamaño bundle razonable (<5MB)
- [ ] Build incluye todas las páginas (no pages faltantes)

---

## 📚 DOCUMENTACIÓN

- [ ] `README.md` actualizado con instrucciones
- [ ] `docs/plan-pruebas-fase-3.md` completado
- [ ] `docs/checklist-fase-3.md` presente (este archivo)
- [ ] `docs/fase-3-ejecucion.md` documentado
- [ ] `database/schema.sql` listo para importar
- [ ] `database/seed.sql` con datos de prueba
- [ ] `backend/` estructura completa
- [ ] Comentarios en código PHP donde aplique
- [ ] README incluye:
  - [ ] Cómo instalar dependencias
  - [ ] Cómo arrancar frontend
  - [ ] Cómo arrancar backend/PHP
  - [ ] Cómo importar BD
  - [ ] Usuarios de prueba documentados
  - [ ] URLs de endpoints principales

---

## 📸 CAPTURAS PARA EVIDENCIA

Recolectar estas capturas (se recomiendan para la presentación):

### Instalación
- [ ] Terminal con `npm install` completado
- [ ] Terminal con `npm run dev` corriendo
- [ ] Terminal con `npm run build` exitoso
- [ ] phpMyAdmin/Cliente MySQL mostrando tablas

### Navegación
- [ ] Home página
- [ ] Página de cursos
- [ ] Detalle de curso
- [ ] Categorías

### Responsividad
- [ ] Home en 360px (móvil)
- [ ] Home en 768px (tablet)
- [ ] Home en 1440px (desktop)

### Autenticación
- [ ] Formulario de registro
- [ ] Registro exitoso con usuario nuevo
- [ ] Formulario de login
- [ ] Login exitoso
- [ ] Header con usuario logueado

### Carrito y Compra
- [ ] Página de carrito con items
- [ ] Aplicar cupón WELCOME20
- [ ] Página de checkout
- [ ] Confirmación de pedido

### Base de Datos
- [ ] Tabla users con 4 usuarios
- [ ] Tabla courses con 12 cursos
- [ ] Tabla orders con pedidos
- [ ] Password hasheada (bcrypt)

### Backend/API
- [ ] Curl de endpoint `/backend/courses/index.php` (JSON)
- [ ] Curl de endpoint `/backend/auth/login.php` (JSON)
- [ ] Curl de endpoint `/backend/orders/create.php` (JSON)
- [ ] Curl de endpoint `/backend/admin/stats.php` (JSON)

### Panel Admin
- [ ] Panel admin page
- [ ] Listado de usuarios
- [ ] Listado de pedidos
- [ ] Estadísticas

### Seguridad
- [ ] Código fuente mostrando password_hash() en seed.sql
- [ ] Código mostrando password_verify() en login.php
- [ ] Código mostrando prepared statements (PDO)
- [ ] Headers CORS en endpoint

---

## 🎯 VALIDACIÓN FINAL

- [ ] No hay rutas rotas en las principales
- [ ] No hay botones vacíos o sin funcionalidad
- [ ] No hay páginas en blanco sin contenido
- [ ] Mensajes de error claros y útiles
- [ ] Animaciones y transiciones suaves
- [ ] Diseño coherente (colores dark/neon mantenidos)
- [ ] Performance aceptable (carga <3s)
- [ ] No hay errores en consola (console.log/warn aceptables)

---

## 📝 NOTAS IMPORTANTES

1. **Usuario Admin para pruebas**:
   - Email: `admin@coderup.com`
   - Contraseña: `Coderup123!`
   - Rol: `admin`

2. **Usuario Cliente para pruebas**:
   - Email: `cliente@coderup.com`
   - Contraseña: `Coderup123!`
   - Rol: `client`

3. **Cupones Disponibles**:
   - `WELCOME20`: 20% descuento (solo nuevos usuarios)
   - `DESCUENTO10`: 10% descuento (todos)
   - `PROMO5`: $5 descuento fijo (todos)

4. **Rutas PHP esperadas**:
   ```
   /backend/auth/register.php    - POST
   /backend/auth/login.php       - POST
   /backend/auth/logout.php      - POST
   /backend/auth/me.php          - GET
   /backend/courses/index.php    - GET
   /backend/courses/show.php     - GET
   /backend/courses/create.php   - POST
   /backend/courses/update.php   - PUT/POST
   /backend/courses/delete.php   - DELETE/POST
   /backend/orders/create.php    - POST
   /backend/orders/user-orders.php - GET
   /backend/orders/index.php     - GET (admin)
   /backend/users/index.php      - GET (admin)
   /backend/users/show.php       - GET
   /backend/users/update-role.php - PUT/POST (admin)
   /backend/admin/stats.php      - GET (admin)
   ```

5. **URLs Locales**:
   - Frontend: `http://localhost:4321`
   - Backend: `http://localhost/backend` (si PHP está en servidor local)
   - MySQL: `localhost:3306`

---

## ✨ CRITERIOS DE ÉXITO

El proyecto está COMPLETO para la Fase 3 si:

✅ Todos los items ☑️ están marcados  
✅ No hay ❌ sin resolver  
✅ Build (`npm run build`) pasa sin errores  
✅ Base de datos funciona correctamente  
✅ Endpoints PHP responden JSON válido  
✅ Autenticación y sesiones funcionan  
✅ Carrito y checkout funcionan  
✅ Admin y permisos funcionan  
✅ Documentación está completa  
✅ Capturas recopiladas para presentación  

---

## 📞 SOPORTE Y DEBUG

Si algo no funciona:

1. **Frontend no carga**: 
   - Verificar `npm run dev` sin errores
   - Limpiar caché: `npm cache clean --force`
   - Reinstalar: `rm -rf node_modules && npm install`

2. **Base de datos no conecta**:
   - Verificar MySQL corriendo: `mysql -u root`
   - Verificar base de datos existe: `SHOW DATABASES;`
   - Reimportar schema: `mysql -u root coderup < database/schema.sql`

3. **Endpoints PHP no responden**:
   - Verificar sintaxis: `php -l backend/config/db.php`
   - Verificar conexión BD: Crear script test simple
   - Verificar CORS headers en browser DevTools

4. **Carrito no funciona**:
   - Verificar localStorage está habilitado
   - Abrir DevTools → Application → LocalStorage
   - Limpiar localStorage: `localStorage.clear()`

---

**Checklist versión**: 1.0  
**Última actualización**: 2026-05-12  
**Responsable**: Alumno TFG
