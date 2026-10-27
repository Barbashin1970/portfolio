import { AUDIENCES, type Audience, type Project } from '@/data/projects';

/** Фильтр каталога: отрасль или «все». */
export type CatalogFilter = Audience | 'all';

/** Отрасли в порядке словаря AUDIENCES — в этом порядке идут кнопки фильтра. */
export const AUDIENCE_ORDER = Object.keys(AUDIENCES) as Audience[];

export function filterProjects(projects: Project[], filter: CatalogFilter): Project[] {
  return filter === 'all' ? projects : projects.filter((project) => project.audience === filter);
}

/** Сколько проектов под каждой кнопкой фильтра. */
export function audienceCounts(projects: Project[]): Record<CatalogFilter, number> {
  const counts = Object.fromEntries(AUDIENCE_ORDER.map((audience) => [audience, 0])) as Record<CatalogFilter, number>;
  for (const project of projects) counts[project.audience] += 1;
  counts.all = projects.length;
  return counts;
}

export const featuredProjects = (projects: Project[]) => projects.filter((project) => project.tier === 'featured');
