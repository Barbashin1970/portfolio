import { ScrollTrigger } from './gsap';
import { getLenis } from './lenis';
import { MEDIA } from './tokens';

/**
 * Переходы по якорям (урок accordion-scroll-lands-on-wrong-section). Отступ под шапку —
 * scroll-margin-top секции: это та же --header-h, которой задана высота самой шапки,
 * так что числа «на глаз» нет. Lenis 1.3 учитывает scroll-margin-top сам — отдельный
 * offset дал бы двойной отступ (замер: 128 px вместо 64 на 375×667).
 * Перед переходом позиции пересчитываются: пин избранного добавляет длину, а размеры
 * у Lenis могли устареть (замер: цель зажата в 19 558 px при длине страницы 21 355 на 320×568).
 */
export function scrollToSection(target: HTMLElement) {
  ScrollTrigger.refresh();
  const lenis = getLenis();
  if (lenis) {
    lenis.resize();
    lenis.scrollTo(target);
  } else {
    const calm = window.matchMedia(MEDIA.reduceMotion).matches;
    target.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' });
  }
  // Фокус — на цель: следующий Tab продолжит с неё, а не со ссылки в шапке.
  target.focus({ preventScroll: true });
}

/** Перехватывает щелчки по ссылкам вида #id; возвращает отписку. */
export function interceptAnchors(): () => void {
  const onClick = (event: MouseEvent) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = (event.target as Element | null)?.closest?.('a[href^="#"]');
    const id = decodeURIComponent(link?.getAttribute('href')?.slice(1) ?? '');
    const target = id ? document.getElementById(id) : null;
    if (!target) return;
    event.preventDefault();
    history.pushState(null, '', `#${id}`);
    scrollToSection(target);
  };
  document.addEventListener('click', onClick);
  return () => document.removeEventListener('click', onClick);
}
