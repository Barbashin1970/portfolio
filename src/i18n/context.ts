import { createContext, useContext } from 'react';
import type { Dict, Locale } from './index';

export interface I18n {
  locale: Locale;
  dict: Dict;
}

export const I18nContext = createContext<I18n | null>(null);

/** Язык страницы и её словарь. Язык — это адрес страницы (Р-04), а не состояние. */
export function useI18n(): I18n {
  const value = useContext(I18nContext);
  if (!value) throw new Error('useI18n вне I18nContext');
  return value;
}
