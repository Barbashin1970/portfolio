/**
 * Единые числа движения: CLAUDE.md, договорённость 5; PLAN §3 «Движение».
 * Easing, длительности и шаги stagger берутся только отсюда — в компонентах чисел нет.
 * Модуль без DOM и без зависимостей: его читает и скрипт до отрисовки (src/boot.ts).
 */

/** Easing для GSAP. */
export const EASE = {
  /** появления */
  out: 'expo.out',
  /** переходы */
  inOut: 'power2.inOut',
  /** всё, что привязано к скроллу */
  scrub: 'none',
} as const;

/** Те же кривые для CSS — там, где анимация обходится без JavaScript (телефон). */
export const CSS_EASE = {
  /** expo.out */
  out: 'cubic-bezier(0.16, 1, 0.3, 1)',
  /** power2.inOut */
  inOut: 'cubic-bezier(0.45, 0, 0.55, 1)',
} as const;

/** Длительности, секунды. */
export const DUR = { fast: 0.3, base: 0.6, slow: 0.9, intro: 1.1 } as const;

/** Шаги stagger, секунды. */
export const STAGGER = { chars: 0.025, words: 0.06, cards: 0.08 } as const;

/** Общее мягкое появление блоков: фон системы, а не «сильный эффект». */
export const APPEAR = { opacity: 0, y: 24 } as const;

/** Буквы заголовка hero поднимаются на половину своей высоты. */
export const SPLIT_FROM = { opacity: 0, yPercent: 50 } as const;

/** Порядок интро hero, секунды от старта таймлайна. */
export const INTRO_AT = { eyebrow: 0, title: 0.1, lead: 0.55, actions: 0.7, hint: 1.2 } as const;

/** Lenis: колесо сглаживается, тач нативный. */
export const LENIS = { lerp: 0.1, smoothWheel: true, syncTouch: false } as const;

/** Magnet у кнопок hero: зона притяжения, сила, предел сдвига, пружина. */
export const MAGNET = {
  padding: 60,
  strength: 4,
  maxOffset: 14,
  spring: { stiffness: 170, damping: 16, mass: 1 },
} as const;

/**
 * Медиазапросы движения. Граница десктопа совпадает с `lg` Tailwind (64rem);
 * те же строки стоят в src/styles/globals.css — их сверяет tests/motion-tokens.test.ts.
 */
export const MEDIA = {
  desktop: '(min-width: 1024px)',
  reduceMotion: '(prefers-reduced-motion: reduce)',
  desktopMotion: '(min-width: 1024px) and (prefers-reduced-motion: no-preference)',
  phoneMotion: '(max-width: 1023.98px) and (prefers-reduced-motion: no-preference)',
} as const;

/** CSS-переменные движения: CSS-анимации берут числа отсюда же, а не пишут свои. */
export const MOTION_CSS_VARS = {
  '--ease-out': CSS_EASE.out,
  '--ease-in-out': CSS_EASE.inOut,
  '--dur-fast': `${DUR.fast}s`,
  '--dur-base': `${DUR.base}s`,
  '--dur-slow': `${DUR.slow}s`,
  '--stagger-words': `${STAGGER.words}s`,
  '--appear-y': `${APPEAR.y}px`,
} as const;
