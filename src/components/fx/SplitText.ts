/**
 * SplitText — из React Bits (reactbits.dev), © 2026 David Haz, MIT + Commons Clause:
 * условия в LICENSE рядом. Ядро прежнее — плагин GSAP SplitText и fromTo с шагом по
 * буквам. Что изменено (README.md рядом): компонент стал функцией, чтобы появление букв
 * встало в общий таймлайн hero; текст не прячется до загрузки шрифтов — его отдала
 * предсборка (Р-22), шрифты ждёт вызывающий код; эффекты, повторы и наведение убраны.
 */
import { gsap, SplitText } from '@/motion/gsap';

export interface SplitRevealOptions {
  from: gsap.TweenVars;
  to?: gsap.TweenVars;
  duration: number;
  ease: string;
  /** Шаг между буквами, секунды. */
  stagger: number;
}

/**
 * Режет элемент на буквы и возвращает появление букв — его кладут в таймлайн.
 * Буквы сразу встают в начальное положение (immediateRender). После анимации
 * вызывающий код делает split.revert(): разметка возвращается к предсобранной.
 */
export function splitReveal(el: HTMLElement, { from, to = { opacity: 1, yPercent: 0 }, duration, ease, stagger }: SplitRevealOptions) {
  const split = SplitText.create(el, {
    type: 'chars',
    smartWrap: true,
    charsClass: 'split-char',
    reduceWhiteSpace: false,
  });
  const tween = gsap.fromTo(
    split.chars,
    { ...from, willChange: 'transform, opacity' },
    { ...to, duration, ease, stagger, clearProps: 'willChange' },
  );
  return { split, tween };
}
