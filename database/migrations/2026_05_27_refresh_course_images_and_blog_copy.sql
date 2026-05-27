UPDATE courses SET thumbnail_url = 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=1200&q=82' WHERE slug = 'react-avanzado';
UPDATE courses SET thumbnail_url = 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=82' WHERE slug = 'nodejs-apis-rest';
UPDATE courses SET thumbnail_url = 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&w=1200&q=82' WHERE slug = 'typescript-profesional';
UPDATE courses SET thumbnail_url = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=82' WHERE slug = 'astro-desde-cero';
UPDATE courses SET thumbnail_url = 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=1200&q=82' WHERE slug = 'python-fullstack';
UPDATE courses SET thumbnail_url = 'https://images.unsplash.com/photo-1605745341112-85968b19335b?auto=format&fit=crop&w=1200&q=82' WHERE slug = 'docker-kubernetes';
UPDATE courses SET thumbnail_url = 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?auto=format&fit=crop&w=1200&q=82' WHERE slug = 'tailwind-css-masterclass';
UPDATE courses SET thumbnail_url = 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&w=1200&q=82' WHERE slug = 'git-github-pro';
UPDATE courses SET thumbnail_url = 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=1200&q=82' WHERE slug = 'sql-bases-de-datos';
UPDATE courses SET thumbnail_url = 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&q=82' WHERE slug = 'html-css-desde-cero';
UPDATE courses SET thumbnail_url = 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1200&q=82' WHERE slug = 'react-native-apps';
UPDATE courses SET thumbnail_url = 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1200&q=82' WHERE slug = 'ui-ux-design-fundamentals';

UPDATE posts
SET
  title = 'Guía práctica de Hooks en React',
  excerpt = 'Aprende cuándo usar useState, useEffect, useContext y custom hooks con ejemplos pensados para una plataforma de cursos.',
  content = '<h2>Por qué importan los hooks</h2><p>Los hooks permiten crear pantallas interactivas sin convertir cada componente en una estructura difícil de seguir. En CoderUp se usan para controlar formularios, filtros de cursos, carrito, autenticación y carga de datos desde la API.</p><p>useState ayuda con estados cercanos a la interfaz, como abrir un modal o recordar una búsqueda. useEffect sirve para sincronizar la pantalla con datos externos, por ejemplo al pedir cursos a MySQL. useContext es útil cuando una información debe compartirse entre varias zonas, como el usuario autenticado o el carrito.</p><h2>Buenas prácticas para clientes</h2><p>Un buen hook debe resolver una responsabilidad concreta y devolver nombres fáciles de entender. Esto mejora la accesibilidad del producto porque los estados de carga, error y éxito se muestran de forma clara, sin dejar al cliente esperando sin explicación.</p><p>También conviene cuidar las dependencias de useEffect. Si están mal definidas, la página puede repetir peticiones o enseñar datos desactualizados. Separar la lógica en hooks pequeños hace que el comportamiento sea más previsible y fácil de mantener.</p><h2>Conclusión</h2><p>Dominar hooks no consiste en memorizar funciones, sino en construir experiencias fluidas, comprensibles y preparadas para crecer.</p>',
  cover_image_url = 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=1200&q=82'
WHERE slug = 'guia-completa-hooks-react';

UPDATE posts
SET
  title = 'TypeScript vs JavaScript: cuál elegir',
  excerpt = 'Compara ambas opciones desde un punto de vista práctico: velocidad, seguridad, mantenimiento y trabajo con APIs.',
  content = '<h2>La diferencia en el día a día</h2><p>JavaScript permite empezar rápido y sigue siendo la base del desarrollo web moderno. TypeScript añade tipos encima de JavaScript para detectar errores antes del despliegue y documentar mejor cómo se usan los datos.</p><p>En una plataforma e-learning aparecen entidades como cursos, instructores, usuarios, pedidos y cupones. Si esos datos están tipados, el equipo sabe qué campos existen, qué valores son opcionales y qué errores debe manejar cada pantalla.</p><h2>Cuándo merece la pena</h2><p>TypeScript compensa especialmente cuando hay formularios, roles, carrito, panel de administración y comunicación con backend. El editor guía al programador y ayuda a evitar fallos visibles para el cliente, como precios mal formateados o cursos sin imagen.</p><p>No hace falta escribir tipos complejos desde el primer día. La estrategia más sana es empezar por las respuestas de API, las props de componentes y los estados críticos. Después se amplía donde aporte claridad real.</p><h2>Conclusión</h2><p>Para proyectos que van a crecer, TypeScript mejora la confianza técnica y hace que el mantenimiento sea más ordenado.</p>',
  cover_image_url = 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&w=1200&q=82'
