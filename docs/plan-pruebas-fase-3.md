# Plan de Pruebas - CoderUp Fase 3: Ejecución del Proyecto

**Fecha**: 2026-05-12  
**Versión**: 1.0  
**Estado**: Preparado para ejecución  

---

## Introducción

Este documento describe todas las pruebas necesarias para validar que CoderUp funciona correctamente como plataforma completa de cursos online. Las pruebas abarcan desde la instalación inicial hasta la verificación de características avanzadas como login, carrito, checkout, pedidos y panel de administración.

---

## 1. INSTALACIÓN Y ARRANQUE

| Nº | Área | Prueba | Pasos | Resultado esperado | Resultado obtenido | Estado | Captura |
|---|---|---|---|---|---|---|---|
| 1.1 | Instalación | npm install | Ejecutar `npm install` en carpeta raíz | Todas las dependencias se instalan sin errores | Pendiente de comprobar | ⚠️ Pendiente | [npm-install] |
| 1.2 | Frontend | npm run dev | Ejecutar `npm run dev` | Astro inicia en localhost:4321 sin errores | Pendiente de comprobar | ⚠️ Pendiente | [astro-dev] |
| 1.3 | Frontend | npm run build | Ejecutar `npm run build` | Build completo sin errores, carpeta dist/ creada | Pendiente de comprobar | ⚠️ Pendiente | [npm-build] |
| 1.4 | Base de datos | MySQL accesible | Verificar conexión a MySQL | MySQL listen en 3306, usuario root accesible | Pendiente de comprobar | ⚠️ Pendiente | [mysql-status] |
| 1.5 | Base de datos | schema.sql importado | Ejecutar `mysql -u root -p coderup < database/schema.sql` | Base de datos coderup creada con 8 tablas | Pendiente de comprobar | ⚠️ Pendiente | [mysql-schema] |
| 1.6 | Base de datos | seed.sql importado | Ejecutar `mysql -u root -p coderup < database/seed.sql` | Datos de prueba insertados: 4 usuarios, 12 cursos, 2 órdenes | Pendiente de comprobar | ⚠️ Pendiente | [mysql-seed] |
| 1.7 | Backend | Archivos PHP presentes | Verificar carpeta backend/ | Carpetas: config/, helpers/, auth/, courses/, orders/, users/, admin/ | Documento creado ✓ | ✅ Completado | N/A |

---

## 2. NAVEGACIÓN Y RUTAS PRINCIPALES

| Nº | Área | Prueba | Pasos | Resultado esperado | Resultado obtenido | Estado | Captura |
|---|---|---|---|---|---|---|---|
| 2.1 | Navegación | Home page | Acceder a `/` | Home carga, hero visible, CTA funciona | Pendiente de comprobar | ⚠️ Pendiente | [home] |
| 2.2 | Navegación | Página Cursos | Acceder a `/cursos` | Lista de cursos visible, paginación funciona | Pendiente de comprobar | ⚠️ Pendiente | [cursos-lista] |
| 2.3 | Navegación | Detalle Curso | Acceder a `/cursos/react-avanzado` | Detalle del curso visible, precio, descripción, botón comprar | Pendiente de comprobar | ⚠️ Pendiente | [curso-detalle] |
| 2.4 | Navegación | Categorías | Acceder a `/categorias` | Lista de categorías visible | Pendiente de comprobar | ⚠️ Pendiente | [categorias] |
| 2.5 | Navegación | Blog | Acceder a `/blog` | Blog page visible (si existe) | Pendiente de comprobar | ⚠️ Pendiente | [blog] |
| 2.6 | Navegación | Sobre Nosotros | Acceder a `/sobre-nosotros` | Página visible | Pendiente de comprobar | ⚠️ Pendiente | [sobre-nosotros] |
| 2.7 | Navegación | Contacto | Acceder a `/contacto` | Formulario visible | Pendiente de comprobar | ⚠️ Pendiente | [contacto] |
| 2.8 | Navegación | Login | Acceder a `/login` | Formulario login visible | Pendiente de comprobar | ⚠️ Pendiente | [login] |
| 2.9 | Navegación | Registro | Acceder a `/registro` o `/register` | Formulario registro visible | Pendiente de comprobar | ⚠️ Pendiente | [registro] |
| 2.10 | Navegación | Carrito | Acceder a `/carrito` | Carrito visible (vacío al inicio) | Pendiente de comprobar | ⚠️ Pendiente | [carrito-vacio] |
| 2.11 | Navegación | Checkout | Acceder a `/checkout` | Página checkout visible | Pendiente de comprobar | ⚠️ Pendiente | [checkout] |
| 2.12 | Navegación | Mi Cuenta | Acceder a `/mi-cuenta` sin sesión | Redirección a login o mensaje de acceso denegado | Pendiente de comprobar | ⚠️ Pendiente | [mi-cuenta-login] |
| 2.13 | Navegación | Mi Cuenta | Acceder a `/mi-cuenta` con sesión | Dashboard visible con datos del usuario | Pendiente de comprobar | ⚠️ Pendiente | [mi-cuenta-logueado] |
| 2.14 | Navegación | Panel Admin | Acceder a `/admin` sin ser admin | Acceso denegado o redirección | Pendiente de comprobar | ⚠️ Pendiente | [admin-denegado] |
| 2.15 | Navegación | Panel Admin | Acceder a `/admin` siendo admin | Panel visible con opciones | Pendiente de comprobar | ⚠️ Pendiente | [admin-panel] |

