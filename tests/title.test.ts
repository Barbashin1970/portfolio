import { describe, expect, it } from 'vitest';
import { getDict } from '@/i18n';
import { titleHtml, titleText, titleWords, wordText } from '@/lib/title';
import { NBSP } from '@/lib/typograf';

describe('разметка заголовка hero (Р-22)', () => {
  const words = titleWords(getDict('ru').hero.title, 'ru');

  it('группы слов не рвут то, что склеил типограф', () => {
    expect(words.map(wordText)).toEqual(['Проверю', 'идею', 'продукта', `за${NBSP}дни,`, `а${NBSP}не${NBSP}за${NBSP}год`]);
  });

  it('акцент — только «за дни», запятая после него обычного цвета', () => {
    expect(words[3].parts).toEqual([
      { text: `за${NBSP}дни`, accent: true },
      { text: ',', accent: false },
    ]);
    expect(words.flatMap((w) => w.parts).filter((p) => p.accent)).toHaveLength(1);
  });

  it('разметка: группы через обычный пробел, у каждой номер для задержки', () => {
    const html = titleHtml(words);
    expect(html.startsWith('<span class="w" style="--i:0">Проверю</span> ')).toBe(true);
    expect(html).toContain(`<span class="w" style="--i:3"><span class="accent">за${NBSP}дни</span>,</span>`);
    expect(html.match(/class="w"/g)).toHaveLength(5);
  });

  it('текст без разметки совпадает с заголовком', () => {
    expect(titleText(words).replaceAll(NBSP, ' ')).toBe('Проверю идею продукта за дни, а не за год');
  });

  it('экранирует разметку в тексте', () => {
    expect(titleHtml(titleWords([{ text: 'a<b & "c"' }], 'en'))).toBe(
      '<span class="w" style="--i:0">a&lt;b</span> <span class="w" style="--i:1">&amp;</span> <span class="w" style="--i:2">&quot;c&quot;</span>',
    );
  });
});
