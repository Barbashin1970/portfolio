import { AUDIENCES, type Audience, type Project } from '@/data/projects';

/** Отрасли каталога: рабочие проекты. У игр своя секция — для отдыха посетителя (Р-33). */
export type CatalogAudience = Exclude<Audience, 'games'>;

/** Фильтр каталога: отрасль или «все». */
export type CatalogFilter = CatalogAudience | 'all';

/** Отрасли в порядке словаря AUDIENCES — в этом порядке идут кнопки фильтра. */
export const AUDIENCE_ORDER = (Object.keys(AUDIENCES) as Audience[]).filter(
  (audience): audience is CatalogAudience => audience !== 'games',
);

/** Рабочие проекты — каталог; игры — своя секция. */
export const workProjects = (projects: Project[]) => projects.filter((project) => project.audience !== 'games');
export const gameProjects = (projects: Project[]) => projects.filter((project) => project.audience === 'games');

export function filterProjects(projects: Project[], filter: CatalogFilter): Project[] {
  return filter === 'all' ? projects : projects.filter((project) => project.audience === filter);
}

/** Сколько проектов под каждой кнопкой фильтра; считает только рабочие. */
export function audienceCounts(projects: Project[]): Record<CatalogFilter, number> {
  const counts = Object.fromEntries(AUDIENCE_ORDER.map((audience) => [audience, 0])) as Record<CatalogFilter, number>;
  const work = workProjects(projects);
  for (const project of work) counts[project.audience as CatalogAudience] += 1;
  counts.all = work.length;
  return counts;
}

export const featuredProjects = (projects: Project[]) => projects.filter((project) => project.tier === 'featured');
