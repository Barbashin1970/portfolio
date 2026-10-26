import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { MEDIA, MOTION_CSS_VARS } from '@/motion/tokens';

const dir = new URL('../src/styles/', import.meta.url);
const css = readdirSync(dir)
  .filter((name) => name.endsWith('.css'))
  .map((name) => ({ name, text: readFileSync(new URL(name, dir), 'utf8') }));

describe('CSS говорит теми же числами, что motion/tokens.ts', () => {
  it('каждый медиазапрос с границей десктопа — из MEDIA', () => {
    const known: string[] = Object.values(MEDIA);
    for (const { name, text } of css) {
      for (const [, query] of text.matchAll(/@media\s+([^{]+)\{/g)) {
        const q = query.trim();
        if (/1024px|1023\.98px/.test(q)) expect(known, `${name}: ${q}`).toContain(q);
      }
    }
  });

  it('каждая переменная движения, которую читает CSS, определена в MOTION_CSS_VARS', () => {
    // Неопределённая переменная молча обнуляет длительность или задержку анимации.
    const defined = Object.keys(MOTION_CSS_VARS);
    for (const { name, text } of css) {
      for (const [, variable] of text.matchAll(/var\((--(?:dur|ease|stagger|at|appear|intro)-[\w-]+)/g)) {
        expect(defined, `${name}: ${variable}`).toContain(variable);
      }
    }
  });
});