WHERE slug = 'typescript-vs-javascript';

UPDATE posts
SET
  title = 'CSS Grid para páginas limpias y responsive',
  excerpt = 'Una guía sencilla para crear catálogos, dashboards y layouts adaptables sin depender de estructuras frágiles.',
  content = '<h2>Un layout que se entiende</h2><p>CSS Grid permite organizar filas y columnas al mismo tiempo. Esto resulta ideal para catálogos de cursos, listados de blog, paneles de administración y páginas donde el contenido necesita respirar sin perder orden.</p><p>En móvil, una grilla puede mostrarse en una sola columna. En escritorio, esa misma estructura puede convertirse en dos o tres columnas manteniendo el HTML limpio. El resultado es más estable y más fácil de revisar en capturas.</p><h2>Aplicación en CoderUp</h2><p>Las tarjetas de cursos necesitan imagen, categoría, nivel, precio y llamada a la acción. Grid ayuda a mantener esa información alineada aunque cambie la longitud del texto o el número de resultados.</p><p>Además, una grilla bien definida mejora la accesibilidad visual: separa bloques, evita solapamientos y permite que cada sección tenga una jerarquía clara.</p><h2>Conclusión</h2><p>CSS Grid no sustituye a flexbox, pero es una herramienta clave para interfaces profesionales, responsive y fáciles de defender.</p>',
  cover_image_url = 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?auto=format&fit=crop&w=1200&q=82'
WHERE slug = 'css-grid-guia-definitiva';

UPDATE posts
SET
  title = 'API REST: respuestas claras para clientes',
  excerpt = 'Diseña endpoints previsibles, mensajes de error útiles y respuestas consistentes para que el frontend sea más fiable.',
  content = '<h2>Una API como contrato</h2><p>Una API REST no es solo una lista de archivos en backend. Es el contrato que permite que la interfaz muestre cursos, posts, instructores, cupones y pedidos sin adivinar cómo llegan los datos.</p><p>Cuando las respuestas mantienen una estructura consistente, el frontend puede enseñar mensajes claros: cursos cargados, cupón aplicado, pedido completado o error de validación. Esto mejora la experiencia del cliente porque cada acción tiene una respuesta comprensible.</p><h2>Seguridad y mantenimiento</h2><p>Las buenas prácticas incluyen validación de entrada, prepared statements, tokens de sesión y códigos HTTP correctos. Un error 400 comunica datos inválidos, un 401 falta de autenticación, un 404 recurso inexistente y un 500 un fallo inesperado.</p><p>También conviene paginar listados, documentar campos y evitar exponer detalles internos. Así la aplicación puede crecer sin romper las pantallas existentes.</p><h2>Conclusión</h2><p>Una API profesional falla bien, protege los datos y permite que la experiencia del cliente sea estable.</p>',
  cover_image_url = 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=82'
WHERE slug = 'api-rest-mejores-practicas';

UPDATE posts
SET
  title = 'Git Flow: organizar el trabajo en equipo',
  excerpt = 'Un flujo de ramas y revisiones ayuda a explicar cambios, evitar conflictos y mantener el proyecto listo para desplegar.',
  content = '<h2>Más que guardar versiones</h2><p>Git cuenta la historia técnica del proyecto. Un historial limpio permite ver qué se implementó, cuándo se corrigió un problema y cómo evolucionaron las decisiones principales.</p><p>Git Flow propone separar el trabajo en ramas de funcionalidad, corrección y publicación. En proyectos pequeños puede simplificarse, pero la idea central sigue siendo útil: aislar cambios, revisar antes de mezclar y mantener la rama principal estable.</p><h2>Aplicado a una plataforma real</h2><p>Antes de subir cambios conviene revisar el diff, ejecutar el build y comprobar que no se publican secretos. Este hábito evita errores visibles en producción y demuestra una forma profesional de trabajar.</p><p>Para un TFG, los commits también sirven como evidencia: muestran iteración, pruebas, mejoras visuales y correcciones sobre datos reales.</p><h2>Conclusión</h2><p>Un workflow claro reduce conflictos y convierte el repositorio en una parte defendible del producto.</p>',
  cover_image_url = 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&w=1200&q=82'
