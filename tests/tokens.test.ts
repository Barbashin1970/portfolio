import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { THEME_COLOR, type Theme } from '@/boot';

const css = readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8');

/** Переменные блока [data-theme='…'] из tokens.css. */
function themeTokens(theme: Theme): Record<string, string> {
  const block = new RegExp(`\\[data-theme='${theme}'\\]\\s*\\{([^}]*)\\}`).exec(css);
  if (!block) throw new Error(`В tokens.css нет блока темы ${theme}`);
  return Object.fromEntries([...block[1].matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map(([, name, value]) => [name, value.trim()]));
}

/** Относительная яркость по WCAG 2.x. */
function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Пары «текст — фон», которые встречаются в вёрстке. */
const PAIRS: [string, string][] = [
  ['--text', '--bg'],
  ['--text', '--surface'],
  ['--text-muted', '--bg'],
  ['--text-muted', '--surface'],
  ['--text-subtle', '--bg'],
  ['--text-subtle', '--surface'],
  ['--accent-2', '--bg'],
  ['--on-accent', '--accent'],
];

/** Пары крупного текста (WCAG 1.4.3: от 24 px или от 18,66 px жирным — порог 3): слово-акцент в H1. */
const LARGE_PAIRS: [string, string][] = [['--accent-ink', '--bg']];

it('формула контраста сходится с эталоном: белый на #FF6B35 — 2,84, провал AA (PLAN §3)', () => {
  expect(contrast('#FFFFFF', '#FF6B35')).toBeCloseTo(2.84, 2);
});

describe.each<Theme>(['dark', 'light'])('токены темы %s', (theme) => {
  const tokens = themeTokens(theme);

  it.each(PAIRS)('%s на %s — контраст AA, не ниже 4,5', (fg, bg) => {
    expect(contrast(tokens[fg], tokens[bg])).toBeGreaterThanOrEqual(4.5);
  });

  it.each(LARGE_PAIRS)('%s на %s — крупный текст, контраст AA не ниже 3', (fg, bg) => {
    expect(contrast(tokens[fg], tokens[bg])).toBeGreaterThanOrEqual(3);
  });

  it('заливка акцента — морковная #FF6B35, как в тёмной теме (Р-41)', () => {
    expect(tokens['--accent']?.toLowerCase()).toBe('#ff6b35');
  });

  it('цвет панели браузера совпадает с фоном темы', () => {
    expect(tokens['--bg']?.toLowerCase()).toBe(THEME_COLOR[theme].toLowerCase());
  });
});
