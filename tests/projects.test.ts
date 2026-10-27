import { existsSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { CONTACTS, mailtoHref } from '@/data/contacts';
import { SHOTS, VIDEOS } from '@/data/media';
import { PROJECT_NOTES } from '@/data/project-notes';
import { projects } from '@/data/projects';
import { AUDIENCE_ORDER, audienceCounts, featuredProjects, filterProjects, gameProjects, workProjects } from '@/lib/catalog';

const publicFile = (path: string) => existsSync(new URL(`../public/${path}`, import.meta.url));

describe('данные витрины (UC-2)', () => {
  it('slug у каждого проекта свой', () => {
    const slugs = projects.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('у приватных проектов нет ссылки на код', () => {
    for (const p of projects.filter((p) => p.visibility === 'private')) expect(p.repoUrl, p.slug).toBeUndefined();
  });

  // Карточка без демо не тупик: ведёт к коду или документам, а если их нет — говорит почему (Р-49).
  it('у карточки без демо есть код, документация или пометка, почему их нет', () => {
    for (const p of projects.filter((p) => !p.demoUrl)) {
      expect(Boolean(p.repoUrl || p.extraLinks?.length || p.demoNote), p.slug).toBe(true);
    }
  });

  it('избранных шесть, в порядке ленты — список Олега от 2026-10-27 (Р-19)', () => {
    expect(featuredProjects(projects).map((p) => p.slug)).toEqual([
      'ragraf',
      'leyka',
      'sima',
      'prompt-professor',
      'sigma-audit',
      'archi',
    ]);
  });

  it('safety снят с витрины (Р-34), его скриншота нет', () => {
    expect(projects.some((p) => p.slug === 'safety')).toBe(false);
    expect(publicFile('media/safety.webp')).toBe(false);
  });

  it('служебные пометки живут отдельно и относятся к настоящим проектам (Б-21)', () => {
    for (const p of projects) expect(Object.keys(p), p.slug).not.toContain('note');
    const slugs = new Set(projects.map((p) => p.slug));
    for (const slug of Object.keys(PROJECT_NOTES)) expect(slugs.has(slug), slug).toBe(true);
  });

  it('у каждой карточки с демо есть скриншот, у каждого видео — файл', () => {
    for (const [slug, file] of Object.entries(SHOTS)) expect(publicFile(file), `${slug}: ${file}`).toBe(true);
    for (const [slug, video] of Object.entries(VIDEOS)) {
      expect(projects.some((p) => p.slug === slug), slug).toBe(true);
      expect(publicFile(video.file), `${slug}: ${video.file}`).toBe(true);
    }
  });
});

describe('фильтр каталога (UC-3)', () => {
  const counts = audienceCounts(projects);
  const work = workProjects(projects);

  it('«Все» равно сумме отраслей и всем рабочим проектам', () => {
    expect(AUDIENCE_ORDER.reduce((sum, a) => sum + counts[a], 0)).toBe(counts.all);
    expect(filterProjects(work, 'all')).toHaveLength(counts.all);
    expect(counts.all + gameProjects(projects).length).toBe(projects.length);
  });

  it('пустых отраслей нет, и фильтр отдаёт ровно свою отрасль', () => {
    for (const audience of AUDIENCE_ORDER) {
      const shown = filterProjects(work, audience);
      expect(shown.length, audience).toBeGreaterThan(0);
      expect(shown.length).toBe(counts[audience]);
      expect(shown.every((p) => p.audience === audience)).toBe(true);
    }
  });
});

describe('игры — своя секция для отдыха (Р-33, UC-8)', () => {
  const games = gameProjects(projects);

  it('в каталоге игр нет, и кнопки «Игры» в фильтре нет', () => {
    expect(workProjects(projects).some((p) => p.audience === 'games')).toBe(false);
    expect(AUDIENCE_ORDER).not.toContain('games');
  });

  it('каждую игру можно открыть и увидеть: демо и скриншот', () => {
    expect(games.length).toBeGreaterThan(0);
    for (const game of games) {
      expect(game.demoUrl, game.slug).toBeTruthy();
      expect(SHOTS[game.slug], game.slug).toBeTruthy();
    }
  });
});

describe('письмо (UC-4)', () => {
  it('адрес из CONTACTS, тема и заготовка закодированы и читаются обратно', () => {
    const href = mailtoHref({ subject: 'Задача с сайта', body: 'Здравствуйте, Олег!\nЗадача: …' });
    const url = new URL(href);
    expect(url.protocol).toBe('mailto:');
    expect(url.pathname).toBe(CONTACTS.email);
    expect(href).not.toMatch(/[А-Яа-яЁё]/);
    expect(url.searchParams.get('subject')).toBe('Задача с сайта');
    expect(url.searchParams.get('body')).toBe('Здравствуйте, Олег!\nЗадача: …');
  });
});
