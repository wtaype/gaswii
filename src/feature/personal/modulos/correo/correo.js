// src/feature/personal/modulos/correo/correo.js
// Controlador Frontend Autónomo del Módulo Correo (Solgas Surquillo)
// 100% JS Nativo · Integrado con dataCorreo.js, plantillasCorreo.js y @widev

import { Notificacion, wiSpin, adrm } from '@widev';
import {
  enviarCorreo,
  obtenerCorreos,
  sincronizarCorreosDesdeFirestore,
  obtenerAjustesCorreo,
  guardarAjustesCorreo,
  limpiarEmail
} from './dataCorreo.js';
import {
  generarPlantillaPedido,
  generarPlantillaComprobante,
  generarPlantillaCotizacion,
  generarPlantillaLibre
} from './plantillasCorreo.js';

export function inicializarModuloCorreo() {
  const panel = document.getElementById('panel-correo');
  if (!panel || panel.dataset.correoInit === 'true') return;
  panel.dataset.correoInit = 'true';

  let plantillaSeleccionada = 'pedido';
  let isSending = false;

  // Elementos del formulario principal
  const form = document.getElementById('formEnviarCorreo');
  const pillsWrap = document.getElementById('crPillsTemplates');
  const inputTo = document.getElementById('crInputTo');
  const inputNombre = document.getElementById('crInputNombre');
  const btnToggleCc = document.getElementById('btnToggleCc');
  const wrapCc = document.getElementById('crWrapCc');
  const inputCc = document.getElementById('crInputCc');
  const hiddenTipo = document.getElementById('crSelectTipo');
  const inputSubject = document.getElementById('crInputSubject');
  const textMensaje = document.getElementById('crTextMensaje');
  const btnEnviar = document.getElementById('btnEnviarCorreo');
  const btnPreview = document.getElementById('btnPreviewCorreo');
  const badgeRemitente = document.getElementById('crBadgeRemitenteActivo');

  // Elementos de la tarjeta de ajustes
  const formAjustes = document.getElementById('formAjustesCorreo');
  const inputAjusteNombre = document.getElementById('crAjusteNombre');
  const inputAjusteEmail = document.getElementById('crAjusteEmail');

  // Elementos de la lista y buscador
  const historyList = document.getElementById('crHistoryList');
  const badgeTotal = document.getElementById('crBadgeTotal');
  const inputBuscar = document.getElementById('crInputBuscar');

  // Elementos del modal
  const modal = document.getElementById('crModalDetalle');
  const modalAsunto = document.getElementById('crModalAsunto');
  const modalInfo = document.getElementById('crModalInfo');
  const modalIframe = document.getElementById('crModalIframe');
  const btnCloseModal = document.getElementById('btnCloseModalDetalle');

  // 1. Cargar Ajustes iniciales
  function cargarAjustes() {
    const aj = obtenerAjustesCorreo();
    if (inputAjusteNombre) inputAjusteNombre.value = aj.remitenteNombre || 'Solgas Surquillo';
    if (inputAjusteEmail) inputAjusteEmail.value = aj.remitenteEmail || 'pedidos@solgassurquillo.com';
    if (badgeRemitente) badgeRemitente.textContent = `Remitente: ${aj.remitenteEmail || 'pedidos@solgassurquillo.com'}`;
  }

  formAjustes?.addEventListener('submit', (e) => {
    e.preventDefault();
    const nombre = (inputAjusteNombre?.value || 'Solgas Surquillo').replace(/[<>]/g, '').trim();
    const rawEmail = inputAjusteEmail?.value?.trim() || 'pedidos@solgassurquillo.com';
    const emailLimpio = limpiarEmail(rawEmail) || 'pedidos@solgassurquillo.com';

    // Si el usuario intentó guardar un correo no oficial, asegurarse de mantener el dominio verificado
    const emailFinal = emailLimpio.toLowerCase().endsWith('@solgassurquillo.com')
      ? emailLimpio
      : 'pedidos@solgassurquillo.com';

    if (inputAjusteEmail) inputAjusteEmail.value = emailFinal;
    if (inputAjusteNombre) inputAjusteNombre.value = nombre;

    guardarAjustesCorreo({
      remitenteNombre: nombre,
      remitenteEmail: emailFinal,
      responderA: emailFinal
    });

    if (badgeRemitente) badgeRemitente.textContent = `Remitente: ${emailFinal}`;
    Notificacion('Ajustes guardados correctamente (Dominio verificado: solgassurquillo.com)', 'success', 3000);
  });

  // 2. Toggle opcional para campo CC
  btnToggleCc?.addEventListener('click', () => {
    if (!wrapCc) return;
    const isHidden = wrapCc.style.display === 'none';
    wrapCc.style.display = isHidden ? 'block' : 'none';
    btnToggleCc.innerHTML = isHidden 
      ? '<i class="fa-solid fa-minus"></i> Ocultar copia CC' 
      : '<i class="fa-solid fa-plus"></i> Añadir copia CC (opcional)';
    if (isHidden && inputCc) inputCc.focus();
  });

  // 3. Aplicar Plantilla / Categoría
  function aplicarPlantilla(nombrePlantilla) {
    plantillaSeleccionada = nombrePlantilla;
    if (hiddenTipo) hiddenTipo.value = nombrePlantilla;

    switch (nombrePlantilla) {
      case 'pedido':
        if (inputSubject) inputSubject.value = '🔥 ¡Tu pedido de gas está confirmado! · Solgas Surquillo';
        if (textMensaje) textMensaje.value = 'Hemos recibido tu pedido con éxito y nuestra unidad de despacho express ya se encuentra en camino con balanza digital calibrada Inacal.';
        break;

      case 'comprobante':
        if (inputSubject) inputSubject.value = '📄 Tu Boleta de Venta Electrónica B001-000482 · Solgas Surquillo';
        if (textMensaje) textMensaje.value = 'Te adjuntamos el comprobante de pago electrónico por tu compra de balón de gas en Solgas Surquillo conforme a las normativas de la SUNAT.';
        break;

      case 'cotizacion':
        if (inputSubject) inputSubject.value = '📋 Cotización Comercial de Balones de Gas · Solgas Surquillo';
        if (textMensaje) textMensaje.value = 'Presentamos nuestra propuesta formal de abastecimiento de gas GLP para su negocio con tarifas preferenciales y despacho continuo.';
        break;

      case 'libre':
      default:
        if (hiddenTipo) hiddenTipo.value = 'general';
        if (inputSubject) inputSubject.value = 'Comunicado Oficial · Solgas Surquillo';
        if (textMensaje) textMensaje.value = '';
        break;
    }
  }

  pillsWrap?.addEventListener('click', (e) => {
    const btn = e.target.closest('.cr-pill-btn');
    if (!btn) return;

    adrm(btn, 'active');
    const tpl = btn.getAttribute('data-template') || 'pedido';
    aplicarPlantilla(tpl);
  });

  // 4. Construir HTML
  function construirHtmlCorreo() {
    const clienteNombre = inputNombre?.value?.trim() || 'Estimado/a cliente';
    const mensajeTexto = textMensaje?.value?.trim() || '';

    if (plantillaSeleccionada === 'pedido') {
      return generarPlantillaPedido({
        cliente: clienteNombre,
        pedidoId: 'GW-' + Math.floor(1000 + Math.random() * 9000),
        producto: 'Balón SOLGAS Premium 10 kg',
        cantidad: 1,
        precio: '65.00',
        direccion: 'Surquillo, Lima'
      });
    }

    if (plantillaSeleccionada === 'comprobante') {
      return generarPlantillaComprobante({
        cliente: clienteNombre,
        tipoComprobante: 'Boleta de Venta Electrónica',
        serieNumero: 'B001-' + String(Math.floor(100 + Math.random() * 900)).padStart(6, '0'),
        monto: '65.00'
      });
    }

    if (plantillaSeleccionada === 'cotizacion') {
      return generarPlantillaCotizacion({
        contacto: clienteNombre,
        empresa: clienteNombre.includes(' ') ? clienteNombre : 'Empresa Cliente',
        detalle: 'Suministro continuo de balones de 10kg / 45kg',
        precioUnitario: '65.00',
        cantidad: 2
      });
    }

    return generarPlantillaLibre({
      cliente: clienteNombre,
      asunto: inputSubject?.value?.trim() || 'Comunicado Oficial · Solgas Surquillo',
      mensaje: mensajeTexto
    });
  }

  // 5. Renderizado del historial de correos
  function renderHistorial(filtro = '') {
    if (!historyList) return;

    let items = obtenerCorreos();
    if (badgeTotal) badgeTotal.textContent = String(items.length);

    if (filtro) {
      const f = filtro.toLowerCase();
      items = items.filter(c => 
        (c.destinatario?.para || '').toLowerCase().includes(f) ||
        (c.destinatario?.nombre || '').toLowerCase().includes(f) ||
        (c.mensaje?.asunto || '').toLowerCase().includes(f)
      );
    }

    if (items.length === 0) {
      historyList.innerHTML = `
        <div class="cr-empty-state">
          <i class="fa-regular fa-paper-plane"></i>
          <p>${filtro ? 'No hay correos que coincidan con la búsqueda.' : 'Aún no has enviado correos. Completa el formulario de la izquierda y haz clic en Enviar.'}</p>
        </div>
      `;
      return;
    }

    historyList.innerHTML = items.map(c => {
      const tipo = c.mensaje?.tipo || 'general';
      const to = c.destinatario?.para || '';
      const nombre = c.destinatario?.nombre || '';
      const asunto = c.mensaje?.asunto || 'Sin asunto';
      const fecha = c.fecha || '';
      const resendId = c.resendId ? c.resendId.substring(0, 8) + '…' : '';

      return `
        <div class="cr-mail-card btn-view-mail" data-id="${c.id}">
          <div class="cr-mail-top">
            <span class="cr-mail-type-badge ${tipo}">${tipo}</span>
            <span class="cr-mail-date">${fecha}</span>
          </div>
          <div class="cr-mail-to">
            <i class="fa-solid fa-user-check" style="color:var(--brand-orange); font-size:12px;"></i>
            ${nombre ? `<strong>${nombre}</strong> <small style="color:var(--muted); font-weight:normal;">(${to})</small>` : to}
          </div>
          <div class="cr-mail-subject">${asunto}</div>
          <div class="cr-mail-snippet">${c.mensaje?.resumen || ''}</div>
          <div class="cr-mail-footer">
            <span><i class="fa-solid fa-circle-check" style="color:var(--green);"></i> Enviado</span>
            <span>ID: ${resendId}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  // 6. Envío del formulario
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (isSending) return;

    const to = inputTo?.value?.trim();
    const nombre = inputNombre?.value?.trim();
    const cc = inputCc?.value?.trim();
    const subject = inputSubject?.value?.trim();
    const tipo = hiddenTipo?.value || 'general';
    const mensaje = textMensaje?.value?.trim();

    if (!to || !subject) {
      Notificacion('Por favor completa el destinatario y el asunto.', 'warning', 3000);
      return;
    }

    isSending = true;
    if (btnEnviar) wiSpin(btnEnviar, true, 'Despachando correo...');

    try {
      const { html, resumen } = construirHtmlCorreo();

      await enviarCorreo({
        para: to,
        nombre,
        cc: cc ? cc.split(',').map(s => s.trim()) : [],
        asunto: subject,
        tipo,
        mensaje: mensaje || resumen,
        html
      });

      Notificacion(`¡Correo enviado con éxito a <strong>${to}</strong>!`, 'success', 3500);

      // Limpiar destinatario para el siguiente envío
      if (inputTo) inputTo.value = '';
      if (inputNombre) inputNombre.value = '';
      if (inputCc) inputCc.value = '';
      if (wrapCc) wrapCc.style.display = 'none';
      if (btnToggleCc) btnToggleCc.innerHTML = '<i class="fa-solid fa-plus"></i> Añadir copia CC (opcional)';

      renderHistorial();
    } catch (err) {
      console.error('[correo.js] Error al enviar:', err);
      Notificacion(`No se pudo enviar: ${err.message || 'Error en Resend'}`, 'error', 4500);
    } finally {
      isSending = false;
      if (btnEnviar) wiSpin(btnEnviar, false);
    }
  });

  // 7. Vista Previa en Modal
  btnPreview?.addEventListener('click', () => {
    const { html, asunto } = construirHtmlCorreo();
    const aj = obtenerAjustesCorreo();
    if (modalAsunto) modalAsunto.textContent = `Previsualización: ${asunto}`;
    if (modalInfo) modalInfo.textContent = `Destinatario: ${inputTo?.value?.trim() || 'cliente@ejemplo.com'} · Remitente: ${aj.remitenteNombre} <${aj.remitenteEmail}>`;
    if (modalIframe) modalIframe.srcdoc = html;
    if (modal) modal.style.display = 'grid';
  });

  // 8. Clic en tarjeta de historial para ver detalle
  historyList?.addEventListener('click', (e) => {
    const card = e.target.closest('.btn-view-mail');
    if (!card) return;

    const id = card.getAttribute('data-id');
    const correos = obtenerCorreos();
    const correo = correos.find(c => c.id === id);
    if (!correo) return;

    if (modalAsunto) modalAsunto.textContent = correo.mensaje?.asunto || 'Detalle del Correo';
    if (modalInfo) {
      modalInfo.innerHTML = `
        <strong>Para:</strong> ${correo.destinatario?.nombre ? correo.destinatario.nombre + ' · ' : ''}${correo.destinatario?.para || ''} | 
        <strong>Fecha:</strong> ${correo.fecha || ''} | 
        <strong>Resend ID:</strong> ${correo.resendId || 'N/A'}
      `;
    }
    if (modalIframe) {
      modalIframe.srcdoc = correo.mensaje?.html || `<p>${correo.mensaje?.resumen || ''}</p>`;
    }
    if (modal) modal.style.display = 'grid';
  });

  btnCloseModal?.addEventListener('click', () => {
    if (modal) modal.style.display = 'none';
  });

  modal?.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });

  inputBuscar?.addEventListener('input', () => {
    renderHistorial(inputBuscar.value.trim());
  });

  // 9. Inicialización
  cargarAjustes();
  aplicarPlantilla('pedido');
  renderHistorial();

  sincronizarCorreosDesdeFirestore().then(() => {
    renderHistorial();
  });
}

// Auto-inicialización segura
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', inicializarModuloCorreo);
} else {
  inicializarModuloCorreo();
}
