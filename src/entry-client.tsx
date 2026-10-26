import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App';
import type { Locale } from '@/i18n';
import './styles/globals.css';

declare global {
  interface Window {
    /** Ошибки гидратации: их читает check-layout, расхождений быть не должно. */
    __hydrationErrors?: string[];
  }
}

const container = document.getElementById('root');
if (!container) throw new Error('Нет #root в index.html');

const locale: Locale = document.documentElement.lang === 'en' ? 'en' : 'ru';
const app = (
  <StrictMode>
    <App locale={locale} />
  </StrictMode>
);

// Страница из предсборки гидратируется; в dev корень пуст — обычный рендер.
if (container.firstElementChild) {
  hydrateRoot(container, app, {
    onRecoverableError(error) {
      (window.__hydrationErrors ??= []).push(String(error));
      console.error(error);
    },
  });
} else {
  createRoot(container).render(app);
}
