import { useEffect } from 'react';
import Lenis from 'lenis';
import { interceptAnchors } from './anchors';
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
    // Якоря — с поправкой на шапку и пин; работают и без Lenis.
    const releaseAnchors = interceptAnchors();

    if (!shouldSmoothScroll((query) => window.matchMedia(query))) {
      return () => {
        cancelled = true;
        releaseAnchors();
      };
    }

    const lenis = new Lenis({ ...LENIS, autoRaf: false });
    const unsync = syncLenisWithGsap(lenis, gsap.ticker, ScrollTrigger.update);
    // Вёрстка поменялась (шрифты, фильтр, пин) — Lenis пересчитывает длину вместе с ScrollTrigger.
    const resize = () => lenis.resize();
    ScrollTrigger.addEventListener('refresh', resize);
    setLenis(lenis);
    return () => {
      cancelled = true;
      releaseAnchors();
      ScrollTrigger.removeEventListener('refresh', resize);
      unsync();
      setLenis(null);
      lenis.destroy();
    };
  }, []);

  return null;
}
