import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import App from './App';
import { getDict, type Locale } from '@/i18n';
import { titleText, titleWords } from '@/lib/title';

const escapeText = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const escapeAttr = (text: string) => escapeText(text).replace(/"/g, '&quot;');

/** Предсборка: scripts/prerender.mjs вставляет разметку и <head> в dist/client/index.html. */
export function render(locale: Locale) {
  const { meta } = getDict(locale);
  const html = renderToString(
    <StrictMode>
      <App locale={locale} />
    </StrictMode>,
  );
  const head = [
    `<title>${escapeText(meta.title)}</title>`,
    `<meta name="description" content="${escapeAttr(meta.description)}" />`,
  ].join('\n    ');
  return { html, head };
}

/** Что обязано оказаться в HTML страницы — с этим сверяет scripts/check-dist.mjs. */
export function pageFacts(locale: Locale) {
  const dict = getDict(locale);
  return {
    lang: locale,
    title: dict.meta.title,
    description: dict.meta.description,
    h1: titleText(titleWords(dict.hero.title, locale)),
    lead: dict.hero.lead,
  };
}
