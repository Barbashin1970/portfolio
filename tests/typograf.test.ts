import { describe, expect, it } from 'vitest';
import { NB_HYPHEN, NBSP, typograf } from '@/lib/typograf';

const visible = (text: string) => text.replaceAll(NBSP, '⍽').replaceAll(NB_HYPHEN, '‑̲');

describe('типограф (Р-10)', () => {
  it('склеивает заголовок hero там, где строка не должна рваться', () => {
    expect(visible(typograf('Проверю идею продукта за дни, а не за год'))).toBe('Проверю идею продукта за⍽дни, а⍽не⍽за⍽год');
    expect(visible(typograf('От идеи до работающего прототипа — один промпт'))).toBe(
      'От⍽идеи до⍽работающего прототипа⍽— один промпт',
    );
  });

  it('держит подряд идущие короткие слова', () => {
    expect(visible(typograf('и в городе'))).toBe('и⍽в⍽городе');
  });

  it('не трогает буквы внутри слов и короткое слово в конце строки', () => {
    expect(typograf('вход и выход в')).toBe(`вход и${NBSP}выход в`);
  });

  it('ставит неразрывный дефис в сокращениях', () => {
    expect(visible(typograf('ИИ-агенты и PWA-приложения'))).toBe('ИИ‑̲агенты и⍽PWA‑̲приложения');
  });

  it('не отрывает номер от сокращения', () => {
    expect(visible(typograf('документацию по ГОСТ 19 и отчёт по ГОСТ 7.32'))).toBe('документацию по⍽ГОСТ⍽19 и⍽отчёт по⍽ГОСТ⍽7.32');
    expect(visible(typograf('Проект 2026 года'))).toBe('Проект 2026 года');
  });

  it('дефис между словами выводит тире с неразрывным пробелом перед ним, дефис в слове не трогает', () => {
    expect(visible(typograf('Ядро - это ИИ-система'))).toBe('Ядро⍽— это ИИ‑̲система');
    expect(visible(typograf('пол-литра'))).toBe('пол-литра');
  });

  it('не меняет длину строки и не меняет уже обработанное', () => {
    const source = 'Опишите задачу одним сообщением — дальше моя работа: разбор, ТЗ, прототип по ссылке и проверка.';
    const once = typograf(source);
    expect(once).toHaveLength(source.length);
    expect(typograf(once)).toBe(once);
  });
});
