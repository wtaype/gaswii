// ==========================================================================
// INICIO CLIENT-SIDE SCRIPT - GASWII (SOLGAS SURQUILLO)
// Local-First, Zero-FOUC, Ultra-Fast Interactions
// ==========================================================================

import negocio from '../../negocio';
import { Saludar } from '../../core/widev/saludo.js';


// Estado local de la página
let idiomaActual = document.documentElement.lang || 'es';

// --------------------------------------------------------------------------
// 1. SELECTOR DINÁMICO DE DISTRITOS (HERO)
// --------------------------------------------------------------------------
export function initDistrictSelector() {
  const districtBtns = document.querySelectorAll('.hero-district-btn, .district-btn');
  districtBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      districtBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const distName = btn.dataset.district;
      const distTime = btn.dataset.time;
      const infoEl = document.getElementById('distritoActualInfo');

      if (infoEl) {
        infoEl.innerHTML = idiomaActual === 'en'
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
  const consumoDiarioHoras = horas * (0.55 + (personas * 0.15));
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
// --------------------------------------------------------------------------
// 3. MODALES (PEDIDO EXPRESS Y LOGIN / REGISTRO CON FIREBASE)
// --------------------------------------------------------------------------
// --------------------------------------------------------------------------
// 3. MODALES (PEDIDO EXPRESS Y AUTH MODAL: LOGIN / REGISTRO / RECUPERAR)
// --------------------------------------------------------------------------
import { iniciarConGoogle, getSmileLocal } from '../auth/auth.js';
import { ejecutarLogin } from '../auth/components/login.js';
import { ejecutarRegistro, validarUsuarioEnVivo, validarEmailEnVivo, validarPasswordConfirm } from '../auth/components/registro.js';
import { procesarRecuperacion } from '../auth/components/recuperar.js';
import { mostrarFeedback, ocultarFeedback } from '../auth/components/feedback.js';
import authEs from '../auth/idioma/es.json';
import authEn from '../auth/idioma/en.json';

let authModo = 'login'; // 'login' | 'registro' | 'recuperar'

function getAuthTexts() {
  return idiomaActual === 'en' ? authEn : authEs;
}

export function setModoAuth(nuevoModo) {
  authModo = nuevoModo;
  const t = getAuthTexts();
  const box = document.getElementById('modalLoginBox');
  const seccionLogin = document.getElementById('seccionLoginCampos');
  const seccionReg = document.getElementById('seccionRegistroCampos');
  const seccionRec = document.getElementById('seccionRecuperarCampos');
  const feedbackEl = document.getElementById('authFeedback');
  ocultarFeedback(feedbackEl);

  const tituloEl = document.getElementById('modalAuthTitulo');
  const subEl = document.getElementById('modalAuthSub');
  const iconEl = document.getElementById('modalAuthIcon');

  const toggleIcon = document.getElementById('toggleModoAuthIcon');
  const toggleText = document.getElementById('toggleModoAuthText');

  const forgotIcon = document.getElementById('btnOlvidasteIcon');
  const forgotText = document.getElementById('btnOlvidasteText');

  const submitIcon = document.getElementById('btnSubmitAuthIcon');
  const submitText = document.getElementById('btnSubmitAuthText');
  const googleBtn = document.getElementById('btnGoogleLogin');

  if (authModo === 'registro') {
    box?.classList.add('modo-registro');
    seccionLogin?.classList.add('is-oculto');
    seccionReg?.classList.remove('is-oculto');
    seccionRec?.classList.add('is-oculto');
    if (googleBtn) googleBtn.classList.add('is-oculto');

    if (tituloEl) tituloEl.textContent = t.registro_titulo;
    if (subEl) subEl.textContent = t.registro_sub;
    if (iconEl) iconEl.className = 'fa-solid fa-user-plus auth-header-icon';

    if (toggleText) toggleText.textContent = t.link_ya_tienes_cuenta;
    if (toggleIcon) toggleIcon.className = 'fa-solid fa-arrow-left';

    if (forgotText) forgotText.textContent = t.link_olvidaste;
    if (forgotIcon) forgotIcon.className = 'fa-solid fa-key';

    if (submitText) submitText.textContent = t.btn_registro;
    if (submitIcon) submitIcon.className = 'fa-solid fa-check';
  } else if (authModo === 'recuperar') {
    box?.classList.remove('modo-registro');
    seccionLogin?.classList.add('is-oculto');
    seccionReg?.classList.add('is-oculto');
    seccionRec?.classList.remove('is-oculto');
    if (googleBtn) googleBtn.classList.add('is-oculto');

    if (tituloEl) tituloEl.textContent = t.recuperar_titulo;
    if (subEl) subEl.textContent = t.recuperar_sub;
    if (iconEl) iconEl.className = 'fa-solid fa-key auth-header-icon';

    if (toggleText) toggleText.textContent = t.link_volver_login;
    if (toggleIcon) toggleIcon.className = 'fa-solid fa-arrow-left';

    if (forgotText) forgotText.textContent = t.link_crear_cuenta;
    if (forgotIcon) forgotIcon.className = 'fa-solid fa-user-plus';

    if (submitText) submitText.textContent = t.btn_recuperar;
    if (submitIcon) submitIcon.className = 'fa-solid fa-paper-plane';
  } else {
    authModo = 'login';
    box?.classList.remove('modo-registro');
    seccionLogin?.classList.remove('is-oculto');
    seccionReg?.classList.add('is-oculto');
    seccionRec?.classList.add('is-oculto');
    if (googleBtn) googleBtn.classList.remove('is-oculto');

    if (tituloEl) tituloEl.textContent = t.login_titulo;
    if (subEl) subEl.textContent = t.login_sub;
    if (iconEl) iconEl.className = 'fa-solid fa-circle-user auth-header-icon';

    if (toggleText) toggleText.textContent = t.link_crear_cuenta;
    if (toggleIcon) toggleIcon.className = 'fa-solid fa-user-plus';

    if (forgotText) forgotText.textContent = t.link_olvidaste;
    if (forgotIcon) forgotIcon.className = 'fa-solid fa-key';

    if (submitText) submitText.textContent = t.btn_login;
    if (submitIcon) submitIcon.className = 'fa-solid fa-right-to-bracket';
  }
}

export function alternarModoAuth() {
  if (authModo === 'login') {
    setModoAuth('registro');
  } else {
    setModoAuth('login');
  }
}

export function alternarModoRecuperar() {
  if (authModo === 'recuperar') {
    setModoAuth('login');
  } else {
    setModoAuth('recuperar');
  }
}

export function abrirModalLogin(modoInicial = 'login') {
  setModoAuth(modoInicial);
  document.getElementById('modalLogin')?.classList.add('open');
}

export function cerrarModalLogin() {
  document.getElementById('modalLogin')?.classList.remove('open');
}

export async function procesarAuth() {
  const feedbackEl = document.getElementById('authFeedback');

  if (authModo === 'recuperar') {
    const inputRec = document.getElementById('recuperarInput');
    await procesarRecuperacion(inputRec, feedbackEl, idiomaActual);
    return;
  }

  if (authModo === 'registro') {
    const nombreEl = document.getElementById('regNombre');
    const celularEl = document.getElementById('regCelular');
    const usuarioEl = document.getElementById('regUsuario');
    const emailEl = document.getElementById('regEmail');
    const passEl = document.getElementById('regPassword');
    const passConfirmEl = document.getElementById('regPasswordConfirm');

    try {
      const res = await ejecutarRegistro({
        nombreEl,
        celularEl,
        usuarioEl,
        emailEl,
        passEl,
        passConfirmEl,
        feedbackEl,
        idioma: idiomaActual
      });
      if (res) {
        setTimeout(() => {
          cerrarModalLogin();
          const rol = res.smile?.rol || 'cliente';
          window.location.href = rol === 'personal' ? '/personal' : '/cliente';
        }, 800);
      }
    } catch (e) {
      // Feedback ya manejado
    }
    return;
  }

  // Modo Login (Usuario o Correo)
  const userInputEl = document.getElementById('loginUsuarioOrEmail');
  const passInputEl = document.getElementById('loginPass');

  try {
    const res = await ejecutarLogin(userInputEl, passInputEl, feedbackEl, idiomaActual);
    if (res) {
      setTimeout(() => {
        cerrarModalLogin();
        const rol = res.smile?.rol || 'cliente';
        window.location.href = rol === 'personal' ? '/personal' : '/cliente';
      }, 800);
    }
  } catch (e) {
    // Feedback ya manejado
  }
}

export async function loginConGoogle() {
  const feedbackEl = document.getElementById('authFeedback');
  mostrarFeedback(feedbackEl, idiomaActual === 'en' ? 'Connecting with Google...' : 'Conectando con Google...', 'info');
  try {
    const res = await iniciarConGoogle();
    mostrarFeedback(feedbackEl, idiomaActual === 'en' ? 'Welcome! Redirecting...' : '¡Bienvenido! Entrando...', 'success');
    setTimeout(() => {
      cerrarModalLogin();
      const rol = res.smile?.rol || 'cliente';
      window.location.href = rol === 'personal' ? '/personal' : '/cliente';
    }, 800);
  } catch (err) {
    console.error('Error Google Auth:', err);
    mostrarFeedback(feedbackEl, idiomaActual === 'en' ? 'Could not complete Google Sign-In.' : 'No se pudo completar el acceso con Google.', 'error');
  }
}

export function initAuthListeners() {
  const regUsuario = document.getElementById('regUsuario');
  const regEmail = document.getElementById('regEmail');
  const regPass = document.getElementById('regPassword');
  const regPassConfirm = document.getElementById('regPasswordConfirm');

  if (regUsuario) {
    regUsuario.addEventListener('input', () => validarUsuarioEnVivo(regUsuario, idiomaActual));
    regUsuario.addEventListener('blur', () => validarUsuarioEnVivo(regUsuario, idiomaActual));
  }

  if (regEmail) {
    regEmail.addEventListener('input', () => validarEmailEnVivo(regEmail, idiomaActual));
    regEmail.addEventListener('blur', () => validarEmailEnVivo(regEmail, idiomaActual));
  }

  if (regPassConfirm && regPass) {
    regPassConfirm.addEventListener('input', () => validarPasswordConfirm(regPass, regPassConfirm, idiomaActual));
    regPassConfirm.addEventListener('blur', () => validarPasswordConfirm(regPass, regPassConfirm, idiomaActual));
  }
}


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

  // AUTOCOMPLETADO INTELIGENTE LOCAL-FIRST (CERO DIGITACIÓN PARA CLIENTES REGISTRADOS)
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

  document.getElementById('modalPedido')?.classList.add('open');
}

export function cerrarModalPedido() {
  document.getElementById('modalPedido')?.classList.remove('open');
}

// --------------------------------------------------------------------------
// 4. DESPACHO DIRECTO DE PEDIDO A WHATSAPP (Con Saludo Dinámico y Tono Natural)
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
    alert(idiomaActual === 'en'
      ? 'Please provide your address so we can deliver your gas cylinder.'
      : 'Por favor indícanos tu dirección (calle, número o referencia) para llevarte el balón.');
    document.getElementById('pedDireccion')?.focus();
    return;
  }

  const saludo = Saludar('', idiomaActual).replace(',', '');
  const smile = getSmileLocal();
  const idCliente = smile?.usuario ? ` (@${smile.usuario})` : (smile?.pin ? ` [PIN: ${smile.pin}]` : '');
  
  // Mensaje en tono servicial del cliente sin redundancias de dirección de la empresa
  const textoMensaje = idiomaActual === 'en'
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

  const urlWa = `https://api.whatsapp.com/send?phone=${negocio.telefonoLimpio || negocio.telefonoRaw}&text=${encodeURIComponent(textoMensaje)}`;
  window.open(urlWa, '_blank');
  cerrarModalPedido();
}


// --------------------------------------------------------------------------
// INICIALIZACIÓN GLOBAL EN EL WINDOW
// --------------------------------------------------------------------------
if (typeof window !== 'undefined') {
  window.abrirModalLogin = abrirModalLogin;
  window.cerrarModalLogin = cerrarModalLogin;
  window.alternarModoAuth = alternarModoAuth;
  window.alternarModoRecuperar = alternarModoRecuperar;
  window.procesarAuth = procesarAuth;
  window.loginConGoogle = loginConGoogle;
  window.abrirModalPedido = abrirModalPedido;
  window.cerrarModalPedido = cerrarModalPedido;
  window.enviarPedidoModalWhatsApp = enviarPedidoModalWhatsApp;

  document.addEventListener('DOMContentLoaded', () => {
    initDistrictSelector();
    initCalculator();
    initAuthListeners();
  });
}

