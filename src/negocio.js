// src/negocio.js
// 🎯 Fuente Única de Verdad para Gaswii (Solgas Surquillo)
// Cualquier cambio de precios, teléfonos, distritos o sedes se realiza aquí
// y se refleja en toda la aplicación, modales, WhatsApp y Schemas de Google.

export const datosNegocio = {
  nombre: "Solgas Surquillo",
  nombreCorto: "Solgas Surquillo",
  razonSocial: "Distribuidor Autorizado OSINERGMIN Reg. 208492",
  autorizacion: "Distribuidor Autorizado OSINERGMIN",
  registroOsinergmin: "Reg. 208492",
  marcaRespaldo: "Solgas S.A.",
  experienciaAnos: 25,
  telefono: "+51 936 369 384",
  telefonoMostrado: "+51 936 369 384",
  telefonoLimpio: "51936369384",
  telefonoRaw: "51936369384",
  direccionSede: "Jr. Dante 260, Surquillo, Lima 15047",
  distritoSede: "Surquillo",
  ciudad: "Lima",
  pais: "PE",
  mapsUrl: "https://maps.app.goo.gl/s86EmxowFcKetJWL8",
  coordenadas: {
    lat: -12.1177408,
    lng: -77.0226796,
    string: "-12.1177408,-77.0226796"
  },
  horario: "Lunes a Domingo: 6:00 a.m. a 11:00 p.m. (365 días)",
  horarioEn: "Monday to Sunday: 6:00 a.m. to 11:00 p.m. (365 days)",
  
  // Cobertura con tiempos reales de despacho desde Jr. Dante 260
  distritos: [
    { 
      id: "surquillo", 
      nombre: "Surquillo", 
      tiempo: "12 - 18 min", 
      sede: true, 
      tag: "Sede Central Express",
      tagEn: "Central Hub Express"
    },
    { 
      id: "miraflores", 
      nombre: "Miraflores", 
      tiempo: "15 - 20 min", 
      sede: false, 
      tag: "Ruta Directa",
      tagEn: "Direct Route"
    },
    { 
      id: "san-borja", 
      nombre: "San Borja", 
      tiempo: "15 - 22 min", 
      sede: false, 
      tag: "Ruta Directa",
      tagEn: "Direct Route"
    },
    { 
      id: "san-isidro", 
      nombre: "San Isidro", 
      tiempo: "18 - 25 min", 
      sede: false, 
      tag: "Ruta Directa",
      tagEn: "Direct Route"
    }
  ],

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
        "Pesaje digital obligatorio frente a tu puerta",
        "Inspección gratuita de fugas en cada entrega"
      ],
      caracteristicasEn: [
        "Original anti-leak safety valve",
        "Osinergmin heat-shrink guarantee security seal",
        "Mandatory digital scale weighing at your door",
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
        "Misma garantía de peso exacto con balanza",
        "Llama azul constante y duradera",
        "Cilindro inspeccionado libre de corrosión",
        "Entrega inmediata sin costo de flete"
      ],
      caracteristicasEn: [
        "Same exact weight guarantee with digital scale",
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
    { nombre: "Tarjeta POS", icon: "fa-credit-card" }
  ]
};

export default datosNegocio;