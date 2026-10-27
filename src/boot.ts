/**
 * Скрипт до отрисовки. Vite-плагин (vite.config.ts) вставляет его первым в <head> —
 * одинаково в dev и в сборке. Модуль без DOM: его читает и конфиг Vite.
 *
 * 1. Тема из localStorage — у того, кто выбрал светлую, тёмная не мигает.
 * 2. Цвет панели браузера — по теме.
 * 3. Класс `intro` — на десктопе без reduced-motion: элементы интро ждут таймлайна GSAP,
 *    а если JavaScript не пришёл, CSS проявляет их сам (globals.css, `intro-fallback`).
 */
import { MEDIA, MOTION_CSS_VARS } from './motion/tokens.ts';

export type Theme = 'dark' | 'light';

export const THEME_KEY = 'theme';

/** Совпадает с --bg тем в tokens.css — сверяет tests/tokens.test.ts. */
export const THEME_COLOR: Record<Theme, string> = { dark: '#0B0C0F', light: '#F6F5F2' };

const json = JSON.stringify;

export const bootScript = [
  '(()=>{const d=document.documentElement;let t="dark";',
  `try{const s=localStorage.getItem(${json(THEME_KEY)});if(s==="light"||s==="dark")t=s}catch(e){}`,
  'd.dataset.theme=t;',
  'const m=document.createElement("meta");m.name="theme-color";',
  `m.content=t==="light"?${json(THEME_COLOR.light)}:${json(THEME_COLOR.dark)};`,
  'document.head.appendChild(m);',
  `if(window.matchMedia&&matchMedia(${json(MEDIA.desktopMotion)}).matches)d.classList.add("intro")})()`,
].join('');

/** Переменные движения для CSS — статичным стилем, чтобы CSS-анимации не ждали JavaScript. */
export const motionStyle = `:root{${Object.entries(MOTION_CSS_VARS)
  .map(([name, value]) => `${name}:${value}`)
  .join(';')}}`;

/** Что встаёт в <head> на место метки <!--boot-->. */
export const bootHead = `<style>${motionStyle}</style><script>${bootScript}</script>`;