WHERE slug = 'git-flow-workflow-equipos';

UPDATE posts
SET
  title = 'Docker para principiantes: del código al entorno',
  excerpt = 'Entiende imágenes, contenedores, volúmenes y docker-compose con un enfoque práctico para despliegues reproducibles.',
  content = '<h2>El problema que resuelve Docker</h2><p>Docker reduce el clásico fallo de que una aplicación funciona en un equipo, pero no en otro. Una imagen define dependencias, versión del runtime y comando de arranque para que desarrollo y producción se parezcan más.</p><p>En una plataforma con frontend, backend y base de datos, docker-compose permite levantar varios servicios de forma coordinada. Esto facilita pruebas, despliegues y revisión técnica del proyecto.</p><h2>Buenas prácticas iniciales</h2><p>Un Dockerfile debe ser claro, pequeño y fácil de reconstruir. Conviene copiar dependencias antes que código cuando sea posible, definir variables de entorno y revisar logs para entender qué ocurre dentro del contenedor.</p><p>Docker no sustituye a las migraciones, la monitorización ni la seguridad, pero aporta una base muy sólida para trabajar con entornos repetibles.</p><h2>Conclusión</h2><p>Aprender Docker ayuda a pasar de una aplicación local a un producto desplegable con más confianza.</p>',
  cover_image_url = 'https://images.unsplash.com/photo-1605745341112-85968b19335b?auto=format&fit=crop&w=1200&q=82'
WHERE slug = 'docker-para-principiantes';

UPDATE posts
SET
  title = 'Accesibilidad web práctica para plataformas de cursos',
  excerpt = 'Mejora formularios, navegación, contraste, foco visible y mensajes de error para que más personas puedan usar la web.',
  content = '<h2>Accesibilidad como parte de la calidad</h2><p>Una web accesible no es una versión especial: es una web mejor construida. Etiquetas visibles, contraste suficiente, foco claro y mensajes de error comprensibles ayudan a todos los usuarios.</p><p>En CoderUp, los formularios de login, registro, checkout y recuperación de contraseña son momentos críticos. Si una persona no entiende qué campo falla o no puede navegar con teclado, el flujo de compra queda incompleto.</p><h2>Detalles que se notan</h2><p>Los botones deben comunicar estados de carga, los enlaces deben tener textos claros y las imágenes necesitan alternativas descriptivas cuando aportan información. También es importante mantener una jerarquía de encabezados lógica para lectores de pantalla.</p><p>La accesibilidad mejora las capturas porque la interfaz se ve ordenada, con separación clara entre acciones, contenido y mensajes del sistema.</p><h2>Conclusión</h2><p>Aplicar WCAG desde el diseño convierte la experiencia en algo más usable, profesional y respetuoso con los clientes.</p>',
  cover_image_url = 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=1200&q=82'
WHERE slug = 'accesibilidad-web-practica';

UPDATE posts
SET
  title = 'MySQL para ecommerce educativo',
  excerpt = 'Modela usuarios, cursos, pedidos, cupones e inscripciones con relaciones claras y datos preparados para auditoría.',
  content = '<h2>Datos que sostienen el producto</h2><p>Un ecommerce educativo necesita más que una tabla de cursos. Usuarios, pedidos, líneas de pedido, cupones e inscripciones forman un recorrido completo desde la visita hasta el acceso al contenido.</p><p>Cada compra debe conservar el precio pagado, el cupón aplicado y los cursos desbloqueados. Así el cliente puede consultar sus pedidos y el sistema mantiene información fiable aunque el precio de un curso cambie después.</p><h2>Relaciones y transacciones</h2><p>MySQL permite expresar estas conexiones con claves foráneas y tablas normalizadas. order_items separa los cursos comprados de la orden, enrollments registra el acceso posterior y coupons permite reglas comerciales sin tocar la interfaz.</p><p>Las transacciones son esenciales: crear orden, items e inscripciones debe ocurrir como una sola operación. Si algo falla, se revierte para no dejar datos a medias.</p><h2>Conclusión</h2><p>Un modelo relacional claro convierte el checkout en una funcionalidad defendible, segura y fácil de explicar.</p>',
  cover_image_url = 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=1200&q=82'
WHERE slug = 'mysql-ecommerce-educativo';
