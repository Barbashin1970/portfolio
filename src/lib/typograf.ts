/**
 * Типограф для русских текстов (Р-10): неразрывный пробел после коротких слов и перед
 * тире, неразрывный дефис в сокращениях вида «ИИ‑систем». Заменяет символ символом,
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

export function typograf(text: string): string {
  return text
    .replace(AFTER_SHORT_WORD, `$1${NBSP}`)
    .replace(BEFORE_DASH, NBSP)
    .replace(ABBREVIATION_HYPHEN, `$1${NB_HYPHEN}`);
}
