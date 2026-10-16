// src/core/rutas.js
// 🗺️ Enrutador Central del Sistema Wii
// 100% Conectado a src/semillas/configurar.js (Cero código fijo)

import { configurarSistema } from '../semillas/configurar.js';

export const RUTAS = {
  inicio: configurarSistema.rutas?.inicio || '/',
  inicioEn: '/en',
  login: configurarSistema.rutas?.login || '/login',
  loginEn: '/en/login',
  cliente: configurarSistema.rutas?.cliente || '/cliente',
  personal: configurarSistema.rutas?.personal || '/personal',
  redes: configurarSistema.rutas?.redes || '/redes',
  terminos: configurarSistema.rutas?.terminos || '/terminos',
  privacidad: configurarSistema.rutas?.privacidad || '/privacidad'
};

export const ROL_PATH = configurarSistema.rutas?.roles || {
  cliente: '/cliente',
  personal: '/personal',
  gestor: '/personal',
  admin: '/personal'
};

export const NAV_LINKS = configurarSistema.navegacion || [];

export default { RUTAS, NAV_LINKS, ROL_PATH };