/**
 * Предсборка (Р-04): вставляет в dist/client/index.html разметку страницы, <head>
 * и предзагрузку кириллицы заголовочного и текстового шрифтов (PLAN §1, «Шрифты»).
 * Метка не найдена — остановка: молча пустой #root хуже упавшей сборки.
 *
 *   node scripts/prerender.mjs   (часть npm run build)
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = new URL('..', import.meta.url);
const clientDir = new URL('dist/client/', root);
const indexUrl = new URL('index.html', clientDir);

/** Шрифты, которые нужны первому экрану: H1 — Geologica, подзаголовок — Onest. */
export const PRELOAD_FONTS = [/^geologica-cyrillic-shrp-normal-[\w-]+\.woff2$/, /^onest-cyrillic-wght-normal-[\w-]+\.woff2$/];

function replaceOnce(html, marker, value) {
  if (!html.includes(marker)) throw new Error(`prerender: в шаблоне нет метки ${marker}`);
  return html.replace(marker, () => value);
}

async function main() {
  const template = readFileSync(indexUrl, 'utf8');
  // Приставка адресов — из собранного шаблона: она совпадает с base Vite по построению.
  const base = /(?:src|href)="([^"]*)assets\//.exec(template)?.[1];
  if (!base) throw new Error('prerender: не нашёл в шаблоне адресов assets/ — не понять base');

  const assets = readdirSync(new URL('assets/', clientDir));
  const preloads = PRELOAD_FONTS.map((pattern) => {
    const file = assets.find((name) => pattern.test(name));
    if (!file) throw new Error(`prerender: нет шрифта для предзагрузки ${pattern}`);
    return `<link rel="preload" href="${base}assets/${file}" as="font" type="font/woff2" crossorigin />`;
  });

  const { render } = await import(new URL('dist/server/entry-server.js', root).href);
  const { html, head } = render('ru');
  let page = replaceOnce(template, '<!--app-head-->', [head, ...preloads].join('\n    '));
  page = replaceOnce(page, '<!--app-html-->', html);
  writeFileSync(indexUrl, page);
  console.log(`prerender: ${fileURLToPath(indexUrl)} — ru, шрифтов в предзагрузке: ${preloads.length}`);
}

await main();
