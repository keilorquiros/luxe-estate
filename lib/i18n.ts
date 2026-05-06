import 'server-only';
import { locales, defaultLocale, Locale } from './i18n-config';

const dictionaries = {
  en: () => import('../dictionaries/en.json').then((module) => module.default),
  es: () => import('../dictionaries/es.json').then((module) => module.default),
  fr: () => import('../dictionaries/fr.json').then((module) => module.default),
  ja: () => import('../dictionaries/ja.json').then((module) => module.default),
};

export const getDictionary = async (locale: Locale) => {
  if (!locales.includes(locale)) {
    return dictionaries[defaultLocale]();
  }
  return dictionaries[locale]();
};

export * from './i18n-config';
