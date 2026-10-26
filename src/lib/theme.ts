import { useSyncExternalStore } from 'react';
import { THEME_COLOR, THEME_KEY, type Theme } from '@/boot';
import { MEDIA } from '@/motion/tokens';

const listeners = new Set<() => void>();

function readTheme(): Theme {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[theme]);
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Хранилище закрыто (приватный режим) — тема живёт до перезагрузки.
  }
  listeners.forEach((listener) => listener());
}

/** Смена темы; где браузер умеет View Transitions и движение не выключено — с затуханием. */
export function setTheme(theme: Theme) {
  const calm = window.matchMedia(MEDIA.reduceMotion).matches;
  if (!calm && document.startViewTransition) document.startViewTransition(() => applyTheme(theme));
  else applyTheme(theme);
}

/**
 * Текущая тема. На сервере и при гидратации — тёмная, как в предсобранном HTML;
 * сразу после гидратации React перечитывает настоящую, расхождения разметки нет.
 */
export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, readTheme, () => 'dark');
}
