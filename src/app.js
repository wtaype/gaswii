// src/app.js
// 🌐 Configuración Global y Dinámica de Gaswii (Solgas Surquillo)
import wii from './wii.js';
import { datosNegocio } from './negocio.js';

export const app = {
  id: wii.id,
  app: datosNegocio.nombre,
  nombreComercial: datosNegocio.nombre,
  marcaRespaldo: datosNegocio.marcaRespaldo,
  autorizacion: datosNegocio.autorizacion,
  registroOsinergmin: datosNegocio.registroOsinergmin,
  slogan: "Balón lleno con peso exacto en tu puerta en 15 - 20 minutos",
  sloganEn: "100% full gas cylinder with exact digital weight at your door in 15 - 20 mins",
  
  // Enlaces y Contacto
  linkweb: wii.linkweb,
  linkme: wii.linkme,
  telefono: datosNegocio.telefonoMostrado,
  telefonoLimpio: datosNegocio.telefonoLimpio,
  whatsappUrl: `https://api.whatsapp.com/send?phone=${datosNegocio.telefonoLimpio}`,
  mapsUrl: datosNegocio.mapsUrl,

  // Sede Física Central
  direccion: datosNegocio.direccionSede,
  horario: datosNegocio.horario,
  horarioEn: datosNegocio.horarioEn,
  coordenadas: datosNegocio.coordenadas,

  // Redes y Soporte
  facebook: "https://www.facebook.com/solgasoficial",
  instagram: "https://www.instagram.com/solgasoficial",
  tiktok: "https://www.tiktok.com/@solgasperu"
};

export default app;