/**
 * Разметка заголовка hero (Р-22). Предсборка отдаёт H1 уже разбитым на группы слов:
 * на телефоне группы проявляются CSS-анимацией, и LCP не ждёт JavaScript; на десктопе
 * GSAP SplitText режет те же группы на буквы. React вставляет разметку строкой и не
 * владеет содержимым H1, поэтому SplitText меняет DOM без спора с реконсиляцией.
 *
 * Группа — кусок между обычными пробелами: неразрывные пробелы типографа держат
 * «до работающего» вместе, и строка не рвётся там, где её склеил типограф.
 */
import type { Locale } from '@/i18n/locale';
import { typograf } from './typograf';

export interface TitleSegment {
  text: string;
  /** Выделить акцентным цветом (одно место в заголовке, PLAN §3). */
  accent?: boolean;
}

export interface TitleWord {
  text: string;
  accent: boolean;
  index: number;
}

export function titleWords(segments: TitleSegment[], locale: Locale): TitleWord[] {
  segments.forEach((segment, i) => {
    const previous = segments[i - 1];
    if (previous && !previous.text.endsWith(' ') && !segment.text.startsWith(' ')) {
      throw new Error(`Граница сегментов заголовка должна приходиться на пробел: «${previous.text}|${segment.text}»`);
    }
  });

  const joined = segments.map((segment) => segment.text).join('');
  // Типограф видит заголовок целиком (тире на стыке сегментов) и не меняет длину строки.
  const typed = locale === 'ru' ? typograf(joined) : joined;
  const words: TitleWord[] = [];
  let offset = 0;
  for (const segment of segments) {
    const part = typed.slice(offset, offset + segment.text.length);
    offset += segment.text.length;
    for (const text of part.split(' ')) {
      if (text) words.push({ text, accent: Boolean(segment.accent), index: words.length });
    }
  }
  return words;
}

const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Внутренняя разметка H1: группы через обычный пробел, у каждой — номер для задержки. */
export function titleHtml(words: TitleWord[]): string {
  return words
    .map((word) => `<span class="w${word.accent ? ' accent' : ''}" style="--i:${word.index}">${escapeHtml(word.text)}</span>`)
    .join(' ');
}

/** Текст H1 без разметки — с ним сверяется предсборка (scripts/check-dist.mjs). */
export function titleText(words: TitleWord[]): string {
  return words.map((word) => word.text).join(' ');
}
