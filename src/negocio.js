// src/negocio.js
// 🎯 Puente Reactivo Conectado a la Colección Firestore 'negocio' y dataNegocio.js
// Permite que la tienda pública lea siempre los datos más actualizados registrados en Mi Negocio

import { obtenerDatosNegocio, calcularAnosTrayectoria } from './feature/personal/modulos/negocio/dataNegocio.js';

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

  // Catálogo Oficial de Cilindros y Accesorios de Gas GLP
  productos: [
    {
      id: "solgas-10kg",
      nombre: "Balón SOLGAS Premium 10 kg",
      nombreEn: "SOLGAS Premium 10 kg Cylinder",
      badge: "Más Pedido",
      badgeEn: "Most Popular",
      icon: "fa-solid fa-star",
      tagClase: "badge-fire",
      tipoUso: "Hogar",
      tipoUsoEn: "Home",
      capacidad: "10 kg Neto",
      capacidadEn: "10 kg Net",
      pesoTotal: "22.5 kg (Tara 12.5 + Gas 10)",
      pesoTotalEn: "22.5 kg (Tare 12.5 + Gas 10)",
      valvula: "Click-On (Acople Rápido) o Rosca",
      valvulaEn: "Click-On (Quick Connect) or Threaded",
      precioPEN: 65.00,
      ahorro: "Garantía de peso exacto",
      ahorroEn: "Exact weight guarantee",
      imagen: "/imgwii/productos/BALON-10KG.webp",
      caracteristicas: [
        "Válvula de seguridad antifugas original",
        "Precinto de garantía termocontraíble Osinergmin",
        "Peso exacto certificado de planta Solgas y base",
        "Inspección gratuita de fugas en cada entrega"
      ],
      caracteristicasEn: [
        "Original anti-leak safety valve",
        "Osinergmin heat-shrink guarantee security seal",
        "Certified exact weight from Solgas plant and hub",
        "Free leak inspection on every single delivery"
      ]
    },
    {
      id: "solgas-45kg",
      nombre: "Balón SOLGAS 45 kg",
      nombreEn: "SOLGAS 45 kg Commercial Cylinder",
      badge: "Comercial",
      badgeEn: "Commercial",
      icon: "fa-solid fa-industry",
      tagClase: "badge-blue",
      tipoUso: "Negocio",
      tipoUsoEn: "Business",
      capacidad: "45 kg Neto",
      capacidadEn: "45 kg Net",
      pesoTotal: "95.0 kg aprox.",
      pesoTotalEn: "Approx. 95.0 kg",
      valvula: "Rosca Industrial de Alta Presión",
      valvulaEn: "High-Pressure Industrial Thread",
      precioPEN: 230.00,
      ahorro: "Tarifa especial negocios",
      ahorroEn: "Special business rate",
      imagen: "/imgwii/productos/BALON-45KG.webp",
      caracteristicas: [
        "Poder calórico superior para cocinas de alto tráfico",
        "Certificación industrial y factura electrónica",
        "Atención prioritaria y cambio de batería programado",
        "Transporte seguro y anclaje por personal calificado"
      ],
      caracteristicasEn: [
        "Superior caloric power for heavy-duty kitchens",
        "Industrial certification and electronic invoice",
        "Priority service and scheduled tank bank swap",
        "Safe transport and secure anchoring by certified staff"
      ]
    },
    {
      id: "masgas-10kg",
      nombre: "Balón MASGAS 10 kg",
      nombreEn: "MASGAS 10 kg Cylinder",
      badge: "Económico",
      badgeEn: "Best Value",
      icon: "fa-solid fa-wallet",
      tagClase: "badge-emerald",
      tipoUso: "Ahorro",
      tipoUsoEn: "Savings",
      capacidad: "10 kg Neto",
      capacidadEn: "10 kg Net",
      pesoTotal: "22.4 kg garantizado",
      pesoTotalEn: "22.4 kg guaranteed",
      valvula: "Rosca Estándar / Universal",
      valvulaEn: "Standard / Universal Thread",
      precioPEN: 55.00,
      ahorro: "Opción más económica",
      ahorroEn: "Most affordable choice",
      imagen: "/imgwii/productos/MASGAS-10KG.webp",
      caracteristicas: [
        "Misma garantía de peso exacto de origen y base",
        "Llama azul constante y duradera",
        "Cilindro inspeccionado libre de corrosión",
        "Entrega inmediata sin costo de flete"
      ],
      caracteristicasEn: [
        "Same exact weight guarantee from plant and hub",
        "Consistent and long-lasting blue flame",
        "Inspected cylinder free of corrosion",
        "Immediate delivery with zero freight charge"
      ]
    },
    {
      id: "regulador-solgas",
      nombre: "Kit Regulador Premium SOLGAS",
      nombreEn: "Premium SOLGAS LPG Regulator Kit",
      badge: "Antifugas",
      badgeEn: "Anti-Leak",
      icon: "fa-solid fa-shield-halved",
      tagClase: "badge-gold",
      tipoUso: "Seguridad",
      tipoUsoEn: "Safety",
      capacidad: "Click-On",
      capacidadEn: "Click-On",
      pesoTotal: "0.85 kg bronce macizo",
      pesoTotalEn: "0.85 kg solid brass",
      valvula: "Sistema Click-On de Traba Automática",
      valvulaEn: "Click-On Automatic Lock System",
      precioPEN: 70.00,
      ahorro: "Instalación y prueba GRATIS",
      ahorroEn: "FREE installation & leak test",
      imagen: "/imgwii/productos/REGULADOR.webp",
      caracteristicas: [
        "Bloqueo instantáneo ante rotura de manguera",
        "Cuerpo de aleación anti-deflagrante",
        "Cumple Norma Técnica Peruana ITINTEC / Osinergmin",
        "Instalado por nuestro técnico sin costo adicional"
      ],
      caracteristicasEn: [
        "Instant automatic shut-off on hose rupture",
        "Flame-proof heavy alloy body",
        "Complies with Peruvian Technical Standard ITINTEC / Osinergmin",
        "Installed by our certified technician at no extra cost"
      ]
    }
  ],

  // Medios de pago aceptados
  mediosPago: [
    { nombre: "Efectivo", icon: "fa-money-bill-wave" },
    { nombre: "Yape", icon: "fa-mobile-screen-button" },
    { nombre: "Plin", icon: "fa-mobile-screen-button" },
    { nombre: "Transferencia", icon: "fa-building-columns" }
  ]
};

export default datosNegocio;