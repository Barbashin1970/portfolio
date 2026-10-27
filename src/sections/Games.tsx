import { useRef } from 'react';
import { ProjectCard } from '@/components/project/ProjectCard';
import { projects } from '@/data/projects';
import { useI18n } from '@/i18n/context';
import { gameProjects } from '@/lib/catalog';
import { gsap, ScrollTrigger, useGSAP } from '@/motion/gsap';
import { DEAL, DUR, EASE, MEDIA, STAGGER } from '@/motion/tokens';

const GAMES = gameProjects(projects);

/**
 * Игры — для отдыха посетителя, а не для заказчика (Р-33, UC-8): свои игры Олега,
 * открываются по ссылке — одни на телефоне, другие в браузере. Сильный эффект секции —
 * «раздача карт» (Р-44): карточки въезжают с поворотом и выпрямляются, на телефоне тоже.
 * Прячутся только те, что ниже экрана; при reduced-motion — ничего.
 */
export function Games() {
  const { dict } = useI18n();
  const t = dict.games;
  const grid = useRef<HTMLUListElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MEDIA.motion, () => {
        const cards = gsap.utils
          .toArray<HTMLElement>(grid.current?.children ?? [])
          .filter((card) => card.getBoundingClientRect().top > window.innerHeight);
        gsap.set(cards, {
          autoAlpha: 0,
          y: DEAL.y,
          scale: DEAL.scale,
          rotation: (i: number) => DEAL.rotate[i % DEAL.rotate.length],
        });
        ScrollTrigger.batch(cards, {
          start: DEAL.start,
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              rotation: 0,
              duration: DUR.slow,
              ease: EASE.deal,
              stagger: STAGGER.cards,
              overwrite: true,
            }),
        });
      });
      return () => mm.revert();
    },
    { scope: grid },
  );

  return (
    <section id="games" aria-labelledby="games-title" className="section-block" tabIndex={-1}>
      <div className="container-page">
        <div className="section-head" data-reveal>
          <p className="label-mono">{t.eyebrow}</p>
          <h2 id="games-title" className="section-title">
            {t.title}
          </h2>
          <p className="section-lead">{t.lead}</p>
          <p className="section-note">{dict.card.access}</p>
        </div>
        <ul ref={grid} className="catalog-grid">
          {GAMES.map((project) => (
            <li key={project.slug} data-deal>
              <ProjectCard project={project} variant="game" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
