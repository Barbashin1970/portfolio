import { Header } from '@/components/layout/Header';
import { getDict, type Locale } from '@/i18n';
import { I18nContext } from '@/i18n/context';
import { SmoothScroll } from '@/motion/SmoothScroll';
import { Hero } from '@/sections/Hero';

/** Первая версия — hero; карточки, каталог, контакт и футер — фаза 2 (PLAN §5). */
export default function App({ locale }: { locale: Locale }) {
  return (
    <I18nContext value={{ locale, dict: getDict(locale) }}>
      <SmoothScroll />
      <Header />
      <main>
        {/* Раздела работ ещё нет: «Смотреть работы» и «Листайте» вернутся с карточками (фаза 2). */}
        <Hero />
      </main>
    </I18nContext>
  );
}
