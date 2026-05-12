// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import icon from 'astro-icon';

// https://astro.build/config
export default defineConfig({
  // 'static' genera HTML estático → perfecto para Vercel CDN
  output: 'static',

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [react(), icon()],
});