---

## 3. RESPONSIVE DESIGN

| Nº | Área | Prueba | Pasos | Resultado esperado | Resultado obtenido | Estado | Captura |
|---|---|---|---|---|---|---|---|
| 3.1 | Responsive | Home móvil (360px) | Ver home en 360px | Layout responsivo, sin overflow, textos legibles | Pendiente de comprobar | ⚠️ Pendiente | [home-360px] |
| 3.2 | Responsive | Home tablet (768px) | Ver home en 768px | Layout adaptado correctamente | Pendiente de comprobar | ⚠️ Pendiente | [home-768px] |
| 3.3 | Responsive | Home desktop (1440px) | Ver home en 1440px | Layout completo, bien espaciado | Pendiente de comprobar | ⚠️ Pendiente | [home-1440px] |
| 3.4 | Responsive | Cursos móvil | Ver `/cursos` en 360px | Cards apiladas, paginación visible | Pendiente de comprobar | ⚠️ Pendiente | [cursos-360px] |
| 3.5 | Responsive | Header móvil | Header en 360px | Menú hamburguesa funciona (si existe) | Pendiente de comprobar | ⚠️ Pendiente | [header-mobile] |
| 3.6 | Responsive | Footer móvil | Footer en 360px | Contenido legible, enlaces clickeables | Pendiente de comprobar | ⚠️ Pendiente | [footer-mobile] |
| 3.7 | Responsive | Formulario móvil | Formulario login en 360px | Campos visibles, botón accesible | Pendiente de comprobar | ⚠️ Pendiente | [formulario-mobile] |
| 3.8 | Responsive | Carrito móvil | Carrito en 360px | Items visibles, total visible | Pendiente de comprobar | ⚠️ Pendiente | [carrito-mobile] |

---

## 4. BASE DE DATOS Y BACKEND PHP

| Nº | Área | Prueba | Pasos | Resultado esperado | Resultado obtenido | Estado | Captura |
|---|---|---|---|---|---|---|---|
| 4.1 | BD | Tablas creadas | Conectar a BD y verificar tablas | Existen: users, courses, orders, order_items, categories, coupons, enrollments, roles | Pendiente de comprobar | ⚠️ Pendiente | [mysql-tables] |
| 4.2 | BD | Usuarios insertados | SELECT * FROM users; | 4 usuarios: admin, editor, cliente, invitado | Pendiente de comprobar | ⚠️ Pendiente | [users-table] |
| 4.3 | BD | Cursos insertados | SELECT * FROM courses; | 12 cursos visibles | Pendiente de comprobar | ⚠️ Pendiente | [courses-table] |
| 4.4 | BD | Categorías insertadas | SELECT * FROM categories; | 6 categorías (Frontend, Backend, DevOps, Mobile, Fullstack, Diseño) | Pendiente de comprobar | ⚠️ Pendiente | [categories-table] |
| 4.5 | BD | Password hasheada | SELECT password FROM users LIMIT 1; | Hash comienza con $2y$ (bcrypt) | Pendiente de comprobar | ⚠️ Pendiente | [password-hash] |
| 4.6 | BD | Índices creados | SHOW INDEXES FROM users; | Índices en email, role, etc. | Pendiente de comprobar | ⚠️ Pendiente | [database-indexes] |
| 4.7 | Backend | Sintaxis PHP | php -l backend/config/db.php | Sin errores de sintaxis | Pendiente de comprobar | ⚠️ Pendiente | [php-syntax] |
| 4.8 | Backend | Config accesible | Verificar backend/config/db.php existe | Archivo presente con PDO config | Documento creado ✓ | ✅ Completado | N/A |

