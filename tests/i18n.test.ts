import { describe, expect, it } from 'vitest';
import { en } from '@/i18n/en';
import { ru } from '@/i18n/ru';

/** Пути всех строк словаря: «hero.title.1.text». */
function leaves(value: unknown, path = ''): [string, string][] {
  if (typeof value === 'string') return [[path, value]];
  if (Array.isArray(value)) return value.flatMap((item, i) => leaves(item, `${path}.${i}`));
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, item]) => leaves(item, path ? `${path}.${key}` : key));
  }
  return [];
}

describe('словари RU и EN', () => {
  it('у EN те же ключи, что у RU', () => {
    expect(leaves(en).map(([path]) => path)).toEqual(leaves(ru).map(([path]) => path));
  });

  it('пустых строк нет', () => {
    for (const [path, text] of [...leaves(ru), ...leaves(en)]) expect(text.trim(), path).not.toBe('');
  });

  it('в EN нет кириллицы (UC-5)', () => {
    for (const [path, text] of leaves(en)) expect(text, path).not.toMatch(/[А-Яа-яЁё]/);
  });
});
