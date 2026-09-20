// src/core/idioma/idioma.ts
// 🌐 Motor Central de Internacionalización (Core Hub & Federated Features)
// Unifica diccionarios globales y de cada feature con fallback automático a español.

import coreEs from './es.json';
import coreEn from './en.json';

import inicioEs from '../../feature/inicio/idioma/es.json';
import inicioEn from '../../feature/inicio/idioma/en.json';

import authEs from '../../feature/auth/idioma/es.json';
import authEn from '../../feature/auth/idioma/en.json';

import clienteEs from '../../feature/cliente/idioma/es.json';
import clienteEn from '../../feature/cliente/idioma/en.json';

// Feature Personal es 100% español operativo nativo (no requiere diccionarios JSON)
const localesPersonal = { es: {}, en: {} };

export type Idioma = 'es' | 'en';

export const IDIOMAS: Record<Idioma, { nombre: string; code: string }> = {
  es: { nombre: 'Español', code: 'es' },
  en: { nombre: 'English', code: 'en' }
};

export const DEFAULT_LANG: Idioma = 'es';

const localesCore: Record<string, typeof coreEs> = {
  es: coreEs,
  en: coreEn
};

const localesInicio: Record<string, typeof inicioEs> = {
  es: inicioEs,
  en: inicioEn
};

const localesAuth: Record<string, typeof authEs> = {
  es: authEs,
  en: authEn
};

const localesCliente: Record<string, typeof clienteEs> = {
  es: clienteEs,
  en: clienteEn
};

/**
 * Retorna las traducciones completas unificadas para el idioma solicitado.
 * Mantiene 100% de compatibilidad hacia atrás con getI18n(lang).section
 */
export function getI18n(lang: string = DEFAULT_LANG) {
  const l = (lang === 'en' ? 'en' : 'es') as Idioma;
  const core = localesCore[l] || localesCore[DEFAULT_LANG];
  const inicio = localesInicio[l] || localesInicio[DEFAULT_LANG];
  const auth = localesAuth[l] || localesAuth[DEFAULT_LANG];
  const cliente = localesCliente[l] || localesCliente[DEFAULT_LANG];
  const personal = localesPersonal[l] || localesPersonal[DEFAULT_LANG];

  return {
    // 🏛️ Transversales (Core)
    topbar: core.topbar,
    nav: core.nav,
    footer: core.footer,
    sistema: core.sistema,

    // 🚀 Feature Inicio (Landing Page)
    hero: inicio.hero,
    sos: inicio.sos,
    catalogo: inicio.catalogo,
    pesaje: inicio.pesaje,
    seguridad: inicio.seguridad,
    calculadora: inicio.calculadora,
    mapa: inicio.mapa,
    nosotros: inicio.nosotros,
    faq: inicio.faq,
    modales: inicio.modales,

    // 🔐 Feature Auth
    auth,

    // 👑 Feature Cliente VIP
    cliente,

    // 🏢 Feature Personal / Consola Staff
    personal
  };
}

/**
 * Acceso directo a una feature específica
 */
export function getFeatureI18n(feature: 'inicio' | 'auth' | 'cliente' | 'personal' | 'core', lang: string = DEFAULT_LANG) {
  const l = (lang === 'en' ? 'en' : 'es') as Idioma;
  switch (feature) {
    case 'inicio': return localesInicio[l] || localesInicio[DEFAULT_LANG];
    case 'auth': return localesAuth[l] || localesAuth[DEFAULT_LANG];
    case 'cliente': return localesCliente[l] || localesCliente[DEFAULT_LANG];
    case 'personal': return localesPersonal[l] || localesPersonal[DEFAULT_LANG];
    default: return localesCore[l] || localesCore[DEFAULT_LANG];
  }
}

export const useTraduccion = getI18n;



