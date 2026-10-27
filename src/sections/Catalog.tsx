import { useEffect, useState } from 'react';
import { ProjectCard } from '@/components/project/ProjectCard';
import { FilterChip, FilterChips } from '@/components/ui/filter-chips';
import { AUDIENCES, projects } from '@/data/projects';
import { VOLUME, VOLUME_HOW } from '@/data/volume';
import { useI18n } from '@/i18n/context';
import { AUDIENCE_ORDER, audienceCounts, filterProjects, workProjects, type CatalogFilter } from '@/lib/catalog';
import { plural } from '@/lib/plural';
import { ScrollTrigger } from '@/motion/gsap';

const WORK = workProjects(projects);
const COUNTS = audienceCounts(projects);
const forms = (words: string[]) => words as [string, string, string];

/**
 * Каталог рабочих проектов по отраслям (UC-3); игры — своя секция ниже (Р-33).
 * Сильный эффект секции — наклон картинки карточки (TiltedCard).
 */
export function Catalog() {
  const { dict, locale } = useI18n();
  const t = dict.catalog;
  const [filter, setFilter] = useState<CatalogFilter>('all');
  const shown = filterProjects(WORK, filter);
  // Справка об объёме (Р-50): шаблон из словаря, числа — снимок из src/data/volume.ts.
  const values: Record<string, string> = {
    repos: `${VOLUME.repos} ${plural(VOLUME.repos, forms(t.volumeRepos))}`,
    code: String(VOLUME.codeK),
    tests: String(VOLUME.testsK),
    servers: `${VOLUME.servers} ${plural(VOLUME.servers, forms(t.volumeProjects))}`,
    databases: String(VOLUME.databases),
  };
  const volume = t.volume.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match);

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
          <p className="section-note">
            {volume}{' '}
            <a href={VOLUME_HOW} target="_blank" rel="noopener">
              {t.volumeHow}
              <span className="sr-only"> ({dict.card.newTab})</span>
            </a>
          </p>
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
