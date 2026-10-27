/**
 * Витрина проектов: галерея избранного и каталог по отраслям (фаза 2).
 *
 * Откуда данные — инвентаризация 2026-10-26: публичный GitHub API, локальные
 * клоны на ноутбуке Олега и проверка каждой демо-ссылки curl'ом.
 * Опись и команды — docs/INVENTORY.md.
 *
 * Правила (бриф и решения Олега от 2026-10-26, см. CLAUDE.md):
 * - Олег разрешил показывать все проекты, приватные — с описанием и стеком;
 * - ссылки на код приватного репозитория нет и быть не может (repoUrl?: never):
 *   у посетителя она открылась бы как 404;
 * - нерабочие демо не публикуем: demoUrl есть только у проверенных адресов,
 *   а где демо нет — карточка ведёт на репозиторий или документацию;
 * - служебные пометки — в project-notes.ts: сайт их не импортирует, и в публичный JS
 *   они не попадают (Б-21, Р-28).
 */

import type { Localized } from '@/i18n/locale';

export type { Locale, Localized } from '@/i18n/locale';

/** Целевая аудитория: по ней фильтруется каталог. */
export type Audience =
  | 'industry'
  | 'city'
  | 'science'
  | 'education'
  | 'business'
  | 'health'
  | 'games';

export const AUDIENCES: Record<Audience, Localized> = {
  industry: { ru: 'Стройка и промышленность', en: 'Construction & industry' },
  city: { ru: 'Город и безопасность', en: 'City & public safety' },
  science: { ru: 'Наука и R&D', en: 'Science & R&D' },
  education: { ru: 'Образование', en: 'Education' },
  business: { ru: 'Бизнес', en: 'Business' },
  health: { ru: 'Здоровье', en: 'Health' },
  games: { ru: 'Игры', en: 'Games' },
};

/** featured — горизонтальная галерея «Избранные проекты»; в каталоге есть все. */
export type Tier = 'featured' | 'catalog';

export interface ExtraLink {
  label: Localized;
  url: string;
}

interface ProjectBase {
  slug: string;
  title: Localized;
  tagline: Localized;
  stack: string[];
  audience: Audience;
  tier: Tier;
  /** Год последнего коммита; у проекта без репозитория — год, когда демо уже было опубликовано (источник — в project-notes.ts). */
  year: number;
  /** Проверенный адрес: 200 и свой контент, см. docs/INVENTORY.md. */
  demoUrl?: string;
  extraLinks?: ExtraLink[];
  /** Что посетителю надо знать о демо до перехода — выводится на карточке. */
  demoNote?: Localized;
}

export interface PublicProject extends ProjectBase {
  visibility: 'public';
  repoUrl: string;
}

export interface PrivateProject extends ProjectBase {
  visibility: 'private';
  repoUrl?: never;
}

export type Project = PublicProject | PrivateProject;

const GH = 'https://github.com/Barbashin1970';
const DOCS = `${GH}/DOCS/tree/main`;
const docsLink = (folder: string): ExtraLink => ({
  label: { ru: 'Документация', en: 'Documentation' },
  url: `${DOCS}/${folder}`,
});

