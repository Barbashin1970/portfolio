import { describe, expect, it } from 'vitest';
import { CONTACTS } from '@/data/contacts';

describe('контакты (UC-4)', () => {
  it('ник Telegram — с одной «l», ссылка собрана из него', () => {
    expect(CONTACTS.telegram.handle).toBe('OlegBarbashin');
    expect(CONTACTS.telegram.url).toBe(`https://t.me/${CONTACTS.telegram.handle}`);
  });

  it('почта — та, что Олег разрешил публиковать', () => {
    expect(CONTACTS.email).toBe('banksnab@gmail.com');
  });
});
