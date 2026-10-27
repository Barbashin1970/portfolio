/**
 * Запрос Олегу из чата в «Контакте» (Р-37): идея промпт-конструктора Олега, доработанная
 * под чат. Кнопки шагов пишут в поле запроса строку своего шага — «Задача: …», «Сфера: …»,
 * а человек правит текст в поле как хочет. Источник правды — текст поля: ответ кнопкой
 * виден по строке шага в нём. Чистые функции — их проверяет tests/contacts.test.ts.
 */
import type { Dict } from '@/i18n';

type ContactDict = Dict['contact'];

/**
 * Предел поля запроса, знаков. Кириллица в адресе — по 6 знаков на букву: 600 букв дают адрес
 * в 3632 знака, ниже предела t.me (TELEGRAM_URL_MAX в src/data/contacts.ts).
 */
export const REQUEST_MAX = 600;

/** Вариант ответа: подпись кнопки и строка в запросе. */
export interface StepOption {
  label: string;
  line: string;
}

/** Порядок шагов — порядок вопросов в чате и строк в запросе. */
export const STEPS = ['need', 'field', 'has', 'when'] as const satisfies readonly (keyof ContactDict['steps'])[];

export type StepId = (typeof STEPS)[number];

export function stepOptions(t: ContactDict, step: StepId): Record<string, StepOption> {
  return t.steps[step].options;
}

/** Строка шага в запросе: «Задача: найти, где ИИ снимет рутину с сотрудников». */
export function stepLine(t: ContactDict, step: StepId, option: string): string {
  return `${t.steps[step].prefix}: ${stepOptions(t, step)[option].line}`;
}

const lineOf = (t: ContactDict, lines: string[], step: StepId) =>
  lines.findIndex((line) => line.startsWith(`${t.steps[step].prefix}:`));

/** У шага есть строка в тексте — от кнопки или поправленная руками. */
export function hasStep(t: ContactDict, text: string, step: StepId): boolean {
  return lineOf(t, text.split('\n'), step) >= 0;
}

/** Выбранная кнопка шага — та, чья строка стоит в тексте дословно; поправленная строка — уже не кнопка. */
export function answerOf(t: ContactDict, text: string, step: StepId): string | undefined {
  const lines = text.split('\n');
  return Object.keys(stepOptions(t, step)).find((option) => lines.includes(stepLine(t, step, option)));
}

/**
 * Кнопка меняет только строку своего шага, остальной текст остаётся, как его поправил
 * человек. option = null — строка шага уходит. Новая строка встаёт после строк предыдущих
 * шагов, иначе — после приветствия; в чужой текст без приветствия — в конец. Если
 * осталось одно приветствие — запроса нет.
 */
export function setStepLine(t: ContactDict, text: string, step: StepId, option: string | null): string {
  const lines = text === '' ? [] : text.split('\n');
  const at = lineOf(t, lines, step);
  if (option === null) {
    if (at >= 0) lines.splice(at, 1);
  } else if (at >= 0) {
    lines[at] = stepLine(t, step, option);
  } else {
    if (lines.length === 0) lines.push(t.chat.hello);
    const earlier = Math.max(...STEPS.slice(0, STEPS.indexOf(step)).map((s) => lineOf(t, lines, s)), -1);
    const anchor = earlier >= 0 ? earlier : lines[0] === t.chat.hello ? 0 : lines.length - 1;
    lines.splice(anchor + 1, 0, stepLine(t, step, option));
  }
  return lines.every((line) => line === t.chat.hello || line.trim() === '') ? '' : lines.join('\n');
}

/** Следующий шаг без строки: сначала после текущего, потом с начала; все есть — null. */
export function nextStep(t: ContactDict, text: string, from: StepId): StepId | null {
  const i = STEPS.indexOf(from);
  return [...STEPS.slice(i + 1), ...STEPS.slice(0, i)].find((step) => !hasStep(t, text, step)) ?? null;
}
