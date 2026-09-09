// src/feature/cliente/tabs/tabsController.js
// Gestor Central de Pestañas (Tabs) de Cliente VIP: Resumen, Pedidos, Direcciones, Puntos, Comprobantes

import { initTabResumen } from './resumen.js';
import { initTabPedidos } from './pedidos.js';
import { initTabDirecciones } from './direcciones.js';
import { initTabPuntos } from './puntos.js';
import { initTabComprobantes } from './comprobantes.js';

const KEY_TAB_ACTIVA = 'wiClienteTabActivo';

export function cambiarTabCliente(tabId) {
  // 1. Desactivar todos los botones y paneles
  const botones = document.querySelectorAll('.cliente-tab-btn');
  const paneles = document.querySelectorAll('.cliente-tab-panel');

  botones.forEach((btn) => {
    btn.classList.remove('active');
    btn.setAttribute('aria-selected', 'false');
  });

  paneles.forEach((panel) => {
    panel.classList.remove('active');
  });

  // 2. Activar el botón y panel seleccionado
  const btnActivo = document.getElementById(`tabBtn_${tabId}`);
  const panelActivo = document.getElementById(`tabPanel_${tabId}`);

  if (btnActivo) {
    btnActivo.classList.add('active');
    btnActivo.setAttribute('aria-selected', 'true');
  }

  if (panelActivo) {
    panelActivo.classList.add('active');
  }

  // 3. Guardar estado en localStorage para recordar pestaña al recargar
  try {
    localStorage.setItem(KEY_TAB_ACTIVA, tabId);
  } catch (e) {}

  // 4. Inicializar datos de la pestaña activa
  if (tabId === 'resumen') initTabResumen();
  else if (tabId === 'pedidos') initTabPedidos();
  else if (tabId === 'direcciones') initTabDirecciones();
  else if (tabId === 'puntos') initTabPuntos();
  else if (tabId === 'comprobantes') initTabComprobantes();
}

export function initTabsController() {
  const guardada = localStorage.getItem(KEY_TAB_ACTIVA) || 'resumen';
  cambiarTabCliente(guardada);
}

export const inicializarTabsCliente = initTabsController;

if (typeof window !== 'undefined') {
  window.cambiarTabCliente = cambiarTabCliente;
}
