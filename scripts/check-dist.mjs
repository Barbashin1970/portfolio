/**
 * Сторож собранной страницы. Фаза 1 — RU; фаза 3 добавит EN, hreflang, canonical, JSON-LD.
 *
 * - H1, title и description в HTML совпадают со словарём — LCP не ждёт JavaScript (Р-04);
 * - lang, translate="no", notranslate (урок browser-translator-breaks-react-dom);
 * - метки шаблона заменены, #root не пуст;
 * - каждый локальный адрес из index.html ведёт на файл в dist/client;
 * - заглушки брифа («[ФИО]», «[ник]»…) не встречаются ни в одном файле dist/
 *   (урок html-guard-misses-placeholders-in-downloadable-files).
 *
 *   npm run check:dist   (после npm run build)
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

export const PLACEHOLDERS = [
  /\[ФИО/,
  /\[ник\]/i,
  /\[e-?mail\]/i,
  /\[telegram\]/i,
  /\[linkedin/i,
  /ТУТ-БУДЕТ/i,
  /<!--app-(?:html|head)-->/,
  /<!--boot-->/,
];

const decode = (text) =>
  text.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');

export const textOf = (html) => decode(html.replace(/<[^>]+>/g, ''));

/** Проверки одной страницы: список расхождений, пустой — всё сошлось. */
export function checkPage(html, facts) {
  const problems = [];
  const expect = (ok, message) => ok || problems.push(message);

  expect(new RegExp(`<html[^>]*\\blang="${facts.lang}"`).test(html), `нет <html lang="${facts.lang}">`);
  expect(/<html[^>]*\btranslate="no"/.test(html), 'нет translate="no" у <html>');
  expect(/<meta name="google" content="notranslate"/.test(html), 'нет <meta name="google" content="notranslate">');

  const title = /<title>([^<]*)<\/title>/.exec(html)?.[1];
  expect(title !== undefined && decode(title) === facts.title, `title не совпадает со словарём: «${title}»`);
  const description = /<meta name="description" content="([^"]*)"/.exec(html)?.[1];
  expect(description !== undefined && decode(description) === facts.description, 'description не совпадает со словарём');

  const h1s = [...html.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)];
  expect(h1s.length === 1, `H1 должен быть один, найдено ${h1s.length}`);
  expect(h1s[0] && textOf(h1s[0][1]) === facts.h1, `текст H1 не совпадает со словарём: «${h1s[0] ? textOf(h1s[0][1]) : ''}»`);

  expect(/<div id="root"[^>]*>\s*<[a-z]/.test(html), '#root пуст — предсборка не сработала');
  return problems;
}

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)],
  );
}

async function main() {
  const root = fileURLToPath(new URL('..', import.meta.url));
  const client = join(root, 'dist/client');
  const indexPath = join(client, 'index.html');
  if (!existsSync(indexPath)) {
    console.error('check-dist: нет dist/client/index.html — сначала npm run build');
    return 1;
  }
  const html = readFileSync(indexPath, 'utf8');
  const { pageFacts } = await import(new URL('../dist/server/entry-server.js', import.meta.url).href);
  const problems = checkPage(html, pageFacts('ru')).map((p) => `index.html: ${p}`);

  const base = /(?:src|href)="([^"]*)assets\//.exec(html)?.[1] ?? '/';
  for (const [, url] of html.matchAll(/(?:src|href)="([^"#?]+)"/g)) {
    if (/^[a-z]+:/i.test(url) || url.startsWith('//')) continue;
    if (!url.startsWith(base)) {
      problems.push(`index.html: адрес «${url}» мимо приставки ${base} — на Pages будет 404`);
      continue;
    }
    if (!existsSync(join(client, url.slice(base.length)))) problems.push(`index.html: нет файла для «${url}»`);
  }

  const files = walk(join(root, 'dist'));
  for (const file of files) {
    const content = readFileSync(file, 'utf8');
    for (const pattern of PLACEHOLDERS) {
      if (pattern.test(content)) problems.push(`${relative(root, file)}: заглушка ${pattern}`);
    }
  }

  for (const problem of problems) console.error(problem);
  if (problems.length) {
    console.error(`check-dist: расхождений ${problems.length}`);
    return 1;
  }
  console.log(`check-dist: страница ru сошлась со словарём; файлов в dist/ без заглушек: ${files.length}`);
  return 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) process.exitCode = await main();
