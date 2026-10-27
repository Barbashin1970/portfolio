import { ProjectCard } from '@/components/project/ProjectCard';
import { projects } from '@/data/projects';
import { useI18n } from '@/i18n/context';
import { gameProjects } from '@/lib/catalog';

const GAMES = gameProjects(projects);

/**
 * Игры — для отдыха посетителя, а не для заказчика (Р-33, UC-8): свои игры Олега,
 * открываются по ссылке, лучше всего — с телефона. Сильный эффект секции — наклон картинки,
 * как в каталоге.
 */
export function Games() {
  const { dict } = useI18n();
  const t = dict.games;

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
        <ul className="catalog-grid">
          {GAMES.map((project) => (
            <li key={project.slug} data-reveal>
              <ProjectCard project={project} variant="game" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
