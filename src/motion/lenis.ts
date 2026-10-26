import type Lenis from 'lenis';
import { MEDIA } from './tokens';

type LenisLike = Pick<Lenis, 'on' | 'raf'>;

interface TickerLike {
  add(callback: (time: number) => void): unknown;
  remove(callback: (time: number) => void): unknown;
  lagSmoothing(threshold: number | boolean, adjustedLag?: number): void;
}

/** Сглаживание GSAP по умолчанию — его возвращает отвязка. */
const DEFAULT_LAG = { threshold: 500, adjusted: 33 } as const;

/**
 * Связка Lenis ↔ GSAP ровно по брифу (CLAUDE.md, договорённость 8):
 * `lenis.on('scroll', ScrollTrigger.update)`, `gsap.ticker.add((t) => lenis.raf(t * 1000))`,
 * `gsap.ticker.lagSmoothing(0)`. Собственный цикл Lenis выключен (`autoRaf: false`) —
 * второго источника кадров нет. Возвращает отвязку.
 */
export function syncLenisWithGsap(lenis: LenisLike, ticker: TickerLike, update: () => void) {
  const unsubscribe = lenis.on('scroll', update);
  const raf = (time: number) => lenis.raf(time * 1000);
  ticker.add(raf);
  ticker.lagSmoothing(0);
  return () => {
    ticker.remove(raf);
    unsubscribe();
    ticker.lagSmoothing(DEFAULT_LAG.threshold, DEFAULT_LAG.adjusted);
  };
}

/** При reduced-motion Lenis не создаётся (договорённость 6, UC-6). */
export function shouldSmoothScroll(matchMedia: (query: string) => { matches: boolean }) {
  return !matchMedia(MEDIA.reduceMotion).matches;
}

let current: Lenis | null = null;

/** Текущий Lenis — для переходов по якорям (фаза 2); null, если сглаживания нет. */
export function getLenis() {
  return current;
}

export function setLenis(lenis: Lenis | null) {
  current = lenis;
}
