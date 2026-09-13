// src/feature/personal/idioma/idioma.js
// Motor federado de idiomas para la consola personal (Cero ternarios, escalable a N idiomas)

import es from './es.json';
import en from './en.json';

const locales = { es, en };

export const getPersonalI18n = (lang = 'es') => locales[lang] || locales.es;
export const t = (lang = 'es') => getPersonalI18n(lang);
export { es, en };
