/**
 * Типограф для русских текстов (Р-10): неразрывный пробел после коротких слов, перед
 * тире и между сокращением и числом («ГОСТ 19»), неразрывный дефис в сокращениях вида
 * «ИИ‑систем». Заменяет символ символом,
 * поэтому длина строки не меняется — на этом держится разметка заголовка (src/lib/title.ts).
 * Повторный проход ничего не меняет.
 */
export const NBSP = ' ';
export const NB_HYPHEN = '‑';

// Союзы «а» и «но» добавлены 2026-10-26: в заголовке «…за дни, а не за год» «а» повисал в конце строки.
const SHORT_WORDS = ['в', 'и', 'с', 'к', 'о', 'у', 'а', 'но', 'на', 'по', 'за', 'до', 'не', 'от'];

const AFTER_SHORT_WORD = new RegExp(`(?<![\\p{L}\\p{N}])(${SHORT_WORDS.join('|')}) `, 'giu');
const BEFORE_DASH = / (?=[—–])/g;
const ABBREVIATION_HYPHEN = /(?<![\p{L}\p{N}])(\p{Lu}{2,5})-(?=[\p{L}\p{N}])/gu;
// Добавлено 2026-10-27: в описаниях проектов «по ГОСТ 19» номер мог уйти на следующую строку.
const ABBREVIATION_NUMBER = /(?<![\p{L}\p{N}])(\p{Lu}{2,5}) (?=\p{N})/gu;

/** Типограф для языка страницы: русскому тексту — правила Р-10, английский — как есть. */
export const typo = (text: string, locale: 'ru' | 'en') => (locale === 'ru' ? typograf(text) : text);

export function typograf(text: string): string {
  return text
    .replace(AFTER_SHORT_WORD, `$1${NBSP}`)
    .replace(BEFORE_DASH, NBSP)
    .replace(ABBREVIATION_HYPHEN, `$1${NB_HYPHEN}`)
    .replace(ABBREVIATION_NUMBER, `$1${NBSP}`);
}
