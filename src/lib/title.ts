/**
 * Разметка заголовка hero (Р-22). Предсборка отдаёт H1 уже разбитым на группы слов:
 * на телефоне группы проявляются CSS-анимацией, и LCP не ждёт JavaScript; на десктопе
 * GSAP SplitText режет те же группы на буквы. React вставляет разметку строкой и не
 * владеет содержимым H1, поэтому SplitText меняет DOM без спора с реконсиляцией.
 *
 * Группа — кусок между обычными пробелами: неразрывные пробелы типографа держат
 * «за дни,» и «а не за год» вместе, и строка не рвётся там, где её склеил типограф.
 * Акцент может кончаться внутри группы: у «за дни,» запятая остаётся обычного цвета.
 */
import type { Locale } from '@/i18n/locale';
import { typograf } from './typograf';

export interface TitleSegment {
  text: string;
  /** Выделить акцентным цветом (одно место в заголовке, PLAN §3). */
  accent?: boolean;
}

export interface TitlePart {
  text: string;
  accent: boolean;
}

export interface TitleWord {
  parts: TitlePart[];
  index: number;
}

export function titleWords(segments: TitleSegment[], locale: Locale): TitleWord[] {
  const joined = segments.map((segment) => segment.text).join('');
  const accentAt = segments.flatMap((segment) => [...segment.text].map(() => Boolean(segment.accent)));
  // Типограф видит заголовок целиком и не меняет длину строки: акцент остаётся на своих символах.
  const typed = [...(locale === 'ru' ? typograf(joined) : joined)];

  const words: TitleWord[] = [];
  let parts: TitlePart[] = [];
  const close = () => {
    if (parts.length) words.push({ parts, index: words.length });
    parts = [];
  };
  typed.forEach((char, i) => {
    if (char === ' ') {
      close();
      return;
    }
    const last = parts.at(-1);
    if (last && last.accent === accentAt[i]) last.text += char;
    else parts.push({ text: char, accent: accentAt[i] });
  });
  close();
  return words;
}

const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Внутренняя разметка H1: группы через обычный пробел, у каждой — номер для задержки. */
export function titleHtml(words: TitleWord[]): string {
  return words
    .map((word) => {
      const inner = word.parts
        .map((part) => (part.accent ? `<span class="accent">${escapeHtml(part.text)}</span>` : escapeHtml(part.text)))
        .join('');
      return `<span class="w" style="--i:${word.index}">${inner}</span>`;
    })
    .join(' ');
}

/** Текст группы без разметки. */
export const wordText = (word: TitleWord) => word.parts.map((part) => part.text).join('');

/** Текст H1 без разметки — с ним сверяется предсборка (scripts/check-dist.mjs). */
export function titleText(words: TitleWord[]): string {
  return words.map(wordText).join(' ');
}
