import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { getDict, type Locale } from '@/i18n';
import { I18nContext } from '@/i18n/context';
import { Reveal } from '@/motion/Reveal';
import { SmoothScroll } from '@/motion/SmoothScroll';
import { Catalog } from '@/sections/Catalog';
import { Contact } from '@/sections/Contact';
import { Featured } from '@/sections/Featured';
import { Hero } from '@/sections/Hero';

/** Первая версия (Р-15): hero, избранное, каталог по отраслям, контакт, футер. */
export default function App({ locale }: { locale: Locale }) {
  return (
    <I18nContext value={{ locale, dict: getDict(locale) }}>
      <SmoothScroll />
      <Reveal />
      <Header />
      <main>
        <Hero workHref="#featured" />
        <Featured />
        <Catalog />
        <Contact />
      </main>
      <Footer />
    </I18nContext>
  );
}
