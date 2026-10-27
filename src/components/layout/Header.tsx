import { useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useI18n } from '@/i18n/context';
import { gsap, useGSAP } from '@/motion/gsap';
import { EASE, MEDIA } from '@/motion/tokens';
import { ThemeToggle } from './ThemeToggle';

/** Разделы страницы — в шапке на десктопе и в меню телефона. */
const SECTIONS = [
  { href: '#featured', key: 'work' },
  { href: '#catalog', key: 'catalog' },
  { href: '#games', key: 'games' },
  { href: '#contact', key: 'contact' },
] as const;

/**
 * Шапка фиксированной высоты (--header-h в tokens.css). Переходы по ссылкам-якорям
 * перехватывает motion/anchors.ts: высота шапки замеряется, пин учитывается.
 * На телефоне разделы — в меню-бургере (Р-47): это <details>, оно раскрывается и без
 * JavaScript, а скрипт закрывает его выбором пункта, Escape и щелчком мимо.
 * По низу шапки — полоса прогресса страницы, привязанная к скроллу (Р-44): страница длинная,
 * а так видно, сколько осталось. При reduced-motion полосы нет.
 */
export function Header() {
  const { dict } = useI18n();
  const t = dict.nav;
  const bar = useRef<HTMLSpanElement>(null);
  const menu = useRef<HTMLDetailsElement>(null);
  const [open, setOpen] = useState(false);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(MEDIA.motion, () => {
      gsap.fromTo(bar.current, { scaleX: 0 }, { scaleX: 1, ease: EASE.scrub, scrollTrigger: { start: 0, end: 'max', scrub: true } });
    });
    return () => mm.revert();
  });

  useEffect(() => {
    const details = menu.current;
    if (!open || !details) return undefined;
    const close = (focus: boolean) => {
      details.open = false;
      if (focus) details.querySelector('summary')?.focus();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close(true);
    };
    const onPointer = (event: PointerEvent) => {
      if (!details.contains(event.target as Node)) close(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [open]);

  return (
    <header className="glass fixed inset-x-0 top-0 z-50 h-(--header-h) border-x-0 border-t-0">
      <div className="container-page flex h-full items-center justify-between gap-4">
        <a href="#top" className="font-display text-[17px] font-semibold tracking-[-0.01em] text-text no-underline">
          {dict.header.name}
        </a>
        <div className="flex items-center gap-1">
          <nav aria-label={t.label} className="nav-desktop hidden items-center gap-1 md:flex">
            {SECTIONS.map(({ href, key }) => (
              <a key={href} className="nav-link" href={href}>
                {t[key]}
              </a>
            ))}
          </nav>
          <details ref={menu} className="nav-menu md:hidden" onToggle={(event) => setOpen(event.currentTarget.open)}>
            <summary className="nav-burger" aria-label={t.menu}>
              {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            </summary>
            <nav aria-label={t.label}>
              <ul className="nav-menu-list">
                {SECTIONS.map(({ href, key }) => (
                  <li key={href}>
                    <a
                      href={href}
                      onClick={() => {
                        if (menu.current) menu.current.open = false;
                      }}
                    >
                      {t[key]}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </details>
          <ThemeToggle label={dict.header.theme} />
        </div>
      </div>
      <span ref={bar} className="scroll-progress" aria-hidden="true" />
    </header>
  );
}
