import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from './gsap';
import { setLenis, shouldSmoothScroll, syncLenisWithGsap } from './lenis';
import { LENIS } from './tokens';

/**
 * Плавная прокрутка: Lenis — единственное сглаживание (договорённость 8).
 * Колесо сглаживается, тач остаётся нативным; при reduced-motion Lenis не создаётся.
 * После загрузки шрифтов вёрстка сдвигается — ScrollTrigger пересчитывает позиции.
 */
export function SmoothScroll() {
  useEffect(() => {
    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) ScrollTrigger.refresh();
    });

    if (!shouldSmoothScroll((query) => window.matchMedia(query))) {
      return () => {
        cancelled = true;
      };
    }

    const lenis = new Lenis({ ...LENIS, autoRaf: false });
    const unsync = syncLenisWithGsap(lenis, gsap.ticker, ScrollTrigger.update);
    setLenis(lenis);
    return () => {
      cancelled = true;
      unsync();
      setLenis(null);
      lenis.destroy();
    };
  }, []);

  return null;
}
