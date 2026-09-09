// src/feature/cliente/tabs/resumen.js
// Controlador de la pestaña Resumen (Reorden en 1 Clic, Nivel de Gas y Estado General)

import { getSmileLocal } from '../../auth/auth.js';
import negocio from '../../../negocio.js';

export function initTabResumen() {
  const smile = getSmileLocal();
  const dirEl = document.getElementById('resumenDireccionText');
  const balonEl = document.getElementById('resumenBalonText');
  const puntosEl = document.getElementById('resumenPuntosText');

  if (smile) {
    if (balonEl) balonEl.textContent = smile.pin || 'Balón SOLGAS de 10 kg';
    if (dirEl) {
      const dirPredet = smile.direcciones?.find((d) => d.predeterminada) || smile.direcciones?.[0];
      dirEl.textContent = dirPredet ? `${dirPredet.direccion} (${dirPredet.distrito})` : 'Registra tu primera dirección de entrega';
    }
    if (puntosEl) {
      puntosEl.textContent = `${smile.puntos !== undefined ? smile.puntos : 50} Pts`;
    }
  }
}

export function pedirReordenExpress() {
  const smile = getSmileLocal();
  const dir = smile?.direcciones?.[0]?.direccion || 'Mi domicilio registrado';
  const dist = smile?.direcciones?.[0]?.distrito || 'Surquillo';
  const prod = smile?.pin || 'Balón SOLGAS de 10 kg';
  const usuario = smile?.usuario ? ` (@${smile.usuario})` : '';

  const msg = `¡Buenas tardes! Deseo repetir mi pedido express de gas: *${prod}*.\n\n` +
              `📍 *Dirección:* ${dir} (${dist})\n` +
              `👤 *Cliente VIP:* ${smile?.nombre || 'Vecino'}${usuario}\n` +
              `💳 *Pago:* Yape / Efectivo en puerta\n\n` +
              `Por favor confírmenme el despacho prioritario, ¡muchas gracias!`;

  const url = `https://api.whatsapp.com/send?phone=${negocio.telefonoLimpio}&text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

export const inicializarResumenTab = initTabResumen;
