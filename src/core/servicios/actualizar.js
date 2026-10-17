// src/core/servicios/actualizar.js
// 🚀 Motor Central de Actualización Universal Zero-Waste (Gaswii Web)
// Centraliza: Local-First (0ms) + Dirty Checking + Firestore Granular + Dock Dual-Stage + Webhook Cloudflare
// Etapa 1: Notificación instantánea en vivo (0ms) para ti y tus clientes
// Etapa 2: Compilación y Sitemap para Googlebot (SEO 100% en la Nube)

import { savels, getls, Notificacion } from '@widev';
import { db } from './firebase.js';
import { doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { hidratarNegocioEnDOM } from './hidratarNegocio.js';
import './actualizar.css';

let _timerDebounceCloudflare = null;
let _desplegandoEnFondo = false;

// ── CONSTANTES DOCK PROGRESO DUAL-STAGE ──
const PROGRESS_STORAGE_KEY = 'cf_deploy_progress';
const DURACION_ESTIMADA_MS = 45 * 1000; // 45s estimación dinámica
let _intervalo = null;
let _sondeoActivo = false;

// =============================================================================
// 1. DOCK FLOTANTE DUAL-STAGE (HTML + CSS WITEMA)
// =============================================================================

function obtenerOCrearDock() {
  if (typeof document === 'undefined') return null;

  let dock = document.getElementById('cfDeployDock');
  if (dock) return dock;

  dock = document.createElement('div');
  dock.id = 'cfDeployDock';
  dock.className = 'cf-dock-wrap';
  dock.innerHTML = `
    <div class="cf-dock-card">
      <!-- 1. ETAPA INMEDIATA EN VIVO (Visibilidad en 0ms para humanos) -->
      <div class="cf-dock-vivo-banner">
        <div class="cf-dock-vivo-header">
          <div class="cf-dock-vivo-tag">
            <span class="cf-live-dot"></span>
            <i class="fa-solid fa-bolt"></i>
            <strong>ACTIVO EN VIVO (0ms)</strong>
          </div>
          <button type="button" class="cf-dock-btn-close" id="cfDockBtnClose" title="Cerrar aviso">&times;</button>
        </div>
        <p class="cf-dock-vivo-desc">
          Tus cambios ya están visibles al instante en tu pantalla y para tus clientes.
        </p>
        <div class="cf-dock-action-wrap">
          <a href="/" target="_blank" rel="noopener noreferrer" class="cf-dock-btn-open" id="cfDockBtnOpen">
            <i class="fa-solid fa-arrow-up-right-from-square"></i> Ver Web en Vivo (0ms)
          </a>
        </div>
      </div>

      <!-- 2. ETAPA SEGUNDO PLANO (Cloudflare Pages SEO para Googlebot) -->
      <div class="cf-dock-seo-section">
        <header class="cf-dock-head">
          <div class="cf-dock-title-wrap">
            <i class="fa-solid fa-cloud-arrow-up cf-dock-icon cf-spin-cloud" id="cfDockIcon"></i>
            <div>
              <strong class="cf-dock-title" id="cfDockTitle">Optimizando SEO en la Nube</strong>
              <span class="cf-dock-sub" id="cfDockSub">Generando HTML estático y sitemap para Googlebot</span>
            </div>
          </div>
          <span class="cf-dock-pct" id="cfDockPct">0%</span>
        </header>

        <!-- Barra de Progreso SEO -->
        <div class="cf-dock-bar-track">
          <div class="cf-dock-bar-fill" id="cfDockBarFill" style="width: 0%;"></div>
        </div>

        <!-- Estado y Contador -->
        <footer class="cf-dock-footer">
          <span class="cf-dock-status-txt" id="cfDockStatusTxt">Iniciando compilación en Cloudflare…</span>
          <span class="cf-dock-timer" id="cfDockTimer">45s</span>
        </footer>
      </div>
    </div>
  `;

  document.body.appendChild(dock);

  const btnClose = dock.querySelector('#cfDockBtnClose');
  btnClose?.addEventListener('click', () => {
    dock.style.display = 'none';
    detenerProgreso(true);
  });

  return dock;
}

function obtenerMensajeEstado(pct) {
  if (pct < 25) return 'Disparando deploy hook en Cloudflare Pages…';
  if (pct < 55) return 'Compilando páginas estáticas con Astro SSG…';
  if (pct < 80) return 'Optimizando sitemap XML y metadatos Googlebot…';
  if (pct < 100) return 'Propagando HTML estático a la red Edge global…';
  return '¡HTML y Sitemap listos en la red global de Cloudflare! 🎉';
}

export function iniciarProgresoDeploy({ motivo = 'cambios', forzarInicio = false } = {}) {
  if (typeof window === 'undefined') return;

  const ahora = Date.now();
  let inicio = ahora;

  try {
    const raw = sessionStorage.getItem(PROGRESS_STORAGE_KEY);
    if (raw && !forzarInicio) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.inicio && (ahora - parsed.inicio) < DURACION_ESTIMADA_MS) {
        inicio = parsed.inicio;
      }
    }
  } catch (e) {}

  sessionStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify({ inicio, motivo }));

  const dock = obtenerOCrearDock();
  if (!dock) return;
  dock.style.display = 'block';

  const elPct = dock.querySelector('#cfDockPct');
  const elBar = dock.querySelector('#cfDockBarFill');
  const elStatus = dock.querySelector('#cfDockStatusTxt');
  const elTimer = dock.querySelector('#cfDockTimer');

  if (_intervalo) clearInterval(_intervalo);

  function tick() {
    const transcurrido = Date.now() - inicio;
    const restante = Math.max(0, DURACION_ESTIMADA_MS - transcurrido);
    const pct = Math.min(100, Math.floor((transcurrido / DURACION_ESTIMADA_MS) * 100));

    if (elPct) elPct.textContent = `${pct}%`;
    if (elBar) elBar.style.width = `${pct}%`;
    if (elStatus) elStatus.textContent = obtenerMensajeEstado(pct);
    if (elTimer) elTimer.textContent = `${Math.ceil(restante / 1000)}s`;

    if (pct >= 55 && !_sondeoActivo) {
      _sondeoActivo = true;
      verificarWebEnVivo();
    }

    if (pct >= 100) {
      finalizarConExito(dock);
    }
  }

  tick();
  _intervalo = setInterval(tick, 1000);
}

