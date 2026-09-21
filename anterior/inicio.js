// ==========================================================================
// INICIO CLIENT-SIDE SCRIPT - GASWII (SOLGAS SURQUILLO)
// Local-First, Zero-FOUC, Ultra-Fast Interactions (On-Demand Auth)
// ==========================================================================

import negocio from '../../negocio';
import { Saludar } from '../../core/widev/saludo.js';
import { wiModal } from '../../core/widev/modales.js';
import { getSmileLocal } from '../auth/sesion.js';
import { obtenerDatosNegocio, consultarNegocioDesdeFirestore } from '../personal/modulos/negocio/dataNegocio.js';

// Estado local de la página
let idiomaActual = document.documentElement.lang || 'es';
let _datosNegocioActivos = obtenerDatosNegocio();

// --------------------------------------------------------------------------
// 0. HIDRATACIÓN REACTIVA EN TIEMPO REAL (LOCAL-FIRST + FIRESTORE)
// --------------------------------------------------------------------------
export function hidratarNegocioEnDOM(datos) {
  if (!datos || typeof datos !== 'object') return;
  _datosNegocioActivos = datos;

  const telLimpio = datos.contacto?.telefonoLimpio || (datos.contacto?.telefono || '').replace(/\D/g, '');
  const telMostrado = datos.contacto?.telefono || '';
  const telFijo = datos.contacto?.telefonoFijo || '';
  const horario = idiomaActual === 'en' ? (datos.contacto?.horarioEn || datos.contacto?.horario || '') : (datos.contacto?.horario || '');
  const direccion = datos.ubicacion?.direccion || '';
  const mapsUrl = datos.ubicacion?.mapsUrl || '';
  const lat = datos.ubicacion?.coordenadas?.lat;
  const lng = datos.ubicacion?.coordenadas?.lng;

  // 1. Teléfonos y Enlaces directos
  if (telLimpio) {
    document.querySelectorAll('[data-negocio-tel-link]').forEach(a => a.href = `tel:${telLimpio}`);
  }
  if (telMostrado) {
    document.querySelectorAll('[data-negocio-tel-text]').forEach(el => el.textContent = telMostrado);
    document.querySelectorAll('[data-negocio-tel-mostrado]').forEach(el => el.textContent = telMostrado);
    document.querySelectorAll('[data-negocio-tel-call]').forEach(el => el.textContent = `Llamar: ${telMostrado}`);
    document.querySelectorAll('[data-negocio-tel-pedido]').forEach(el => el.textContent = telMostrado);
  }
  if (telFijo) {
    document.querySelectorAll('[data-negocio-tel-fijo]').forEach(el => el.textContent = `Fijo: ${telFijo}`);
  }

  // 2. Horarios y Ubicación
  if (horario) {
    document.querySelectorAll('[data-negocio-horario]').forEach(el => el.textContent = horario);
  }
  if (direccion) {
    document.querySelectorAll('[data-negocio-direccion]').forEach(el => el.textContent = direccion);
  }
  if (mapsUrl) {
    document.querySelectorAll('[data-negocio-maps], [data-negocio-maps-btn]').forEach(a => a.href = mapsUrl);
  }
  if (lat && lng) {
    document.querySelectorAll('[data-negocio-maps-iframe]').forEach(iframe => {
      iframe.src = `https://maps.google.com/maps?q=${lat},${lng}&hl=${idiomaActual}&z=16&output=embed`;
    });
  }

  // 3. Métricas
  if (datos.metricas) {
    const elCli = document.querySelector('[data-negocio-metrica-clientes]');
    if (elCli && datos.metricas.clientes) elCli.textContent = datos.metricas.clientes;
    const elBal = document.querySelector('[data-negocio-metrica-balanza]');
    if (elBal && datos.metricas.balanza) elBal.textContent = datos.metricas.balanza;
    const elYrs = document.querySelector('[data-negocio-metrica-years]');
    if (elYrs && datos.metricas.years) elYrs.textContent = datos.metricas.years;
    const elDias = document.querySelector('[data-negocio-metrica-dias]');
    if (elDias && datos.metricas.dias) elDias.textContent = datos.metricas.dias;
  }

  // 4. Zonas de Entrega
  if (Array.isArray(datos.zonas) && datos.zonas.length > 0) {
    const activas = datos.zonas.filter(z => z.activo !== false);
    const container = document.getElementById('districtSelector');
    if (container && activas.length > 0) {
      container.innerHTML = activas.map((dist, idx) => `
        <button 
          type="button"
          class="hero-district-btn ${idx === 0 ? 'active' : ''}"
          data-district="${dist.distrito || ''}"
          data-time="${dist.tiempoMin || 0} - ${dist.tiempoMax || 0} ${dist.unidad || 'min'}"
        >
          <div class="hero-district-name">${dist.distrito || ''}</div>
          <div class="hero-district-time"><i class="fa-solid fa-bolt"></i> ${dist.tiempoMin || 0} - ${dist.tiempoMax || 0} ${dist.unidad || 'min'}</div>
        </button>
      `).join('');
      initDistrictSelector();
    }

    const selPedDist = document.getElementById('pedDistrito');
    if (selPedDist && activas.length > 0) {
      const currentVal = selPedDist.value;
      selPedDist.innerHTML = activas.map(d => `
        <option value="${d.distrito || ''}">${d.distrito || ''} (${d.tiempoMin || 0} - ${d.tiempoMax || 0} ${d.unidad || 'min'})</option>
      `).join('');
      if (currentVal && activas.some(d => d.distrito === currentVal)) {
        selPedDist.value = currentVal;
      }
    }
  }
}

