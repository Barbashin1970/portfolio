import { describe, expect, it } from 'vitest';
import { CONTACTS, mailShareHref, mailtoHref, TELEGRAM_URL_MAX, telegramHref, telegramShareHref } from '@/data/contacts';
import { projects } from '@/data/projects';
import { getDict } from '@/i18n';
import { en } from '@/i18n/en';
import { ru } from '@/i18n/ru';
import { answerOf, hasStep, nextStep, REQUEST_MAX, setStepLine, STEPS, stepLine, stepOptions } from '@/lib/request';

describe('контакты (UC-4)', () => {
  it('ник Telegram — с одной «l», ссылка собрана из него', () => {
    expect(CONTACTS.telegram.handle).toBe('OlegBarbashin');
    expect(CONTACTS.telegram.url).toBe(`https://t.me/${CONTACTS.telegram.handle}`);
  });

  it('почта — та, что Олег разрешил публиковать', () => {
    expect(CONTACTS.email).toBe('banksnab@gmail.com');
  });
});

describe('чат-конструктор запроса (Р-37)', () => {
  const t = ru.contact;

  it('шаги чата — те же и в том же порядке, что в словарях RU и EN', () => {
    expect(Object.keys(ru.contact.steps)).toEqual([...STEPS]);
    expect(Object.keys(en.contact.steps)).toEqual([...STEPS]);
  });

  it('первый вариант задачи — разбор процессов, главная работа (Р-36); последний — приглашение в команду', () => {
    const needs = Object.keys(t.steps.need.options);
    expect(needs[0]).toBe('processes');
    expect(needs.at(-1)).toBe('invite');
  });

  it('кнопка пишет строку своего шага, первая — вместе с приветствием', () => {
    expect(setStepLine(t, '', 'need', 'processes').split('\n')).toEqual([
      'Здравствуйте, Олег!',
      'Задача: найти, где ИИ снимет рутину с сотрудников',
    ]);
  });

  it('строки встают по порядку шагов, а не по порядку нажатий', () => {
    let text = setStepLine(t, '', 'when', 'soon');
    text = setStepLine(t, text, 'need', 'processes');
    expect(text.split('\n')).toEqual([
      'Здравствуйте, Олег!',
      'Задача: найти, где ИИ снимет рутину с сотрудников',
      'Срок: в ближайшие три месяца',
    ]);
  });

  it('правка руками остаётся: кнопка меняет только строку своего шага', () => {
    const edited = `${setStepLine(t, '', 'need', 'processes')}\nПилот — на одном складе`;
    const next = setStepLine(t, edited, 'field', 'business');
    expect(next.split('\n')).toEqual([
      'Здравствуйте, Олег!',
      'Задача: найти, где ИИ снимет рутину с сотрудников',
      'Сфера: бизнес и торговля',
      'Пилот — на одном складе',
    ]);
    // Строку шага, поправленную руками, кнопка заменяет целиком.
    const rewritten = next.replace('с сотрудников', 'с кладовщиков');
    expect(answerOf(t, rewritten, 'need')).toBeUndefined();
    expect(hasStep(t, rewritten, 'need')).toBe(true);
    expect(setStepLine(t, rewritten, 'need', 'training').split('\n')[1]).toBe(stepLine(t, 'need', 'training'));
  });

  it('повторное нажатие убирает строку; одно приветствие — уже не запрос', () => {
    const text = setStepLine(t, '', 'need', 'docs');
    expect(answerOf(t, text, 'need')).toBe('docs');
    expect(setStepLine(t, text, 'need', null)).toBe('');
    expect(setStepLine(t, `${text}\nСвой вопрос`, 'need', null)).toBe('Здравствуйте, Олег!\nСвой вопрос');
  });

  it('в свой текст без приветствия строка шага встаёт в конец', () => {
    expect(setStepLine(t, 'Хочу обсудить склад', 'need', 'processes')).toBe(
      'Хочу обсудить склад\nЗадача: найти, где ИИ снимет рутину с сотрудников',
    );
  });

  it('следующий шаг — первый без строки после текущего, потом с начала; все есть — null', () => {
    const one = setStepLine(t, '', 'need', 'docs');
    expect(nextStep(t, one, 'need')).toBe('field');
    const tail = ['field', 'has', 'when'].reduce((text, step) => setStepLine(t, text, step as 'field', Object.keys(stepOptions(t, step as 'field'))[0]), '');
    expect(nextStep(t, tail, 'when')).toBe('need');
    expect(nextStep(t, setStepLine(t, tail, 'need', 'docs'), 'has')).toBeNull();
  });

  it.each(['ru', 'en'] as const)('%s: самый длинный запрос доходит до Telegram и письма без потерь', (locale) => {
    const d = getDict(locale).contact;
    const text = STEPS.reduce((acc, step) => {
      const [longest] = Object.entries(stepOptions(d, step)).reduce((a, b) => (b[1].line.length > a[1].line.length ? b : a));
      return setStepLine(d, acc, step, longest);
    }, '');
    expect(text.split('\n')).toHaveLength(STEPS.length + 1);
    expect(text.length).toBeLessThanOrEqual(REQUEST_MAX);

    const telegram = new URL(telegramHref(text));
    expect(`${telegram.origin}${telegram.pathname}`).toBe(CONTACTS.telegram.url);
    expect(telegram.searchParams.get('text')).toBe(text);

    const mail = new URL(mailtoHref({ subject: d.subject, body: text }));
    expect(mail.pathname).toBe(CONTACTS.email);
    expect(mail.searchParams.get('subject')).toBe(d.subject);
    expect(mail.searchParams.get('body')).toBe(text);
  });

  it('полное поле кириллицей — ещё ссылка с текстом; длиннее предела t.me — просто чат, не 400', () => {
    const full = telegramHref('Ж'.repeat(REQUEST_MAX));
    expect(full).toContain('?text=');
    expect(full.length).toBeLessThanOrEqual(TELEGRAM_URL_MAX);
    expect(telegramHref('—'.repeat(2000))).toBe(CONTACTS.telegram.url);
    expect(telegramHref('')).toBe(CONTACTS.telegram.url);
  });
});

describe('порекомендовать Олега (UC-9)', () => {
  it('делятся адресом сайта на github.io — его не блокируют, в отличие от хостингов демо', () => {
    expect(CONTACTS.site).toBe('https://barbashin1970.github.io/portfolio/');
  });

  it.each(['ru', 'en'] as const)('%s: Telegram и письмо несут адрес сайта и готовый текст', (locale) => {
    const r = getDict(locale).contact.recommend;
    const telegram = new URL(telegramShareHref(CONTACTS.site, r.text));
    expect(`${telegram.origin}${telegram.pathname}`).toBe('https://t.me/share/url');
    expect(telegram.searchParams.get('url')).toBe(CONTACTS.site);
    expect(telegram.searchParams.get('text')).toBe(r.text);

    const mail = new URL(mailShareHref(r.subject, `${r.text}\n\n${CONTACTS.site}`));
    expect(mail.pathname).toBe('');
    expect(mail.searchParams.get('subject')).toBe(r.subject);
    expect(mail.searchParams.get('body')).toContain(CONTACTS.site);
  });
});

describe('подсказка о доступе к демо', () => {
  // Подсказка правдива, пока часть демо живёт вне github.io — на vercel.app и railway.app.
  it('часть демо — на vercel.app или railway.app', () => {
    const elsewhere = projects.filter((p) => p.demoUrl && /\.(vercel|up\.railway)\.app\//.test(p.demoUrl));
    expect(elsewhere.length).toBeGreaterThan(0);
  });
});
