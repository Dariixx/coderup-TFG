import { siteConfig } from "../config/site";
import { getBlogPosts, getCategories, getCourses } from "../lib/strapi";

export async function GET() {
  const [courses, categories, posts] = await Promise.all([
    getCourses(),
    getCategories(),
    getBlogPosts(),
  ]);

  const staticRoutes = ["/", "/cursos", "/categorias", "/blog", "/contacto", "/sobre-nosotros", "/carrito"];
  const dynamicRoutes = [
    ...courses.map((course) => `/cursos/${course.slug}`),
    ...categories.map((category) => `/categorias/${category.slug}`),
    ...posts.map((post) => `/blog/${post.slug}`),
  ];

  const urls = [...staticRoutes, ...dynamicRoutes]
    .map((route) => `<url><loc>${siteConfig.url}${route}</loc></url>`)
    .join("");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
}
