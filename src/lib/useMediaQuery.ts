import { useSyncExternalStore } from 'react';

/**
 * Совпадает ли медиазапрос. На сервере и при гидратации — false, как в предсобранном
 * HTML; сразу после гидратации React перечитывает настоящее значение без расхождения разметки.
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', onChange);
      return () => list.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
