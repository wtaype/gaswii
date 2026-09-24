// src/feature/inicio/lib/whatsapp.js
// 🚀 Motor Centralizado de Atribución Inteligente de WhatsApp para Gaswii
// Funciona de forma isomórfica (Build-time SSR en Astro + Runtime en Cliente)
// Permite al dueño del negocio saber exactamente desde qué sección o tarjeta llega el pedido.

import { datosNegocio } from '../../../negocio.js';

/**
 * Obtiene el número de WhatsApp canónico (desde caché local o fallback negocio)
 */
export function obtenerNumeroWhatsApp() {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('minegocio');
      if (raw) {
        const cfg = JSON.parse(raw);
        const wa = cfg.contacto?.whatsappLimpio || cfg.contacto?.whatsapp;
        if (wa) return String(wa).replace(/\D/g, '');
      }
    } catch (e) {}
  }
  return datosNegocio.whatsapp || '51936369384';
}

/**
 * Obtiene el nombre del negocio (desde caché local o fallback canónico)
 */
export function obtenerNombreNegocio() {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('minegocio');
      if (raw) {
        const cfg = JSON.parse(raw);
        const nom = cfg.identidad?.nombre;
        if (nom) return nom;
      }
    } catch (e) {}
  }
  return datosNegocio.nombre || 'Solgas Surquillo';
}

/**
 * Genera el texto formateado con atribución de origen explícita
 */
export function generarMensajeWhatsApp({
  origen = 'Web Inicio',
  producto = '',
  precio = null,
  cantidad = 1,
  distrito = '',
  direccion = '',
  cliente = '',
  celular = '',
  metodoPago = '',
  detalle = '',
  notas = '',
  extra = ''
} = {}) {
  const nombreNegocio = obtenerNombreNegocio();
  const lineas = [];

  lineas.push(`¡Hola ${nombreNegocio}! 👋`);
  lineas.push(`He visto en su página web y deseo consultar / pedir:`);
  lineas.push(``);
  lineas.push(`🏷️ Origen: [${origen}]`);

  if (cliente) {
    const cel = celular ? ` (📱 ${celular})` : '';
    lineas.push(`👤 Cliente: ${cliente}${cel}`);
  }

  if (producto) {
    const cantTxt = cantidad > 1 ? `${cantidad}x ` : '';
    const precioTxt = precio !== null && precio !== undefined && !isNaN(Number(precio))
      ? ` (S/ ${Number(precio).toFixed(2)})`
      : '';
    lineas.push(`📦 Producto: ${cantTxt}${producto}${precioTxt}`);
  }

  if (direccion || distrito) {
    const dirCompleta = direccion && distrito 
      ? `${direccion}, ${distrito}` 
      : (direccion || distrito);
    lineas.push(`📍 Entrega: ${dirCompleta}`);
  }

  if (metodoPago) {
    lineas.push(`💳 Pago: ${metodoPago}`);
  }

  if (detalle) {
    lineas.push(`💬 Consulta: ${detalle}`);
  }

  if (notas) {
    lineas.push(`📝 Notas: ${notas}`);
  }

  if (extra) {
    lineas.push(extra);
  }

  lineas.push(``);
  lineas.push(`¿Podrían confirmarme la atención, por favor? ¡Muchas gracias!`);

  return lineas.join('\n');
}

/**
 * Genera el enlace directo de WhatsApp wa.me codificado
 */
export function crearEnlaceWhatsApp(opciones = {}, numeroPersonalizado = null) {
  const num = numeroPersonalizado ? String(numeroPersonalizado).replace(/\D/g, '') : obtenerNumeroWhatsApp();
  const msg = typeof opciones === 'string' ? opciones : generarMensajeWhatsApp(opciones);
  return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
}

export default {
  obtenerNumeroWhatsApp,
  obtenerNombreNegocio,
  generarMensajeWhatsApp,
  crearEnlaceWhatsApp
};
