// src/core/idioma/idioma.ts
// 🌐 Motor de Internacionalización y Detección de Idiomas (Español por Defecto & Fallback)

import esLocale from './es.json';
import enLocale from './en.json';

export type Idioma = 'es' | 'en';

export const IDIOMAS: Record<Idioma, { nombre: string; code: string }> = {
  es: { nombre: 'Español', code: 'es' },
  en: { nombre: 'English', code: 'en' }
};

export const DEFAULT_LANG: Idioma = 'es';

const locales: Record<string, Record<string, any>> = {
  es: esLocale,
  en: enLocale
};

/**
 * Retorna las traducciones para el idioma solicitado con fallback automático a español.
 */
export function getI18n(lang: string = DEFAULT_LANG) {
  const dict = locales[lang] || locales[DEFAULT_LANG];
  const base = locales[DEFAULT_LANG];

  return {
    topbar: { ...base.topbar, ...(dict.topbar || {}) },
    nav: { ...base.nav, ...(dict.nav || {}) },
    hero: { ...base.hero, ...(dict.hero || {}) },
    sos: { ...base.sos, ...(dict.sos || {}) },
    catalogo: { ...base.catalogo, ...(dict.catalogo || {}) },
    pesaje: { ...base.pesaje, ...(dict.pesaje || {}) },
    seguridad: { ...base.seguridad, ...(dict.seguridad || {}) },
    calculadora: { ...base.calculadora, ...(dict.calculadora || {}) },
    mapa: { ...base.mapa, ...(dict.mapa || {}) },
    nosotros: { ...base.nosotros, ...(dict.nosotros || {}) },
    faq: { ...base.faq, ...(dict.faq || {}) },
    footer: { ...base.footer, ...(dict.footer || {}) },
    modales: { ...base.modales, ...(dict.modales || {}) },
  };
}

export const useTraduccion = getI18n;