// --------------------------------------------------------------------------
// 1. SELECTOR DINÁMICO DE DISTRITOS (HERO)
// --------------------------------------------------------------------------
export function initDistrictSelector() {
  const districtBtns = document.querySelectorAll('.hero-district-btn, .district-btn');
  districtBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      districtBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      const distName = btn.dataset.district;
      const distTime = btn.dataset.time;
      const infoEl = document.getElementById('distritoActualInfo');

      if (infoEl) {
        infoEl.innerHTML =
          idiomaActual === 'en'
            ? `Delivering to <strong>${distName}</strong>: estimated time <strong>${distTime}</strong>`
            : `Despachando a <strong>${distName}</strong>: tiempo estimado <strong>${distTime}</strong>`;
      }

      const selPedDist = document.getElementById('pedDistrito');
      if (selPedDist) {
        selPedDist.value = distName;
      }
    });
  });
}

// --------------------------------------------------------------------------
// 2. CALCULADORA DE CONSUMO INTELIGENTE
// --------------------------------------------------------------------------
export function recalcularDuracion() {
  const personasEl = document.getElementById('calcPersonas');
  const horasEl = document.getElementById('calcHoras');
  const tamanoEl = document.getElementById('calcTamano');

  const personas = parseInt(personasEl?.value || '3', 10);
  const horas = parseFloat(horasEl?.value || '2.5');
  const kg = parseInt(tamanoEl?.value || '10', 10);

  const personasDisplay = document.getElementById('personasDisplay');
  const horasDisplay = document.getElementById('horasDisplay');

  if (personasDisplay) {
    personasDisplay.textContent = idiomaActual === 'en' ? `${personas} persons` : `${personas} personas`;
  }
  if (horasDisplay) {
    horasDisplay.textContent = idiomaActual === 'en' ? `${horas} hrs / day` : `${horas} horas / día`;
  }

  const totalHorasDisponibles = (kg / 10) * 80;
  const consumoDiarioHoras = horas * (0.55 + personas * 0.15);
  const dias = Math.max(8, Math.round(totalHorasDisponibles / consumoDiarioHoras));

  const resEl = document.getElementById('calcDiasResult');
  if (resEl) {
    resEl.textContent = idiomaActual === 'en' ? `${dias} days` : `${dias} días`;
  }
}

