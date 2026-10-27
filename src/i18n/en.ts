/** Тексты EN. Страница /en/ собирается в фазе 3; полноту словаря держит тип. */
import type { Dict } from './ru';

export const en = {
  meta: {
    title: 'Oleg Barbashin — systems analyst and AI systems developer',
    description:
      'Have a task but see the risks? Let’s test it first: a prototype of your idea you open at a link, and documentation that follows the standard and is tied to the product’s code.',
  },
  header: {
    name: 'Oleg Barbashin',
    theme: 'Light theme',
  },
  hero: {
    eyebrow: 'Systems analyst · AI systems developer · Novosibirsk',
    title: [{ text: 'Have a task but see the risks? ' }, { text: 'Let’s test it first', accent: true }],
    lead: 'Two things usually needed fast: build a prototype of your idea, open it at a link and run through all your scenarios. And documentation that follows the standard and is tied to the product’s code.',
    discuss: 'Discuss a task',
    discussNote: 'on Telegram, opens in a new tab',
    work: 'See the work',
    hint: 'Scroll',
  },
  nav: {
    label: 'Sections',
    work: 'Work',
    catalog: 'Catalog',
    contact: 'Contact',
  },
  featured: {
    eyebrow: 'Selected',
    title: 'Selected work',
  },
  catalog: {
    eyebrow: 'Catalog',
    title: 'Projects by industry',
    filter: 'Industry',
    all: 'All',
  },
  card: {
    demo: 'Open the demo',
    code: 'Code',
    newTab: 'opens in a new tab',
    screen: 'Demo screen',
    video: 'Video',
    playVideo: 'Play the video',
    videoLoading: 'Loading the video',
    noDemo: 'No demo — code and documents at the links',
    stack: 'Stack',
  },
  contact: {
    eyebrow: 'Contact',
    title: 'Tell me about the task',
    lead: 'Write what needs testing — an idea or a finished product — and what you already have. I will reply with where to start: a prototype or the documentation.',
    telegram: 'Message on Telegram',
    email: 'Send an email',
    emailLabel: 'Email',
    subject: 'A task from the portfolio site',
    body: 'Hello Oleg,\n\nThe task: \nWhat we already have — an idea, code, documents: \nDeadline: \n',
  },
  footer: {
    rights: '© 2026 Oleg Barbashin',
    source: 'Site source',
    license: 'Code — MIT',
  },
} satisfies Dict;
