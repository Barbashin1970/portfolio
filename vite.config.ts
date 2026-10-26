/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { bootHead } from './src/boot.ts';

// Адрес на Pages повторяет имя репозитория с учётом регистра (Р-18): workflow передаёт
// BASE_PATH из имени репозитория, локально — /portfolio/.
const base = process.env.BASE_PATH ?? '/portfolio/';

export default defineConfig(({ isSsrBuild }) => ({
  base,
  // Серверной сборке public/ не нужен: она только рендерит разметку для предсборки.
  build: { copyPublicDir: !isSsrBuild },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  plugins: [
    react(),
    tailwindcss(),
    {
      // Переменные движения и скрипт до отрисовки — сразу после <meta charset>, до стилей (src/boot.ts).
      name: 'portfolio:boot',
      transformIndexHtml(html) {
        if (!html.includes('<!--boot-->')) throw new Error('В index.html нет метки <!--boot-->');
        return html.replace('<!--boot-->', bootHead);
      },
    },
  ],
  test: {
    include: ['tests/**/*.test.{ts,tsx}'],
    environment: 'node',
  },
}));
