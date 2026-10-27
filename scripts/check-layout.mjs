/**
 * Проверка вёрстки в настоящем браузере: headless Chrome с эмуляцией экрана
 * открывает собранный сайт и ждёт конца интро (scripts/lib/chrome.mjs).
 *
 * - у H1 scrollWidth ≤ clientWidth — проверяется сам заголовок: overflow у секции
 *   спрятал бы вылет от проверки страницы (Б-19);
 * - у страницы нет горизонтальной прокрутки;
 * - на 375×667 и 1440×900 роль, H1, подзаголовок и кнопки hero — в первом экране
 *   и видны (UC-1);
 * - каждая ссылка-якорь ведёт на элемент, который есть на странице;
 * - ошибок гидратации 0; интро закончилось: класса intro и разрезанных букв нет;
 * - фон: на десктопе — живой граф, на телефоне и при reduced-motion — статичный (UC-6).
 *
 *   npm run check:layout                 (после npm run build)
 *   npm run check:layout -- --shots DIR  (ещё и скриншоты каждого экрана)
 *   npm run check:layout -- --url https://barbashin1970.github.io/portfolio/  (живой сайт)
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
  if (!${expectLive}) return true;
  // Живой граф поднялся, а статичный SVG догас (твин GSAP не виден в getAnimations).
  const svg = document.querySelector('.hero-graph');
  return document.querySelector('.hero-bg')?.dataset.graph === 'live' && !!svg && getComputedStyle(svg).visibility === 'hidden';
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
    staticGraphShown: getComputedStyle(document.querySelector('.hero-graph')).visibility !== 'hidden',
    deadAnchors: [...document.querySelectorAll('a[href^="#"]')]
      .map((a) => a.getAttribute('href'))
      .filter((href) => href.length > 1 && !document.getElementById(decodeURIComponent(href.slice(1)))),
  };
})()`;

/**
 * Действия человека (фаза 2): лента избранного, видео, фильтр каталога, число игр в своей
 * секции и переход по якорю к самой нижней секции —
 * «Контакту» (урок accordion-scroll-lands-on-wrong-section: верхние секции не промахиваются никогда).
 */
