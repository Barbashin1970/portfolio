import { gsap, ScrollTrigger, SplitText, useGSAP } from './gsap';
import { DUR, EASE, MEDIA, STAGGER, TITLE_LINES } from './tokens';

/**
 * Заголовки секций поднимаются по строкам из-под маски (Р-51) — поверх общего появления блока.
 * Исключение из «одного сильного эффекта на секцию»: его разрешил Олег 2026-10-27, «это красиво».
 * Строки режутся по настоящему шрифту и только у заголовков ниже первого экрана; при смене
 * ширины SplitText режет заново (autoSplit) и пересобирает анимацию. При reduced-motion — ничего.
 */
export function TitleReveal() {
  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(MEDIA.motion, (_context, contextSafe) => {
      if (!contextSafe) return undefined;
      let alive = true;
      const splits: SplitText[] = [];
      const split = contextSafe(() => {
        if (!alive) return;
        const titles = gsap.utils
          .toArray<HTMLElement>('.section-title')
          .filter((title) => title.getBoundingClientRect().top > window.innerHeight);
        for (const title of titles) {
          splits.push(
            SplitText.create(title, {
              type: 'lines',
              mask: 'lines',
              linesClass: 'title-line',
              autoSplit: true,
              onSplit: (self) =>
                gsap.from(self.lines, {
                  yPercent: TITLE_LINES.yPercent,
                  duration: DUR.slow,
                  ease: EASE.out,
                  stagger: STAGGER.cards,
                  scrollTrigger: { trigger: title, start: TITLE_LINES.start, once: true },
                }),
            }),
          );
        }
        ScrollTrigger.refresh();
      });
      void document.fonts.ready.then(() => split());
      return () => {
        alive = false;
        splits.forEach((s) => s.revert());
      };
    });
    return () => mm.revert();
  });
  return null;
}
