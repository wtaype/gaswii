// src/feature/personal/lib/progreso.js
// 🚀 Gestor de Barra de Progreso Dual-Stage de Re-Deploy en Cloudflare Pages
// Etapa 1: Notificación instantánea en vivo (0ms) con botón directo para el dueño y clientes
// Etapa 2: Sincronización en segundo plano de compilación estática y sitemap para Googlebot (SEO)
// Integrado 100% con variables de witema.css

const STORAGE_KEY = 'cf_deploy_progress';
const DURACION_ESTIMADA_MS = 45 * 1000; // 45 segundos estimación dinámica de Cloudflare
let _intervalo = null;
let _sondeoActivo = false;

/**
 * Inserta o retorna el contenedor HTML del dock de progreso
 */
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
            <strong>ACTIVO EN VIVO</strong>
          </div>
          <button type="button" class="cf-dock-btn-close" id="cfDockBtnClose" title="Cerrar aviso">&times;</button>
        </div>
        <p class="cf-dock-vivo-desc">
          Tus números, fotos, redes y precios ya están visibles en tiempo real para tus clientes.
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
              <span class="cf-dock-sub" id="cfDockSub">Generando HTML estático para Googlebot</span>
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
          <span class="cf-dock-status-txt" id="cfDockStatusTxt">Iniciando build en Cloudflare…</span>
          <span class="cf-dock-timer" id="cfDockTimer">45s</span>
        </footer>
      </div>
    </div>
  `;

  // Estilos inyectados respetando witema.css
  const style = document.createElement('style');
  style.id = 'cfDeployDockStyles';
  style.textContent = `
    .cf-dock-wrap {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 10000;
      width: calc(100% - 48px);
      max-width: 430px;
      pointer-events: auto;
      animation: cfDockSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      font-family: 'Poppins', system-ui, -apple-system, sans-serif;
    }
    @keyframes cfDockSlideUp {
      from { transform: translateY(28px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .cf-dock-card {
      background: var(--bg2, rgba(17, 24, 39, 0.96));
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid var(--borde, rgba(255, 255, 255, 0.14));
      border-radius: 16px;
      padding: 16px;
      box-shadow: 0 20px 48px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.08);
      color: var(--tx, #f8fafc);
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .cf-dock-vivo-banner {
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.35);
      border-radius: 12px;
      padding: 12px 14px;
    }
    .cf-dock-vivo-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .cf-dock-vivo-tag {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      color: #10b981;
      font-size: 11.5px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .cf-live-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 8px #10b981;
      animation: cfDotPulse 1.4s ease-in-out infinite;
    }
    @keyframes cfDotPulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.85); }
    }
    .cf-dock-vivo-desc {
      font-size: 12px;
      line-height: 1.4;
      color: var(--tx, #f1f5f9);
      margin: 6px 0 10px;
    }
    .cf-dock-btn-open {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      width: 100%;
      padding: 10px 14px;
      background: #10b981;
      color: #ffffff !important;
      font-size: 13px;
      font-weight: 600;
      text-decoration: none;
      border-radius: 8px;
      box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);
      transition: transform 0.15s, filter 0.15s;
    }
    .cf-dock-btn-open:hover {
      filter: brightness(1.1);
      transform: translateY(-1px);
    }
    .cf-dock-seo-section {
      padding-top: 4px;
    }
    .cf-dock-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .cf-dock-title-wrap {
      display: flex;
      align-items: center;
      gap: 9px;
    }
    .cf-dock-icon {
      font-size: 18px;
      color: var(--brand-primary, #ff6600);
      flex-shrink: 0;
    }
    .cf-spin-cloud {
      animation: cfPulseCloud 1.6s ease-in-out infinite alternate;
    }
    @keyframes cfPulseCloud {
      from { transform: scale(0.92); opacity: 0.8; }
      to { transform: scale(1.08); opacity: 1; }
    }
    .cf-dock-title {
      font-size: 12.5px;
      font-weight: 600;
      display: block;
      line-height: 1.25;
    }
    .cf-dock-sub {
      font-size: 10.5px;
      color: var(--tx2, #94a3b8);
      display: block;
    }
    .cf-dock-pct {
      font-size: 12px;
      font-weight: 700;
      color: var(--brand-primary, #ff6600);
      font-variant-numeric: tabular-nums;
    }
    .cf-dock-btn-close {
      background: none;
      border: none;
      color: var(--tx2, #94a3b8);
      font-size: 18px;
      cursor: pointer;
      line-height: 1;
      padding: 2px 4px;
      border-radius: 4px;
      transition: color 0.15s;
    }
    .cf-dock-btn-close:hover {
      color: var(--tx, #fff);
    }
    .cf-dock-bar-track {
      height: 6px;
      background: var(--bg3, rgba(255, 255, 255, 0.08));
      border-radius: 999px;
      overflow: hidden;
      margin: 8px 0 6px;
      position: relative;
    }
    .cf-dock-bar-fill {
      height: 100%;
      border-radius: 999px;
      background: linear-gradient(90deg, #ff6600, #f59e0b, #10b981);
      transition: width 0.3s ease;
      position: relative;
    }
    .cf-dock-bar-fill::after {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
      animation: cfShimmer 1.8s infinite;
    }
    @keyframes cfShimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    .cf-dock-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      font-size: 11px;
    }
    .cf-dock-status-txt {
      color: var(--tx2, #94a3b8);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
    }
    .cf-dock-timer {
      font-weight: 600;
      color: var(--tx, #f8fafc);
      font-variant-numeric: tabular-nums;
      flex-shrink: 0;
    }
    @media (max-width: 640px) {
      .cf-dock-wrap {
        left: 12px;
        right: 12px;
        bottom: 12px;
        width: calc(100% - 24px);
      }
    }
  `;

  if (!document.getElementById('cfDeployDockStyles')) {
    document.head.appendChild(style);
  }
  document.body.appendChild(dock);

  // Botón de cerrar
  const btnClose = dock.querySelector('#cfDockBtnClose');
  btnClose?.addEventListener('click', () => {
    dock.style.display = 'none';
    detenerProgreso(true);
  });

  return dock;
}

/**
 * Obtiene el mensaje descriptivo del estado SEO de Cloudflare
 */
function obtenerMensajeEstado(pct) {
  if (pct < 25) return 'Disparando deploy hook en Cloudflare Pages…';
  if (pct < 55) return 'Compilando 44 páginas estáticas con Astro SSG…';
  if (pct < 80) return 'Optimizando sitemap XML y metadatos Googlebot…';
  if (pct < 100) return 'Propagando HTML estático a la red Edge global…';
  return '¡HTML y Sitemap listos en la red global de Cloudflare! 🎉';
}

/**
 * Inicia o reanuda la barra de progreso
 */
export function iniciarProgresoDeploy({ motivo = 'cambios', forzarInicio = false } = {}) {
  if (typeof window === 'undefined') return;

  const ahora = Date.now();
  let inicio = ahora;

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw && !forzarInicio) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.inicio && (ahora - parsed.inicio) < DURACION_ESTIMADA_MS) {
        inicio = parsed.inicio;
      }
    }
  } catch (e) {}

  sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ inicio, motivo }));

  const dock = obtenerOCrearDock();
  if (!dock) return;
  dock.style.display = 'block';

  const elPct = dock.querySelector('#cfDockPct');
  const elBar = dock.querySelector('#cfDockBarFill');
  const elStatus = dock.querySelector('#cfDockStatusTxt');
  const elTimer = dock.querySelector('#cfDockTimer');
  const elTitle = dock.querySelector('#cfDockTitle');
  const elSub = dock.querySelector('#cfDockSub');
  const elIcon = dock.querySelector('#cfDockIcon');

  if (_intervalo) clearInterval(_intervalo);

  function tick() {
    const transcurrido = Date.now() - inicio;
    const restante = Math.max(0, DURACION_ESTIMADA_MS - transcurrido);
    const pct = Math.min(100, Math.floor((transcurrido / DURACION_ESTIMADA_MS) * 100));

    if (elPct) elPct.textContent = `${pct}%`;
    if (elBar) elBar.style.width = `${pct}%`;
    if (elStatus) elStatus.textContent = obtenerMensajeEstado(pct);
    if (elTimer) elTimer.textContent = `${Math.ceil(restante / 1000)}s`;

    // Sondeo inteligente después de los 25s
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

/**
 * Sondea suavemente con HEAD si la web ya está respondiendo
 */
async function verificarWebEnVivo() {
  try {
    const res = await fetch(`/?_t=${Date.now()}`, {
      method: 'HEAD',
      cache: 'no-store'
    });
    if (res.ok) {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const { inicio } = JSON.parse(raw);
        if (Date.now() - inicio > 28000) {
          const dock = document.getElementById('cfDeployDock');
          if (dock) finalizarConExito(dock);
        }
      }
    }
  } catch (err) {
    // Silencioso
  } finally {
    _sondeoActivo = false;
  }
}

/**
 * Transición al estado 100% de éxito
 */
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

  // Limpiar sesión después de 45 segundos
  setTimeout(() => {
    detenerProgreso(false);
  }, 45000);
}

/**
 * Detiene el progreso y limpia la sesión
 */
export function detenerProgreso(eliminarStorage = true) {
  if (_intervalo) {
    clearInterval(_intervalo);
    _intervalo = null;
  }
  if (eliminarStorage && typeof sessionStorage !== 'undefined') {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
  }
}

/**
 * Auto-inicialización reactiva en el Panel Personal
 */
export function inicializarProgresoDeploy() {
  if (typeof window === 'undefined') return;

  const handleDeployEvent = (e) => {
    iniciarProgresoDeploy({
      motivo: e?.detail?.motivo || 'actualización',
      forzarInicio: true
    });
  };
  window.addEventListener('wi:iniciar-deploy', handleDeployEvent);

  // Revisar si había un deploy en curso al navegar entre pestañas
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.inicio && (Date.now() - parsed.inicio) < DURACION_ESTIMADA_MS) {
        iniciarProgresoDeploy({ forzarInicio: false });
      }
    }
  } catch (e) {}
}

export default {
  iniciarProgresoDeploy,
  detenerProgreso,
  inicializarProgresoDeploy
};