const INTERACT = `(async () => {
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  // Конец прокрутки — когда Lenis снял с <html> класс lenis-scrolling и страница стоит.
  // Одной неподвижности мало: на программном рендере headless Chrome кадры замирают
  // на 1–4 с посреди анимации, при свободном главном потоке (замер 2026-10-27).
  const settle = async () => {
    let last = -1;
    let still = 0;
    for (let i = 0; i < 150 && still < 6; i++) {
      await sleep(100);
      const moving = document.documentElement.classList.contains('lenis-scrolling');
      still = !moving && Math.abs(scrollY - last) < 0.5 ? still + 1 : 0;
      last = scrollY;
    }
  };
  const result = { pinSpacer: Boolean(document.querySelector('.pin-spacer')) };
  // Лента избранного идёт по колонке текста: первая карточка — с края заголовка секции,
  // в конце ленты последняя кончается у правого края колонки, целиком в окне.
  const cards = document.querySelectorAll('.featured-track > li');
  const head = Math.round(document.querySelector('#featured .section-title').getBoundingClientRect().left);
  const width = document.documentElement.clientWidth;
  result.track = { head, width, first: Math.round(cards[0].getBoundingClientRect().left) };
  const spacer = document.querySelector('.pin-spacer');
  if (spacer) scrollTo(0, spacer.getBoundingClientRect().top + scrollY + spacer.offsetHeight - innerHeight);
  else document.querySelector('.featured-viewport').scrollLeft = 1e6;
  for (let i = 0; i < 50; i++) {
    await sleep(100);
    result.track.last = Math.round(cards[cards.length - 1].getBoundingClientRect().right);
    if (Math.abs(result.track.last - (width - head)) <= 2) break;
  }
  // Видео не качаются заранее: адрес — только в data-src, пока человек не попросил.
  const videos = [...document.querySelectorAll('video.project-video')];
  result.videosIdle = videos.length > 0 && videos.every((video) => !video.getAttribute('src') && video.dataset.src);
  const toggle = document.querySelector('#catalog .video-toggle');
  toggle?.scrollIntoView({ block: 'center' });
  toggle?.click();
  let played = false;
  for (let i = 0; i < 50 && !played; i++) {
    await sleep(100);
    played = Boolean(toggle?.closest('.project-card')?.querySelector('.project-video.is-playing'));
  }
  result.videoPlays = played;
  toggle?.click();
  // Каталог — рабочие проекты; игры — своя секция с той же сеткой, поэтому счёт — по секции.
  const gridSize = (section) => document.querySelectorAll(section + ' .catalog-grid > li').length;
  const chips = [...document.querySelectorAll('.catalog-filter button')];
  const health = chips.find((button) => button.textContent.includes('Здоровье'));
  health?.click();
  await sleep(300);
  result.filter = { pressed: health?.getAttribute('aria-pressed') ?? null, shown: gridSize('#catalog') };
  chips[0]?.click();
  await sleep(300);
  result.filterAll = gridSize('#catalog');
  result.games = gridSize('#games');
  document.querySelector('header a[href="#contact"]')?.click();
  await sleep(200);
  await settle();
  result.anchor = {
    top: Math.round(document.getElementById('contact')?.getBoundingClientRect().top ?? NaN),
    header: Math.round(document.querySelector('header')?.getBoundingClientRect().height ?? NaN),
  };
  // После перехода «Контакт» проявился: блоки с data-reveal видны.
  const shown = () =>
    [...document.querySelectorAll('#contact [data-reveal]')].every((el) => {
      const style = getComputedStyle(el);
      return style.visibility === 'visible' && Number(style.opacity) > 0.9;
    });
  for (let i = 0; i < 50 && !shown(); i++) await sleep(100);
  result.contactShown = shown();
  // И всё, что выше низа экрана, проявилось: переход пролетел каталог и игры, появление
  // не должно застрять ни в одной секции.
  const hidden = () =>
    [...document.querySelectorAll('[data-reveal]')].filter((el) => {
      if (el.getBoundingClientRect().top > innerHeight) return false;
      const style = getComputedStyle(el);
      return style.visibility !== 'visible' || Number(style.opacity) < 0.9;
    }).length;
  for (let i = 0; i < 50 && hidden() > 0; i++) await sleep(100);
  result.hiddenAbove = hidden();
  return result;
})()`;

/** Ожидания к действиям: список расхождений. */
export function judgeActions(a, screen, expected) {
  const problems = [];
  const expect = (ok, message) => ok || problems.push(message);
  const pinned = screen.width >= 1024 && !screen.reduce;
  expect(a.pinSpacer === pinned, pinned ? 'у избранного нет пина' : 'пин есть там, где его быть не должно (телефон или reduced-motion)');
  const t = a.track;
  expect(Math.abs(t.first - t.head) <= 2, `лента избранного начинается с ${t.first} px, а заголовок секции — с ${t.head} px`);
  expect(Math.abs(t.last - (t.width - t.head)) <= 2, `в конце ленты последняя карточка кончается на ${t.last} px, край колонки — ${t.width - t.head} px`);
  expect(a.videosIdle, 'видео начали качаться до просьбы посетителя');
  expect(a.videoPlays, 'по кнопке «Видео» ролик не заиграл за 5 с');
  expect(a.filter.pressed === 'true', `фильтр «Здоровье»: aria-pressed=${a.filter.pressed}`);
  expect(a.filter.shown === expected.health, `фильтр «Здоровье»: карточек ${a.filter.shown}, в данных ${expected.health}`);
  expect(a.filterAll === expected.work, `фильтр «Все»: карточек ${a.filterAll}, рабочих проектов в данных ${expected.work}`);
  expect(a.games === expected.games, `в секции игр карточек ${a.games}, игр в данных ${expected.games}`);
  expect(Math.abs(a.anchor.top - a.anchor.header) <= 8, `якорь «Контакт»: верх секции ${a.anchor.top}, шапка ${a.anchor.header}`);
  expect(a.contactShown, '«Контакт» не проявился за 5 с после перехода по якорю');
  expect(a.hiddenAbove === 0, `выше низа экрана не проявились блоки: ${a.hiddenAbove}`);
  return problems;
}

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
    // До фазы 2 кнопка одна: «Смотреть работы» вернётся вместе с карточками.
    expect(m.firstScreen.some((i) => i.sel === '.hero-actions a'), 'в hero нет ни одной кнопки');
  }
  expect(m.deadAnchors.length === 0, `ссылки на якоря, которых нет на странице: ${m.deadAnchors.join(', ')}`);
  expect(m.hydrationErrors === 0, `ошибок гидратации: ${m.hydrationErrors}`);
  expect(!m.introClass, 'класс intro остался — интро не закончилось');
  expect(m.splitChars === 0, `в H1 остались разрезанные буквы: ${m.splitChars}`);
  const graph = screen.width >= 1024 && !screen.reduce ? 'live' : 'static';
  expect(m.graph === graph, `фон: ожидался ${graph}, получен ${m.graph}`);
  expect(m.staticGraphShown === (graph === 'static'), `статичный граф ${m.staticGraphShown ? 'виден' : 'погас'} при фоне ${m.graph}`);
  return problems;
}

