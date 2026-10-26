import { describe, expect, it } from 'vitest';
import { bootScript, THEME_COLOR, THEME_KEY } from '@/boot';
import { MEDIA } from '@/motion/tokens';

/** Исполняет скрипт до отрисовки на поддельном документе и возвращает, что он сделал. */
function runBoot({ stored, desktopMotion }: { stored: string | null; desktopMotion: boolean }) {
  const classes = new Set<string>();
  const appended: { name: string; content: string }[] = [];
  const queries: string[] = [];
  const documentElement = { dataset: {} as Record<string, string>, classList: { add: (c: string) => classes.add(c) } };
  const document = {
    documentElement,
    head: { appendChild: (m: { name: string; content: string }) => appended.push(m) },
    createElement: () => ({ name: '', content: '' }),
  };
  const localStorage = { getItem: (key: string) => (key === THEME_KEY ? stored : null) };
  const matchMedia = (query: string) => {
    queries.push(query);
    return { matches: desktopMotion };
  };
  const window = { matchMedia };
  new Function('document', 'localStorage', 'matchMedia', 'window', bootScript)(
    document,
    localStorage,
    matchMedia,
    window,
  );
  return { theme: documentElement.dataset.theme, classes, appended, queries };
}

describe('скрипт до отрисовки', () => {
  it('ставит тёмную тему, если выбора нет', () => {
    const r = runBoot({ stored: null, desktopMotion: false });
    expect(r.theme).toBe('dark');
    expect(r.appended).toEqual([{ name: 'theme-color', content: THEME_COLOR.dark }]);
  });

  it('восстанавливает выбранную светлую тему и цвет панели', () => {
    const r = runBoot({ stored: 'light', desktopMotion: false });
    expect(r.theme).toBe('light');
    expect(r.appended[0]?.content).toBe(THEME_COLOR.light);
  });

  it('не верит мусору в хранилище', () => {
    expect(runBoot({ stored: 'sepia', desktopMotion: false }).theme).toBe('dark');
  });

  it('ставит класс intro только на десктопе без reduced-motion', () => {
    expect(runBoot({ stored: null, desktopMotion: true }).classes.has('intro')).toBe(true);
    const phone = runBoot({ stored: null, desktopMotion: false });
    expect(phone.classes.has('intro')).toBe(false);
    expect(phone.queries).toEqual([MEDIA.desktopMotion]);
  });
});
