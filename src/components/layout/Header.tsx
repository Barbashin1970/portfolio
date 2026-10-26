import { useI18n } from '@/i18n/context';
import { ThemeToggle } from './ThemeToggle';

/**
 * Шапка фиксированной высоты: она берётся из --header-h (tokens.css), тем же числом
 * hero отступает сверху. Переходы по якорям с замером шапки — фаза 2.
 */
export function Header() {
  const { dict } = useI18n();
  return (
    <header className="glass fixed inset-x-0 top-0 z-50 h-(--header-h) border-x-0 border-t-0">
      <div className="container-page flex h-full items-center justify-between gap-4">
        <a href="#top" className="font-display text-[17px] font-semibold tracking-[-0.01em] text-text no-underline">
          {dict.header.name}
        </a>
        <ThemeToggle label={dict.header.theme} />
      </div>
    </header>
  );
}