export function initCalculator() {
  document.getElementById('calcPersonas')?.addEventListener('input', recalcularDuracion);
  document.getElementById('calcHoras')?.addEventListener('input', recalcularDuracion);
  document.getElementById('calcTamano')?.addEventListener('change', recalcularDuracion);
  recalcularDuracion();
}

// --------------------------------------------------------------------------
// 3. AUTH MODAL ON-DEMAND (Carga diferida ultraligera - 0 KB de Auth al inicio)
// --------------------------------------------------------------------------
export function abrirModalLogin(modoInicial = 'login') {
  import('../auth/visualLogin.js').then((m) => {
    m.initListeners();
    m.abrirLogin(modoInicial);
  });
}

export function cerrarModalLogin() {
  const modal = document.getElementById('wi_auth_modal');
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => modal.remove(), 200);
  }
}

// --------------------------------------------------------------------------
// 4. MODAL PEDIDO EXPRESS
// --------------------------------------------------------------------------
export function abrirModalPedido(productoPreseleccionado) {
  if (productoPreseleccionado) {
    const selProd = document.getElementById('pedProducto');
    if (selProd) {
      for (let i = 0; i < selProd.options.length; i++) {
        if (selProd.options[i].text.toLowerCase().includes(productoPreseleccionado.toLowerCase())) {
          selProd.selectedIndex = i;
          break;
        }
      }
    }
  }

  // AUTOCOMPLETADO INTELIGENTE LOCAL-FIRST PARA CLIENTES REGISTRADOS
  try {
    const smile = getSmileLocal();
    const vipBanner = document.getElementById('modalPedidoVipBanner');
    const guestBanner = document.getElementById('modalPedidoGuestBanner');
    const vipNombre = document.getElementById('modalPedidoVipNombre');

    if (smile && (smile.uid || smile.nombre)) {
      const inputNombre = document.getElementById('pedNombre');
      const inputTelefono = document.getElementById('pedTelefono');
      const inputDireccion = document.getElementById('pedDireccion');
      const selectDistrito = document.getElementById('pedDistrito');

      if (inputNombre && smile.nombre && !inputNombre.value) inputNombre.value = smile.nombre;
      if (inputTelefono && smile.celular && !inputTelefono.value) inputTelefono.value = smile.celular;
      if (smile.direcciones && smile.direcciones.length > 0) {
        const dir = smile.direcciones[0];
        if (inputDireccion && dir.direccion && !inputDireccion.value) inputDireccion.value = dir.direccion;
        if (selectDistrito && dir.distrito) selectDistrito.value = dir.distrito;
      }

      if (vipBanner) vipBanner.style.display = 'flex';
      if (guestBanner) guestBanner.style.display = 'none';
      if (vipNombre) vipNombre.textContent = `¡Hola, ${smile.nombre ? smile.nombre.split(' ')[0] : (smile.usuario || 'Cliente')}!`;
    } else {
      if (vipBanner) vipBanner.style.display = 'none';
      if (guestBanner) guestBanner.style.display = 'flex';
    }
  } catch (e) {
    console.warn('Error autocompletando pedido:', e);
  }

  wiModal.open('modalPedido');
}

export function cerrarModalPedido() {
  wiModal.close('modalPedido');
}

