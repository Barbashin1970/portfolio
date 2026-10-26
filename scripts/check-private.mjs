/**
 * Сторож открытого репозитория (Р-14, урок private-repo-made-public-leaks-history).
 *
 * Ищет строки из внутреннего списка .private/check-private.txt в файлах, которые попадут
 * в git (отслеживаемые и новые неигнорируемые), и во всём dist/. Падает и тогда, когда
 * в этот набор попал сам файл из .private/. Список в git не попадает, поэтому в CI
 * сторож молчит: его место — на ноутбуке, до коммита.
 *
 *   npm run check:private
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

export const LIST = '.private/check-private.txt';

/** Строки списка: пустые и комментарии (#) пропускаются. */
export function parseNeedles(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));
}

/** Совпадения без учёта регистра: [{ path, line, needle }]. */
export function findLeaks(files, needles) {
  const lowered = needles.map((needle) => [needle, needle.toLowerCase()]);
  const leaks = [];
  for (const { path, content } of files) {
    const lines = content.toLowerCase().split('\n');
    lines.forEach((text, i) => {
      for (const [needle, low] of lowered) {
        if (text.includes(low)) leaks.push({ path, line: i + 1, needle });
      }
    });
  }
  return leaks;
}

/** Файлы, которые уйдут в git: отслеживаемые и новые, не попавшие под .gitignore. */
function gitFiles(root) {
  const out = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], {
    cwd: root,
    encoding: 'utf8',
  });
  return out.split('\0').filter(Boolean);
}

function walk(dir, root) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    return entry.isDirectory() ? walk(full, root) : [relative(root, full)];
  });
}

function main() {
  const root = fileURLToPath(new URL('..', import.meta.url));
  const listPath = join(root, LIST);
  if (!existsSync(listPath)) {
    if (process.env.CI) {
      console.log(`check-private: списка ${LIST} нет — в CI сторож не работает, он работает до коммита.`);
      return 0;
    }
    console.error(`check-private: нет списка ${LIST}. Без него сторож ничего не проверяет.`);
    return 1;
  }

  const needles = parseNeedles(readFileSync(listPath, 'utf8'));
  if (needles.length === 0) {
    console.error(`check-private: список ${LIST} пуст.`);
    return 1;
  }

  const tracked = gitFiles(root);
  // git пишет пути через «/» на любой системе.
  const exposed = tracked.filter((path) => path.startsWith('.private/'));
  const paths = [...new Set([...tracked, ...walk(join(root, 'dist'), root)])];
  const files = paths
    .filter((path) => existsSync(join(root, path)))
    .map((path) => ({ path, content: readFileSync(join(root, path), 'utf8') }));
  const leaks = findLeaks(files, needles);

  for (const path of exposed) console.error(`${path}: файл из .private/ попадёт в git — проверьте .gitignore`);
  for (const { path, line, needle } of leaks) console.error(`${path}:${line}: «${needle}»`);
  if (exposed.length || leaks.length) {
    console.error(`check-private: найдено ${leaks.length + exposed.length}. Внутреннее — только в .private/.`);
    return 1;
  }
  console.log(`check-private: 0 совпадений в ${files.length} файлах (строк в списке: ${needles.length}).`);
  return 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) process.exitCode = main();
