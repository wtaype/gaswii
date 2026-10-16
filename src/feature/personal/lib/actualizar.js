// src/feature/personal/lib/actualizar.js
// 🚀 Fachada de Re-Deploy en Cloudflare y Sincronización Web
// Delega en el Motor Central Universal @core/servicios/actualizar.js
// Cero duplicación de lógica · Debounce consolidado · Fondo 100% silencioso

import { dispararDeploySilencioso } from '@core/servicios/actualizar.js';

/**
 * Solicita actualización y re-deploy consolidado en Cloudflare a través del motor central
 * @param {Object} opciones
 * @param {string} opciones.motivo - Motivo descriptivo del cambio ('negocio', 'productos', etc.)
 */
export function solicitarActualizacionWeb({
  motivo = 'actualización'
} = {}) {
  dispararDeploySilencioso(motivo);
}

export default { solicitarActualizacionWeb };

