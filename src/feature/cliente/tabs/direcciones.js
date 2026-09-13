// src/feature/cliente/tabs/direcciones.js
// Controlador de la pestaña Mis Direcciones de Recarga Frecuentes

import { getSmileLocal, sincronizarSmile } from '../../auth/sesion.js';

export function initTabDirecciones() {
  const smile = getSmileLocal();
  const contenedor = document.getElementById('direccionesListaContenedor');

  if (!contenedor) return;

  const dirs = smile?.direcciones || [];

  if (dirs.length === 0) {
    contenedor.innerHTML = `
      <div class="tab-empty-state">
        <i class="fa-solid fa-map-location-dot tab-empty-icon"></i>
        Aún no tienes direcciones guardadas.
        <p class="tab-empty-desc">Registra tu casa o negocio para pedir en 1 solo toque sin volver a escribir tu dirección.</p>
        <button onclick="window.mostrarFormularioNuevaDireccion && window.mostrarFormularioNuevaDireccion()" class="btn-fire">
          <i class="fa-solid fa-plus"></i> Agregar mi primera dirección
        </button>
      </div>
    `;
  } else {
    contenedor.innerHTML = dirs.map((d, index) => `
      <div class="tab-dir-item">
        <div class="tab-dir-item-content">
          <div class="tab-dir-icon-box">
            <i class="fa-solid ${d.etiqueta === 'Trabajo' ? 'fa-briefcase' : 'fa-house'}"></i>
          </div>
          <div>
            <div class="tab-order-header">
              <strong class="tab-dir-title">${d.etiqueta || 'Mi Domicilio'}</strong>
              ${d.predeterminada ? '<span class="tab-dir-badge">Predeterminada</span>' : ''}
            </div>
            <div class="tab-dir-address">${d.direccion}</div>
            <div class="tab-dir-district">${d.distrito || 'Surquillo'}</div>
          </div>
        </div>
        <button onclick="window.eliminarDireccionCliente && window.eliminarDireccionCliente(${index})" title="Eliminar dirección" class="tab-dir-delete-btn">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
    `).join('');
  }
}

export async function guardarNuevaDireccion(etiqueta, direccion, distrito, predeterminada = false) {
  const smile = getSmileLocal();
  if (!smile) return;

  const nuevasDirs = [...(smile.direcciones || [])];
  if (predeterminada) {
    nuevasDirs.forEach(d => d.predeterminada = false);
  }

  nuevasDirs.push({
    id: `dir_${Date.now()}`,
    etiqueta,
    direccion,
    distrito,
    predeterminada: predeterminada || nuevasDirs.length === 0
  });

  const nuevoSmile = { ...smile, direcciones: nuevasDirs };
  try {
    localStorage.setItem('wiSmile', JSON.stringify(nuevoSmile));
    if (auth.currentUser) {
      await sincronizarSmile(auth.currentUser, { direcciones: nuevasDirs });
    }
  } catch (e) {}

  initTabDirecciones();
}

export async function eliminarDireccionCliente(index) {
  const smile = getSmileLocal();
  if (!smile || !smile.direcciones) return;

  const nuevasDirs = smile.direcciones.filter((_, i) => i !== index);
  const nuevoSmile = { ...smile, direcciones: nuevasDirs };

  try {
    localStorage.setItem('wiSmile', JSON.stringify(nuevoSmile));
    if (auth.currentUser) {
      await sincronizarSmile(auth.currentUser, { direcciones: nuevasDirs });
    }
  } catch (e) {}

  initTabDirecciones();
}

export const inicializarDireccionesTab = initTabDirecciones;
