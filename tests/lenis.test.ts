import { describe, expect, it, vi } from 'vitest';
import { shouldSmoothScroll, syncLenisWithGsap } from '@/motion/lenis';
import { MEDIA } from '@/motion/tokens';

function fakes() {
  const unsubscribe = vi.fn();
  const lenis = { on: vi.fn(() => unsubscribe), raf: vi.fn() };
  const ticker = { add: vi.fn(), remove: vi.fn(), lagSmoothing: vi.fn() };
  const update = vi.fn();
  return { lenis, ticker, update, unsubscribe };
}

describe('связка Lenis ↔ GSAP по брифу', () => {
  it('ScrollTrigger.update подписан на прокрутку Lenis', () => {
    const { lenis, ticker, update } = fakes();
    syncLenisWithGsap(lenis as never, ticker, update);
    expect(lenis.on).toHaveBeenCalledWith('scroll', update);
  });

  it('кадры Lenis идут от тикера GSAP, секунды переводятся в миллисекунды', () => {
    const { lenis, ticker, update } = fakes();
    syncLenisWithGsap(lenis as never, ticker, update);
    expect(ticker.add).toHaveBeenCalledTimes(1);
    const tick = ticker.add.mock.calls[0][0] as (time: number) => void;
    tick(1.5);
    expect(lenis.raf).toHaveBeenCalledWith(1500);
  });

  it('сглаживание задержек тикера выключено', () => {
    const { lenis, ticker, update } = fakes();
    syncLenisWithGsap(lenis as never, ticker, update);
    expect(ticker.lagSmoothing).toHaveBeenCalledWith(0);
  });

  it('отвязка снимает тот же обработчик, отписывает прокрутку и возвращает сглаживание', () => {
    const { lenis, ticker, update, unsubscribe } = fakes();
    const unsync = syncLenisWithGsap(lenis as never, ticker, update);
    const tick = ticker.add.mock.calls[0][0];
    unsync();
    expect(ticker.remove).toHaveBeenCalledWith(tick);
    expect(unsubscribe).toHaveBeenCalledTimes(1);
    expect(ticker.lagSmoothing).toHaveBeenLastCalledWith(500, 33);
  });
});

describe('reduced-motion', () => {
  it('при prefers-reduced-motion Lenis не создаётся', () => {
    const asked: string[] = [];
    const reduce = (query: string) => {
      asked.push(query);
      return { matches: query === MEDIA.reduceMotion };
    };
    expect(shouldSmoothScroll(reduce)).toBe(false);
    expect(asked).toEqual([MEDIA.reduceMotion]);
    expect(shouldSmoothScroll(() => ({ matches: false }))).toBe(true);
  });
});
