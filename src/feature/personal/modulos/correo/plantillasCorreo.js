// src/feature/personal/modulos/correo/plantillasCorreo.js
// Plantillas HTML Oficiales con Membrete Solgas Surquillo / Gaswii
// 100% Compatibles con Gmail, Outlook, Apple Mail y dispositivos móviles

/**
 * Envoltorio base para todos los correos de la empresa
 */
function envoltorioBase({ contenidoHtml, asunto, vistaPreviaTexto = '' }) {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${asunto}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f4f6f9; font-family: 'Segoe UI', Arial, sans-serif; color: #202b39; }
    table { border-collapse: collapse; }
    .card-wrap { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e6e9ed; box-shadow: 0 4px 15px rgba(0,0,0,0.04); }
    .header { background: #ffffff; padding: 24px 30px; border-bottom: 2px solid #e95716; text-align: left; }
    .logo-img { height: 42px; width: auto; vertical-align: middle; }
    .header-tag { float: right; font-size: 11px; font-weight: 700; color: #e95716; text-transform: uppercase; letter-spacing: 0.1em; background: #fff3ec; padding: 6px 12px; border-radius: 6px; margin-top: 8px; }
    .body-content { padding: 30px; line-height: 1.6; }
    .footer { background: #f8fafc; padding: 22px 30px; border-top: 1px solid #eef1f5; font-size: 12px; color: #718096; line-height: 1.5; }
    .btn-ws { display: inline-block; background: #25d366; color: #ffffff !important; text-decoration: none; font-weight: bold; font-size: 14px; padding: 12px 24px; border-radius: 8px; margin-top: 15px; }
    .badge-info { background: #fdf5f0; border-left: 4px solid #e95716; padding: 12px 16px; border-radius: 4px; margin: 18px 0; }
  </style>
</head>
<body>
  <span style="display:none;font-size:1px;color:#fff;max-height:0;">${vistaPreviaTexto}</span>
  <div class="card-wrap">
    <!-- Encabezado con Logo Oficial -->
    <div class="header">
      <span class="header-tag">Solgas Surquillo</span>
      <img src="https://media.solgassurquillo.com/logo.webp" alt="Solgas Surquillo" class="logo-img" onerror="this.style.display='none'" />
      <span style="font-size: 18px; font-weight: 800; color: #202b39; vertical-align: middle; margin-left: 8px;">SOLGAS SURQUILLO</span>
    </div>

    <!-- Contenido Principal -->
    <div class="body-content">
      ${contenidoHtml}
    </div>

    <!-- Pie de Página Corporativo -->
    <div class="footer">
      <p style="margin: 0 0 6px 0;"><strong>Solgas Surquillo · Distribuidor Autorizado OSINERGMIN Reg. 208492</strong></p>
      <p style="margin: 0 0 6px 0;">Sede Central: Jr. Dante 261, Surquillo, Lima | Central Delivery: +51 936 369 384</p>
      <p style="margin: 0; font-size: 11px; color: #a0aec0;">Este correo es una notificación oficial emitida por Gaswii. Si tienes dudas, contáctanos al WhatsApp de atención.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * 1. Plantilla: Confirmación de Pedido de Gas a Domicilio
 */
export function generarPlantillaPedido({
  cliente = 'Estimado/a cliente',
  pedidoId = 'GW-1029',
  producto = 'Balón SOLGAS Premium 10 kg',
  cantidad = 1,
  precio = '65.00',
  direccion = 'Surquillo, Lima',
  tiempoEstimado = '15 - 20 minutos',
  telefono = '936 369 384'
} = {}) {
  const contenidoHtml = `
    <h2 style="color: #e95716; margin-top: 0; font-size: 22px;">🔥 ¡Tu pedido de gas está confirmado!</h2>
    <p>Hola <strong>${cliente}</strong>,</p>
    <p>Hemos recibido tu pedido con éxito y nuestra unidad de despacho express ya se encuentra en camino.</p>

    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 20px 0;">
      <table style="width: 100%;">
        <tr>
          <td style="padding: 6px 0; color: #64748b; font-size: 13px;">Número de Pedido:</td>
          <td style="padding: 6px 0; font-weight: bold; text-align: right; color: #e95716;">#${pedidoId}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b; font-size: 13px;">Producto solicitado:</td>
          <td style="padding: 6px 0; font-weight: bold; text-align: right;">${cantidad}x ${producto}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b; font-size: 13px;">Dirección de Entrega:</td>
          <td style="padding: 6px 0; font-weight: 500; text-align: right;">${direccion}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b; font-size: 13px;">Tiempo estimado:</td>
          <td style="padding: 6px 0; font-weight: bold; text-align: right; color: #16a34a;">${tiempoEstimado}</td>
        </tr>
        <tr style="border-top: 1px solid #e2e8f0;">
          <td style="padding: 12px 0 6px; font-size: 15px; font-weight: bold;">Total a pagar:</td>
          <td style="padding: 12px 0 6px; font-size: 18px; font-weight: 900; text-align: right; color: #202b39;">S/ ${precio}</td>
        </tr>
      </table>
    </div>

    <div class="badge-info">
      <p style="margin: 0; color: #9a3412; font-size: 13px;">
        ⚖️ <strong>Garantía de Peso Exacto:</strong> Nuestro técnico pesará el balón con balanza digital Inacal frente a ti antes de conectarlo y realizará la prueba de hermeticidad gratuita.
      </p>
    </div>

    <div style="text-align: center; margin-top: 25px;">
      <a href="https://wa.me/51936369384?text=${encodeURIComponent('Hola Solgas Surquillo, deseo consultar el estado de mi pedido #' + pedidoId)}" class="btn-ws">
        📲 Consultar Estado por WhatsApp
      </a>
    </div>
  `;

  const asunto = `🔥 Confirmación de Pedido #${pedidoId} · Solgas Surquillo`;
  const vistaPreviaTexto = `Tu pedido de gas #${pedidoId} está en camino a ${direccion}.`;
  return { asunto, html: envoltorioBase({ contenidoHtml, asunto, vistaPreviaTexto }), resumen: vistaPreviaTexto };
}

/**
 * 2. Plantilla: Envío de Comprobante de Pago Electrónico (Boleta / Factura)
 */
export function generarPlantillaComprobante({
  cliente = 'Estimado cliente',
  tipoComprobante = 'Boleta de Venta Electrónica',
  serieNumero = 'B001-000482',
  monto = '65.00',
  fecha = '21 Sep 2026',
  urlDescarga = 'https://gaswii.com/cliente'
} = {}) {
  const contenidoHtml = `
    <h2 style="color: #202b39; margin-top: 0; font-size: 20px;">📄 Tu ${tipoComprobante}</h2>
    <p>Hola <strong>${cliente}</strong>,</p>
    <p>Te hacemos llegar el comprobante de pago electrónico emitido conforme a las normativas de la SUNAT por tu compra de gas GLP en Solgas Surquillo.</p>

    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
      <span style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: bold; letter-spacing: 0.05em;">${tipoComprobante}</span>
      <div style="font-size: 24px; font-weight: 800; color: #e95716; margin: 8px 0;">${serieNumero}</div>
      <div style="font-size: 16px; color: #334155; margin-bottom: 8px;">Monto Total: <strong>S/ ${monto}</strong></div>
      <div style="font-size: 13px; color: #94a3b8;">Fecha de emisión: ${fecha}</div>
    </div>

    <p style="font-size: 13px; color: #64748b;">
      Puedes consultar el estado de este comprobante y tus pedidos en cualquier momento ingresando a tu portal de cliente con tu número de DNI o RUC.
    </p>

    <div style="text-align: center; margin-top: 25px;">
      <a href="${urlDescarga}" style="display:inline-block; background:#e95716; color:#ffffff; padding:12px 24px; text-decoration:none; font-weight:bold; border-radius:8px;">
        📥 Ver Comprobante en Portal
      </a>
    </div>
  `;

  const asunto = `📄 Tu ${tipoComprobante} ${serieNumero} · Solgas Surquillo`;
  const vistaPreviaTexto = `Comprobante electrónico ${serieNumero} por el monto de S/ ${monto}.`;
  return { asunto, html: envoltorioBase({ contenidoHtml, asunto, vistaPreviaTexto }), resumen: vistaPreviaTexto };
}

/**
 * 3. Plantilla: Cotización Comercial (Restaurantes, Pollerías, Negocios)
 */
export function generarPlantillaCotizacion({
  contacto = 'Administración',
  empresa = 'Empresa',
  detalle = 'Abastecimiento de balones Solgas de 45 kg',
  precioUnitario = '220.00',
  cantidad = 2,
  validez = '7 días'
} = {}) {
  const subtotal = (parseFloat(precioUnitario) * parseInt(cantidad, 10)).toFixed(2);
  const contenidoHtml = `
    <h2 style="color: #e95716; margin-top: 0; font-size: 22px;">📋 Cotización Comercial de GLP</h2>
    <p>Estimados <strong>${empresa}</strong> (${contacto}),</p>
    <p>Agradecemos su interés en el suministro de gas GLP de alta pureza respaldado por Solgas S.A. Presentamos nuestra propuesta formal para su establecimiento:</p>

    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 18px; margin: 20px 0;">
      <table style="width: 100%;">
        <tr>
          <td style="padding: 6px 0; color: #64748b; font-size: 13px;">Requerimiento:</td>
          <td style="padding: 6px 0; font-weight: bold; text-align: right;">${detalle}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b; font-size: 13px;">Cantidad solicitada:</td>
          <td style="padding: 6px 0; font-weight: bold; text-align: right;">${cantidad} unidades</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #64748b; font-size: 13px;">Precio unitario con delivery:</td>
          <td style="padding: 6px 0; font-weight: bold; text-align: right;">S/ ${precioUnitario}</td>
        </tr>
        <tr style="border-top: 1px solid #e2e8f0;">
          <td style="padding: 12px 0 6px; font-size: 15px; font-weight: bold;">Inversión Total:</td>
          <td style="padding: 12px 0 6px; font-size: 18px; font-weight: 900; text-align: right; color: #e95716;">S/ ${subtotal}</td>
        </tr>
      </table>
    </div>

    <ul style="color: #475569; font-size: 13px; line-height: 1.7; padding-left: 20px;">
      <li>Despacho prioritario en ruta directa Surquillo / San Borja / Miraflores.</li>
      <li>Factura electrónica con RUC para crédito fiscal.</li>
      <li>Prueba técnica de calibración y fugas en cada reposición.</li>
      <li>Validez de la oferta: ${validez}.</li>
    </ul>

    <div style="text-align: center; margin-top: 25px;">
      <a href="https://wa.me/51936369384?text=${encodeURIComponent('Hola, deseo coordinar el pedido de la cotización comercial para ' + empresa)}" class="btn-ws">
        🤝 Coordinar Entrega por WhatsApp
      </a>
    </div>
  `;

  const asunto = `📋 Cotización Comercial de Balones de Gas · ${empresa}`;
  const vistaPreviaTexto = `Propuesta comercial de GLP para ${empresa}. Total: S/ ${subtotal}`;
  return { asunto, html: envoltorioBase({ contenidoHtml, asunto, vistaPreviaTexto }), resumen: vistaPreviaTexto };
}

/**
 * 4. Plantilla: Notificación Libre / Mensaje Corporativo
 */
export function generarPlantillaLibre({
  cliente = 'Cliente',
  asunto = 'Comunicado Oficial · Solgas Surquillo',
  mensaje = ''
} = {}) {
  const contenidoHtml = `
    <h2 style="color: #202b39; margin-top: 0; font-size: 20px;">${asunto}</h2>
    <p>Hola <strong>${cliente}</strong>,</p>
    <div style="font-size: 15px; line-height: 1.7; color: #334155; margin: 18px 0; white-space: pre-line;">
      ${mensaje}
    </div>
  `;

  const vistaPreviaTexto = mensaje.substring(0, 80) + '...';
  return { asunto, html: envoltorioBase({ contenidoHtml, asunto, vistaPreviaTexto }), resumen: vistaPreviaTexto };
}
