import { gsap, ScrollTrigger, useGSAP } from './gsap';
import { APPEAR, DUR, EASE, MEDIA, STAGGER } from './tokens';

/**
 * Общее мягкое появление блоков [data-reveal] (PLAN §2): opacity и сдвиг на 24 px, только
 * у того, что ниже первого экрана, — видимое сразу не прячется. При reduced-motion — ничего.
 */
export function Reveal() {
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(MEDIA.motion, () => {
      const below = gsap.utils
        .toArray<HTMLElement>('[data-reveal]')
        .filter((el) => el.getBoundingClientRect().top > window.innerHeight);
      gsap.set(below, { autoAlpha: APPEAR.opacity, y: APPEAR.y });
      ScrollTrigger.batch(below, {
        start: 'top 90%',
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, { autoAlpha: 1, y: 0, duration: DUR.base, ease: EASE.out, stagger: STAGGER.cards, overwrite: true }),
      });
    });
    return () => mm.revert();
  });
  return null;
}
