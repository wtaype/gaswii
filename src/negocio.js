// src/negocio.js
// 🎯 Puente Reactivo Conectado a la Colección Firestore 'negocio' y dataNegocio.js
// Permite que la tienda pública lea siempre los datos más actualizados registrados en Mi Negocio

import { obtenerDatosNegocio, calcularAnosTrayectoria } from './feature/personal/modulos/negocio/dataNegocio.js';
import actualizarData from './core/actualizar.json';

export const datosNegocio = {
  get nombre() { return obtenerDatosNegocio().identidad?.nombre || ''; },
  get nombreCorto() { return obtenerDatosNegocio().identidad?.nombreCorto || ''; },
  get razonSocial() { return obtenerDatosNegocio().identidad?.razonSocial || ''; },
  get autorizacion() { return obtenerDatosNegocio().identidad?.razonSocial || ''; },
  get ruc() { return obtenerDatosNegocio().identidad?.ruc || ''; },
  get registroOsinergmin() { return obtenerDatosNegocio().identidad?.registroOsinergmin || ''; },
  get marcaRespaldo() { return obtenerDatosNegocio().identidad?.marcaRespaldo || ''; },
  get logo() { return obtenerDatosNegocio().identidad?.logo || ''; },
  get imagenSede() { return obtenerDatosNegocio().identidad?.imagenSede || ''; },
  get experienciaAnos() {
    const raw = calcularAnosTrayectoria(obtenerDatosNegocio().identidad?.lanzamientoFecha);
    return parseInt(raw, 10) || 0;
  },
  get telefono() { return obtenerDatosNegocio().contacto?.telefono || ''; },
  get telefonoMostrado() { return obtenerDatosNegocio().contacto?.telefono || ''; },
  get telefonoFijo() { return obtenerDatosNegocio().contacto?.telefonoFijo || ''; },
  get telefonoLimpio() {
    const c = obtenerDatosNegocio().contacto || {};
    return c.telefonoLimpio || (c.telefono || '').replace(/\D/g, '');
  },
  get telefonoRaw() {
    const c = obtenerDatosNegocio().contacto || {};
    return c.telefonoLimpio || (c.telefono || '').replace(/\D/g, '');
  },
  get whatsapp() { return obtenerDatosNegocio().contacto?.whatsapp || ''; },
  get whatsappMensaje() { return obtenerDatosNegocio().contacto?.whatsappMensaje || ''; },
  get email() { return obtenerDatosNegocio().contacto?.email || ''; },
  get direccionSede() { return obtenerDatosNegocio().ubicacion?.direccion || ''; },
  get distritoSede() { return obtenerDatosNegocio().ubicacion?.distrito || ''; },
  get ciudad() { return obtenerDatosNegocio().ubicacion?.ciudad || ''; },
  get pais() { return obtenerDatosNegocio().ubicacion?.pais || 'PE'; },
  get mapsUrl() { return obtenerDatosNegocio().ubicacion?.mapsUrl || ''; },
  get coordenadas() { return obtenerDatosNegocio().ubicacion?.coordenadas || { lat: 0, lng: 0 }; },
  get horario() { return obtenerDatosNegocio().contacto?.horario || ''; },
  get horarioEn() { return obtenerDatosNegocio().contacto?.horarioEn || ''; },
  get metricas() { return obtenerDatosNegocio().metricas || { clientes: '', balanza: '', years: '', dias: '' }; },
  get redes() { return obtenerDatosNegocio().redes || { facebook: '', instagram: '', tiktok: '' }; },
  /**
   * @returns {{ id: string, nombre: string, tiempo: string, tag: string, tagEn: string }[]}
   */
  get distritos() {
    const zonas = obtenerDatosNegocio().zonas || [];
    return zonas.filter(z => z.activo !== false).map(z => ({
      id: z.id || (z.distrito || '').toLowerCase().replace(/\s+/g, '-'),
      nombre: z.distrito || '',
      tiempo: `${z.tiempoMin || 0} - ${z.tiempoMax || 0} ${z.unidad || 'min'}`,
      tag: z.tag || '',
      tagEn: z.tag || ''
    }));
  },

  // Catálogo Oficial de Cilindros y Accesorios (Cargado desde actualizar.json)
  get productos() {
    return actualizarData?.productos || [];
  },

  // Medios de pago aceptados (Cargado desde actualizar.json)
  get mediosPago() {
    return actualizarData?.mediosPago || [];
  }
};

export default datosNegocio;