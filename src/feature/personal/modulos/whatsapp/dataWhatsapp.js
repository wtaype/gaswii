// src/feature/personal/modulos/whatsapp/dataWhatsapp.js
// Centro de Plantillas y Generador de Mensajes Oficiales de WhatsApp
// 100% JS Nativo · Integrado con @widev y Local-First
import { obtenerDatosNegocio } from '../negocio/dataNegocio.js';
import whatsappSemilla from '@/semillas/whatsapp.json';

export const PLANTILLAS_WHATSAPP = Array.isArray(whatsappSemilla?.plantillas) ? whatsappSemilla.plantillas : [];

export function formatearPlantilla(textoBase, valores = {}) {
  let resultado = textoBase;
  const neg = obtenerDatosNegocio() || {};
  const nombreEstudio = neg.identidad?.nombreCorto || neg.identidad?.nombre || neg.nombre || 'nuestro equipo';
  const especialista = neg.identidad?.especialista || neg.especialista || 'Atención al Cliente';
  const direccionSede = neg.ubicacion?.direccion ? neg.ubicacion.direccion : 'Atención y Despacho Express';

  const defaults = {
    cliente: 'Estimado/a cliente',
    estudio: nombreEstudio,
    especialista: especialista,
    pedidoId: 'GW-1029',
    producto: 'Balón SOLGAS Premium 10 kg',
    cantidad: '1',
    monto: '65.00',
    precioMayorista: '225.00',
    direccion: 'Jr. Dante 260, Surquillo',
    distrito: neg.ubicacion?.distrito || 'Surquillo',
    ruc: '20554897123',
    digito: '3',
    periodo: 'Agosto 2026',
    fechaVencimiento: '18 de Septiembre de 2026',
    regimen: 'Régimen MYPE Tributario',
    nps: '9827364510',
    modalidad: 'Delivery Express a Domicilio',
    fechaHora: 'Hoy · Salida Inmediata',
    honorario: '65.00',
    lugarEnlace: `${direccionSede}`,
    comprobanteTipo: 'Boleta Electrónica',
    comprobanteNumero: 'B001-000482',
    fecha: 'Hoy',
    servicio: 'Recarga Balón SOLGAS Premium 10 kg'
  };

  const merge = { ...defaults, ...valores };

  for (const [clave, val] of Object.entries(merge)) {
    const regex = new RegExp(`\\{${clave}\\}`, 'g');
    resultado = resultado.replace(regex, val || '');
  }

  return resultado;
}