const argument = (name) => {
  const i = process.argv.indexOf(name);
  return i > 0 ? process.argv[i + 1] : undefined;
};

async function main() {
  const shots = argument('--shots') ? resolve(argument('--shots')) : null;
  if (shots) mkdirSync(shots, { recursive: true });

  // Живой адрес — как есть; иначе раздаём dist/client с той же приставкой, что на Pages.
  const live = argument('--url');
  const server = live ? null : await startServer(fileURLToPath(new URL('../dist/client', import.meta.url)));
  const site = live ?? `${server.origin}${server.base}`;
  // --only 1440 — только экраны, в названии которых есть эта строка.
  const only = argument('--only');
  const screens = only ? SCREENS.filter((screen) => screen.name.includes(only)) : SCREENS;
  // Сколько карточек ждать после фильтра — из данных, а не числом в проверке.
  const { projects } = await import('../src/data/projects.ts');
  const count = (audience) => projects.filter((p) => p.audience === audience).length;
  const expected = { work: projects.length - count('games'), games: count('games'), health: count('health') };
  const chrome = await launchChrome();
  let failures = 0;
  try {
    for (const screen of screens) {
      const page = await chrome.openPage(screen);
      await page.goto(site);
      const expectLive = screen.width >= 1024 && !screen.reduce;
      const done = await page.until(settled(expectLive), SETTLE_TIMEOUT_MS);
      const m = await page.evaluate(MEASURE);
      const problems = judge(m, screen);
      if (!done) problems.push(`за ${SETTLE_TIMEOUT_MS / 1000} с страница не успокоилась`);
      const name = `${screen.width}x${screen.height}${screen.reduce ? '-reduced' : ''}`;
      if (shots) writeFileSync(join(shots, `${name}.png`), await page.screenshot());
      const actions = await page.evaluate(INTERACT);
      problems.push(...judgeActions(actions, screen, expected));
      if (shots) writeFileSync(join(shots, `${name}-contact.png`), await page.screenshot());
      failures += problems.length;
      const line = `${screen.name}: H1 ${m.h1?.scroll}/${m.h1?.client}, страница ${m.page.scroll}/${m.page.client}, фон ${m.graph}, якорь ${actions.anchor.top}/${actions.anchor.header}`;
      if (problems.length) console.error(`✗ ${line}\n  - ${problems.join('\n  - ')}`);
      else console.log(`✓ ${line}`);
      await page.close();
    }
  } finally {
    await chrome.close();
    await server?.close();
  }
  if (failures) {
    console.error(`check-layout: расхождений ${failures} (${site})`);
    return 1;
  }
  console.log(`check-layout: всё на месте (${site})`);
  return 0;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) process.exitCode = await main();
