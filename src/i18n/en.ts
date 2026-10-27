/** Тексты EN. Страница /en/ собирается в фазе 3; полноту словаря держит тип. */
import type { Dict } from './ru';

export const en = {
  meta: {
    title: 'Oleg Barbashin — systems analyst and AI systems developer',
    description:
      'Have a task but no developers of your own? Prototypes, AI modules tested on your data, GOST 19 documentation and R&D reports — for universities, industry, construction and business.',
  },
  header: {
    name: 'Oleg Barbashin',
    theme: 'Light theme',
  },
  hero: {
    eyebrow: 'Systems analyst · AI systems developer · Novosibirsk',
    title: [{ text: 'Have a task but no developers of your own? ' }, { text: 'Let’s test it first', accent: true }],
    lead: 'A product prototype, an AI module for routine work — say, sorting patient records — or GOST 19 documentation and an R&D report. We test it on your data first; then you decide whether to roll it out.',
    discuss: 'Discuss a task',
    discussNote: 'on Telegram, opens in a new tab',
    work: 'See the work',
    hint: 'Scroll',
  },
} satisfies Dict;
