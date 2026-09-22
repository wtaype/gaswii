// src/feature/personal/modulos/correo/correo.js
// Controlador Frontend Autónomo del Módulo Correo (Solgas Surquillo)
// Markdown Live Editor + Previsualización en Tiempo Real + Datos Dinámicos

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
} from './plantillas.js';
import { obtenerDatosNegocio } from '../negocio/dataNegocio.js';

export function inicializarModuloCorreo() {
  const panel = document.getElementById('panel-correo');
  if (!panel || panel.dataset.correoInit === 'true') return;
  panel.dataset.correoInit = 'true';

  let plantillaSeleccionada = 'pedido';
  let isSending = false;
  let liveDebounceTimer = null;

  // Elementos de formulario
  const form = document.getElementById('formEnviarCorreo');
  const hiddenTipo = document.getElementById('crSelectTipo');
  const inputTo = document.getElementById('crInputTo');
  const inputNombre = document.getElementById('crInputNombre');
  const inputCc = document.getElementById('crInputCc');
  const wrapCc = document.getElementById('crWrapCc');
  const btnToggleCc = document.getElementById('btnToggleCc');
  const inputSubject = document.getElementById('crInputSubject');
  const textMarkdown = document.getElementById('crTextMarkdown');
  const btnReset = document.getElementById('btnResetPlantilla');
  const btnEnviar = document.getElementById('btnEnviarCorreo');
  const pillsWrap = document.getElementById('crPillsCategorias');
  const wordsCounter = document.getElementById('crLiveWordsCount');

  // Cajas dinámicas por categoría
  const boxPedido = document.getElementById('crFieldsPedido');
  const boxComprobante = document.getElementById('crFieldsComprobante');
  const boxCotizacion = document.getElementById('crFieldsCotizacion');

  // Inputs específicos de Pedido
  const inPedNumero = document.getElementById('crPedNumero');
  const inPedPrecio = document.getElementById('crPedPrecio');
  const inPedProducto = document.getElementById('crPedProducto');
  const inPedPago = document.getElementById('crPedPago');
  const inPedDireccion = document.getElementById('crPedDireccion');

  // Inputs específicos de Comprobante SUNAT
  const inCompTipo = document.getElementById('crCompTipo');
  const inCompSerie = document.getElementById('crCompSerie');
  const inCompMonto = document.getElementById('crCompMonto');
  const inCompDoc = document.getElementById('crCompDoc');

  // Inputs específicos de Cotización
  const inCotNumero = document.getElementById('crCotNumero');
  const inCotEmpresa = document.getElementById('crCotEmpresa');
  const inCotValidez = document.getElementById('crCotValidez');

  // Live Preview Elements
  const liveFrame = document.getElementById('crLiveFrame');
  const frameWrap = document.getElementById('crFrameWrap');
  const deviceButtons = document.querySelectorAll('.cr-device-btn');

  // Elementos de Ajustes y Lista
  const formAjustes = document.getElementById('formAjustesCorreo');
  const inputAjusteNombre = document.getElementById('crAjusteNombre');
  const inputAjusteEmail = document.getElementById('crAjusteEmail');
  const badgeRemitente = document.getElementById('crBadgeRemitenteActivo');
  const historyList = document.getElementById('crHistoryList');
  const badgeTotal = document.getElementById('crBadgeTotal');
  const inputBuscar = document.getElementById('crInputBuscar');

  // Modal
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
    if (badgeRemitente) badgeRemitente.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${aj.remitenteEmail || 'pedidos@solgassurquillo.com'}`;
  }

  formAjustes?.addEventListener('submit', (e) => {
    e.preventDefault();
    const nombre = (inputAjusteNombre?.value || 'Solgas Surquillo').replace(/[<>]/g, '').trim();
    const rawEmail = inputAjusteEmail?.value?.trim() || 'pedidos@solgassurquillo.com';
    const emailLimpio = limpiarEmail(rawEmail) || 'pedidos@solgassurquillo.com';

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

    if (badgeRemitente) badgeRemitente.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${emailFinal}`;
    Notificacion('Ajustes guardados correctamente', 'success', 2500);
    actualizarLivePreview();
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

  // 3. Switch de Dispositivo en Live Preview (Desktop / Móvil)
  deviceButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      deviceButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const dev = btn.getAttribute('data-device');
      if (dev === 'mobile') {
        frameWrap?.classList.add('is-mobile');
      } else {
        frameWrap?.classList.remove('is-mobile');
      }
    });
  });

  // 4. Construcción Dinámica del Correo
  function construirCorreoActual() {
    const cliente = inputNombre?.value?.trim() || 'Estimado/a cliente';
    const asunto = inputSubject?.value?.trim() || 'Comunicado Oficial';
    const markdown = textMarkdown?.value || '';
    const negocio = obtenerDatosNegocio();

    switch (plantillaSeleccionada) {
      case 'pedido':
        return generarPlantillaPedido({
          cliente,
          pedidoId: inPedNumero?.value?.trim() || 'GW-1029',
          producto: inPedProducto?.value?.trim() || 'Balón SOLGAS Premium 10 kg',
          cantidad: 1,
          precio: inPedPrecio?.value?.trim() || '65.00',
          direccion: inPedDireccion?.value?.trim() || 'Surquillo, Lima',
          metodoPago: inPedPago?.value?.trim() || 'Efectivo / Yape',
          mensajeMarkdown: markdown,
          negocio
        });

      case 'comprobante':
        return generarPlantillaComprobante({
          cliente,
          tipoComprobante: inCompTipo?.value || 'Boleta de Venta Electrónica',
          serieNumero: inCompSerie?.value?.trim() || 'B001-000482',
          monto: inCompMonto?.value?.trim() || '65.00',
          docIdentidad: inCompDoc?.value?.trim() || '',
          mensajeMarkdown: markdown,
          negocio
        });

      case 'cotizacion':
        return generarPlantillaCotizacion({
          cliente,
          empresa: inCotEmpresa?.value?.trim() || 'Empresa Solicitante',
          cotizacionId: inCotNumero?.value?.trim() || 'COT-2026-08',
          validez: inCotValidez?.value?.trim() || '15 días calendario',
          mensajeMarkdown: markdown,
          negocio
        });

      case 'libre':
      default:
        return generarPlantillaLibre({
          cliente,
          asunto,
          mensajeMarkdown: markdown,
          negocio
        });
    }
  }

  // 5. Renderizado en Tiempo Real en el Iframe (Live Preview)
  function actualizarLivePreview() {
    clearTimeout(liveDebounceTimer);
    liveDebounceTimer = setTimeout(() => {
      if (!liveFrame) return;
      const { html } = construirCorreoActual();
      liveFrame.srcdoc = html;
      actualizarContadorPalabras();
    }, 40);
  }

  // Contador de palabras y tiempo de lectura
  function actualizarContadorPalabras() {
    if (!wordsCounter || !textMarkdown) return;
    const txt = textMarkdown.value.trim();
    const words = txt ? txt.split(/\s+/).filter(Boolean).length : 0;
    const min = Math.max(1, Math.ceil(words / 180));
    wordsCounter.textContent = `${words} palabras · ${min} min lectura`;
  }

  // 6. Aplicar Plantilla / Categoría
  function aplicarPlantilla(nombrePlantilla) {
    plantillaSeleccionada = nombrePlantilla;
    if (hiddenTipo) hiddenTipo.value = nombrePlantilla;

    // Mostrar/ocultar cajas dinámicas
    if (boxPedido) boxPedido.style.display = nombrePlantilla === 'pedido' ? 'block' : 'none';
    if (boxComprobante) boxComprobante.style.display = nombrePlantilla === 'comprobante' ? 'block' : 'none';
    if (boxCotizacion) boxCotizacion.style.display = nombrePlantilla === 'cotizacion' ? 'block' : 'none';

    switch (nombrePlantilla) {
      case 'pedido':
        if (inputSubject) inputSubject.value = '🔥 ¡Tu pedido de gas está confirmado! · Solgas Surquillo';
        if (textMarkdown) textMarkdown.value = 'Nota adicional: El repartidor llamará 5 minutos antes de llegar a tu puerta con el POS y la balanza calibrada.';
        break;

      case 'comprobante':
        if (inputSubject) inputSubject.value = '📄 Tu Boleta de Venta Electrónica B001-000482 · Solgas Surquillo';
        if (textMarkdown) textMarkdown.value = `### Detalle de Facturación:
- **Operación:** Venta al por menor de gas doméstico GLP.
- **Tipo:** Venta gravada con IGV incluido.
- **Canal:** Despacho Express Surquillo.`;
        break;

      case 'cotizacion':
        if (inputSubject) inputSubject.value = '📋 Cotización Comercial de Balones de Gas · Solgas Surquillo';
        if (textMarkdown) textMarkdown.value = `| Balón Solgas | Cantidad | Precio Unit. | Subtotal |
| :--- | :---: | :---: | :---: |
| Balón 45 kg Industrial | 2 | S/ 220.00 | S/ 440.00 |
| Balón 10 kg Plus | 5 | S/ 65.00 | S/ 325.00 |

### Beneficios para tu establecimiento:
- Despacho prioritario programado semanal o quincenal.
- Mantenimiento y verificación de válvulas gratis.`;
        break;

      case 'libre':
      default:
        if (inputSubject) inputSubject.value = 'Comunicado Oficial · Solgas Surquillo';
        if (textMarkdown) textMarkdown.value = `## Estimado cliente,

Te informamos que durante el feriado mantendremos nuestra atención continua en Surquillo, Miraflores, San Borja y San Isidro.

- **Horario:** 06:30 am a 09:30 pm.
- **Pedidos express:** Vía web y WhatsApp directo.`;
        break;
    }

    actualizarLivePreview();
  }

  pillsWrap?.addEventListener('click', (e) => {
    const btn = e.target.closest('.cr-pill-btn');
    if (!btn) return;
    adrm(btn, 'active');
    const tpl = btn.getAttribute('data-template') || 'pedido';
    aplicarPlantilla(tpl);
  });

  // 7. Eventos de la Barra de Herramientas Markdown
  const toolbar = document.getElementById('crMdToolbar');
  toolbar?.addEventListener('click', (e) => {
    const btn = e.target.closest('.cr-md-btn');
    if (!btn || !textMarkdown) return;

    const tag = btn.getAttribute('data-tag');
    if (!tag) return;

    const s = textMarkdown.selectionStart;
    const end = textMarkdown.selectionEnd;
    const seleccionado = textMarkdown.value.substring(s, end) || 'texto';

    let insercion = '';
    if (tag === 'table') {
      insercion = `\n| Producto | Cantidad | Precio Unit. | Subtotal |\n| :--- | :---: | :---: | :---: |\n| Balón 10 kg | 1 | S/ 65.00 | S/ 65.00 |\n`;
    } else if (tag.includes('texto')) {
      insercion = tag.replace('texto', seleccionado);
    } else {
      insercion = tag;
    }

    textMarkdown.value = textMarkdown.value.substring(0, s) + insercion + textMarkdown.value.substring(end);
    textMarkdown.focus();
    textMarkdown.selectionStart = s;
    textMarkdown.selectionEnd = s + insercion.length;

    actualizarLivePreview();
  });

  // 8. Escucha global de inputs en tiempo real (para cualquier cambio)
  document.querySelectorAll('.cr-live-input').forEach(input => {
    input.addEventListener('input', actualizarLivePreview);
    input.addEventListener('change', actualizarLivePreview);
  });
  inputNombre?.addEventListener('input', actualizarLivePreview);

  // Botón Restablecer
  btnReset?.addEventListener('click', () => {
    aplicarPlantilla(plantillaSeleccionada);
    Notificacion('Plantilla restablecida a los valores sugeridos.', 'info', 2000);
  });

  // 9. Envío del Formulario
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (isSending) return;

    const to = inputTo?.value?.trim();
    const nombre = inputNombre?.value?.trim();
    const cc = inputCc?.value?.trim();
    const subject = inputSubject?.value?.trim();
    const tipo = hiddenTipo?.value || 'pedido';

    if (!to || !subject) {
      Notificacion('Por favor completa el destinatario y el asunto.', 'warning', 3000);
      return;
    }

    isSending = true;
    if (btnEnviar) wiSpin(btnEnviar, true, 'Despachando correo...');

    try {
      const { html, resumen, asunto: asuntoFinal } = construirCorreoActual();

      await enviarCorreo({
        para: to,
        nombre,
        cc: cc ? cc.split(',').map(s => s.trim()) : [],
        asunto: subject || asuntoFinal,
        tipo,
        mensaje: resumen,
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

  // 10. Renderizar Historial de Correos Enviados
  function renderHistorial(filtro = '') {
    if (!historyList) return;
    const correos = obtenerCorreos();
    if (badgeTotal) badgeTotal.textContent = String(correos.length);

    const filtrados = filtro
      ? correos.filter(c => 
          (c.destinatario?.para || '').toLowerCase().includes(filtro.toLowerCase()) ||
          (c.destinatario?.nombre || '').toLowerCase().includes(filtro.toLowerCase()) ||
          (c.mensaje?.asunto || '').toLowerCase().includes(filtro.toLowerCase())
        )
      : correos;

    if (filtrados.length === 0) {
      historyList.innerHTML = `
        <div class="cr-empty-state">
          <i class="fa-solid fa-inbox"></i>
          <div>No hay correos registrados todavía.</div>
        </div>
      `;
      return;
    }

    historyList.innerHTML = filtrados.map(c => {
      const fechaTxt = c.fecha || '';
      const tipoTxt = (c.mensaje?.tipo || 'General').toUpperCase();
      const para = c.destinatario?.para || 'cliente';
      const asunto = c.mensaje?.asunto || 'Sin Asunto';
      const resendId = c.resendId ? c.resendId.substring(0, 10) + '...' : 'OK';

      return `
        <div class="cr-mail-card" data-id="${c.id}">
          <div class="cr-mail-head">
            <span class="cr-mail-tag">${tipoTxt}</span>
            <span class="cr-mail-date">${fechaTxt}</span>
          </div>
          <div class="cr-mail-to"><i class="fa-solid fa-user" style="font-size:10px; opacity:0.6;"></i> ${para}</div>
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

  // Buscador en vivo del historial
  inputBuscar?.addEventListener('input', (e) => {
    renderHistorial(e.target.value.trim());
  });

  // Clic en tarjeta de historial para ver en modal
  historyList?.addEventListener('click', (e) => {
    const card = e.target.closest('.cr-mail-card');
    if (!card) return;
    const id = card.getAttribute('data-id');
    const correo = obtenerCorreos().find(c => c.id === id);
    if (!correo || !modal) return;

    if (modalAsunto) modalAsunto.textContent = correo.mensaje?.asunto || 'Detalle del Correo';
    if (modalInfo) modalInfo.textContent = `Para: ${correo.destinatario?.para} · Enviado el ${correo.fecha || ''}`;
    if (modalIframe) {
      modalIframe.srcdoc = correo.mensaje?.html || `<p>${correo.mensaje?.resumen || ''}</p>`;
    }
    modal.style.display = 'grid';
  });

  btnCloseModal?.addEventListener('click', () => {
    if (modal) modal.style.display = 'none';
  });

  modal?.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });

  // Inicialización final
  cargarAjustes();
  aplicarPlantilla('pedido');
  renderHistorial();

  // Sincronización en background con Firestore
  sincronizarCorreosDesdeFirestore().then(() => renderHistorial());
}
