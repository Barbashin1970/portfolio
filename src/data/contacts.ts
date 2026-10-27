/**
 * Контакты (CLAUDE.md, «Паспорт»; Р-13). Ник и адрес совпадают в кнопках, футере
 * и JSON-LD — сверяет tests/contacts.test.ts (UC-4).
 */
export const CONTACTS = {
  telegram: {
    /** Одна «l»: Олег поправил 2026-10-26, профиль проверен. */
    handle: 'OlegBarbashin',
    url: 'https://t.me/OlegBarbashin',
  },
  email: 'banksnab@gmail.com',
  github: 'https://github.com/Barbashin1970',
  /** Адрес сайта: им делятся, когда рекомендуют Олега (UC-9). */
  site: 'https://barbashin1970.github.io/portfolio/',
  repo: 'https://github.com/Barbashin1970/portfolio',
} as const;

/**
 * Предел адреса t.me: длиннее — ответ 400. Замер 2026-10-27 (Node fetch): адрес в 4106 знаков
 * проходит, в 4130 — 400; латиница: 4032 — 200, 5032 — 400.
 */
export const TELEGRAM_URL_MAX = 4096;

/**
 * Чат в Telegram с текстом в поле ввода (Р-37). Параметр text — из документации Telegram
 * (core.telegram.org/api/links, «Public username links»); страница t.me передаёт его
 * приложению. Без текста — просто чат; слишком длинный текст — тоже просто чат, а не 400:
 * текст тогда копируют кнопкой.
 */
export function telegramHref(text = ''): string {
  const url = `${CONTACTS.telegram.url}?text=${encodeURIComponent(text)}`;
  return text && url.length <= TELEGRAM_URL_MAX ? url : CONTACTS.telegram.url;
}

/**
 * Поделиться в Telegram (UC-9): Telegram спросит, кому, и поставит в поле адрес и текст.
 * Формат — core.telegram.org/api/links, «Share links».
 */
export function telegramShareHref(url: string, text: string): string {
  return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
}

/** Письмо знакомому: адресата человек впишет сам, тема и текст со ссылкой — готовы. */
export function mailShareHref(subject: string, body: string): string {
  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/** Письмо с темой и заготовкой (Р-13): кириллица кодируется, адрес — из CONTACTS. */
export function mailtoHref({ subject, body }: { subject: string; body: string }): string {
  return `mailto:${CONTACTS.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