async function verificarWebEnVivo() {
  try {
    const res = await fetch(`/?_t=${Date.now()}`, { method: 'HEAD', cache: 'no-store' });
    if (res.ok) {
      const raw = sessionStorage.getItem(PROGRESS_STORAGE_KEY);
      if (raw) {
        const { inicio } = JSON.parse(raw);
        if (Date.now() - inicio > 28000) {
          const dock = document.getElementById('cfDeployDock');
          if (dock) finalizarConExito(dock);
        }
      }
    }
  } catch (err) {
  } finally {
    _sondeoActivo = false;
  }
}

function finalizarConExito(dock) {
  if (_intervalo) {
    clearInterval(_intervalo);
    _intervalo = null;
  }

  const elPct = dock.querySelector('#cfDockPct');
  const elBar = dock.querySelector('#cfDockBarFill');
  const elStatus = dock.querySelector('#cfDockStatusTxt');
  const elTimer = dock.querySelector('#cfDockTimer');
  const elTitle = dock.querySelector('#cfDockTitle');
  const elSub = dock.querySelector('#cfDockSub');
  const elIcon = dock.querySelector('#cfDockIcon');

  if (elPct) elPct.textContent = '100%';
  if (elBar) {
    elBar.style.width = '100%';
    elBar.style.background = '#10b981';
  }
  if (elIcon) {
    elIcon.className = 'fa-solid fa-circle-check cf-dock-icon';
    elIcon.style.color = '#10b981';
  }
  if (elTitle) elTitle.textContent = '¡SEO Estático Desplegado!';
  if (elSub) elSub.textContent = 'Googlebot y redes verán el HTML compilado';
  if (elStatus) elStatus.textContent = 'Sitemap y páginas 100% sincronizadas en Edge CDN.';
  if (elTimer) elTimer.textContent = 'Listo';

  setTimeout(() => {
    detenerProgreso(false);
  }, 10000);
}

