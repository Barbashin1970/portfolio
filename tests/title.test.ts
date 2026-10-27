import { describe, expect, it } from 'vitest';
import { getDict } from '@/i18n';
import { titleHtml, titleText, titleWords, wordText } from '@/lib/title';
import { NBSP } from '@/lib/typograf';

describe('разметка заголовка hero (Р-22)', () => {
  const words = titleWords(getDict('ru').hero.title, 'ru');

  it('группы слов не рвут то, что склеил типограф', () => {
    expect(words.map(wordText)).toEqual(['ИИ,', 'который', 'работает', `на${NBSP}вашу`, 'команду']);
  });

  it('акцент — только «на вашу команду» (Р-39)', () => {
    const accented = words.flatMap((w) => w.parts).filter((p) => p.accent).map((p) => p.text);
    expect(accented).toEqual([`на${NBSP}вашу`, 'команду']);
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
    expect(html.startsWith('<span class="w" style="--i:0">ИИ,</span> ')).toBe(true);
    expect(html).toContain(`<span class="w" style="--i:4"><span class="accent">команду</span></span>`);
    expect(html.match(/class="w"/g)).toHaveLength(5);
  });

  it('текст без разметки совпадает с заголовком', () => {
    expect(titleText(words).replaceAll(NBSP, ' ')).toBe('ИИ, который работает на вашу команду');
  });

  it('экранирует разметку в тексте', () => {
    expect(titleHtml(titleWords([{ text: 'a<b & "c"' }], 'en'))).toBe(
      '<span class="w" style="--i:0">a&lt;b</span> <span class="w" style="--i:1">&amp;</span> <span class="w" style="--i:2">&quot;c&quot;</span>',
    );
  });
});
