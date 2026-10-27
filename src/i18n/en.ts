/** Тексты EN. Страница /en/ собирается в фазе 3; полноту словаря держит тип. */
import type { Dict } from './ru';

export const en = {
  meta: {
    title: 'Oleg Barbashin — systems analyst and AI systems developer',
    description:
      'Have a task but no developers of your own? A prototype of your idea you can try before investing, and GOST 19 documentation tied to the product’s code.',
  },
  header: {
    name: 'Oleg Barbashin',
    theme: 'Light theme',
  },
  hero: {
    eyebrow: 'Systems analyst · AI systems developer · Novosibirsk',
    title: [{ text: 'Have a task but no developers of your own? ' }, { text: 'Let’s test it first', accent: true }],
    lead: 'Two things you can verify: a prototype of your idea — open it at a link and try it before you invest — and GOST 19 documentation tied to the product’s code, with every number checked against the product.',
    discuss: 'Discuss a task',
    discussNote: 'on Telegram, opens in a new tab',
    work: 'See the work',
    hint: 'Scroll',
  },
} satisfies Dict;
