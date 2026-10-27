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
    featuredFocus: [...document.querySelectorAll('.is-featured :is(.project-shot, .project-video)')].map(
      (el) => getComputedStyle(el).objectPosition,
    ),
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
  // В конце ленты счётчик — последняя карточка, полоса заполнена (Р-44).
  await sleep(200);
  result.track.count = document.querySelector('.featured-count')?.textContent.replace(/\\s+/g, ' ').trim() ?? '';
  const fill = document.querySelector('.featured-fill');
  result.track.fill = fill ? new DOMMatrix(getComputedStyle(fill).transform).a : 0;
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
  // Полоса прогресса страницы (Р-44): у «Контакта» почти полная; при reduced-motion пустая.
  const progress = document.querySelector('.scroll-progress');
  result.progress = progress ? new DOMMatrix(getComputedStyle(progress).transform).a : -1;
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
    [...document.querySelectorAll('[data-reveal], [data-deal]')].filter((el) => {
      if (el.getBoundingClientRect().top > innerHeight) return false;
      const style = getComputedStyle(el);
      return style.visibility !== 'visible' || Number(style.opacity) < 0.9;
    }).length;
  for (let i = 0; i < 50 && hidden() > 0; i++) await sleep(100);
  result.hiddenAbove = hidden();
  // Чат (Р-37): приветствие проявилось после «печатает…»; первая кнопка ответа пишет строку
  // в поле запроса, и чат переходит ко второму шагу. Человек дописывает строку руками —
  // кнопка второго шага добавляет свою строку и правку не стирает. «Отправить» несёт ровно
  // текст поля, стоит у правого края, после щелчка в окне — отправленная реплика и подсказка.
  const visible = (el) => {
    if (!el) return false;
    const style = getComputedStyle(el);
    return style.visibility === 'visible' && Number(style.opacity) > 0.9;
  };
  // На коротком телефоне окно после перехода ниже экрана, и «печатает…» ждёт, пока его
  // докрутят, — как человек, сначала докручиваем до окна.
  document.querySelector('.chat')?.scrollIntoView({ block: 'center' });
  await settle();
  for (let i = 0; i < 50 && !visible(document.querySelector('.chat-greeting')); i++) await sleep(100);
  const chat = { greeting: visible(document.querySelector('.chat-greeting')) };
  const field = document.querySelector('.chat-text');
  document.querySelector('.chat-chips button')?.click();
  await sleep(300);
  const tabs = [...document.querySelectorAll('.chat-step')];
  chat.answered = Boolean(tabs[0]?.querySelector('svg'));
  chat.step = tabs.findIndex((tab) => tab.getAttribute('aria-current') === 'step');
  chat.firstLines = field ? field.value.split('\\n').length : 0;
  // Правку руками React узнаёт по событию input; значение ставится родным сеттером поля.
  const MANUAL = 'Пилот — на одном складе';
  if (field) {
    Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set.call(field, field.value + '\\n' + MANUAL);
    field.dispatchEvent(new Event('input', { bubbles: true }));
  }
  await sleep(200);
  document.querySelector('.chat-chips button')?.click();
  await sleep(300);
  chat.value = field?.value ?? '';
  chat.kept = chat.value.endsWith(MANUAL);
  chat.lines = chat.value.split('\\n').length;
  const send = document.querySelector('.chat-send');
  const href = send?.getAttribute('href') ?? '';
  chat.sendText = href.includes('?') ? new URL(href).searchParams.get('text') : null;
  const sendBox = send?.getBoundingClientRect();
  const chatBox = document.querySelector('.chat')?.getBoundingClientRect();
  chat.sendInset = sendBox && chatBox ? Math.round(chatBox.right - sendBox.right) : NaN;
  chat.sendNarrow = Boolean(sendBox && chatBox && sendBox.width < chatBox.width - 64);
  // «Отправить» без ухода со страницы: переход отменяет слушатель на document до React,
  // а React показывает отправленную реплику и подсказку.
  document.addEventListener('click', (event) => event.preventDefault(), { capture: true, once: true });
  send?.click();
  await sleep(300);
  chat.own = document.querySelector('.chat-msg.is-own')?.textContent ?? '';
  chat.note = Boolean(document.querySelector('.chat-note'));
  result.chat = chat;
  // Порекомендовать (UC-9): без системного окна «Поделиться» список раскрывается и несёт
  // адрес сайта. Окно в headless Chrome непредсказуемо — его на время проверки нет.
  Object.defineProperty(navigator, 'share', { value: undefined, configurable: true });
  document.querySelector('.recommend summary')?.click();
  await sleep(200);
  const shareLink = document.querySelector('.recommend-list a[href*="t.me/share"]');
  result.recommend = {
    open: Boolean(document.querySelector('.recommend-menu')?.open),
    url: shareLink ? new URL(shareLink.href).searchParams.get('url') : null,
  };
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
  const last = String(expected.featured).padStart(2, '0');
  expect(t.count === `${last} / ${last}` && t.fill > 0.98, `в конце ленты счётчик «${t.count}», полоса ${t.fill.toFixed(2)}`);
  expect(screen.reduce ? a.progress === 0 : a.progress > 0.8, `полоса прогресса страницы у «Контакта»: ${a.progress.toFixed(2)}`);
  expect(a.videosIdle, 'видео начали качаться до просьбы посетителя');
  expect(a.videoPlays, 'по кнопке «Видео» ролик не заиграл за 5 с');
  expect(a.filter.pressed === 'true', `фильтр «Здоровье»: aria-pressed=${a.filter.pressed}`);
  expect(a.filter.shown === expected.health, `фильтр «Здоровье»: карточек ${a.filter.shown}, в данных ${expected.health}`);
  expect(a.filterAll === expected.work, `фильтр «Все»: карточек ${a.filterAll}, рабочих проектов в данных ${expected.work}`);
  expect(a.games === expected.games, `в секции игр карточек ${a.games}, игр в данных ${expected.games}`);
  expect(Math.abs(a.anchor.top - a.anchor.header) <= 8, `якорь «Контакт»: верх секции ${a.anchor.top}, шапка ${a.anchor.header}`);
  expect(a.contactShown, '«Контакт» не проявился за 5 с после перехода по якорю');
  expect(a.hiddenAbove === 0, `выше низа экрана не проявились блоки: ${a.hiddenAbove}`);
  const c = a.chat;
  expect(c.greeting, 'чат: приветствие не проявилось за 5 с, когда окно на экране');
  expect(c.answered && c.step === 1 && c.firstLines === 2, `чат: первая кнопка — строк в поле ${c.firstLines}, шаг ${c.step}`);
  expect(c.kept && c.lines === 4, `чат: правка руками не пережила кнопку второго шага («${c.value}»)`);
  expect(c.sendText === c.value.trim(), `чат: «Отправить» несёт «${c.sendText}», а в поле «${c.value}»`);
  expect(c.sendNarrow && c.sendInset >= 0 && c.sendInset <= 32, `чат: «Отправить» не у правого края окна или во всю ширину (отступ ${c.sendInset} px)`);
  expect(c.note && c.own === c.sendText, `чат: после «Отправить» нет подсказки или реплика не та («${c.own}»)`);
  expect(a.recommend.open && a.recommend.url === expected.site, `«Порекомендовать»: список ${a.recommend.open ? 'открыт' : 'не открылся'}, адрес ${a.recommend.url}`);
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
  // На десктопе колонка картинки избранного уже кадра: он держится левого верхнего угла,
  // где у скриншотов логотип и название, и режется только справа (Олег, 2026-10-27).
  if (screen.width >= 1024) {
    const off = m.featuredFocus.filter((position) => position !== '0% 0%');
    expect(m.featuredFocus.length > 0 && off.length === 0, `кадр избранного не у левого края: ${off.join(', ') || 'картинок нет'}`);
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
  const { CONTACTS } = await import('../src/data/contacts.ts');
  const expected = {
    work: projects.length - count('games'),
    games: count('games'),
    health: count('health'),
    featured: projects.filter((p) => p.tier === 'featured').length,
    site: CONTACTS.site,
  };
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
