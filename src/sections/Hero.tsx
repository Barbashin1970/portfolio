import { useRef, useState, type CSSProperties } from 'react';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import Magnet from '@/components/fx/Magnet';
import { splitReveal } from '@/components/fx/SplitText';
import { Button } from '@/components/ui/button';
import { CONTACTS } from '@/data/contacts';
import { useI18n } from '@/i18n/context';
import { titleHtml, titleWords } from '@/lib/title';
import { gsap, useGSAP } from '@/motion/gsap';
import { APPEAR, DUR, EASE, INTRO, INTRO_AT, MAGNET, MEDIA, SPLIT_FROM, STAGGER } from '@/motion/tokens';
import { HeroBackground } from './HeroBackground';

const appearFrom = { autoAlpha: 0, y: APPEAR.y };
const appearTo = { autoAlpha: 1, y: 0 };
/** Только то, что ставил GSAP: инлайн-стили React (у Magnet — display, --n) не трогаем. */
const INTRO_PROPS = 'opacity,visibility,transform,animation';

/**
 * Первый экран. Сильный эффект секции — SplitText по буквам и живой граф (PLAN §2).
 * Телефон и reduced-motion: CSS-появление по словам из предсобранной разметки, статичный
 * SVG, Magnet молчит. Десктоп: один таймлайн GSAP, затем живой граф.
 *
 * `workHref` — адрес раздела работ. Пока его нет, нет ни кнопки «Смотреть работы»,
 * ни подсказки «Листайте»: они не обещают того, чего на странице нет.
 */
export function Hero({ workHref }: { workHref?: string }) {
  const { dict, locale } = useI18n();
  const t = dict.hero;
  const scope = useRef<HTMLElement>(null);
  const [introDone, setIntroDone] = useState(false);
  const html = titleHtml(titleWords(t.title, locale));

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MEDIA.desktopMotion, (_context, contextSafe) => {
        const root = scope.current;
        if (!root || !contextSafe) return undefined;
        const q = gsap.utils.selector(root);
        const items = q('[data-intro]') as HTMLElement[];
        const title = q('#hero-title')[0] as HTMLElement;
        let split: { revert(): void } | null = null;
        let alive = true;

        const finish = () => {
          document.documentElement.classList.remove('intro');
          split?.revert();
          split = null;
          gsap.set(items, { clearProps: INTRO_PROPS });
          setIntroDone(true);
        };

        const begin = contextSafe(() => {
          if (!alive) return;
          // JavaScript пришёл позже CSS-подстраховки: всё уже видно — интро не повторяем.
          if (items.some((el) => getComputedStyle(el).visibility === 'visible')) {
            finish();
            return;
          }
          gsap.set(items, { animation: 'none' });
          const reveal = splitReveal(title, { from: SPLIT_FROM, duration: DUR.intro, ease: EASE.out, stagger: STAGGER.chars });
          split = reveal.split;
          const timeline = gsap
            .timeline({ defaults: { duration: DUR.base, ease: EASE.out }, onComplete: finish })
            .fromTo(q('[data-intro="eyebrow"]'), appearFrom, appearTo, INTRO_AT.eyebrow)
            .set(title, { autoAlpha: 1 }, INTRO_AT.title)
            .add(reveal.tween, INTRO_AT.title)
            .fromTo(q('[data-intro="lead"]'), appearFrom, appearTo, INTRO_AT.lead)
            .fromTo(q('[data-intro="action"]'), appearFrom, { ...appearTo, stagger: STAGGER.cards }, INTRO_AT.actions);
          const hint = q('[data-intro="hint"]');
          if (hint.length) timeline.fromTo(hint, { autoAlpha: 0 }, { autoAlpha: 1 }, INTRO_AT.hint);
        });

        // Буквы режем по настоящему шрифту, но ждём его не дольше, чем CSS-подстраховку.
        const fontsOrTimeout = Promise.race([
          document.fonts.ready,
          new Promise((resolve) => window.setTimeout(resolve, INTRO.fontWait * 1000)),
        ]);
        void fontsOrTimeout.then(() => begin());

        return () => {
          alive = false;
          document.documentElement.classList.remove('intro');
          split?.revert();
        };
      });
      return () => mm.revert();
    },
    { scope },
  );

  return (
    <section ref={scope} id="top" aria-labelledby="hero-title" className="relative isolate flex min-h-svh flex-col pt-(--header-h)">
      <HeroBackground start={introDone} />
      <div className="container-page flex flex-1 flex-col justify-center pt-6 pb-8 lg:py-10">
        <div className="max-w-256">
          <p className="hero-eyebrow label-mono" data-intro="eyebrow">
            {t.eyebrow}
          </p>
          <h1 id="hero-title" className="hero-title" data-intro="title" dangerouslySetInnerHTML={{ __html: html }} />
          <p className="hero-lead" data-intro="lead">
            {t.lead}
          </p>
          <div className="hero-actions">
            <Magnet
              className="hero-action"
              data-intro="action"
              padding={MAGNET.padding}
              magnetStrength={MAGNET.strength}
              maxOffset={MAGNET.maxOffset}
              spring={MAGNET.spring}
            >
              <Button asChild>
                <a href={CONTACTS.telegram.url} target="_blank" rel="noopener">
                  {t.discuss}
                  <ArrowUpRight />
                  <span className="sr-only"> ({t.discussNote})</span>
                </a>
              </Button>
            </Magnet>
            {workHref && (
              <Magnet
                className="hero-action"
                data-intro="action"
                style={{ '--n': 1 } as CSSProperties}
                padding={MAGNET.padding}
                magnetStrength={MAGNET.strength}
                maxOffset={MAGNET.maxOffset}
                spring={MAGNET.spring}
              >
                <Button asChild variant="ghost">
                  <a href={workHref}>
                    {t.work}
                    <ArrowDown />
                  </a>
                </Button>
              </Magnet>
            )}
          </div>
        </div>
      </div>
      {workHref && (
        <div className="hero-hint" aria-hidden="true" data-intro="hint">
          <span className="label-mono">{t.hint}</span>
          <span className="hint-line">
            <span className="hint-dot" />
          </span>
        </div>
      )}
    </section>
  );
}
