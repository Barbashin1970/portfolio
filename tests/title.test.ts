import { describe, expect, it } from 'vitest';
import { getDict } from '@/i18n';
import { titleHtml, titleText, titleWords } from '@/lib/title';
import { NBSP } from '@/lib/typograf';

describe('разметка заголовка hero (Р-22)', () => {
  const words = titleWords(getDict('ru').hero.title, 'ru');

  it('группы слов не рвут то, что склеил типограф', () => {
    expect(words.map((w) => w.text)).toEqual([
      `От${NBSP}идеи`,
      `до${NBSP}работающего`,
      `прототипа${NBSP}—`,
      'один',
      'промпт',
    ]);
  });

  it('акцент — только у «один промпт»', () => {
    expect(words.filter((w) => w.accent).map((w) => w.text)).toEqual(['один', 'промпт']);
  });

  it('разметка: группы через обычный пробел, у каждой номер для задержки', () => {
    const html = titleHtml(words);
    expect(html.startsWith('<span class="w" style="--i:0">От')).toBe(true);
    expect(html).toContain('<span class="w accent" style="--i:4">промпт</span>');
    expect(html.match(/<span /g)).toHaveLength(5);
  });

  it('текст без разметки совпадает с заголовком', () => {
    expect(titleText(words).replaceAll(NBSP, ' ')).toBe('От идеи до работающего прототипа — один промпт');
  });

  it('экранирует разметку в тексте', () => {
    expect(titleHtml(titleWords([{ text: 'a<b & "c"' }], 'en'))).toContain('a&lt;b</span> <span class="w" style="--i:1">&amp;');
  });

  it('отказывается резать слово на границе сегментов', () => {
    expect(() => titleWords([{ text: 'один' }, { text: 'промпт', accent: true }], 'ru')).toThrow(/на пробел/);
  });
});
