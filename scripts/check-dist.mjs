/**
 * Сторож собранной страницы. Фаза 1 — RU; фаза 3 добавит EN, hreflang, canonical, JSON-LD.
 *
 * - H1, подзаголовок hero, title и description в HTML совпадают со словарём — LCP
 *   не ждёт JavaScript (Р-04); фото в «Контакте» — с подписью из словаря (Р-52);
 * - lang, translate="no", notranslate (урок browser-translator-breaks-react-dom);
 * - метки шаблона заменены, #root не пуст;
 * - каждый локальный адрес из index.html ведёт на файл в dist/client;
 * - заглушки брифа («[ФИО]», «[ник]»…) не встречаются ни в одном файле dist/
 *   (урок html-guard-misses-placeholders-in-downloadable-files);
 * - служебных пометок из src/data/project-notes.ts нет ни в одном файле dist/ (Б-21, Р-28).
 *   Контроль поиска: описание проекта в бандле находится тем же способом — иначе поиск слеп.
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

/** Самый длинный кусок без кавычек и переносов: их минификатор экранирует. */
export const fragment = (text) => text.split(/["'`\\\n]/).reduce((a, b) => (b.length > a.length ? b : a), '');

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
  // Подзаголовок несёт главную работу (Р-36) и тоже не ждёт JavaScript.
  const lead = /<p class="hero-lead"[^>]*>([\s\S]*?)<\/p>/.exec(html)?.[1];
  expect(lead !== undefined && textOf(lead) === facts.lead, `подзаголовок hero не совпадает со словарём: «${lead ? textOf(lead) : ''}»`);
  // Фото Олега в «Контакте» (Р-52) — в странице и с подписью; файл по его адресу ищет обход ниже.
  const photo = /<img\b[^>]*\bclass="contact-photo"[^>]*>/.exec(html)?.[0];
  const alt = photo && /\balt="([^"]*)"/.exec(photo)?.[1];
  expect(alt !== undefined && decode(alt) === facts.name, `фото в «Контакте»: ${photo ? `подпись «${alt}» не из словаря` : 'нет в странице'}`);

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
  const contents = files.map((file) => readFileSync(file, 'utf8'));
  files.forEach((file, i) => {
    for (const pattern of PLACEHOLDERS) {
      if (pattern.test(contents[i])) problems.push(`${relative(root, file)}: заглушка ${pattern}`);
    }
  });

  const { projects } = await import('../src/data/projects.ts');
  const { PROJECT_NOTES } = await import('../src/data/project-notes.ts');
  const found = (text) => contents.some((content) => content.includes(fragment(text)));
  if (!found(projects[0].tagline.ru)) problems.push('описание проекта не нашлось в dist/ — поиск пометок слеп');
  for (const [slug, note] of Object.entries(PROJECT_NOTES)) {
    if (found(note)) problems.push(`служебная пометка «${slug}» попала в dist/`);
  }

  for (const problem of problems) console.error(problem);
  if (problems.length) {
    console.error(`check-dist: расхождений ${problems.length}`);
    return 1;
  }
  console.log(
    `check-dist: страница ru сошлась со словарём; файлов в dist/ без заглушек и пометок: ${files.length}, пометок искали: ${Object.keys(PROJECT_NOTES).length}`,
  );
  return 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) process.exitCode = await main();
