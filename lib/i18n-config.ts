export const locales = ['en', 'es', 'fr', 'ja'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'es';

export const getLocaleDisplayName = (locale: string) => {
  switch (locale) {
    case 'en': return 'English';
    case 'es': return 'Español';
    case 'fr': return 'Français';
    case 'ja': return '日本語';
    default: return locale;
  }
};

/**
 * ISO 3166-1 alpha-2 for flag assets. Unicode regional-flag emoji often renders
 * as two letters (e.g. "GB") on Windows instead of a colored flag — use raster/SVG flags instead.
 */
export const getLocaleFlagCountryCode = (locale: string): string => {
  switch (locale) {
    case 'en':
      return 'us';
    case 'es':
      return 'es';
    case 'fr':
      return 'fr';
    case 'ja':
      return 'jp';
    default:
      return 'xx';
  }
};