export const projects: Project[] = [
  // ── Избранные: четыре, список подтверждён Олегом 2026-10-27 (Р-19) ──
  {
    slug: 'ragraf',
    visibility: 'private',
    tier: 'featured',
    audience: 'industry',
    year: 2026,
    title: { ru: 'РАГРАФ', en: 'RAGRAF' },
    tagline: {
      ru: 'ИИ, который можно проверить: каждое решение предъявляет входные данные, формулу и порог',
      en: 'AI you can audit: every verdict shows its inputs, formula and threshold',
    },
    stack: ['FastAPI', 'DuckDB', 'RDF · SHACL', 'React', 'React Flow'],
    demoUrl: 'https://ragraf.up.railway.app/',
    extraLinks: [docsLink('RAGRAF_DOCS')],
  },
  {
    slug: 'sigma',
    visibility: 'public',
    tier: 'featured',
    audience: 'city',
    year: 2026,
    title: { ru: 'Сигма — ситуационный центр', en: 'Sigma — situation centre' },
    tagline: {
      ru: 'ИИ-подсказки оператору ЕДДС: сценарии ЧП, видеостена и тренажёр с аттестацией',
      en: 'AI prompts for emergency dispatch operators: incident scenarios, a video wall and a certification trainer',
    },
    stack: ['React 19', 'Vite 8', 'Tailwind 4', 'TypeScript'],
    demoUrl: 'https://sigma-operator.vercel.app/operator/hospital-fire',
    repoUrl: `${GH}/demo-sigma-main`,
    extraLinks: [
      {
        label: { ru: 'Ранний прототип фреймворка', en: 'Early framework prototype' },
        url: 'https://sigma-three-theta.vercel.app/',
      },
    ],
  },
  {
    slug: 'sima',
    visibility: 'public',
    tier: 'featured',
    audience: 'city',
    year: 2026,
    title: { ru: 'СИМА — открытые данные Новосибирска', en: 'SIMA — Novosibirsk open data' },
    tagline: {
      ru: 'Отвечает на вопросы о городе по открытым данным — отключения, воздух, транспорт, стройки — без нейросети в рантайме',
      en: 'Answers questions about the city from open data — outages, air quality, transit, construction — with no neural network at runtime',
    },
    stack: ['Python', 'DuckDB', 'Open-Meteo', 'OpenStreetMap'],
    demoUrl: 'https://nsk-opendata-bot.up.railway.app/',
    repoUrl: `${GH}/NSK_OpenData_Bot`,
  },
  {
    slug: 'prompt-professor',
    visibility: 'public',
    tier: 'featured',
    audience: 'education',
    year: 2026,
    title: { ru: 'ИИ в учебном процессе', en: 'AI in Teaching' },
    tagline: {
      ru: 'Курс повышения квалификации для преподавателей НГУ: лекции, библиотека промптов, конструктор и тесты',
      en: 'A professional development course for NSU faculty: lectures, a prompt library, a prompt builder and self-tests',
    },
    stack: ['Python', 'Markdown', 'PWA', 'JavaScript'],
    demoUrl: 'https://barbashin1970.github.io/PROMPT-Professor/',
    repoUrl: `${GH}/PROMPT-Professor`,
    extraLinks: [
      { label: { ru: 'Зеркало на Vercel', en: 'Vercel mirror' }, url: 'https://ai-in-the-education.vercel.app/' },
    ],
  },

  // ── Стройка и промышленность ────────────────────────────────────────
  {
    slug: 'safety',
    visibility: 'public',
    tier: 'catalog',
    audience: 'industry',
    year: 2026,
    title: { ru: 'ИИ-помощник по технике безопасности', en: 'Site safety assistant' },
    tagline: {
      ru: 'Собирает наряд, чек-лист и инструктаж по онтологии норм — без галлюцинаций, потому что решение принимает не LLM',
      en: 'Builds work orders, checklists and briefings from an ontology of safety rules — no hallucinations, because no LLM makes the call',
    },
    stack: ['Python', 'Streamlit', 'pandas', 'RDF'],
    demoUrl: 'https://safety-builder.streamlit.app/',
    repoUrl: `${GH}/safety`,
    // Б-17: проверено 2026-10-27 — Streamlit показал экран сна, кнопка разбудила приложение.
    demoNote: {
      ru: 'Демо засыпает без посетителей: нажмите кнопку на экране — оно проснётся',
      en: 'The demo sleeps when idle: press the button on its screen to wake it up',
    },
  },
  {
    slug: 'archi',
    visibility: 'private',
    tier: 'catalog',
    audience: 'industry',
    year: 2026,
    title: { ru: 'Платформа АРХИ', en: 'ARCHI Platform' },
    tagline: {
      ru: 'Читает графики стройки, применяет регламенты и сама пишет ответственному, когда норма нарушена: объект, предписание, срок',
      en: 'Reads construction schedules, applies the rules and messages the person in charge when one is broken: site, order, deadline',
    },
    stack: ['FastAPI', 'SQLite', 'aiogram', 'JavaScript'],
    demoUrl: 'https://archi-nsu.vercel.app/',
    extraLinks: [docsLink('ARCHI-NSU')],
  },
  {
    slug: 'preconstruction',
    visibility: 'public',
    tier: 'catalog',
    audience: 'industry',
    year: 2026,
    title: { ru: 'PRECONSTRUCTION', en: 'PRECONSTRUCTION' },
    tagline: {
      ru: 'ИИ-пресейл для строителей: агент проводит интервью, запускает исследователей параллельно и собирает отчёт с питчем',
      en: 'AI pre-sales research for construction ideas: the agent interviews you, runs researchers in parallel and assembles a report with a pitch',
    },
    stack: ['Claude Code', 'Agent Skills'],
    repoUrl: `${GH}/PRECONSTRUCTION`,
  },
  {
    slug: 'stroyka-test',
    visibility: 'public',
    tier: 'catalog',
    audience: 'industry',
    year: 2026,
    title: { ru: 'Тест по ИИ для строителей', en: 'AI quiz for builders' },
    tagline: {
      ru: 'Тест по ИИ для строителей',
      en: 'An AI quiz for construction professionals',
    },
    stack: ['JavaScript'],
    demoUrl: 'https://stroyka-alpha.vercel.app/',
    repoUrl: `${GH}/stroyka-test`,
  },

  // ── Город и безопасность ────────────────────────────────────────────
  {
    slug: 'smartcityprompt',
    visibility: 'public',
    tier: 'catalog',
    audience: 'city',
    year: 2026,
    title: { ru: 'Промпт-конструктор умного города', en: 'Smart-city prompt builder' },
    tagline: {
      ru: 'Собирает промпт для городской аналитики: роль, шаблон задачи, схема данных — вплоть до SQL для DuckDB',
      en: 'Assembles prompts for urban analytics: role, task template, data schema — down to DuckDB SQL',
    },
    stack: ['HTML', 'JavaScript'],
    demoUrl: 'https://smartcityprompt.vercel.app/',
    repoUrl: `${GH}/smartcityprompt`,
  },

  // ── Наука и R&D ─────────────────────────────────────────────────────
  {
    slug: 'sigma-audit',
    visibility: 'private',
    tier: 'catalog',
    audience: 'science',
    year: 2026,
    title: { ru: 'Сигма-аудит', en: 'Sigma audit' },
    tagline: {
      ru: 'Проверяет публичный GitHub-репозиторий по 26 правилам методологии «Сигма» — за 30 секунд и без установки',
      en: 'Audits a public GitHub repository against 26 rules of the Sigma methodology — in 30 seconds, nothing to install',
    },
    stack: ['Python', 'FastAPI', 'React', 'TypeScript'],
    demoUrl: 'https://polinom-sigma-audit.up.railway.app/',
  },
  {
    slug: 'nsu-ai-skills',
    visibility: 'public',
    tier: 'catalog',
    audience: 'science',
    year: 2026,
    title: { ru: 'NSU-AI-SKILLS', en: 'NSU-AI-SKILLS' },
    tagline: {
      ru: 'Навыки для ИИ-агента: документация по ГОСТ 19, порядок работы SKICODING и отчёты о НИОКР',
      en: 'Skills for AI coding agents: GOST 19 documentation, the SKICODING workflow and R&D reports',
    },
    stack: ['Claude Code', 'Agent Skills', 'Markdown'],
    repoUrl: `${GH}/NSU-AI-SKILLS`,
  },
  {
    slug: 'md2gostdocx',
    visibility: 'public',
    tier: 'catalog',
    audience: 'science',
    year: 2026,
    title: { ru: 'md2gostdocx', en: 'md2gostdocx' },
    tagline: {
      ru: 'Собирает сдаточный DOCX по ГОСТ 19 из Markdown — с линтером и кодами возврата для CI',
      en: 'Turns Markdown docs into a GOST 19-compliant DOCX — with a linter and exit codes for CI',
    },
    stack: ['Python', 'pandoc', 'uv'],
    repoUrl: `${GH}/MD-DOCX-CONVERTER`,
  },
  {
    slug: 'engineer',
    visibility: 'public',
    tier: 'catalog',
    audience: 'science',
    year: 2026,
    title: { ru: 'Инженерный калькулятор: проверка GigaCode', en: 'Engineering calculator: a GigaCode audit' },
    tagline: {
      ru: 'Калькулятор от GigaCode не работал вовсе: 25 найденных дефектов и путь от 2 до 48 пройденных сценариев из 48',
      en: 'GigaCode’s calculator didn’t work at all: 25 defects found, from 2 to 48 of 48 user scenarios passing',
    },
    stack: ['JavaScript', 'HTML', 'CSS'],
    demoUrl: 'https://barbashin1970.github.io/ENGINEER/',
    repoUrl: `${GH}/ENGINEER`,
  },
  {
    slug: 'leyka',
    visibility: 'private',
    tier: 'catalog',
    audience: 'science',
    year: 2026,
    title: { ru: 'LEYKA', en: 'LEYKA' },
    tagline: {
      ru: 'Система управления проектами Центра ИИ НГУ: лента-мессенджер, ИИ-модератор и цифровой диалоговый ассистент',
      en: 'Project management for the NSU AI Center: a messenger-style feed, an AI moderator and a conversational assistant',
    },
    stack: ['FastAPI', 'SQLite', 'React', 'TanStack Query'],
    extraLinks: [docsLink('LEYKA_DOCS')],
  },

  // ── Образование ─────────────────────────────────────────────────────
  {
    slug: 'prompt-education',
    visibility: 'public',
    tier: 'catalog',
    audience: 'education',
    year: 2025,
    title: { ru: 'Конструктор промптов', en: 'Prompt builder' },
    tagline: {
      ru: 'Конструктор структурированных промптов: роль, задача, тема, аудитория, формат, ограничения',
      en: 'A structured prompt builder: role, task, topic, audience, format, constraints',
    },
    stack: ['HTML', 'JavaScript'],
    demoUrl: 'https://prompt-education.vercel.app/',
    repoUrl: `${GH}/prompt`,
  },
  {
    slug: 'ai-in-edtech',
    visibility: 'public',
    tier: 'catalog',
    audience: 'education',
    year: 2025,
    title: { ru: 'ИИ в образовании', en: 'AI in Education' },
    tagline: {
      ru: 'Интерактивная презентация «ИИ в образовании» на 12 слайдов',
      en: 'A 12-slide interactive presentation on AI in education',
    },
    stack: ['HTML', 'CSS', 'JavaScript'],
    demoUrl: 'https://ai-in-edtech.vercel.app/',
    repoUrl: `${GH}/Ai-in-edtech`,
  },
  {
    slug: 'pto-presentation',
    visibility: 'public',
    tier: 'catalog',
    audience: 'education',
    year: 2025,
    title: { ru: 'Профессия инженер ПТО', en: 'The site technical office engineer' },
    tagline: {
      ru: 'Учебная презентация для студентов-строителей: задачи инженера ПТО, мини-опросы и тест',
      en: 'A training presentation for construction students on the technical office engineer role, with quizzes',
    },
    stack: ['HTML', 'CSS', 'JavaScript'],
    demoUrl: 'https://pto-presentation.vercel.app/',
    repoUrl: `${GH}/pto-presentation`,
  },

  // ── Бизнес ──────────────────────────────────────────────────────────
  {
    slug: 'ai-sklad',
    visibility: 'public',
    tier: 'catalog',
    audience: 'business',
    year: 2026,
    title: { ru: 'ИИ-аналитик остатков', en: 'AI stock analyst' },
    tagline: {
      ru: 'Делит складские остатки на 7 групп и советует по каждой позиции: что сделать, к какому сроку и с каким эффектом',
      en: 'Sorts finished-goods stock into 7 groups and advises on each item: what to do, by when and with what effect',
    },
    stack: ['Python', 'HTML'],
    demoUrl: 'https://ai-sklad.vercel.app/',
    repoUrl: `${GH}/AI-SKLAD`,
  },
  {
    slug: 'berimaj',
    visibility: 'private',
    tier: 'catalog',
    audience: 'business',
    year: 2026,
    title: { ru: 'Мадам Беримаж', en: 'Madame Berimaj' },
    tagline: {
      ru: 'Сайт натуральной косметики ручной работы: подбор состава под кожу, аромаподбор, клуб и книга',
      en: 'A website for handmade natural cosmetics: formulas matched to your skin, scent matching, a club and a book',
    },
    stack: ['React', 'TypeScript', 'Tailwind', 'FastAPI', 'SQLite'],
    demoUrl: 'https://berimaj.vercel.app/',
  },

  // ── Здоровье ────────────────────────────────────────────────────────
  {
    slug: 'sill',
    visibility: 'private',
    tier: 'catalog',
    audience: 'health',
    year: 2026,
    title: { ru: 'SILL — трекер интервального голодания', en: 'SILL — intermittent fasting tracker' },
    tagline: {
      ru: 'Честный таймер окна питания: правится задним числом, работает офлайн, данные остаются в браузере',
      en: 'An honest eating-window timer: editable after the fact, works offline, data stays in your browser',
    },
    stack: ['React 19', 'Tailwind', 'Zustand', 'PWA'],
    demoUrl: 'https://silltime.vercel.app/',
  },
  {
    slug: 'aroma-sofia',
    visibility: 'private',
    tier: 'catalog',
    audience: 'health',
    year: 2026,
    title: { ru: 'Арома София', en: 'Aroma Sofia' },
    tagline: {
      ru: 'Персональные аромасмеси по дате рождения',
      en: 'Personal aromatherapy blends based on your birth date',
    },
    stack: ['Expo', 'React Native', 'i18next'],
    demoUrl: 'https://sofia-ru.vercel.app/',
    extraLinks: [
      { label: { ru: 'Международная версия', en: 'International edition' }, url: 'https://sofia-europe.vercel.app/' },
    ],
  },
  {
    slug: 'workout',
    visibility: 'public',
    tier: 'catalog',
    audience: 'health',
    year: 2026,
    title: { ru: 'Workout Coach', en: 'Workout Coach' },
    tagline: {
      ru: 'Генератор тренировок под уровень энергии и время: план и ссылка на таймер для часов',
      en: 'A workout generator tuned to your energy and time: a plan plus a timer link for your watch',
    },
    stack: ['HTML', 'JavaScript'],
    demoUrl: 'https://workout-gogo.vercel.app/',
    repoUrl: `${GH}/workout`,
  },

  // ── Игры ────────────────────────────────────────────────────────────
  {
    slug: 'gonka',
    visibility: 'private',
    tier: 'catalog',
    audience: 'games',
    year: 2026,
    title: { ru: 'GONKA — Orbital Race', en: 'GONKA — Orbital Race' },
    tagline: {
      ru: 'Настольная гонка в космосе: порталы, команды 2×2 и управление жестами',
      en: 'A space-age board race: portals, 2v2 teams and gesture controls',
    },
    stack: ['React 19', 'TypeScript', 'Socket.IO', 'PWA'],
    demoUrl: 'https://gonka-two.vercel.app/',
  },
  {
    slug: 'tigra',
    visibility: 'private',
    tier: 'catalog',
    audience: 'games',
    year: 2026,
    title: { ru: 'Tigra — инвест-игра', en: 'Tigra — investing game' },
    tagline: {
      ru: 'Инвест-игра в пять кубиков: ИИ-боты, бросок жестом, игра по сети',
      en: 'An investing game with five dice: AI bots, gesture rolls, online multiplayer',
    },
    stack: ['React 19', 'TypeScript', 'Socket.IO', 'PWA'],
    demoUrl: 'https://tigra-dice.vercel.app/',
  },
  {
    slug: 'smart-5',
    visibility: 'private',
    tier: 'catalog',
    audience: 'games',
    year: 2026,
    title: { ru: 'СМАРТ — игры в 5 букв', en: 'SMART — five-letter word games' },
    tagline: {
      ru: 'Дуэль слов из пяти букв на одном телефоне, соло-практика и джекпот. Офлайн и без рекламы',
      en: 'A five-letter word duel on one phone, plus solo practice and a jackpot. Offline, no ads',
    },
    stack: ['React 19', 'TypeScript', 'Zustand', 'PWA'],
    demoUrl: 'https://fiveletters.vercel.app/',
  },
  {
    slug: 'redjohn',
    visibility: 'private',
    tier: 'catalog',
    audience: 'games',
    year: 2026,
    title: { ru: 'REDJOHN', en: 'REDJOHN' },
    tagline: {
      ru: 'Сразись с Кровавым Джо: найди печати, запечатай дом и освободи район — 80 домов',
      en: 'Face Bloody Joe: find the seals, lock his house and free the neighbourhood — 80 houses',
    },
    stack: ['React 19', 'TypeScript', 'Zustand', 'PWA'],
    demoUrl: 'https://redjohngame.vercel.app/',
  },
  {
    slug: 'boardway',
    visibility: 'private',
    tier: 'catalog',
    audience: 'games',
    year: 2026,
    title: { ru: 'Boardway', en: 'Boardway' },
    tagline: {
      ru: 'Бизнес-симулятор: 24 месяца, автопарк видеогрузовиков, госзаказы и долги',
      en: 'A business sim: 24 months, a fleet of LED-screen trucks, government contracts and debt',
    },
    stack: ['Expo', 'React Native', 'TypeScript'],
    demoUrl: 'https://boardway-nsk.vercel.app/',
  },
  {
    slug: 'harry-quiz',
    visibility: 'public',
    tier: 'catalog',
    audience: 'games',
    year: 2026,
    title: { ru: 'Гарри Поттер — Magic Quiz', en: 'Harry Potter — Magic Quiz' },
    tagline: {
      ru: 'Викторина по миру Гарри Поттера: шляпа распределяет броском кубиков, дальше пять квизов нарастающей сложности',
      en: 'A Harry Potter quiz: the Sorting Hat rolls dice, then five quizzes of rising difficulty',
    },
    stack: ['Expo', 'React Native'],
    demoUrl: 'https://harryquiz.vercel.app/',
    repoUrl: `${GH}/harrypotterquiz`,
  },

  // ── Игры из первой попытки портфолио (ai-point, 2025): Олег разрешил публиковать 2026-10-27 ──
  {
    slug: 'puzzle-15',
    visibility: 'private',
    tier: 'catalog',
    audience: 'games',
    year: 2025,
    title: { ru: 'Пятнашки', en: '15 Puzzle' },
    tagline: {
      ru: 'Классическая головоломка в фирменном стиле заказчика: логика, рейтинг и соревнование',
      en: 'The classic sliding puzzle in a client’s branding: logic, a leaderboard and competition',
    },
    stack: ['Expo', 'React Native'],
    demoUrl: 'https://15-puzzle-mu.vercel.app/',
  },
  {
    slug: 'boston-consulter',
    visibility: 'private',
    tier: 'catalog',
    audience: 'games',
    year: 2025,
    title: { ru: 'Boston Consulter', en: 'Boston Consulter' },
    tagline: {
      ru: 'Игра-погружение в профессию бизнес-консультанта и её карьерные перспективы',
      en: 'A game that walks you through a business consultant’s job and career prospects',
    },
    stack: ['Expo', 'React Native'],
    demoUrl: 'https://junior-consulter.vercel.app/',
  },
  {
    slug: 'profconsalt',
    visibility: 'private',
    tier: 'catalog',
    audience: 'games',
    year: 2025,
    title: { ru: 'Profconsalt — раннер', en: 'Profconsalt runner' },
    tagline: {
      ru: 'Раннер на 90 секунд о сдаче отчётности: беспечный предприниматель уворачивается от бизнес-проблем и собирает бонусы',
      en: 'A 90-second runner about filing reports: a carefree entrepreneur dodges business problems and collects bonuses',
    },
    stack: ['Expo', 'React Native'],
    demoUrl: 'https://profconsalt.vercel.app/',
  },
];
