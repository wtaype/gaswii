// src/core/idioma/idioma.ts
// 🌐 Motor de Internacionalización y Detección de Idiomas

import esLocale from './locales/es.json';
import enLocale from './locales/en.json';

export type Idioma = 'es' | 'en';

export const IDIOMAS: Record<Idioma, { nombre: string; flag: string }> = {
  es: { nombre: 'Español', flag: '🇵🇪' },
  en: { nombre: 'English', flag: '🇺🇸' }
};

export const DEFAULT_LANG: Idioma = 'es';

const locales: Record<Idioma, Record<string, any>> = {
  es: esLocale,
  en: enLocale
};

/**
 * Hook utilitario para obtener traducciones tipadas o fallback a clave
 */
export function useTranslations(lang: Idioma = DEFAULT_LANG) {
  const dict = locales[lang] || locales[DEFAULT_LANG];
  return function t(key: string, fallback?: string): string {
    const keys = key.split('.');
    let result: any = dict;
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        return fallback || key;
      }
    }
    return typeof result === 'string' ? result : fallback || key;
  };
}
