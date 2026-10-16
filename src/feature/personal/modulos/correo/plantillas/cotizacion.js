// src/feature/personal/modulos/correo/plantillas/cotizacion.js
// Plantilla de Propuesta de Servicios Contables y Asesoría Tributaria

import { envoltorioBase } from './base.js';
import { mdToEmailHtml } from './parser.js';

export function generarPlantillaCotizacion({
  cliente = 'Contacto Comercial',
  empresa = 'Empresa Solicitante',
  cotizacionId = 'COT-2026-15',
  validez = '15 días calendario',
  mensajeMarkdown = '',
  negocio = {}
} = {}) {
  const nombreEmpresa = negocio?.nombre || '';
  const esServicios = negocio?.modeloNegocio === 'servicios_y_asesorias';
  const colorMarca = negocio?.colorPrimario || '#ff6600';

  const contenidoMarkdownDefecto = esServicios ? `
| Servicio Profesional Propuesto | Modalidad | Inversión Estimada |
| :--- | :---: | :---: |
| Consultoría Especializada y Asesoría Técnica | Mensual | S/ 150.00 |
| Gestión de Procesos y Supervisión Periódica | Mensual | S/ 180.00 |
| Soporte Continuo y Acompañamiento Estratégico | Incluido | S/ 0.00 |

### Entregables del Servicio:
- Plan de trabajo estructurado y metas mensuales.
- Informes periódicos de cumplimiento y rendimiento.
- Sesiones de consultoría y seguimiento continuo.
- Soporte prioritario ante requerimientos o incidencias.
  `.trim() : `
| Suministro GLP Comercial | Cantidad Estimada | Tarifa por Unidad (S/) |
| :--- | :---: | :---: |
| Balón SOLGAS Comercial 45 kg | 4 unidades | S/ 225.00 |
| Balón SOLGAS Premium 10 kg | 6 unidades | S/ 63.00 |
| Kit Regulador Industrial / Manguera | 1 set | S/ 0.00 (Bonificado) |

### Beneficios del Suministro:
- Reparto express prioritario con ventana garantizada de 30 minutos.
- Balanza digital certificada en cada despacho (peso neto exacto verificado en puerta).
- Facturación mensual electrónica consolidada o crédito según evaluación.
- Mantenimiento preventivo e inspección de fugas sin costo adicional.
  `.trim();

  const tablaHtml = mdToEmailHtml(mensajeMarkdown || contenidoMarkdownDefecto);
  const tituloCotiz = esServicios ? '📋 Propuesta de Servicios Contables' : '📋 Cotización de Suministro GLP Comercial';
  const bajadaCotiz = esServicios 
    ? 'Presentamos nuestra propuesta formal de servicios contables, tributarios y de planillas con respaldo profesional especializado:' 
    : 'Presentamos nuestra propuesta comercial formal para el abastecimiento continuo de gas GLP para su negocio con garantía de peso exacto:';
  const asuntoTag = esServicios ? 'Propuesta Contable' : 'Cotización Comercial';

  const contenidoHtml = `
    <h2 style="color: ${colorMarca}; margin-top: 0; font-size: 21px; font-weight: 700;">${tituloCotiz}</h2>
    <p style="font-size: 15px;">Estimados señores de <strong>${empresa}</strong> (${cliente}),</p>
    <p style="color: #475569; font-size: 14px;">${bajadaCotiz}</p>

    <div style="background:#fdfbf7;border:1px solid #ebdcc5;border-radius:8px;padding:10px 16px;margin:14px 0;display:flex;justify-content:space-between;font-size:13px;">
      <span>Cotización: <strong>#${cotizacionId}</strong></span>
      <span>Validez: <strong>${validez}</strong></span>
    </div>

    <!-- Contenido y Tablas en Markdown -->
    ${tablaHtml}

    <div style="text-align: center; margin-top: 25px;">
      <a href="https://wa.me/${(negocio.contacto?.whatsappLimpio || negocio.contacto?.whatsapp || '').replace(/\D/g, '')}?text=${encodeURIComponent('Hola, deseo coordinar la propuesta #' + cotizacionId + ' para ' + empresa)}" class="btn-ws">
        🤝 Coordinar Inicio de Suministro por WhatsApp
      </a>
    </div>
  `;

  const asunto = `📋 ${asuntoTag} #${cotizacionId} · ${empresa} · ${nombreEmpresa}`;
  const vistaPreviaTexto = `Propuesta comercial #${cotizacionId} para ${empresa}.`;
  return { asunto, html: envoltorioBase({ contenidoHtml, asunto, vistaPreviaTexto, negocio }), resumen: vistaPreviaTexto };
}
