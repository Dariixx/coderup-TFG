import { siteConfig } from "../config/site";

export function GET() {
  const body = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /checkout
Disallow: /mi-cuenta
Disallow: /login
Disallow: /register
Disallow: /forgot-password
Disallow: /reset-password

Sitemap: ${siteConfig.url}/sitemap.xml
Host: ${siteConfig.url}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