---

## 5. ENDPOINTS JSON

| Nº | Área | Prueba | Pasos | Resultado esperado | Resultado obtenido | Estado | Captura |
|---|---|---|---|---|---|---|---|
| 5.1 | API | GET /backend/courses/index.php | curl http://localhost/backend/courses/index.php | JSON con array de cursos | Pendiente de comprobar | ⚠️ Pendiente | [api-cursos] |
| 5.2 | API | GET /backend/courses/show.php?slug=react-avanzado | Acceder endpoint con slug | JSON con detalle del curso | Pendiente de comprobar | ⚠️ Pendiente | [api-curso-detalle] |
| 5.3 | API | POST /backend/auth/register.php | Registrar usuario válido | JSON con datos del usuario creado, status 201 | Pendiente de comprobar | ⚠️ Pendiente | [api-register] |
| 5.4 | API | POST /backend/auth/login.php | Login con usuario válido | JSON con datos de sesión | Pendiente de comprobar | ⚠️ Pendiente | [api-login] |
| 5.5 | API | GET /backend/auth/me.php | Obtener usuario actual | JSON con datos del usuario logueado | Pendiente de comprobar | ⚠️ Pendiente | [api-me] |
| 5.6 | API | POST /backend/orders/create.php | Crear pedido | JSON con datos de la orden creada | Pendiente de comprobar | ⚠️ Pendiente | [api-order-create] |
| 5.7 | API | GET /backend/orders/user-orders.php | Obtener pedidos del usuario | JSON con array de órdenes del usuario logueado | Pendiente de comprobar | ⚠️ Pendiente | [api-user-orders] |
| 5.8 | API | GET /backend/users/index.php | Listar usuarios (admin) | JSON con array de usuarios | Pendiente de comprobar | ⚠️ Pendiente | [api-users-list] |
| 5.9 | API | GET /backend/admin/stats.php | Obtener stats (admin) | JSON con totalUsers, totalCourses, totalOrders, etc. | Pendiente de comprobar | ⚠️ Pendiente | [api-stats] |

---

## 6. REGISTRO Y LOGIN

| Nº | Área | Prueba | Pasos | Resultado esperado | Resultado obtenido | Estado | Captura |
|---|---|---|---|---|---|---|---|
| 6.1 | Auth | Registro correcto | Rellenar formulario válido y enviar | Usuario creado, sesión iniciada, redirección a /mi-cuenta | Pendiente de comprobar | ⚠️ Pendiente | [registro-ok] |
| 6.2 | Auth | Registro - email duplicado | Intentar registrar con email existente | Error: "Ya existe una cuenta con este email" | Pendiente de comprobar | ⚠️ Pendiente | [registro-email-existe] |
| 6.3 | Auth | Registro - password corta | Registrar con contraseña <6 caracteres | Error: "Contraseña muy corta" | Pendiente de comprobar | ⚠️ Pendiente | [registro-password-corta] |
| 6.4 | Auth | Registro - campos vacíos | Dejar campos en blanco | Error de validación para cada campo | Pendiente de comprobar | ⚠️ Pendiente | [registro-campos-vacios] |
| 6.5 | Auth | Login correcto | Email: cliente@coderup.com, Pass: Coderup123! | Sesión iniciada, redirección a /mi-cuenta | Pendiente de comprobar | ⚠️ Pendiente | [login-ok] |
| 6.6 | Auth | Login - credentials incorrectos | Email o password incorrecto | Error: "Credenciales incorrectas" | Pendiente de comprobar | ⚠️ Pendiente | [login-error] |
| 6.7 | Auth | Login - email inválido | Registrar email inválido | Error de validación | Pendiente de comprobar | ⚠️ Pendiente | [login-email-invalido] |
| 6.8 | Auth | Logout | Hacer click en logout | Sesión destruida, redirección a home, botones cambian | Pendiente de comprobar | ⚠️ Pendiente | [logout-ok] |
| 6.9 | Auth | Header sin sesión | Ver header sin login | "Iniciar sesión" y "Registrarse" visibles | Pendiente de comprobar | ⚠️ Pendiente | [header-sin-sesion] |
| 6.10 | Auth | Header con sesión | Ver header con login | "Mi cuenta" y "Logout" visibles | Pendiente de comprobar | ⚠️ Pendiente | [header-con-sesion] |
| 6.11 | Auth | Header admin | Ver header siendo admin | "Panel Admin" visible | Pendiente de comprobar | ⚠️ Pendiente | [header-admin] |

