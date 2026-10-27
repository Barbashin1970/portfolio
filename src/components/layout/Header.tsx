import { useI18n } from '@/i18n/context';
import { ThemeToggle } from './ThemeToggle';

/**
 * Шапка фиксированной высоты (--header-h в tokens.css). Переходы по ссылкам-якорям
 * перехватывает motion/anchors.ts: высота шапки замеряется, пин учитывается.
 * На телефоне из разделов — только «Контакт»: к работам ведёт кнопка первого экрана.
 */
export function Header() {
  const { dict } = useI18n();
  const t = dict.nav;
  return (
    <header className="glass fixed inset-x-0 top-0 z-50 h-(--header-h) border-x-0 border-t-0">
      <div className="container-page flex h-full items-center justify-between gap-4">
        <a href="#top" className="font-display text-[17px] font-semibold tracking-[-0.01em] text-text no-underline">
          {dict.header.name}
        </a>
        <div className="flex items-center gap-1">
          <nav aria-label={t.label} className="flex items-center gap-1">
            <a className="nav-link hidden md:inline-flex" href="#featured">
              {t.work}
            </a>
            <a className="nav-link hidden md:inline-flex" href="#catalog">
              {t.catalog}
            </a>
            <a className="nav-link" href="#contact">
              {t.contact}
            </a>
          </nav>
          <ThemeToggle label={dict.header.theme} />
        </div>
      </div>
    </header>
  );
}
