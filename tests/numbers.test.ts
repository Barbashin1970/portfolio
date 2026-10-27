import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { projects } from '@/data/projects';
import { AUDIENCE_ORDER } from '@/lib/catalog';
import { plural } from '@/lib/plural';

/**
 * Сторож чисел: README, английский README и опись называют столько проектов и демо,
 * сколько их в src/data/projects.ts. Документ, разошедшийся с данными, роняет тесты.
 */
const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

const total = projects.length;
const demos = projects.filter((p) => p.demoUrl).length;

describe('склонение', () => {
  it.each([
    [1, 'проект'],
    [2, 'проекта'],
    [5, 'проектов'],
    [11, 'проектов'],
    [21, 'проект'],
    [24, 'проекта'],
    [31, 'проект'],
    [112, 'проектов'],
  ])('%i %s', (n, word) => {
    expect(plural(n, ['проект', 'проекта', 'проектов'])).toBe(word);
  });
});

describe('числа в документах сходятся с src/data/projects.ts', () => {
  it('README.md', () => {
    const text = read('README.md');
    expect(text).toContain(`Всего на витрине ${total} ${plural(total, ['проект', 'проекта', 'проектов'])}`);
    expect(text).toContain(`у ${demos} есть живое демо`);
  });

  it('README-en.md', () => {
    const text = read('README-en.md');
    expect(text).toContain(`holds ${total} projects`);
    expect(text).toContain(`${demos} of them with a live demo`);
  });

  it('docs/INVENTORY.md', () => {
    const text = read('docs/INVENTORY.md');
    const games = projects.filter((p) => p.audience === 'games').length;
    const work = total - games;
    expect(text).toContain(`| Проектов на витрине | ${total}:`);
    expect(text).toContain(`в каталоге ${work} ${plural(work, ['рабочий проект', 'рабочих проекта', 'рабочих проектов'])}`);
    expect(text).toContain(`${games} ${plural(games, ['игра', 'игры', 'игр'])} — своей секцией`);
    expect(text).toContain(`живое демо у ${demos}`);
  });

  it('отраслей в каталоге — шесть, как написано в README; игры — отдельно (Р-33)', () => {
    expect(AUDIENCE_ORDER).toHaveLength(6);
    expect(read('README.md')).toContain('в шести отраслях');
  });
});
