import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import App from './App';
import type { Locale } from '@/data/projects';

/** Предсборка: scripts/prerender.mjs вставляет результат в dist/client/index.html. */
export function render(locale: Locale) {
  const html = renderToString(
    <StrictMode>
      <App locale={locale} />
    </StrictMode>,
  );
  return { html };
}
