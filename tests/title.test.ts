import { describe, expect, it } from 'vitest';
import { getDict } from '@/i18n';
import { titleHtml, titleText, titleWords, wordText } from '@/lib/title';
import { NBSP } from '@/lib/typograf';

describe('разметка заголовка hero (Р-22)', () => {
  const words = titleWords(getDict('ru').hero.title, 'ru');

  it('группы слов не рвут то, что склеил типограф', () => {
    expect(words.map(wordText)).toEqual(['Задача', 'есть,', `но${NBSP}видите`, 'риски?', 'Начнём', `с${NBSP}проверки`]);
  });

  it('акцент — только «Начнём с проверки»', () => {
    const accented = words.flatMap((w) => w.parts).filter((p) => p.accent).map((p) => p.text);
    expect(accented).toEqual(['Начнём', `с${NBSP}проверки`]);
  });

  it('акцент может кончаться внутри группы: знак препинания остаётся обычного цвета', () => {
    const custom = titleWords([{ text: 'Проверю ' }, { text: 'за дни', accent: true }, { text: ', а не за год' }], 'ru');
    expect(custom[1].parts).toEqual([
      { text: `за${NBSP}дни`, accent: true },
      { text: ',', accent: false },
    ]);
  });

  it('разметка: группы через обычный пробел, у каждой номер для задержки', () => {
    const html = titleHtml(words);
    expect(html.startsWith('<span class="w" style="--i:0">Задача</span> ')).toBe(true);
    expect(html).toContain(`<span class="w" style="--i:5"><span class="accent">с${NBSP}проверки</span></span>`);
    expect(html.match(/class="w"/g)).toHaveLength(6);
  });

  it('текст без разметки совпадает с заголовком', () => {
    expect(titleText(words).replaceAll(NBSP, ' ')).toBe('Задача есть, но видите риски? Начнём с проверки');
  });

  it('экранирует разметку в тексте', () => {
    expect(titleHtml(titleWords([{ text: 'a<b & "c"' }], 'en'))).toBe(
      '<span class="w" style="--i:0">a&lt;b</span> <span class="w" style="--i:1">&amp;</span> <span class="w" style="--i:2">&quot;c&quot;</span>',
    );
  });
});
