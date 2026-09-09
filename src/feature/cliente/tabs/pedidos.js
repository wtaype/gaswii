// src/feature/cliente/tabs/pedidos.js
// Controlador de la pestaña Mis Pedidos y Radar de Motorizado en Tiempo Real

import { getSmileLocal } from '../../auth/auth.js';

export function initTabPedidos() {
  const smile = getSmileLocal();
  const estadoTrackingEl = document.getElementById('pedidosTrackingEstado');
  const listaHistorialEl = document.getElementById('pedidosHistorialLista');

  // Si no hay pedidos activos, muestra estado limpio de base
  if (estadoTrackingEl) {
    estadoTrackingEl.innerHTML = `
      <div class="tab-tracking-base">
        <i class="fa-solid fa-motorcycle tab-tracking-base-icon"></i>
        <div>
          <strong class="tab-tracking-base-title">Flota en Base Central Jr. Dante 260</strong>
          <span class="tab-tracking-base-sub">Tiempo estimado para tu zona: 15 - 20 minutos con balanza digital a bordo.</span>
        </div>
      </div>
    `;
  }

  // Carga pedidos registrados del cliente si existen
  try {
    const pedidosRaw = localStorage.getItem('gaswii_pedidos_cliente');
    const pedidos = pedidosRaw ? JSON.parse(pedidosRaw) : [];

    if (listaHistorialEl) {
      if (pedidos.length === 0) {
        listaHistorialEl.innerHTML = `
          <div class="tab-empty-state">
            <i class="fa-solid fa-clock-rotate-left tab-empty-icon"></i>
            Aún no tienes pedidos registrados en este dispositivo.
            <div class="tab-empty-btn-wrap">
              <button onclick="window.pedirReordenExpress && window.pedirReordenExpress()" class="btn-whatsapp">
                <i class="fa-brands fa-whatsapp"></i> Hacer mi primer pedido
              </button>
            </div>
          </div>
        `;
      } else {
        listaHistorialEl.innerHTML = pedidos.map((p) => `
          <div class="tab-order-item">
            <div>
              <div class="tab-order-header">
                <strong class="tab-order-title">${p.producto}</strong>
                <span class="tab-order-badge">${p.estado || 'Entregado'}</span>
              </div>
              <div class="tab-order-sub">${p.fecha || 'Reciente'} — ${p.direccion}</div>
            </div>
            <div>
              <span class="tab-order-amount">S/ ${parseFloat(p.monto || 48).toFixed(2)}</span>
            </div>
          </div>
        `).join('');
      }
    }
  } catch (e) {}
}

export const inicializarPedidosTab = initTabPedidos;
