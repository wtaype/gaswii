// src/feature/cliente/tabs/puntos.js
// Controlador de la pestaña Puntos, Billetera y Recompensas VIP

import { getSmileLocal } from '../../auth/sesion.js';

export function initTabPuntos() {
  const smile = getSmileLocal();
  const puntos = smile?.puntos !== undefined ? smile.puntos : 50;

  const saldoEl = document.getElementById('puntosSaldoDisplay');
  const barraEl = document.getElementById('puntosBarraProgreso');
  const faltanEl = document.getElementById('puntosFaltantesText');

  if (saldoEl) saldoEl.textContent = `${puntos}`;
  
  // Meta: 200 puntos = 1 balón gratis (S/ 48 de ahorro)
  const meta = 200;
  const porcentaje = Math.min(100, Math.round((puntos / meta) * 100));
  const faltan = Math.max(0, meta - puntos);

  if (barraEl) barraEl.style.width = `${porcentaje}%`;
  if (faltanEl) {
    faltanEl.textContent = faltan > 0
      ? `Te faltan ${faltan} puntos para canjear tu Balón 10kg Gratis.`
      : '¡Felicidades! Tienes puntos suficientes para canjear tu Balón Gratis.';
  }
}

export const inicializarPuntosTab = initTabPuntos;