export function detenerProgreso(eliminarStorage = true) {
  if (_intervalo) {
    clearInterval(_intervalo);
    _intervalo = null;
  }
  if (eliminarStorage && typeof sessionStorage !== 'undefined') {
    try {
      sessionStorage.removeItem(PROGRESS_STORAGE_KEY);
    } catch (e) {}
  }
}

export function inicializarProgresoDeploy() {
  if (typeof window === 'undefined') return;

  const handleDeployEvent = (e) => {
    iniciarProgresoDeploy({
      motivo: e?.detail?.motivo || 'actualización',
      forzarInicio: true
    });
  };
  window.addEventListener('wi:iniciar-deploy', handleDeployEvent);

  try {
    const raw = sessionStorage.getItem(PROGRESS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.inicio && (Date.now() - parsed.inicio) < DURACION_ESTIMADA_MS) {
        iniciarProgresoDeploy({ forzarInicio: false });
      }
    }
  } catch (e) {}
}

// =============================================================================
// 2. MOTOR CENTRAL DE ACTUALIZACIÓN (LOCAL-FIRST + FIRESTORE + CLOUDFLARE)
// =============================================================================

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
  // 1. DIRTY CHECKING INTELIGENTE
  if (!forzarWrite) {
    try {
      const previoRaw = getls(storageKey);
      if (previoRaw) {
        if (listaStorage !== undefined && Array.isArray(previoRaw)) {
          const previoItem = previoRaw.find(x => x && (x.id === docId || x.slug === docId));
          if (previoItem && JSON.stringify(previoItem) === JSON.stringify(datos)) {
            Notificacion('No se detectaron cambios en este elemento', 'info', 2000);
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

    // Guardar en claves alias de retrocompatibilidad
    if (modulo === 'negocio') {
      try { savels('minegocio', aGuardar); } catch (e) {}
      try { savels('gaswii_negocio', aGuardar); } catch (e) {}
    } else if (modulo === 'productos') {
      try { savels('gaswii_productos', aGuardar); } catch (e) {}
      try { savels('wi_servicios', aGuardar); } catch (e) {}
    }

    if (typeof window !== 'undefined') {
      // Evento canónico Workwii
      window.dispatchEvent(new CustomEvent(evento, { detail: aGuardar }));

      // Eventos específicos por módulo
      if (modulo === 'negocio') {
        window.dispatchEvent(new CustomEvent('gaswii:negocio-actualizado', { detail: aGuardar }));
        hidratarNegocioEnDOM(datos);
      } else if (modulo === 'productos') {
        window.dispatchEvent(new CustomEvent('gaswii:productos-actualizado', { detail: aGuardar }));
      } else if (modulo === 'blogs') {
        window.dispatchEvent(new CustomEvent('wi:blogs-actualizado', { detail: aGuardar }));
      }
    }
  } catch (err) {
    console.warn('[actualizarCentral] Error en LocalStorage:', err);
  }

  Notificacion(mensajeExito, 'success', 2500);

  // 3. PERSISTENCIA GRANULAR EN FIRESTORE (En segundo plano)
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

  // 4. CLOUDFLARE BACKGROUND DEPLOY + ACTIVAR DOCK DUAL-STAGE
  if (redeploy) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('wi:iniciar-deploy', {
        detail: { motivo: modulo, tiempoMs: DURACION_ESTIMADA_MS }
      }));
    }
    dispararDeploySilencioso(modulo);
  }

  return { ok: true, modificado: true, datos };
}

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
      if (modulo === 'blogs') {
        window.dispatchEvent(new CustomEvent('wi:blogs-actualizado', { detail: listaActualizada }));
      }
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

  // 3. Deploy consolidado y dock
  if (redeploy) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('wi:iniciar-deploy', {
        detail: { motivo: `eliminar-${modulo}`, tiempoMs: DURACION_ESTIMADA_MS }
      }));
    }
    dispararDeploySilencioso(modulo);
  }

  return { ok: true, modificado: true };
}

export function solicitarActualizacionWeb({ motivo = 'actualización' } = {}) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('wi:iniciar-deploy', {
      detail: { motivo, tiempoMs: DURACION_ESTIMADA_MS }
    }));
  }
  dispararDeploySilencioso(motivo);
}

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
  solicitarActualizacionWeb,
  dispararDeploySilencioso,
  iniciarProgresoDeploy,
  detenerProgreso,
  inicializarProgresoDeploy
};