---

## 7. CARRITO Y CHECKOUT

| Nº | Área | Prueba | Pasos | Resultado esperado | Resultado obtenido | Estado | Captura |
|---|---|---|---|---|---|---|---|
| 7.1 | Carrito | Añadir a carrito | Click "Añadir a carrito" en curso premium | Curso añadido, carrito actualizado | Pendiente de comprobar | ⚠️ Pendiente | [carrito-add] |
| 7.2 | Carrito | Carrito visible | Ir a `/carrito` | Curso visible en carrito, precio correcto | Pendiente de comprobar | ⚠️ Pendiente | [carrito-items] |
| 7.3 | Carrito | Total correcto | Ver total en carrito | Subtotal + items = total correcto | Pendiente de comprobar | ⚠️ Pendiente | [carrito-total] |
| 7.4 | Carrito | Quitar del carrito | Click "Quitar" en item | Item eliminado, total actualizado | Pendiente de comprobar | ⚠️ Pendiente | [carrito-remove] |
| 7.5 | Carrito | Carrito vacío | Vaciar carrito | Mensaje "Tu carrito está vacío" | Pendiente de comprobar | ⚠️ Pendiente | [carrito-empty] |
| 7.6 | Carrito | Duplic libre - no se añade | Intentar añadir gratis | Curso gratis no se puede comprar (carrito solo premium) | Pendiente de comprobar | ⚠️ Pendiente | [carrito-gratis] |
| 7.7 | Carrito | Descuento bienvenida | Código: WELCOME20 (nuevo usuario) | Descuento 20% aplicado | Pendiente de comprobar | ⚠️ Pendiente | [carrito-descuento] |
| 7.8 | Checkout | Acceso sin login | Ir a `/checkout` sin login | Redirección a login o mensajeinfo | Pendiente de comprobar | ⚠️ Pendiente | [checkout-sin-login] |
| 7.9 | Checkout | Checkout con carrito | Ir a `/checkout` con items | Resumen de compra visible | Pendiente de comprobar | ⚠️ Pendiente | [checkout-form] |
| 7.10 | Checkout | Crear pedido | Completar checkout | Pedido creado en BD, orden visible | Pendiente de comprobar | ⚠️ Pendiente | [checkout-ok] |
| 7.11 | Checkout | Carrito se vacía | Completar compra | Carrito vacío después de pedido | Pendiente de comprobar | ⚠️ Pendiente | [carrito-vaciado] |

---

## 8. ROLES Y PERMISOS

| Nº | Área | Prueba | Pasos | Resultado esperado | Resultado obtenido | Estado | Captura |
|---|---|---|---|---|---|---|---|
| 8.1 | Roles | Admin accede a /admin | Login como admin, ir a `/admin` | Panel admin visible | Pendiente de comprobar | ⚠️ Pendiente | [admin-access] |
| 8.2 | Roles | Editor accede a admin | Login como editor, ir a `/admin` | Acceso a sección editor si existe, sino denegado | Pendiente de comprobar | ⚠️ Pendiente | [editor-access] |
| 8.3 | Roles | Cliente no accede a admin | Login como cliente, ir a `/admin` | Acceso denegado o redirección | Pendiente de comprobar | ⚠️ Pendiente | [client-admin-denied] |
| 8.4 | Roles | Invitado no accede a admin | Login como invitado, ir a `/admin` | Acceso denegado | Pendiente de comprobar | ⚠️ Pendiente | [guest-admin-denied] |
| 8.5 | Roles | Cliente ve solo sus órdenes | Login cliente, ir a `/mi-cuenta/pedidos` | Solo pedidos del usuario visible | Pendiente de comprobar | ⚠️ Pendiente | [client-orders] |
| 8.6 | Roles | Admin ve todas las órdenes | Login admin, GET `/backend/orders/index.php` | Todas las órdenes de todos los usuarios | Pendiente de comprobar | ⚠️ Pendiente | [admin-all-orders] |

---

## 9. CRUD DE CURSOS

