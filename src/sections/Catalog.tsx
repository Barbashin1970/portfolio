import { useEffect, useState } from 'react';
import { ProjectCard } from '@/components/project/ProjectCard';
import { FilterChip, FilterChips } from '@/components/ui/filter-chips';
import { AUDIENCES, projects } from '@/data/projects';
import { useI18n } from '@/i18n/context';
import { AUDIENCE_ORDER, audienceCounts, filterProjects, workProjects, type CatalogFilter } from '@/lib/catalog';
import { ScrollTrigger } from '@/motion/gsap';

const WORK = workProjects(projects);
const COUNTS = audienceCounts(projects);

/**
 * Каталог рабочих проектов по отраслям (UC-3); игры — своя секция ниже (Р-33).
 * Сильный эффект секции — наклон картинки карточки (TiltedCard).
 */
export function Catalog() {
  const { dict, locale } = useI18n();
  const t = dict.catalog;
  const [filter, setFilter] = useState<CatalogFilter>('all');
  const shown = filterProjects(WORK, filter);

  // Сетка поменяла высоту — пин и появления ниже пересчитывают позиции (договорённость 8).
  useEffect(() => {
    ScrollTrigger.refresh();
  }, [filter]);

  return (
    <section id="catalog" aria-labelledby="catalog-title" className="section-block" tabIndex={-1}>
      <div className="container-page">
        <div className="section-head" data-reveal>
          <p className="label-mono">{t.eyebrow}</p>
          <h2 id="catalog-title" className="section-title">
            {t.title}
          </h2>
          <p className="section-note">{dict.card.access}</p>
        </div>
        <div className="catalog-filter" data-reveal>
          <FilterChips label={t.filter}>
            <FilterChip pressed={filter === 'all'} onClick={() => setFilter('all')}>
              {t.all}
              <span className="filter-count">{COUNTS.all}</span>
            </FilterChip>
            {AUDIENCE_ORDER.map((audience) => (
              <FilterChip key={audience} pressed={filter === audience} onClick={() => setFilter(audience)}>
                {AUDIENCES[audience][locale]}
                <span className="filter-count">{COUNTS[audience]}</span>
              </FilterChip>
            ))}
          </FilterChips>
        </div>
        <ul className="catalog-grid" aria-live="polite">
          {shown.map((project) => (
            <li key={project.slug} data-reveal>
              <ProjectCard project={project} variant="catalog" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
