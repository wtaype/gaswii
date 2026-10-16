// src/feature/inicio/lib/whatsapp.js
// 🚀 Adaptador Dinámico de Enlaces WhatsApp para Gaswii (Cero Textos Hardcodeados)
// Consume directamente de la colección reactiva en @feature/personal/modulos/whatsapp/lib/dataWhatsapp.js
// Sincronización en 0ms con el panel administrativo "Ajustes / Canales"

import { 
  formatearCanal, 
  crearUrlCanal, 
  obtenerTelefonoOficial 
} from '@feature/personal/modulos/whatsapp/lib/dataWhatsapp.js';
import { 
  obtenerSaludoHora, 
  construirUrlWhatsapp 
} from '@feature/personal/modulos/whatsapp/lib/formateador.js';
import { datosNegocio } from '@/negocio.js';

export { obtenerSaludoHora };

/**
 * Obtiene el número oficial para recepción de pedidos (resuelto desde la colección o negocio)
 */
export function obtenerNumeroWhatsApp() {
  return obtenerTelefonoOficial();
}

/**
 * Obtiene el nombre del negocio
 */
export function obtenerNombreNegocio() {
  return datosNegocio?.identidad?.nombreCorto || datosNegocio?.nombre || 'Solgas Surquillo';
}

/**
 * Genera el texto formateado dinámico consultando la colección de canales (0 textos hardcodeados)
 */
export function generarMensajeWhatsApp(opciones = {}) {
  if (typeof opciones === 'string') return opciones;

  const canalId = opciones.canalId || (
    (opciones.cliente || opciones.direccion || opciones.metodoPago) ? 'canal_modal_express' :
    opciones.producto ? 'canal_catalogo_producto' :
    (opciones.kg || opciones.dias) ? 'canal_calculadora' :
    'canal_general_header'
  );

  return formatearCanal(canalId, opciones);
}

/**
 * Genera el enlace directo wa.me codificado consultando la colección de canales
 */
export function crearEnlaceWhatsApp(opciones = {}, numeroPersonalizado = null) {
  if (typeof opciones === 'string') {
    return construirUrlWhatsapp(opciones, numeroPersonalizado || obtenerTelefonoOficial());
  }

  const canalId = opciones.canalId || (
    (opciones.cliente || opciones.direccion || opciones.metodoPago) ? 'canal_modal_express' :
    opciones.producto ? 'canal_catalogo_producto' :
    (opciones.kg || opciones.dias) ? 'canal_calculadora' :
    'canal_general_header'
  );

  return crearUrlCanal(canalId, opciones, numeroPersonalizado);
}

export default {
  obtenerSaludoHora,
  obtenerNumeroWhatsApp,
  obtenerNombreNegocio,
  generarMensajeWhatsApp,
  crearEnlaceWhatsApp
};
