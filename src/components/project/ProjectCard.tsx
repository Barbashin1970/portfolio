import { useRef, useState } from 'react';
import { ArrowUpRight, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VIDEOS } from '@/data/media';
import { AUDIENCES, type Project } from '@/data/projects';
import { useI18n } from '@/i18n/context';
import { typo } from '@/lib/typograf';
import { useMediaQuery } from '@/lib/useMediaQuery';
import { cn } from '@/lib/utils';
import { MEDIA } from '@/motion/tokens';
import { ProjectMedia, type VideoState } from './ProjectMedia';

const HOVER = '(hover: hover) and (pointer: fine)';

/**
 * Карточка проекта — одна для галереи избранного и каталога. Главное действие — «Открыть
 * демо» (в доступном имени — название проекта, UC-2); код и документация — тихими ссылками.
 * У приватных проектов ссылки на код нет по типу (repoUrl?: never).
 */
export function ProjectCard({ project, variant }: { project: Project; variant: 'featured' | 'catalog' }) {
  const { dict, locale } = useI18n();
  const t = dict.card;
  const title = project.title[locale];
  const id = `${variant}-${project.slug}`;
  const hasVideo = Boolean(VIDEOS[project.slug]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoState, setVideoState] = useState<VideoState>('idle');
  const playing = videoState !== 'idle';
  const canHover = useMediaQuery(HOVER);
  const calm = useMediaQuery(MEDIA.reduceMotion);

  // Видео грузится только по запросу; до первого кадра — скелетон (ProjectMedia).
  const play = () => {
    const video = videoRef.current;
    if (!video) return;
    if (!video.src) video.src = video.dataset.src ?? '';
    setVideoState(video.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA ? 'playing' : 'loading');
    void video.play().catch(() => setVideoState('idle'));
  };
  const pause = () => {
    videoRef.current?.pause();
    setVideoState('idle');
  };
  const hoverPlay = hasVideo && canHover && !calm;
  const secondary = [
    ...(project.repoUrl ? [{ label: t.code, url: project.repoUrl }] : []),
    ...(project.extraLinks ?? []).map((link) => ({ label: link.label[locale], url: link.url })),
  ];

  return (
    <article
      className={cn('project-card', `is-${variant}`)}
      aria-labelledby={id}
      onPointerEnter={hoverPlay ? play : undefined}
      onPointerLeave={hoverPlay ? pause : undefined}
    >
      <div className="project-media-wrap">
        <ProjectMedia
          project={project}
          alt={`${t.screen}: ${title}`}
          tilt={variant === 'catalog'}
          videoRef={videoRef}
          videoState={videoState}
          loadingLabel={t.videoLoading}
          onVideoPlaying={() => setVideoState('playing')}
          onVideoWaiting={() => setVideoState((state) => (state === 'idle' ? state : 'loading'))}
        />
        {hasVideo && (
          <button type="button" className="video-toggle" aria-pressed={playing} onClick={playing ? pause : play}>
            {playing ? <Pause /> : <Play />}
            <span>{t.video}</span>
            <span className="sr-only">: {title}</span>
          </button>
        )}
      </div>
      <div className="project-body">
        <p className="label-mono">
          {AUDIENCES[project.audience][locale]} · {project.year}
        </p>
        <h3 id={id} className="project-title">
          {title}
        </h3>
        <p className="project-tagline">{typo(project.tagline[locale], locale)}</p>
        {project.demoNote && <p className="project-note">{typo(project.demoNote[locale], locale)}</p>}
        <ul className="project-stack" aria-label={t.stack}>
          {project.stack.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <div className="project-links">
          {project.demoUrl ? (
            <Button asChild size="sm">
              <a href={project.demoUrl} target="_blank" rel="noopener">
                {t.demo}
                <ArrowUpRight />
                <span className="sr-only">
                  : {title} ({t.newTab})
                </span>
              </a>
            </Button>
          ) : (
            <p className="project-nodemo">{t.noDemo}</p>
          )}
          {secondary.length > 0 && (
            <ul className="project-secondary">
              {secondary.map((link) => (
                <li key={link.url}>
                  <a href={link.url} target="_blank" rel="noopener">
                    {link.label}
                    <ArrowUpRight aria-hidden="true" />
                    <span className="sr-only">
                      : {title} ({t.newTab})
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </article>
  );
}
