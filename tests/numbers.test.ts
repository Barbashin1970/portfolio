import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { AUDIENCES, projects } from '@/data/projects';
import { plural } from '@/lib/plural';

/**
 * Сторож чисел: README, английский README и опись называют столько проектов и демо,
 * сколько их в src/data/projects.ts. Документ, разошедшийся с данными, роняет тесты.
 */
const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

const total = projects.length;
const demos = projects.filter((p) => p.demoUrl).length;
const audiences = Object.keys(AUDIENCES).length;

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
    expect(text).toContain(`| Проектов на витрине | ${total}:`);
    expect(text).toContain(`живое демо у ${demos}`);
  });

  it('отраслей в каталоге — семь, как написано в README', () => {
    expect(audiences).toBe(7);
    expect(read('README.md')).toContain('в семи отраслях');
  });
});
