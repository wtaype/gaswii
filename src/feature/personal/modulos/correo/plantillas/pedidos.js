// src/feature/personal/modulos/correo/plantillas/pedidos.js
// Plantilla de Confirmación de Asesoría y Servicios
// 100% Modular y Reutilizable

import { envoltorioBase } from './base.js';
import { mdToEmailHtml } from './parser.js';

export function generarPlantillaPedido({
  cliente = 'Estimado/a cliente',
  pedidoId = 'PED-1029',
  producto = 'Balón SOLGAS Premium 10 kg',
  cantidad = 1,
  precio = '65.00',
  direccion = 'Jr. Dante 260, Surquillo',
  metodoPago = 'Efectivo / Yape / Plin',
  tiempoEstimado = '15 a 20 minutos (Express)',
  mensajeMarkdown = '',
  negocio = {}
} = {}) {
  const contenidoExtraHtml = mensajeMarkdown ? mdToEmailHtml(mensajeMarkdown) : '';
  const nombreEmpresa = negocio?.nombre || '';
  const esServicios = negocio?.modeloNegocio === 'servicios_y_asesorias';
  const colorMarca = negocio?.colorPrimario || '#ff6600';

  const tituloEncabezado = esServicios ? '⚖️ ¡Tu cita de asesoría está confirmada!' : '📦 ¡Tu pedido de gas está confirmado!';
  const bajadaTexto = esServicios 
    ? 'Hemos registrado tu solicitud de atención. Nuestro especialista revisará tu caso para guiarte en tu gestión.' 
    : 'Hemos recibido tu pedido con éxito y nuestra unidad de reparto se encuentra preparando tu despacho con balanza digital calibrada.';
  const itemLabel = esServicios ? 'Servicio contratado:' : 'Balón / Producto:';
  const modalidadLabel = esServicios ? 'Modalidad / Ubicación:' : 'Dirección de Entrega:';
  const tiempoLabel = esServicios ? 'Duración:' : 'Tiempo de Entrega:';
  const totalLabel = esServicios ? 'Honorario Total:' : 'Total a Pagar en Puerta:';
  const garantiaTexto = esServicios
    ? '🛡️ <strong>Garantía Profesional:</strong> Asesoría directa con especialista colegiada con absolución fundamentada en el Código Tributario.'
    : '🛡️ <strong>Garantía Oficial Solgas:</strong> Precinto de seguridad termocontraíble intacto. Nuestro repartidor verificará el peso neto exacto con balanza digital en su presencia.';
  const botonTexto = esServicios ? '📲 Coordinar Horario por WhatsApp' : '🛵 Consultar Estado por WhatsApp';

  const contenidoHtml = `
    <h2 style="color: ${colorMarca}; margin-top: 0; font-size: 22px; font-weight: 800;">${tituloEncabezado}</h2>
    <p style="font-size: 15px;">Hola <strong>${cliente}</strong>,</p>
    <p style="color: #475569; font-size: 14px; margin-bottom: 20px;">${bajadaTexto}</p>

    <!-- Ficha de Datos del Pedido -->
    <div style="background: #fdfbf7; border: 1px solid #e5dccb; border-radius: 10px; padding: 18px; margin: 18px 0;">
      <table style="width: 100%; font-size: 14px;">
        <tr>
          <td style="padding: 6px 0; color: #64748b;">N° de Pedido:</td>
          <td style="padding: 6px 0; font-weight: 800; text-align: right; color: ${colorMarca};">#${pedidoId}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">${itemLabel}</td>
          <td style="padding: 6px 0; font-weight: 700; text-align: right; color: #0f172a;">${cantidad}x ${producto}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">${modalidadLabel}</td>
          <td style="padding: 6px 0; font-weight: 500; text-align: right; color: #334155;">${direccion}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">Medio de Pago:</td>
          <td style="padding: 6px 0; font-weight: 500; text-align: right; color: #334155;">${metodoPago}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b;">${tiempoLabel}</td>
          <td style="padding: 6px 0; font-weight: 700; text-align: right; color: #16a34a;">${tiempoEstimado}</td>
        </tr>
        <tr style="border-top: 2px dashed #e2e8f0;">
          <td style="padding: 12px 0 4px; font-size: 15px; font-weight: 800; color: #0f172a;">${totalLabel}</td>
          <td style="padding: 12px 0 4px; font-size: 20px; font-weight: 900; text-align: right; color: ${colorMarca};">S/ ${precio}</td>
        </tr>
      </table>
    </div>

    ${contenidoExtraHtml}

    <!-- Garantía Oficial -->
    <div style="background: #fdfbf7; border-left: 4px solid ${colorMarca}; padding: 14px 18px; border-radius: 6px; margin: 18px 0;">
      <p style="margin: 0; color: #334155; font-size: 13px; line-height: 1.6;">
        ${garantiaTexto}
      </p>
    </div>

    <div style="text-align: center; margin-top: 22px;">
      <a href="https://wa.me/${(negocio.contacto?.whatsappLimpio || negocio.contacto?.whatsapp || '').replace(/\D/g, '')}?text=${encodeURIComponent('Hola ' + nombreEmpresa + ', deseo consultar por mi pedido #' + pedidoId)}" class="btn-ws">
        ${botonTexto}
      </a>
    </div>
  `;

  const asunto = `📦 ¡Tu pedido #${pedidoId} está confirmado! · ${nombreEmpresa}`;
  const vistaPreviaTexto = `Pedido #${pedidoId} registrado con éxito. Total: S/ ${precio}.`;
  return { asunto, html: envoltorioBase({ contenidoHtml, asunto, vistaPreviaTexto, negocio }), resumen: vistaPreviaTexto };
}
