import { typograf } from '@/lib/typograf';
import { en } from './en';
import type { Locale } from './locale';
import { ru, type Dict } from './ru';

export type { Dict } from './ru';
export type { Locale } from './locale';

/** Типограф по всем строкам словаря, включая сегменты заголовка. */
function typografDeep<T>(value: T): T {
  if (typeof value === 'string') return typograf(value) as T;
  if (Array.isArray(value)) return value.map(typografDeep) as T;
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, typografDeep(item)])) as T;
  }
  return value;
}

const DICTS: Record<Locale, Dict> = { ru: typografDeep(ru), en };

export function getDict(locale: Locale): Dict {
  return DICTS[locale];
}
