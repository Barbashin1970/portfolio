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
} as const;
