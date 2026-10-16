// src/core/servicios/actualizar.js
// 🚀 Motor Central de Actualización Universal Zero-Waste (Gaswii Web)
// Centraliza: Local-First (0ms) + Dirty Checking + Firestore Granular + Background Deploy Silencioso
// Elimina tiempos de espera y bloqueos de pantalla; ahorra 100% de cuotas de Firebase en datos no modificados.

import { savels, getls, Notificacion } from '@widev';
import { db } from './firebase.js';
import { doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { hidratarNegocioEnDOM } from './hidratarNegocio.js';

let _timerDebounceCloudflare = null;
let _desplegandoEnFondo = false;

/**
 * Motor Central de Actualización Inteligente Zero-Waste
 * @param {Object} params
 * @param {'negocio'|'productos'|'blogs'|'whatsapp'|'comprobantes'|'clientes'} params.modulo
 * @param {string} params.coleccion - Colección en Firestore ('negocio', 'productos', etc.)
 * @param {string} params.docId - ID del documento ('principal', 'balon-10kg', etc.)
 * @param {string} params.storageKey - Clave en LocalStorage ('wi_negocio', 'wi_productos')
 * @param {string} params.evento - Evento reactivo ('wi:negocio-actualizado', 'wi:productos-actualizado')
 * @param {Object} params.datos - Objeto de datos normalizado
 * @param {boolean} [params.redeploy=true] - Si requiere refrescar el HTML estático en Cloudflare para Googlebot
 * @param {string} [params.mensajeExito='Cambios guardados al instante'] - Feedback visual
 * @param {boolean} [params.forzarWrite=false] - Omitir dirty check si se requiere re-escritura forzada
 * @returns {Promise<{ ok: boolean, modificado: boolean, datos: any }>}
 */
export async function actualizarCentral({
  modulo = 'negocio',
  coleccion = 'negocio',
  docId = 'principal',
  storageKey = 'wi_negocio',
  evento = 'wi:negocio-actualizado',
  datos = {},
  listaStorage = undefined,
  redeploy = true,
  mensajeExito = 'Cambios guardados al instante',
  forzarWrite = false
}) {
  // 1. DIRTY CHECKING INTELIGENTE (Evita writes innecesarios si nada cambió)
  if (!forzarWrite) {
    try {
      const previoRaw = getls(storageKey);
      if (previoRaw) {
        if (listaStorage !== undefined && Array.isArray(previoRaw)) {
          // Si es una lista (ej. productos), comparar el ítem específico
          const previoItem = previoRaw.find(x => x && x.id === docId);
          if (previoItem && JSON.stringify(previoItem) === JSON.stringify(datos)) {
            Notificacion('No se detectaron cambios en este elemento', 'info', 2000);
            return { ok: true, modificado: false, datos };
          }
        } else {
          // Documento único (ej. negocio/principal)
          const nuevoStr = JSON.stringify(datos);
          const previoStr = JSON.stringify(previoRaw);
          if (previoStr === nuevoStr) {
            Notificacion('No se detectaron cambios nuevos', 'info', 2000);
            return { ok: true, modificado: false, datos };
          }
        }
      }
    } catch (e) {}
  }

  // 2. LOCAL-FIRST INMEDIATO (0 ms en pantalla tipo App Nativa)
  const aGuardar = listaStorage !== undefined ? listaStorage : datos;
  try {
    savels(storageKey, aGuardar);
    if (modulo === 'negocio') {
      try { savels('minegocio', aGuardar); } catch (e) {}
      try { savels('gaswii_negocio', aGuardar); } catch (e) {}
    } else if (modulo === 'productos') {
      try { savels('gaswii_productos', aGuardar); } catch (e) {}
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(evento, { detail: aGuardar }));
      if (modulo === 'negocio') {
        window.dispatchEvent(new CustomEvent('gaswii:negocio-actualizado', { detail: aGuardar }));
        hidratarNegocioEnDOM(datos);
      } else if (modulo === 'productos') {
        window.dispatchEvent(new CustomEvent('gaswii:productos-actualizado', { detail: aGuardar }));
      }
    }
  } catch (err) {
    console.warn('[actualizarCentral] Error en LocalStorage:', err);
  }

  Notificacion(mensajeExito, 'success', 2500);

  // 3. PERSISTENCIA GRANULAR EN FIRESTORE (1 sola escritura atómica en segundo plano)
  try {
    if (db) {
      const docRef = doc(db, coleccion, docId);
      await setDoc(docRef, {
        ...datos,
        actualizado: serverTimestamp()
      }, { merge: true });
    }
  } catch (err) {
    console.warn(`[actualizarCentral] Error silencioso al escribir en ${coleccion}/${docId}:`, err?.message || err);
  }

  // 4. CLOUDFLARE BACKGROUND DEPLOY (Silencioso con Debounce Consolidado de 5s)
  if (redeploy) {
    dispararDeploySilencioso(modulo);
  }

  return { ok: true, modificado: true, datos };
}

/**
 * Eliminación granular en Firestore y Local-First
 */
export async function eliminarCentral({
  modulo = 'productos',
  coleccion = 'productos',
  docId = '',
  storageKey = 'wi_productos',
  evento = 'wi:productos-actualizado',
  listaActualizada = [],
  redeploy = true,
  mensajeExito = 'Elemento eliminado con éxito'
}) {
  if (!docId) return { ok: false, error: 'Sin docId' };

  // 1. Local-First inmediato
  try {
    savels(storageKey, listaActualizada);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(evento, { detail: listaActualizada }));
    }
  } catch (e) {}

  Notificacion(mensajeExito, 'info', 2500);

  // 2. Eliminar en Firestore
  try {
    if (db) {
      await deleteDoc(doc(db, coleccion, docId));
    }
  } catch (err) {
    console.warn(`[actualizarCentral] Error al eliminar ${coleccion}/${docId}:`, err);
  }

  // 3. Deploy consolidado
  if (redeploy) {
    dispararDeploySilencioso(modulo);
  }

  return { ok: true, modificado: true };
}

/**
 * Disparador consolidado y silencioso de Webhook Cloudflare en segundo plano
 * Espera 5 segundos de inactividad para consolidar múltiples cambios en 1 solo build
 */
export function dispararDeploySilencioso(motivo = 'cambio') {
  if (_timerDebounceCloudflare) {
    clearTimeout(_timerDebounceCloudflare);
  }

  _timerDebounceCloudflare = setTimeout(async () => {
    const hookUrl = import.meta.env.PUBLIC_CLOUDFLARE_DEPLOY_HOOK;
    if (!hookUrl || _desplegandoEnFondo) return;

    try {
      _desplegandoEnFondo = true;
      console.log(`[actualizarCentral] Sincronizando HTML estático en Cloudflare [${motivo}]...`);
      await fetch(hookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' }
      });
      console.log(`[actualizarCentral] Webhook Cloudflare enviado con éxito.`);
    } catch (e) {
      console.warn('[actualizarCentral] Webhook diferido:', e);
    } finally {
      _desplegandoEnFondo = false;
    }
  }, 5000);
}

export default {
  actualizarCentral,
  eliminarCentral,
  dispararDeploySilencioso
};
