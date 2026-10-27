/**
 * Картинки и видео карточек (фаза 2). Файлы лежат в public/media/:
 * - <slug>.webp — скриншот публичного экрана демо, снимает scripts/capture-shots.mjs;
 * - <slug>.mp4 — видео из первой попытки портфолио (ai-point), сжатое разово
 *   (команда — docs/INVENTORY.md, раздел «Медиа»).
 * У проекта без демо картинки нет — карточка рисует запасной граф.
 */
// С расширением: этот модуль читает и Node в scripts/capture-shots.mjs, а он без него не найдёт файл.
import { projects } from './projects.ts';

export interface ProjectVideo {
  file: string;
  /** Запись с телефона: в карточке — в рамке телефона. */
  portrait: boolean;
}

/**
 * Видео — из ai-point. У Сигмы видео — ранний прототип фреймворка, а не демо оператора ЕДДС,
 * на которое ведёт карточка, поэтому его нет. У игр срезана рамка мини-приложения Telegram.
 */
export const VIDEOS: Record<string, ProjectVideo> = {
  'pto-presentation': { file: 'media/pto-presentation.mp4', portrait: false },
  boardway: { file: 'media/boardway.mp4', portrait: true },
  profconsalt: { file: 'media/profconsalt.mp4', portrait: true },
  'boston-consulter': { file: 'media/boston-consulter.mp4', portrait: true },
  'puzzle-15': { file: 'media/puzzle-15.mp4', portrait: true },
};

/**
 * Мобильные приложения снимаются экраном телефона и стоят в карточке в рамке телефона;
 * остальные — экраном десктопа. Этот же список читает scripts/capture-shots.mjs.
 */
export const PHONE_FIRST = new Set([
  'gonka',
  'tigra',
  'smart-5',
  'redjohn',
  'boardway',
  'harry-quiz',
  'puzzle-15',
  'boston-consulter',
  'profconsalt',
  'sill',
  'aroma-sofia',
]);

/** Скриншот — у каждого проекта с демо. */
export const SHOTS: Record<string, string> = Object.fromEntries(
  projects.filter((project) => project.demoUrl).map((project) => [project.slug, `media/${project.slug}.webp`]),
);
