// src/app.js
// 🌐 Configuración Global y Dinámica de Gaswii (100% Sincronizada con Firestore negocio.md)
import wii from './wii.js';
import { datosNegocio } from './negocio.js';

export const app = {
  id: wii.id,
  get app() { return datosNegocio.nombre; },
  get nombreComercial() { return datosNegocio.nombre; },
  get marcaRespaldo() { return datosNegocio.marcaRespaldo; },
  get autorizacion() { return datosNegocio.razonSocial; },
  get slogan() { return datosNegocio.subtitulo || ''; },
  get sloganEn() { return datosNegocio.raw?.subtituloEn || datosNegocio.subtitulo || ''; },
  
  // Enlaces y Contacto
  linkweb: wii.linkweb,
  linkme: wii.linkme,
  get telefono() { return datosNegocio.telefonoMostrado; },
  get telefonoLimpio() { return datosNegocio.telefonoLimpio; },
  get whatsappUrl() {
    const msg = datosNegocio.whatsappMensaje ? `&text=${encodeURIComponent(datosNegocio.whatsappMensaje)}` : '';
    return `https://api.whatsapp.com/send?phone=${datosNegocio.whatsappLimpio || datosNegocio.telefonoLimpio}${msg}`;
  },
  get mapsUrl() { return datosNegocio.mapsUrl; },

  // Sede Física Central
  get direccion() { return datosNegocio.direccionSede; },
  get horario() { return datosNegocio.horario; },
  get horarioEn() { return datosNegocio.horarioEn; },
  get coordenadas() { return datosNegocio.coordenadas; },

  // Redes Sociales Oficiales de Firestore
  get facebook() { return datosNegocio.redes.facebook; },
  get instagram() { return datosNegocio.redes.instagram; },
  get tiktok() { return datosNegocio.redes.tiktok; }
};

export default app;