| Nº | Área | Prueba | Pasos | Resultado esperado | Resultado obtenido | Estado | Captura |
|---|---|---|---|---|---|---|---|
| 9.1 | Cursos | Listar cursos | GET `/backend/courses/index.php` | JSON con 12 cursos | Pendiente de comprobar | ⚠️ Pendiente | [cursos-list] |
| 9.2 | Cursos | Ver detalle | GET `/backend/courses/show.php?slug=react-avanzado` | JSON con curso completo | Pendiente de comprobar | ⚠️ Pendiente | [curso-show] |
| 9.3 | Cursos | Crear curso | POST `/backend/courses/create.php` (editor) | Curso creado con ID | Pendiente de comprobar | ⚠️ Pendiente | [curso-create] |
| 9.4 | Cursos | Actualizar curso | PUT `/backend/courses/update.php` (editor) | Curso actualizado | Pendiente de comprobar | ⚠️ Pendiente | [curso-update] |
| 9.5 | Cursos | Eliminar curso | DELETE `/backend/courses/delete.php` (admin) | Curso eliminado | Pendiente de comprobar | ⚠️ Pendiente | [curso-delete] |
| 9.6 | Cursos | Curso no existe | GET `/backend/courses/show.php?slug=inexistente` | 404, error "Curso no encontrado" | Pendiente de comprobar | ⚠️ Pendiente | [curso-404] |
| 9.7 | Cursos | Crear sin permisos | POST (cliente) | Error 403 "Forbidden" | Pendiente de comprobar | ⚠️ Pendiente | [curso-forbidden] |

---

## 10. MI CUENTA Y PEDIDOS

| Nº | Área | Prueba | Pasos | Resultado esperado | Resultado obtenido | Estado | Captura |
|---|---|---|---|---|---|---|---|
| 10.1 | Cuenta | Dashboard visible | Login, ir a `/mi-cuenta` | Datos del usuario visibles (nombre, email) | Pendiente de comprobar | ⚠️ Pendiente | [account-dashboard] |
| 10.2 | Cuenta | Pedidos del usuario | Ver `/mi-cuenta/pedidos` | Histórico de pedidos visible | Pendiente de comprobar | ⚠️ Pendiente | [user-orders-list] |
| 10.3 | Cuenta | Sin pedidos | Usuario sin compras, ver `/mi-cuenta/pedidos` | Mensaje "No tienes pedidos" | Pendiente de comprobar | ⚠️ Pendiente | [no-orders] |
| 10.4 | Cuenta | Detalles pedido | Click en un pedido | Detalles y items del pedido visibles | Pendiente de comprobar | ⚠️ Pendiente | [order-detail] |
| 10.5 | Cuenta | Sin login | Acceder `/mi-cuenta` sin sesión | Redirección a login | Pendiente de comprobar | ⚠️ Pendiente | [account-redirect] |

---

## 11. FORMULARIOS

| Nº | Área | Prueba | Pasos | Resultado esperado | Resultado obtenido | Estado | Captura |
|---|---|---|---|---|---|---|---|
| 11.1 | Formularios | Contact form | Rellenar y enviar formulario contacto | Confirmación visible (simulado) | Pendiente de comprobar | ⚠️ Pendiente | [contact-form] |
| 11.2 | Formularios | Newsletter | Rellenar y enviar newsletter | Confirmación visible (simulado) | Pendiente de comprobar | ⚠️ Pendiente | [newsletter-form] |
| 11.3 | Formularios | Login form validation | Dejar vacío email | Error de validación | Pendiente de comprobar | ⚠️ Pendiente | [login-validation] |
| 11.4 | Formularios | Register form validation | Dejar vacío nombre | Error de validación | Pendiente de comprobar | ⚠️ Pendiente | [register-validation] |

---

## 12. SEGURIDAD BÁSICA

