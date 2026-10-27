/**
 * Скриншоты публичных экранов демо для карточек (фаза 2): headless Chrome по протоколу
 * DevTools снимает каждый demoUrl из src/data/projects.ts сразу в WebP и кладёт
 * в public/media/<slug>.webp. Мобильные приложения (PHONE_FIRST в src/data/media.ts)
 * снимаются экраном телефона, остальные — десктопа. Код и закрытые экраны не снимаем:
 * только то, что видит любой посетитель по ссылке.
 *
 *   node scripts/capture-shots.mjs            — все демо
 *   node scripts/capture-shots.mjs sigma sima — только эти
 *
 * Node ≥ 22.18 читает .ts сам (снятие типов), поэтому данные берутся прямо из src.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { launchChrome } from './lib/chrome.mjs';

const { projects } = await import('../src/data/projects.ts');
const { PHONE_FIRST } = await import('../src/data/media.ts');

const SCREENS = {
  desktop: { width: 1280, height: 800, mobile: false, scale: 1, clipScale: 0.75 },
  phone: { width: 390, height: 844, mobile: true, scale: 1, clipScale: 1 },
};
/** Одностраничным приложениям и спящим серверам Railway и Streamlit нужно время. */
const SETTLE_MS = 6000;
const LOAD_TIMEOUT_MS = 45000;
const WAKE_TIMEOUT_MS = 150000;

const only = new Set(process.argv.slice(2));
const targets = projects.filter((p) => p.demoUrl && (only.size === 0 || only.has(p.slug)));
const outDir = fileURLToPath(new URL('../public/media/', import.meta.url));
mkdirSync(outDir, { recursive: true });

const chrome = await launchChrome();
const failed = [];
try {
  for (const project of targets) {
    const screen = SCREENS[PHONE_FIRST.has(project.slug) ? 'phone' : 'desktop'];
    const page = await chrome.openPage(screen);
    try {
      await page.goto(project.demoUrl);
      const loaded = await page.until("document.readyState === 'complete'", LOAD_TIMEOUT_MS);
      await new Promise((resolve) => setTimeout(resolve, SETTLE_MS));
      // Streamlit усыпляет приложение без посещений — так было у safety, снятого с витрины
      // 2026-10-27: будим и ждём, пока проснётся.
      if (await page.evaluate(String.raw`/gone to sleep/i.test(document.body?.innerText ?? '')`)) {
        console.log(`  ${project.slug}: приложение спит — бужу`);
        await page.evaluate(String.raw`[...document.querySelectorAll('button')].find((b) => /back up/i.test(b.textContent))?.click()`);
        await page.until(String.raw`!/gone to sleep|oven|waking/i.test(document.body?.innerText ?? '')`, WAKE_TIMEOUT_MS);
        await new Promise((resolve) => setTimeout(resolve, SETTLE_MS * 3));
      }
      const shot = await page.screenshot({
        format: 'webp',
        quality: 72,
        clip: { x: 0, y: 0, width: screen.width, height: screen.height, scale: screen.clipScale },
      });
      writeFileSync(`${outDir}${project.slug}.webp`, shot);
      const title = await page.evaluate('document.title');
      console.log(`${loaded ? '✓' : '…'} ${project.slug}: ${Math.round(shot.length / 1024)} КБ, «${title}»`);
    } catch (error) {
      failed.push(project.slug);
      console.error(`✗ ${project.slug}: ${error.message}`);
    } finally {
      await page.close();
    }
  }
} finally {
  await chrome.close();
}
if (failed.length) {
  console.error(`capture-shots: не сняты ${failed.join(', ')}`);
  process.exitCode = 1;
}