// --------------------------------------------------------------------------
// 5. DESPACHO DIRECTO DE PEDIDO A WHATSAPP
// --------------------------------------------------------------------------
export function enviarPedidoModalWhatsApp() {
  const nombre = document.getElementById('pedNombre')?.value.trim() || '';
  const telefono = document.getElementById('pedTelefono')?.value.trim() || '';
  const distrito = document.getElementById('pedDistrito')?.value || 'Surquillo';
  const direccion = document.getElementById('pedDireccion')?.value.trim() || '';
  const producto = document.getElementById('pedProducto')?.value || 'Balón SOLGAS de 10 kg';
  const pago = document.getElementById('pedPago')?.value || 'Efectivo';
  const comentarios = document.getElementById('pedComentarios')?.value.trim() || '';

  if (!direccion) {
    alert(
      idiomaActual === 'en'
        ? 'Please provide your address so we can deliver your gas cylinder.'
        : 'Por favor indícanos tu dirección (calle, número o referencia) para llevarte el balón.'
    );
    document.getElementById('pedDireccion')?.focus();
    return;
  }

  const saludo = Saludar('', idiomaActual).replace(',', '');
  const smile = getSmileLocal();
  const idCliente = smile?.usuario ? ` (@${smile.usuario})` : smile?.pin ? ` [PIN: ${smile.pin}]` : '';

  const textoMensaje =
    idiomaActual === 'en'
      ? `¡${saludo}! I saw your website and would like to order: *${producto}*.\n\n` +
        `📍 *Delivery Address:* ${direccion} (${distrito})\n` +
        `💳 *Payment Method:* ${pago}\n` +
        `👤 *My Name:* ${nombre || 'Customer'}${idCliente}\n` +
        `📱 *Contact Phone:* ${telefono || 'Same WhatsApp'}` +
        (comentarios ? `\n📝 *Notes:* ${comentarios}` : '') +
        `\n\nPlease confirm my order. Thank you!`
      : `¡${saludo}! He visto su página web y deseo pedir un balón de gas: *${producto}*.\n\n` +
        `📍 *Mi dirección es:* ${direccion} (${distrito})\n` +
        `💳 *Forma de pago:* ${pago}\n` +
        `👤 *Mi nombre es:* ${nombre || 'Vecino'}${idCliente}\n` +
        `📱 *Mi celular de llamada:* ${telefono || 'El mismo de este WhatsApp'}` +
        (comentarios ? `\n📝 *Indicaciones:* ${comentarios}` : '') +
        `\n\nPor favor confirmen mi pedido para esperarlo, ¡muchas gracias!`;

  const waDestino = _datosNegocioActivos?.contacto?.whatsapp || _datosNegocioActivos?.contacto?.telefonoLimpio || negocio.whatsapp || negocio.telefonoLimpio || negocio.telefonoRaw;
  const urlWa = `https://api.whatsapp.com/send?phone=${waDestino}&text=${encodeURIComponent(textoMensaje)}`;
  window.open(urlWa, '_blank');
  cerrarModalPedido();
}

// --------------------------------------------------------------------------
// INICIALIZACIÓN GLOBAL EN EL WINDOW
// --------------------------------------------------------------------------
if (typeof window !== 'undefined') {
  window.abrirModalLogin = abrirModalLogin;
  window.cerrarModalLogin = cerrarModalLogin;
  window.abrirModalPedido = abrirModalPedido;
  window.cerrarModalPedido = cerrarModalPedido;
  window.enviarPedidoModalWhatsApp = enviarPedidoModalWhatsApp;
  window.hidratarNegocioEnDOM = hidratarNegocioEnDOM;

  document.addEventListener('DOMContentLoaded', () => {
    // 1. Iniciar selectores y calculadoras
    initDistrictSelector();
    initCalculator();

    // 2. Hidratación instantánea Local-First (0ms)
    const local = obtenerDatosNegocio();
    if (local) hidratarNegocioEnDOM(local);

    // 3. Sincronización asíncrona en segundo plano con Firebase Firestore
    consultarNegocioDesdeFirestore().then(remoto => {
      if (remoto) {
        hidratarNegocioEnDOM(remoto);
      }
    }).catch(err => {
      console.warn('[inicio.js] Firestore sync diferido:', err?.message || err);
    });

    // 4. Escuchar cambios en vivo (Cross-Component y Cross-Tab)
    window.addEventListener('gaswii:negocio-actualizado', (e) => {
      if (e.detail) hidratarNegocioEnDOM(e.detail);
    });

    window.addEventListener('storage', (e) => {
      if (e.key === 'minegocio') {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed) hidratarNegocioEnDOM(parsed);
        } catch (err) {}
      }
    });
  });
}
