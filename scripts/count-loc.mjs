/**
 * Объём кода за 2025–2026 — справка под каталогом (Р-50). Считает по локальным клонам
 * репозиториев Barbashin1970 непустые строки в файлах под git:
 * - одинаковые файлы в разных репозиториях (один blob git) — один раз;
 * - файл длиннее 5000 непустых строк — сгенерированный (типы API, сборки), не в счёт;
 * - корпус норм и отчёты NORMA-STROY (norma-text/, otchet/) — тексты сводов правил,
 *   а не документация;
 * - репозитории из .private/loc-skip.txt (личная инфраструктура и база знаний) не считаются:
 *   в открытых файлах их имён нет.
 * Свой сервер — фреймворк сервера в зависимостях (FastAPI, aiogram, Express, Spring…)
 * или встроенный HTTP-сервер Python; база данных — SQLite, DuckDB, SQLAlchemy и подобные.
 *
 *   node scripts/count-loc.mjs ~     — только на ноутбуке Олега: приватные клоны есть только там
 *
 * Итог сверяется вручную с src/data/volume.ts; README и опись с ним сверяет tests/numbers.test.ts.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const LIMIT = 5000;
const SINCE = '2025-01-01';
const LANG = {
  '.py': 'Python',
  '.ts': 'TypeScript',
  '.tsx': 'TypeScript',
  '.js': 'JavaScript',
  '.jsx': 'JavaScript',
  '.mjs': 'JavaScript',
  '.cjs': 'JavaScript',
  '.java': 'Java',
  '.kt': 'Kotlin',
  '.go': 'Go',
  '.sql': 'SQL',
  '.sh': 'Shell',
  '.ps1': 'Shell',
  '.bat': 'Shell',
};
const DOCS = new Set(['.md', '.mdx']);
const SKIP_DIR = /(^|\/)(node_modules|vendor|third_party|dist|build|out|\.next|coverage|site-packages|venv|\.venv)\//;
const SKIP_FILE = /(\.min\.(js|css)$|-lock\.|\.lock$|bundle\.js$|\.map$)/;
const CORPUS = /^(norma-text|otchet)\//;
const TEST = /(^|\/)(tests?|__tests__|spec)\/|\.(test|spec)\.[jt]sx?$|(^|\/)test_[^/]*\.py$|_test\.(py|go)$/;
const DEPS = /(^|\/)(requirements[^/]*\.txt|pyproject\.toml|package\.json|pom\.xml|build\.gradle(\.kts)?)$/;
const SERVER = /\b(fastapi|flask|django|aiohttp|aiogram|uvicorn|starlette|express|fastify|socket\.io"|@nestjs|koa|hono|spring-boot|javalin|ktor)\b/i;
const SERVER_IMPORT = /^(from|import) (fastapi|flask|aiohttp|aiogram|http\.server|socketserver)\b/m;
const DB = /\b(sqlalchemy|sqlite3?|duckdb|psycopg|asyncpg|aiosqlite|postgres|redis|better-sqlite3|prisma|jdbc)\b/i;

const git = (dir, args) => execFileSync('git', ['-C', dir, ...args], { encoding: 'utf8', maxBuffer: 1 << 28 }).trim();
const nonBlank = (text) => text.split('\n').filter((line) => line.trim() !== '').length;
const read = (path) => {
  try {
    return statSync(path).size < 3_000_000 ? readFileSync(path, 'utf8') : '';
  } catch {
    return '';
  }
};

function skipList() {
  const file = fileURLToPath(new URL('../.private/loc-skip.txt', import.meta.url));
  if (!existsSync(file)) return new Set();
  return new Set(readFileSync(file, 'utf8').split('\n').map((line) => line.trim()).filter((line) => line && !line.startsWith('#')));
}

export function countRepos(root) {
  const skip = skipList();
  const seen = new Set();
  const total = { repos: 0, code: 0, tests: 0, docs: 0, servers: 0, databases: 0, commits: 0, byLang: {}, generated: [] };
  for (const name of readdirSync(root).sort()) {
    const dir = join(root, name);
    if (skip.has(name) || !existsSync(join(dir, '.git'))) continue;
    let remote;
    try {
      remote = git(dir, ['remote', 'get-url', 'origin']);
    } catch {
      continue;
    }
    if (!/github\.com[:/]Barbashin1970\//i.test(remote)) continue;
    const dates = git(dir, ['log', '--format=%ad', '--date=short']).split('\n').filter(Boolean);
    if (!dates.length || dates.at(-1) < SINCE) continue;

    total.repos += 1;
    total.commits += dates.length;
    let python = '';
    for (const row of git(dir, ['ls-files', '-s', '-z']).split('\0').filter(Boolean)) {
      const [meta, file] = row.split('\t');
      const blob = meta.split(' ')[1];
      const ext = extname(file).toLowerCase();
      const lang = LANG[ext];
      if (SKIP_DIR.test(file) || SKIP_FILE.test(file) || (!lang && !DOCS.has(ext))) continue;
      if (name === 'NORMA-STROY' && CORPUS.test(file)) continue;
      const text = read(join(dir, file));
      if (lang === 'Python') python += text;
      const n = nonBlank(text);
      if (!n || seen.has(blob)) continue;
      seen.add(blob);
      if (n > LIMIT) {
        total.generated.push(`${name}/${file}: ${n}`);
        continue;
      }
      if (DOCS.has(ext)) {
        total.docs += n;
        continue;
      }
      total.code += n;
      total.byLang[lang] = (total.byLang[lang] ?? 0) + n;
      if (TEST.test(file)) total.tests += n;
    }
    const deps = git(dir, ['ls-files'])
      .split('\n')
      .filter((file) => DEPS.test(file) && !SKIP_DIR.test(file))
      .map((file) => read(join(dir, file)))
      .join('\n');
    if (SERVER.test(deps) || SERVER_IMPORT.test(python)) total.servers += 1;
    if (DB.test(deps) || /^(from|import) (sqlite3|duckdb)\b/m.test(python)) total.databases += 1;
  }
  return total;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = process.argv[2];
  if (!root) {
    console.error('count-loc: укажите папку с клонами, например ~');
    process.exitCode = 1;
  } else {
    const t = countRepos(root);
    const k = (n) => Math.round(n / 1000);
    console.log(`репозиториев: ${t.repos}, коммитов: ${t.commits}`);
    console.log(`строк кода: ${t.code} (≈ ${k(t.code)} тыс.), из них тесты: ${t.tests} (≈ ${k(t.tests)} тыс.)`);
    console.log(`по языкам: ${Object.entries(t.byLang).sort((a, b) => b[1] - a[1]).map(([l, n]) => `${l} ${n}`).join(', ')}`);
    console.log(`документация, Markdown: ${t.docs} (≈ ${k(t.docs)} тыс.)`);
    console.log(`со своим сервером: ${t.servers}, с базой данных: ${t.databases}`);
    console.log(`не в счёт как сгенерированные: ${t.generated.join('; ') || 'нет'}`);
  }
}
