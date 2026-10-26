/**
 * Проверка вёрстки в настоящем браузере: headless Chrome с эмуляцией экрана
 * открывает собранный сайт и ждёт конца интро (scripts/lib/chrome.mjs).
 *
 * - у H1 scrollWidth ≤ clientWidth — проверяется сам заголовок: overflow у секции
 *   спрятал бы вылет от проверки страницы (Б-19);
 * - у страницы нет горизонтальной прокрутки;
 * - на 375×667 и 1440×900 роль, H1, подзаголовок и обе кнопки — в первом экране
 *   и видны (UC-1);
 * - ошибок гидратации 0; интро закончилось: класса intro и разрезанных букв нет;
 * - фон: на десктопе — живой граф, на телефоне и при reduced-motion — статичный (UC-6).
 *
 *   npm run check:layout                 (после npm run build)
 *   npm run check:layout -- --shots DIR  (ещё и скриншоты каждого экрана)
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launchChrome } from './lib/chrome.mjs';
import { startServer } from './lib/static-server.mjs';

/** Экраны: 320 — только ширина заголовка; первый экран UC-1 — на 375×667 и 1440×900. */
export const SCREENS = [
  { name: 'телефон 320×568', width: 320, height: 568, mobile: true, scale: 2, firstScreen: false },
  { name: 'телефон 375×667', width: 375, height: 667, mobile: true, scale: 2, firstScreen: true },
  { name: 'десктоп 1440×900', width: 1440, height: 900, mobile: false, scale: 1, firstScreen: true },
  { name: 'телефон 375×667, reduced-motion', width: 375, height: 667, mobile: true, scale: 2, firstScreen: true, reduce: true },
  { name: 'десктоп 1440×900, reduced-motion', width: 1440, height: 900, mobile: false, scale: 1, firstScreen: true, reduce: true },
];

const FIRST_SCREEN = ['.hero-eyebrow', '#hero-title', '.hero-lead', '.hero-actions a'];
const SETTLE_TIMEOUT_MS = 15000;

/** Интро закончилось: страница загружена, класса intro нет, конечные анимации отыграли. */
const settled = (expectLive) => `(() => {
  if (document.readyState !== 'complete' || document.fonts.status !== 'loaded') return false;
  if (document.documentElement.classList.contains('intro')) return false;
  const running = document.getAnimations().filter((a) => a.playState === 'running' && a.effect?.getComputedTiming().endTime !== Infinity);
  if (running.length) return false;
  return ${expectLive} ? document.querySelector('.hero-bg')?.dataset.graph === 'live' : true;
})()`;

const MEASURE = `(() => {
  const h1 = document.getElementById('hero-title');
  const box = (el) => {
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return { top: Math.round(r.top), bottom: Math.round(r.bottom), shown: s.visibility === 'visible' && Number(s.opacity) > 0.9 };
  };
  return {
    h1: h1 ? { scroll: h1.scrollWidth, client: h1.clientWidth } : null,
    page: { scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth },
    viewport: innerHeight,
    firstScreen: ${JSON.stringify(FIRST_SCREEN)}.flatMap((sel) => [...document.querySelectorAll(sel)].map((el) => ({ sel, ...box(el) }))),
    hydrationErrors: (window.__hydrationErrors || []).length,
    introClass: document.documentElement.classList.contains('intro'),
    splitChars: h1 ? h1.querySelectorAll('.split-char').length : -1,
    graph: document.querySelector('.hero-bg')?.dataset.graph ?? null,
  };
})()`;

/** Ожидания к одному экрану: список расхождений. */
export function judge(m, screen) {
  const problems = [];
  const expect = (ok, message) => ok || problems.push(message);
  expect(m.h1 && m.h1.scroll <= m.h1.client, `H1 вылезает: scrollWidth ${m.h1?.scroll} > clientWidth ${m.h1?.client}`);
  expect(m.page.scroll <= m.page.client, `горизонтальная прокрутка: ${m.page.scroll} > ${m.page.client}`);
  if (screen.firstScreen) {
    for (const item of m.firstScreen) {
      expect(item.top >= 0 && item.bottom <= m.viewport, `${item.sel} не в первом экране: ${item.top}…${item.bottom} из ${m.viewport}`);
      expect(item.shown, `${item.sel} не виден`);
    }
    expect(m.firstScreen.filter((i) => i.sel === '.hero-actions a').length === 2, 'кнопок в hero не две');
  }
  expect(m.hydrationErrors === 0, `ошибок гидратации: ${m.hydrationErrors}`);
  expect(!m.introClass, 'класс intro остался — интро не закончилось');
  expect(m.splitChars === 0, `в H1 остались разрезанные буквы: ${m.splitChars}`);
  const graph = screen.width >= 1024 && !screen.reduce ? 'live' : 'static';
  expect(m.graph === graph, `фон: ожидался ${graph}, получен ${m.graph}`);
  return problems;
}

async function main() {
  const shotsArg = process.argv.indexOf('--shots');
  const shots = shotsArg > 0 ? resolve(process.argv[shotsArg + 1]) : null;
  if (shots) mkdirSync(shots, { recursive: true });

  const server = await startServer(fileURLToPath(new URL('../dist/client', import.meta.url)));
  const chrome = await launchChrome();
  let failures = 0;
  try {
    for (const screen of SCREENS) {
      const page = await chrome.openPage(screen);
      await page.goto(`${server.origin}${server.base}`);
      const expectLive = screen.width >= 1024 && !screen.reduce;
      const done = await page.until(settled(expectLive), SETTLE_TIMEOUT_MS);
      const m = await page.evaluate(MEASURE);
      const problems = judge(m, screen);
      if (!done) problems.push(`за ${SETTLE_TIMEOUT_MS / 1000} с страница не успокоилась`);
      failures += problems.length;
      const line = `${screen.name}: H1 ${m.h1?.scroll}/${m.h1?.client}, страница ${m.page.scroll}/${m.page.client}, фон ${m.graph}`;
      if (problems.length) console.error(`✗ ${line}\n  - ${problems.join('\n  - ')}`);
      else console.log(`✓ ${line}`);
      if (shots) {
        const file = `${screen.width}x${screen.height}${screen.reduce ? '-reduced' : ''}.png`;
        writeFileSync(join(shots, file), await page.screenshot());
      }
      await page.close();
    }
  } finally {
    await chrome.close();
    await server.close();
  }
  if (failures) {
    console.error(`check-layout: расхождений ${failures}`);
    return 1;
  }
  console.log('check-layout: всё на месте');
  return 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) process.exitCode = await main();
