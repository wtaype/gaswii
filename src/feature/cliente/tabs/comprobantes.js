// src/feature/cliente/tabs/comprobantes.js
// Controlador de la pestaña Comprobantes Electrónicos Oficiales (Boletas / Facturas)

import { getSmileLocal } from '../../auth/auth.js';

export function initTabComprobantes() {
  const smile = getSmileLocal();
  const contenedor = document.getElementById('comprobantesListaContenedor');

  if (!contenedor) return;

  // Si el cliente no tiene comprobantes emitidos aún
  contenedor.innerHTML = `
    <div class="tab-empty-state">
      <i class="fa-solid fa-file-invoice tab-empty-icon"></i>
      Aún no tienes comprobantes electrónicos emitidos.
      <p class="tab-empty-desc">Tus comprobantes electrónicos oficiales se sincronizarán aquí automáticamente al recibir tu primer balón de gas.</p>
    </div>
  `;
}

export const inicializarComprobantesTab = initTabComprobantes;
