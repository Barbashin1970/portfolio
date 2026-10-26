/** Тексты EN. Страница /en/ собирается в фазе 3; полноту словаря держит тип. */
import type { Dict } from './ru';

export const en = {
  meta: {
    title: 'Oleg Barbashin — systems analyst and AI systems developer',
    description:
      'I test a software product idea in days, not a year: a prototype at a link for your audience to judge. AI agents, semantic graphs, digital platforms.',
  },
  header: {
    name: 'Oleg Barbashin',
    theme: 'Light theme',
  },
  hero: {
    eyebrow: 'Systems analyst · AI systems developer · Novosibirsk',
    title: [{ text: 'I test a product idea ' }, { text: 'in days', accent: true }, { text: ', not a year' }],
    lead: 'A prototype at a link that your audience opens and judges — before you hire a team and spend a year building. AI-assisted development gives up to 50× leverage: we compare several directions and keep the best.',
    discuss: 'Test an idea',
    discussNote: 'on Telegram, opens in a new tab',
    work: 'See the work',
    hint: 'Scroll',
  },
} satisfies Dict;
