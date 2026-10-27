import { useRef } from 'react';
import { ProjectCard } from '@/components/project/ProjectCard';
import { projects } from '@/data/projects';
import { useI18n } from '@/i18n/context';
import { featuredProjects } from '@/lib/catalog';
import { gsap, useGSAP } from '@/motion/gsap';
import { getLenis } from '@/motion/lenis';
import { EASE, MEDIA } from '@/motion/tokens';

const FEATURED = featuredProjects(projects);

/**
 * Избранные проекты. Сильный эффект секции (PLAN §2): на десктопе без reduced-motion —
 * пин и горизонтальная прокрутка, привязанная к скроллу; на телефоне и при reduced-motion —
 * обычный ряд со свайпом и snap, без пина (договорённости 6 и 7).
 */
export function Featured() {
  const { dict } = useI18n();
  const t = dict.featured;
  const scope = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MEDIA.desktopMotion, () => {
        const section = scope.current;
        const viewport = section?.querySelector<HTMLElement>('.featured-viewport');
        const track = section?.querySelector<HTMLElement>('.featured-track');
        if (!section || !viewport || !track) return undefined;

        section.dataset.mode = 'pin';
        // Ход ленты — до последней карточки у правого края колонки: поля ленты не в счёт.
        const distance = () => {
          const style = getComputedStyle(viewport);
          const inner = viewport.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
          return Math.max(0, track.scrollWidth - inner);
        };
        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: EASE.scrub,
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => `+=${distance()}`,
            pin: true,
            scrub: true,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        });

        // Клавиатура: карточка с фокусом могла уехать за край — прокручиваем страницу к ней (PLAN §1).
        const onFocus = (event: FocusEvent) => {
          const st = tween.scrollTrigger;
          const card = (event.target as Element).closest<HTMLElement>('.featured-track > li');
          if (!st || !card || !distance()) return;
          // Место карточки в ленте — по разнице рамок: сдвиг ленты в обеих одинаков.
          const offset = card.getBoundingClientRect().left - track.getBoundingClientRect().left;
          const y = st.start + Math.min(1, offset / distance()) * (st.end - st.start);
          const lenis = getLenis();
          if (lenis) lenis.scrollTo(y, { immediate: true });
          else window.scrollTo(0, y);
        };
        track.addEventListener('focusin', onFocus);
        return () => {
          track.removeEventListener('focusin', onFocus);
          delete section.dataset.mode;
        };
      });
      return () => mm.revert();
    },
    { scope },
  );

  return (
    <section ref={scope} id="featured" aria-labelledby="featured-title" className="featured section-block" tabIndex={-1}>
      <div className="container-page section-head" data-reveal>
        <p className="label-mono">{t.eyebrow}</p>
        <h2 id="featured-title" className="section-title">
          {t.title}
        </h2>
        <p className="section-note">{dict.card.access}</p>
      </div>
      <div className="featured-viewport">
        <ul className="featured-track">
          {FEATURED.map((project) => (
            <li key={project.slug}>
              <ProjectCard project={project} variant="featured" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