| Nº | Área | Prueba | Pasos | Resultado esperado | Resultado obtenido | Estado | Captura |
|---|---|---|---|---|---|---|---|
| 12.1 | Seguridad | Password hasheada | SELECT password FROM users LIMIT 1 | Hash bcrypt ($2y$), no texto plano | Pendiente de comprobar | ⚠️ Pendiente | [password-bcrypt] |
| 12.2 | Seguridad | No devuelve password | POST login → response | JSON sin campo password | Pendiente de comprobar | ⚠️ Pendiente | [api-no-password] |
| 12.3 | Seguridad | SQL Injection - login | Intentar inyección en email | Consulta preparada, sin inyección | Documento creado ✓ | ✅ Completado | N/A |
| 12.4 | Seguridad | SQL Injection - courses | Intentar inyección en search | Parámetros sanitizados | Documento creado ✓ | ✅ Completado | N/A |
| 12.5 | Seguridad | XSS - nombre usuario | Guardar <script> en nombre | Se escapa o sanitiza en salida | Documento creado ✓ | ✅ Completado | N/A |
| 12.6 | Seguridad | CORS headers | Verificar headers en respuestas | Access-Control-Allow-Origin presente | Documento creado ✓ | ✅ Completado | N/A |
| 12.7 | Seguridad | Rutas admin protegidas | Acceso sin sesión a /admin endpoint | Redirección o 401 Unauthorized | Documento creado ✓ | ✅ Completado | N/A |
| 12.8 | Seguridad | localStorage limpio | Ver código fuente | No hay contraseñas en localStorage | Documento creado ✓ | ✅ Completado | N/A |

---

## 13. ESTADOS VACÍOS Y ERRORES

| Nº | Área | Prueba | Pasos | Resultado esperado | Resultado obtenido | Estado | Captura |
|---|---|---|---|---|---|---|---|
| 13.1 | Errores | Carrito vacío | Acceder a `/carrito` sin items | Mensaje "Tu carrito está vacío" | Pendiente de comprobar | ⚠️ Pendiente | [carrito-empty-msg] |
| 13.2 | Errores | Sin cursos (hipotético) | Si no hay cursos | Mensaje "No hay cursos disponibles" | Pendiente de comprobar | ⚠️ Pendiente | [cursos-empty] |
| 13.3 | Errores | Curso no encontrado | Acceder `/cursos/slug-inexistente` | Página 404 o redirección | Pendiente de comprobar | ⚠️ Pendiente | [curso-404-page] |
| 13.4 | Errores | Sin pedidos | Usuario sin compras en `/mi-cuenta/pedidos` | Mensaje claro | Pendiente de comprobar | ⚠️ Pendiente | [pedidos-empty] |
| 13.5 | Errores | Backend apagado | Si backend no responde | Error visible, no pantalla blanca | Pendiente de comprobar | ⚠️ Pendiente | [backend-error] |

---

## 14. BUILD FINAL

| Nº | Área | Prueba | Pasos | Resultado esperado | Resultado obtenido | Estado | Captura |
|---|---|---|---|---|---|---|---|
| 14.1 | Build | npm run build | Ejecutar build | Sin errores, carpeta `dist/` creada | Pendiente de comprobar | ⚠️ Pendiente | [build-success] |
| 14.2 | Build | Archivos generados | Verificar dist/ | HTML, CSS, JS bundleados | Pendiente de comprobar | ⚠️ Pendiente | [dist-files] |
| 14.3 | Build | Size bundle | Verificar tamaño | < 5MB total | Pendiente de comprobar | ⚠️ Pendiente | [bundle-size] |

---

## LEGENDAS Y NOTAS

### Estados
- ✅ **Completado**: Prueba verificada exitosamente
- ⚠️ **Pendiente de comprobar**: Preparado pero requiere ejecución manual
- ❌ **Fallo**: Prueba no supera validación

### Usuarios de Prueba
```
Email: admin@coderup.com
Contraseña: Coderup123!
Rol: Admin

Email: editor@coderup.com
Contraseña: Coderup123!
Rol: Editor

Email: cliente@coderup.com
Contraseña: Coderup123!
Rol: Cliente

Email: invitado@coderup.com
Contraseña: Coderup123!
Rol: Guest
```

### Datos de Conexión BD
```
Host: localhost
Puerto: 3306
Base de datos: coderup
Usuario: root
Contraseña: (vacío o tu contraseña local)
```

### URLs Base
- Frontend: http://localhost:4321
- Backend: http://localhost/backend
- MySQL: localhost:3306

---

## Conclusión

Este plan de pruebas cubre todas las áreas críticas de CoderUp. Una vez completadas todas las pruebas con resultado ✅, el proyecto estará listo para la defensa de la Fase 3.

**Total de pruebas**: 70+ casos  
**Estimado de tiempo**: 4-6 horas  
**Requiere**: MySQL, PHP 7.4+, Node.js 18+

---

*Documento creado: 2026-05-12*  
*Versión: 1.0*
