# Fase 3: Ejecución del proyecto

## 1. Introducción a la fase

La Fase 3 se centra en la ejecución técnica del proyecto CoderUp. El objetivo principal ha sido transformar una base frontend ya funcional en una solución web completa con backend propio en PHP, persistencia en MySQL y comunicación real mediante `fetch()`.

## 2. Estado inicial del proyecto

| Elemento | Estado inicial |
| --- | --- |
| Frontend Astro | Disponible |
| Componentes React | Disponibles |
| Diseño responsive | Avanzado |
| Autenticación | Simulada con `localStorage` |
| Pedidos | Simulados con `localStorage` |
| Backend real | No disponible |
| Base de datos MySQL | No disponible |

## 3. Planificación temporal

| Bloque | Trabajo realizado |
| --- | --- |
| Bloque 1 | Auditoría del repositorio y detección de mocks |
| Bloque 2 | Diseño de la base de datos relacional |
| Bloque 3 | Implementación del backend PHP |
| Bloque 4 | Integración frontend con `fetch()` |
| Bloque 5 | Panel de administración y documentación |

## 4. Recursos utilizados

- Visual Studio Code
- Astro
- React
- TypeScript
- PHP 8
- MySQL
- phpMyAdmin
- Git y GitHub

## 5. Permisos, licencias y documentación

- Se han usado recursos propios del proyecto.
- Los iconos y librerías del frontend proceden de dependencias abiertas ya instaladas.
- La documentación técnica se ha centralizado en `README.md` y `docs/fase-3-ejecucion.md`.

## 6. Revisión de recursos

- Se revisó la estructura de `src/pages`, `src/components`, `src/lib`, `src/data` y `src/styles`.
- Se detectaron referencias heredadas del starter de Astro.
- Se detectó una capa previa `strapi.ts` que se sustituyó por una capa API propia basada en PHP.

## 7. Riesgos detectados

| Riesgo | Impacto |
| --- | --- |
| Romper la interfaz actual | Alto |
| Cambios demasiado grandes sin validación | Alto |
| Dependencia de mocks no documentados | Medio |
| Errores de sesión o permisos | Alto |

## 8. Medidas de prevención

- Trabajo por bloques lógicos.
- Build frecuente con `npm run build`.
- Reutilización del diseño existente.
- Fallback controlado a datos locales en cursos y blog durante desarrollo.
- Validaciones en cliente y servidor.

## 9. Implementación del backend PHP

Se ha creado una carpeta `backend/` estructurada por dominios:

- `auth/`
- `courses/`
- `orders/`
- `users/`
- `admin/`
- `config/`
- `helpers/`

La API devuelve respuestas JSON homogéneas y usa PDO con consultas preparadas.

[Insertar captura: estructura de la carpeta backend]

## 10. Implementación de la base de datos

La base de datos `coderup_db` se define en `database/schema.sql` y se rellena con datos de prueba mediante `database/seed.sql`.

Tablas creadas:

- `roles`
- `users`
- `categories`
- `courses`
- `orders`
- `order_items`

[Insertar captura: diagrama o tablas en phpMyAdmin]

## 11. Implementación de autenticación

Se han implementado los endpoints:

- `register.php`
- `login.php`
- `logout.php`
- `me.php`

Características:

- Contraseñas cifradas con `password_hash()`.
- Verificación con `password_verify()`.
- Inicio de sesión mediante sesiones PHP.
- Validación de credenciales en servidor.

[Insertar captura: login funcionando]

## 12. Implementación de CRUD de cursos

Se ha desarrollado un CRUD básico sobre `courses`:

- Listado
- Detalle
- Creación
- Actualización
- Eliminación

Los permisos se controlan por rol:

- `admin`: acceso completo
- `editor`: creación y edición

[Insertar captura: listado de cursos desde base de datos]
[Insertar captura: formulario de crear curso]

## 13. Implementación de pedidos

El checkout del frontend se conecta con `backend/orders/create.php`. El backend:

- recibe los cursos del carrito,
- calcula subtotal y total,
- aplica el descuento `WELCOME20` si procede,
- crea `orders`,
- crea `order_items`.

[Insertar captura: pedido creado correctamente]

## 14. Roles y permisos

Roles creados en el sistema:

- `admin`
- `editor`
- `cliente`
- `invitado`

Se han preparado al menos cuatro usuarios de prueba con esos accesos.

[Insertar captura: tabla users en phpMyAdmin]

## 15. Seguridad aplicada

- Contraseñas no almacenadas en texto plano.
- Validaciones reutilizables en `helpers/validators.php`.
- Consultas preparadas con PDO.
- Control de permisos mediante `helpers/auth.php`.
- Respuestas JSON con mensajes controlados.

## 16. Evidencias necesarias

Capturas recomendadas:

- Home de CoderUp.
- Registro correcto.
- Login correcto.
- Tabla `users`.
- Tabla `courses`.
- Tabla `orders`.
- CRUD de cursos desde panel admin.
- Historial de pedidos del usuario.
- Panel de estadísticas.

## 17. Pruebas realizadas

| Prueba | Resultado |
| --- | --- |
| Build de Astro | Correcto |
| Fallback de cursos en build | Correcto |
| Sintaxis PHP | Revisada con `php -l` |
| Formularios de auth | Integrados con backend |
| CRUD admin | Base funcional preparada |

## 18. Incidencias y soluciones

| Incidencia | Solución aplicada |
| --- | --- |
| Dependencia previa de `localStorage` en auth y pedidos | Sustitución por backend PHP |
| Referencias al starter de Astro | Eliminadas y documentadas |
| Build roto por tokens Tailwind | Ajuste de variables de tema en `global.css` |
| Build estático sin backend activo | Fallback controlado a datos locales |

## 19. Conclusión de la fase

La Fase 3 deja el proyecto CoderUp en un estado mucho más profesional, claro y defendible. Se mantiene el frontend original, pero ahora existe una arquitectura completa con backend PHP, base de datos MySQL, autenticación real, operaciones CRUD y documentación suficiente para la memoria y la exposición.

[Insertar captura: panel admin]
