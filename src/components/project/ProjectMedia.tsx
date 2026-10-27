import type { Ref } from 'react';
import TiltedCard from '@/components/fx/TiltedCard';
import { PHONE_FIRST, SHOTS, VIDEOS } from '@/data/media';
import type { Project } from '@/data/projects';
import { cn } from '@/lib/utils';

const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`;

export type VideoState = 'idle' | 'loading' | 'playing';

interface ProjectMediaProps {
  project: Project;
  /** Подпись картинки: «Экран демо: <название>». */
  alt: string;
  /** Наклон картинки (каталог); на тач-экранах и при reduced-motion TiltedCard гасит его сам. */
  tilt?: boolean;
  /**
   * Сцена (Р-45): скриншот лежит на подложке с полями и скруглён целиком — каталог и игры.
   * Тогда шов между картинкой и описанием — одна прямая линия, без зазубрин скругления.
   */
  stage?: boolean;
  videoRef?: Ref<HTMLVideoElement>;
  videoState?: VideoState;
  /** Подпись скелетона, пока видео грузится: «Видео загружается». */
  loadingLabel?: string;
  onVideoPlaying?: () => void;
  onVideoWaiting?: () => void;
}

/**
 * Картинка карточки: скриншот публичного экрана демо, у мобильных приложений — в рамке
 * телефона; видео — поверх скриншота и грузится только по запросу; без демо — запасной граф.
 * Пока видео грузится или подвисает — скелетон (приём Skeleton UI из nsk-opendata-bot:
 * мгновенная заглушка, чтобы человек видел, что ответ идёт, и не уходил). Пульс — в форме
 * кадра; подпись — над всей картинкой: в рамку телефона шириной около 90 px она не влезает.
 * Область статуса есть всегда, чтобы экранный чтец озвучил появившуюся подпись.
 */
export function ProjectMedia({
  project,
  alt,
  tilt = false,
  stage = false,
  videoRef,
  videoState = 'idle',
  loadingLabel,
  onVideoPlaying,
  onVideoWaiting,
}: ProjectMediaProps) {
  const shot = SHOTS[project.slug];
  const video = VIDEOS[project.slug];
  const phone = PHONE_FIRST.has(project.slug);
  const loading = Boolean(video) && videoState === 'loading';
  const staged = stage && Boolean(shot) && !phone;

  const videoEl = video && (
    <>
      <video
        ref={videoRef}
        className={cn('project-video', videoState === 'playing' && 'is-playing')}
        data-src={asset(video.file)}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
        onPlaying={onVideoPlaying}
        onWaiting={onVideoWaiting}
      />
      {loading && <span className="skeleton-block" aria-hidden="true" />}
    </>
  );

  const content = !shot ? (
    <FallbackGraph />
  ) : phone ? (
    <div className="phone-frame">
      <img src={asset(shot)} alt={alt} width={390} height={844} loading="lazy" decoding="async" />
      {videoEl}
    </div>
  ) : staged && !tilt ? (
    <div className="shot-frame">
      <img className="project-shot" src={asset(shot)} alt={alt} width={960} height={600} loading="lazy" decoding="async" />
      {videoEl}
    </div>
  ) : (
    <>
      <img className="project-shot" src={asset(shot)} alt={alt} width={960} height={600} loading="lazy" decoding="async" />
      {videoEl}
    </>
  );

  return (
    <div className={cn('project-media', phone && 'is-phone', shot && !phone && 'has-shot', staged && 'is-stage', !shot && 'is-fallback')}>
      {tilt ? (
        <TiltedCard
          containerWidth="100%"
          containerHeight="100%"
          imageWidth="100%"
          imageHeight="100%"
          radius={staged ? 12 : 16}
          rotateAmplitude={8}
          scaleOnHover={1.03}
          glare={0.25}
          shadow={0.35}
          showTooltip={false}
          flipOnClick={false}
          gyroscope={false}
          intro={false}
        >
          {content}
        </TiltedCard>
      ) : (
        content
      )}
      {video && (
        <span className="media-status" role="status">
          {loading && <span className="skeleton-label">{loadingLabel}</span>}
        </span>
      )}
    </div>
  );
}

/** Запасная картинка проекта без демо: узлы и связи, как фон первого экрана. */
function FallbackGraph() {
  return (
    <svg className="fallback-graph" viewBox="0 0 320 200" aria-hidden="true" focusable="false">
      <g className="graph-edges">
        <line x1="60" y1="60" x2="140" y2="40" /><line x1="140" y1="40" x2="220" y2="80" /><line x1="60" y1="60" x2="110" y2="130" />
        <line x1="140" y1="40" x2="160" y2="110" /><line x1="220" y1="80" x2="160" y2="110" /><line x1="110" y1="130" x2="160" y2="110" />
        <line x1="160" y1="110" x2="250" y2="150" /><line x1="220" y1="80" x2="270" y2="60" />
      </g>
      <g className="graph-node"><circle cx="60" cy="60" r="4" /><circle cx="110" cy="130" r="4" /><circle cx="270" cy="60" r="3.5" /></g>
      <g className="graph-data"><circle cx="140" cy="40" r="5" /><circle cx="220" cy="80" r="5" /><circle cx="250" cy="150" r="4.5" /></g>
      <circle className="graph-hub" cx="160" cy="110" r="8" />
    </svg>
  );
}
