/** Тексты EN. Страница /en/ собирается в фазе 3; полноту словаря держит тип. */
import type { Dict } from './ru';

export const en = {
  meta: {
    title: 'Oleg Barbashin — systems analyst and AI systems developer',
    description:
      'From idea and spec to a working prototype: AI agents, semantic graphs and digital platforms for Novosibirsk State University, industry and construction.',
  },
  header: {
    name: 'Oleg Barbashin',
    theme: 'Light theme',
  },
  hero: {
    eyebrow: 'Systems analyst · AI systems developer · Novosibirsk',
    title: [{ text: 'From idea to working prototype — ' }, { text: 'one prompt', accent: true }],
    lead: 'Describe the task in one message — the rest is my job: analysis, a spec, a prototype at a link, and testing. AI agents, semantic graphs and digital platforms — for Novosibirsk State University, industry and construction.',
    discuss: 'Discuss a project',
    discussNote: 'on Telegram, opens in a new tab',
    work: 'See the work',
    hint: 'Scroll',
  },
} satisfies Dict;
