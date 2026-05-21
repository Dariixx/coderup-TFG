import { siteConfig } from "../config/site";
import { getBlogPosts, getCategories, getCourses, getInstructors } from "../lib/content";

export async function GET() {
  const [courses, categories, posts, instructors] = await Promise.all([
    getCourses(),
    getCategories(),
    getBlogPosts(),
    getInstructors(),
  ]);

  const staticRoutes = [
    { route: "/", priority: "1.0", changefreq: "weekly" },
    { route: "/cursos", priority: "0.9", changefreq: "weekly" },
    { route: "/categorias", priority: "0.8", changefreq: "weekly" },
    { route: "/blog", priority: "0.8", changefreq: "weekly" },
    { route: "/instructors", priority: "0.7", changefreq: "monthly" },
    { route: "/contacto", priority: "0.6", changefreq: "monthly" },
    { route: "/sobre-nosotros", priority: "0.6", changefreq: "monthly" },
    { route: "/carrito", priority: "0.4", changefreq: "monthly" },
    { route: "/privacidad", priority: "0.3", changefreq: "yearly" },
    { route: "/terminos", priority: "0.3", changefreq: "yearly" },
    { route: "/cookies", priority: "0.3", changefreq: "yearly" },
  ];
  const dynamicRoutes = [
    ...courses.map((course) => ({ route: `/cursos/${course.slug}`, priority: "0.8", changefreq: "monthly" })),
    ...categories.map((category) => ({ route: `/categorias/${category.slug}`, priority: "0.7", changefreq: "monthly" })),
    ...posts.map((post) => ({ route: `/blog/${post.slug}`, priority: "0.7", changefreq: "monthly" })),
    ...instructors.filter((instructor) => instructor.slug).map((instructor) => ({ route: `/instructors/${instructor.slug}`, priority: "0.6", changefreq: "monthly" })),
  ];
  const lastmod = siteConfig.updatedAt;

  const urls = [...staticRoutes, ...dynamicRoutes]
    .map(({ route, priority, changefreq }) => `<url><loc>${siteConfig.url}${route}</loc><lastmod>${lastmod}</lastmod><changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`)
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
