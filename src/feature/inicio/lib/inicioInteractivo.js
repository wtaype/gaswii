// src/feature/inicio/lib/inicioInteractivo.js
// 🌟 Módulo de Interactividad Smart Unificado de Gaswii (Diferido vía wiSmart)
// Cero Bloqueo de Primer Render (TBT = 0ms) · Se activa al interactuar (touch, scroll, click, mousemove)
import { imgwii } from '@widev';
import { ROL_PATH } from '@core/rutas.js';
import { obtenerSaludoHora, crearEnlaceWhatsApp } from './whatsapp.js';

/**
 * Resuelve el destino del panel administrativo o de cliente
 */
function resolverDestinoDashboard(smile) {
  if (!smile) return '/login';
  const isEn = window.location.pathname.startsWith('/en');
  const rol = smile.rol || 'cliente';
  const esStaff = rol === 'personal' || rol === 'gestor' || rol === 'admin';
  const base = ROL_PATH[rol] || (esStaff ? '/personal' : '/cliente');
  return isEn ? `/en${base}` : base;
}

/**
 * Actualiza la UI de autenticación en Header y MobileDrawer
 */
export function actualizarAuthUi(smile) {
  const btnLogin = document.getElementById('headerBtnLogin');
  const userPerfil = document.getElementById('headerUserPerfil');
  const userAvatar = document.getElementById('headerUserAvatar');
  const userNombre = document.getElementById('headerUserNombre');
  const userBadge = document.getElementById('headerUserBadge');
  const perfilLink = document.getElementById('headerPerfilLink');

  const drawerBtnLogin = document.getElementById('drawerBtnLogin');
  const drawerUserPerfil = document.getElementById('drawerUserPerfil');
  const drawerUserAvatar = document.getElementById('drawerUserAvatar');
  const drawerUserNombre = document.getElementById('drawerUserNombre');
  const drawerUserBadge = document.getElementById('drawerUserBadge');
  const drawerPerfilLink = document.getElementById('drawerPerfilLink');

  if (smile && (smile.uid || smile.nombre)) {
    if (btnLogin) btnLogin.style.display = 'none';
    if (userPerfil) userPerfil.style.display = 'flex';
    if (drawerBtnLogin) drawerBtnLogin.style.display = 'none';
    if (drawerUserPerfil) drawerUserPerfil.style.display = 'flex';

    const foto = smile.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(smile.nombre || smile.usuario || 'VIP')}&background=ff6a00&color=fff&rounded=true`;
    if (userAvatar) userAvatar.src = foto;
    if (drawerUserAvatar) drawerUserAvatar.src = foto;

    const nombreCorto = smile.nombre ? smile.nombre.split(' ')[0] : (smile.usuario || 'VIP');
    if (userNombre) userNombre.textContent = nombreCorto;
    if (drawerUserNombre) drawerUserNombre.textContent = nombreCorto;

    const rol = smile.rol || 'cliente';
    let rolBadge = smile.usuario ? `@${smile.usuario.replace('@', '')}` : 'VIP';
    if (rol === 'gestor') rolBadge = 'Gestor';
    else if (rol === 'admin') rolBadge = 'Admin';
    else if (rol === 'personal') rolBadge = 'Personal';

    if (userBadge) userBadge.textContent = rolBadge;
    if (drawerUserBadge) drawerUserBadge.textContent = rolBadge;

    const rutaDestino = resolverDestinoDashboard(smile);
    if (perfilLink) perfilLink.href = rutaDestino;
    if (drawerPerfilLink) drawerPerfilLink.href = rutaDestino;
  } else {
    if (btnLogin) btnLogin.style.display = 'inline-flex';
    if (userPerfil) userPerfil.style.display = 'none';
    if (drawerBtnLogin) drawerBtnLogin.style.display = 'flex';
    if (drawerUserPerfil) drawerUserPerfil.style.display = 'none';
  }
}

/**
 * Switcher de idiomas dinámico preservando ruta y anclas
 */
function initLanguageSwitcher() {
  document.querySelectorAll('.header-pill-group a[data-lang]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const explicitHref = btn.getAttribute('href');
      // Si el enlace ya tiene un destino específico definido por SSR o por el módulo (ej. artículos de blog)
      if (explicitHref && explicitHref !== '#' && !explicitHref.startsWith('#')) {
        const hash = window.location.hash || '';
        // Si hay un hash activo en la URL actual y el href no lo tiene, anexamos el hash
        if (hash && !explicitHref.includes('#')) {
          e.preventDefault();
          window.location.href = explicitHref + hash;
        }
        // Permitimos la navegación nativa limpia directa al href del botón
        return;
      }

      const targetLang = btn.getAttribute('data-lang');
      if (!targetLang) return;
      e.preventDefault();
      const pathActual = window.location.pathname.replace(/\/$/, '') || '/';
      let limpia = pathActual;
      if (limpia === '/en') limpia = '/';
      else if (limpia.startsWith('/en/')) limpia = limpia.slice(3) || '/';
      const hash = window.location.hash || '';

      const dest = targetLang === 'es' 
        ? limpia 
        : (limpia === '/' ? `/${targetLang}` : `/${targetLang}${limpia}`);
      window.location.href = dest + hash;
    });
  });
}

/**
 * Hidrata elementos del Hero con datos reactivos de negocio
 */
function hidratarHeroDesdeNegocio(datos) {
  if (!datos || typeof datos !== 'object') return;

  const dir = datos.ubicacion?.direccion || '';
  const maps = datos.ubicacion?.mapsUrl || '';
  const tel = datos.contacto?.telefono || '';
  const telLimpio = datos.contacto?.telefonoLimpio || tel.replace(/\D/g, '');

  if (dir) {
    document.querySelectorAll('[data-negocio-direccion], [data-negocio-direccion-sede], [data-negocio-direccion-origen]').forEach(el => {
      el.textContent = dir;
    });
  }

  if (maps) {
    document.querySelectorAll('[data-negocio-maps]').forEach(a => {
      a.setAttribute('href', maps);
    });
  }

  if (tel) {
    document.querySelectorAll('[data-negocio-tel-text]').forEach(el => el.textContent = tel);
  }
  if (telLimpio) {
    document.querySelectorAll('[data-negocio-tel-link]').forEach(a => a.setAttribute('href', `tel:${telLimpio}`));
  }

  const horario = datos.contacto?.horario || '';
  if (horario) {
    document.querySelectorAll('[data-negocio-horario]').forEach(el => el.textContent = horario);
  }
}

/**
 * Selector de distritos en Hero
 */
function initSelectorDistritos() {
  const grid = document.getElementById('districtSelector');
  const info = document.getElementById('distritoActualInfo');
  if (!grid) return;

  const botones = grid.querySelectorAll('.hero-district-btn');
  botones.forEach((btn) => {
    btn.addEventListener('click', () => {
      botones.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const time = btn.getAttribute('data-time') || '';
      if (info) {
        const timeEl = info.querySelector('.eta-time');
        if (timeEl) {
          timeEl.textContent = time;
        } else {
          const origenEl = info.querySelector('[data-negocio-direccion-origen]');
          const dir = origenEl ? origenEl.textContent : '';
          const prefijo = info.getAttribute('data-prefijo') || 'Despachando desde';
          info.innerHTML = `<span class="eta-prefix">${prefijo}</span> <span data-negocio-direccion-origen>${dir}</span>: <strong class="eta-time">${time}</strong>`;
        }
      }
    });
  });

  // Hidratar con datos guardados de negocio en localStorage
  try {
    const raw = localStorage.getItem('wi_negocio') || localStorage.getItem('gaswii_negocio') || localStorage.getItem('minegocio') || localStorage.getItem('gaswii_negocio_config');
    if (raw) {
      const parsed = JSON.parse(raw);
      const data = parsed?.value || parsed;
      if (data) hidratarHeroDesdeNegocio(data);
    }
  } catch (e) {}

  const onNegocioActualizado = (e) => {
    if (e.detail) hidratarHeroDesdeNegocio(e.detail);
  };
  window.addEventListener('wi:negocio-actualizado', onNegocioActualizado);
  window.addEventListener('gaswii:negocio-actualizado', onNegocioActualizado);
}

/**
 * Calculadora de duración y rendimiento de balones de gas
 */
function initCalculadora() {
  const sPersonas = document.getElementById('calcPersonas');
  const sHoras = document.getElementById('calcHoras');
  const sTamano = document.getElementById('calcTamano');
  const dPersonas = document.getElementById('personasDisplay');
  const dHoras = document.getElementById('horasDisplay');
  const dDias = document.getElementById('calcDiasResult');

  if (!sPersonas || !sHoras || !sTamano || !dPersonas || !dHoras || !dDias) return;

  const unidadPersonas = sPersonas.getAttribute('data-unidad') || 'personas';
  const unidadHoras = sHoras.getAttribute('data-unidad') || 'horas / día';
  const unidadDias = dDias.getAttribute('data-unidad') || 'días';

  function recalcular() {
    const p = parseFloat(sPersonas.value || '3');
    const h = parseFloat(sHoras.value || '2.5');
    const kg = parseFloat(sTamano.value || '10');

    dPersonas.textContent = `${p} ${unidadPersonas}`;
    dHoras.textContent = `${h} ${unidadHoras}`;

    const consumoDiario = Math.max(0.1, (p * 0.04) + (h * 0.1));
    const diasEstimados = Math.max(1, Math.round(kg / consumoDiario));

    dDias.textContent = `${diasEstimados} ${unidadDias}`;

    const btnWa = document.querySelector('.btn-calc-pedir');
    if (btnWa) {
      btnWa.href = crearEnlaceWhatsApp({
        canalId: 'canal_calculadora',
        kg,
        personas: p,
        dias: diasEstimados
      });
    }
  }

  sPersonas.addEventListener('input', recalcular);
  sHoras.addEventListener('input', recalcular);
  sTamano.addEventListener('change', recalcular);
}

/**
 * Reconciliación Local-First de productos con localStorage y eventos en caliente
 */
function initReconciliacionProductos() {
  function aplicarReconciliacion(prods) {
    if (!Array.isArray(prods) || prods.length === 0) return;
    prods.forEach((p) => {
      const id = p.id || p.slug;
      if (!id) return;
      const card = document.querySelector(`[data-prod-id="${id}"]`);
      if (!card) return;

      const precioNum = p.precioPEN ?? p.precio;
      const precioEl = card.querySelector('.producto-card-precio');
      if (precioEl && precioNum !== undefined) {
        precioEl.textContent = `S/ ${Number(precioNum).toFixed(2)}`;
      }

      // Nombre si cambió
      const nombreTxt = typeof p.nombre === 'object' ? p.nombre?.es : p.nombre;
      const tituloEl = card.querySelector('.producto-card-titulo, h3');
      if (tituloEl && nombreTxt) {
        tituloEl.textContent = nombreTxt;
      }
    });
  }

  try {
    const local = localStorage.getItem('wi_productos') || localStorage.getItem('gaswii_productos');
    if (local) {
      const prods = JSON.parse(local);
      const lista = Array.isArray(prods) ? prods : (prods?.value || null);
      if (Array.isArray(lista)) aplicarReconciliacion(lista);
    }
  } catch (e) {}

  window.addEventListener('wi:productos-actualizado', (e) => {
    if (e.detail) aplicarReconciliacion(e.detail);
  });
  window.addEventListener('gaswii:productos-actualizado', (e) => {
    if (e.detail) aplicarReconciliacion(e.detail);
  });
  window.addEventListener('storage', (e) => {
    if ((e.key === 'wi_productos' || e.key === 'gaswii_productos') && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        const lista = Array.isArray(parsed) ? parsed : (parsed?.value || null);
        if (Array.isArray(lista)) aplicarReconciliacion(lista);
      } catch (err) {}
    }
  });

  window.addEventListener('wi:whatsapp-actualizado', () => {
    document.querySelectorAll('.card-balon').forEach(card => {
      const tituloEl = card.querySelector('.card-title');
      const precioEl = card.querySelector('[data-price-id]');
      const btnWs = card.querySelector('.btn-card-ws');
      if (btnWs && tituloEl) {
        const nom = tituloEl.textContent?.trim() || '';
        const pr = precioEl ? parseFloat(precioEl.textContent || '0') : null;
        btnWs.href = crearEnlaceWhatsApp({
          canalId: 'canal_catalogo_producto',
          producto: nom,
          precio: pr
        });
      }
    });
  });
}

/**
 * Inicializador Maestro diferido por wiSmart()
 */
export function initInicioInteractivo() {
  // 1. Activar lazy loading inteligente de imágenes
  imgwii.ver();

  // 2. Reactividad de sesión en Header y Drawer
  try {
    const raw = localStorage.getItem('wiSmile');
    if (raw) actualizarAuthUi(JSON.parse(raw));
  } catch (e) {}

  window.addEventListener('gaswii:auth-change', (e) => {
    actualizarAuthUi(e.detail);
  });

  window.cerrarSesionHeader = async () => {
    const { salir } = await import('@feature/auth/sesion.js');
    await salir();
    actualizarAuthUi(null);
  };

  // 3. Switcher de idiomas
  initLanguageSwitcher();

  // 4. Selector de distritos en Hero
  initSelectorDistritos();

  // 5. Calculadora de duración de gas
  initCalculadora();

  // 6. Sincronización Local-First de productos
  initReconciliacionProductos();

  // 7. Accesibilidad: Cerrar Drawer con tecla Escape
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      window.cerrarDrawer?.();
    }
  });
}
