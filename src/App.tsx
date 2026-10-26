import type { Locale } from '@/data/projects';

export default function App({ locale }: { locale: Locale }) {
  return (
    <main id="top" lang={locale}>
      <h1>Олег Барбашин</h1>
    </main>
  );
}
