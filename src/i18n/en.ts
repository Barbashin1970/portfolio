/** Тексты EN. Страница /en/ собирается в фазе 3; полноту словаря держит тип. */
import type { Dict } from './ru';

export const en = {
  meta: {
    title: 'Oleg Barbashin — systems analyst and AI systems developer',
    description:
      'I go through your business chain and find where AI takes routine work off your staff. We test it on your data, and I train your team. Prototypes and standard-compliant documentation, too.',
  },
  header: {
    name: 'Oleg Barbashin',
    theme: 'Light theme',
  },
  hero: {
    eyebrow: 'Systems analyst · AI systems developer · Novosibirsk',
    title: [{ text: 'AI that works ' }, { text: 'for your team', accent: true }],
    lead: 'I like building platforms for universities, games, and tools for construction and industry. Open any of the 20+ demos and decide for yourself. I’ll build the same for your idea. I’ll also find where AI takes routine work off your staff, and train your team to work with it.',
    discuss: 'Discuss a task',
    discussNote: 'on Telegram, opens in a new tab',
    work: 'See the work',
    hint: 'Scroll',
  },
  nav: {
    label: 'Sections',
    work: 'Work',
    catalog: 'Catalog',
    games: 'Games',
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
  games: {
    eyebrow: 'Leisure',
    title: 'Games for a break',
    lead: 'Not everything here is about work. Games I made myself open at a link: some on a phone, others in a browser on a big screen. Play one on a break, or borrow an idea for your own game.',
  },
  card: {
    demo: 'Open the demo',
    play: 'Play',
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
