// src/feature/personal/tabs/tabsPersonalController.js
// Controlador Central de Pestañas (Tabs) para la Consola Operativa Staff

const KEY_TAB_PERSONAL = 'wiPersonalTabActivo';

export function cambiarTabPersonal(tabId) {
  // 1. Desactivar todos los botones y ocultar todos los paneles
  const botones = document.querySelectorAll('.personal-tab-btn');
  const paneles = document.querySelectorAll('.personal-tab-panel');

  botones.forEach((btn) => {
    btn.classList.remove('active');
    btn.setAttribute('aria-selected', 'false');
  });

  paneles.forEach((panel) => {
    panel.classList.remove('active');
  });

  // 2. Activar el botón y panel seleccionado
  const btnActivo = document.getElementById('tabBtn_personal_' + tabId);
  const panelActivo = document.getElementById('tabPanel_personal_' + tabId);

  if (btnActivo) {
    btnActivo.classList.add('active');
    btnActivo.setAttribute('aria-selected', 'true');
  }

  if (panelActivo) {
    panelActivo.classList.add('active');
  }

  // 3. Guardar pestaña activa en localStorage
  try {
    localStorage.setItem(KEY_TAB_PERSONAL, tabId);
  } catch (e) {}

  // 4. Disparar filtros o refrescos si aplica
  if (typeof window !== 'undefined') {
    if (tabId === 'tabla' && window.filtrarTablaVentas) {
      window.filtrarTablaVentas();
    }
  }
}

export function initTabsPersonal() {
  const guardada = localStorage.getItem(KEY_TAB_PERSONAL) || 'resumen';
  cambiarTabPersonal(guardada);
}
