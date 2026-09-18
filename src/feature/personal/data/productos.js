// src/feature/personal/data/productos.js
// Catálogo Maestro Oficial de Cilindros y Accesorios (Gaswii / Solgas Surquillo)
// Modelo Bilingüe { es, en }, Precios exclusivamente en Soles (S/), Auditoría y Pin

export const productosIniciales = [
  {
    id: "solgas-10kg",
    codigo: "GAS-001",
    userId: "admin_solgas",
    creado: "2026-09-01T08:00:00.000Z",
    actualizado: "2026-09-15T00:00:00.000Z",
    pin: true,
    orden: 1,
    activo: true,

    // Precios e Inventario (Exclusivamente en Soles S/)
    precio: 65.00,
    costo: 48.50,
    stockLlenos: 84,
    stockVacios: 32,

    // Multimedia y Estilos
    imagen: "/imgwii/productos/BALON-10KG.webp",
    tag: "badge-fire",
    icon: "fa-solid fa-star",

    // Textos Bilingües
    nombre: {
      es: "Balón SOLGAS Premium 10 kg",
      en: "SOLGAS Premium 10 kg Cylinder"
    },
    nombreCorto: {
      es: "Solgas 10 kg",
      en: "Solgas 10 kg"
    },
    badge: {
      es: "Más Pedido",
      en: "Most Popular"
    },
    tipoUso: {
      es: "Hogar",
      en: "Home"
    },
    capacidad: {
      es: "10 kg Neto",
      en: "10 kg Net"
    },
    pesoTotal: {
      es: "22.5 kg (Tara 12.5 + Gas 10)",
      en: "22.5 kg (Tare 12.5 + Gas 10)"
    },
    valvula: {
      es: "Click-On (Acople Rápido) o Rosca",
      en: "Click-On (Quick Connect) or Threaded"
    },
    seguridad: {
      es: "Precinto verificado Osinergmin",
      en: "Osinergmin verified security seal"
    },
    garantia: {
      es: "Garantía 100% de peso exacto",
      en: "100% exact weight guarantee"
    },
    despacho: {
      es: "Despacho en puerta · Incluido",
      en: "Doorstep delivery · Included"
    },
    garantiasList: {
      es: [
        "Válvula de seguridad antifugas original",
        "Pesaje obligatorio en balanza digital en puerta",
        "Precinto termoencogible original de fábrica",
        "Entrega garantizada en menos de 30 minutos"
      ],
      en: [
        "Original anti-leak safety valve",
        "Mandatory digital weighing at door",
        "Factory original heat-shrink seal",
        "Guaranteed delivery in under 30 minutes"
      ]
    }
  },
  {
    id: "solgas-45kg",
    codigo: "GAS-002",
    userId: "admin_solgas",
    creado: "2026-09-01T08:00:00.000Z",
    actualizado: "2026-09-15T00:00:00.000Z",
    pin: true,
    orden: 2,
    activo: true,

    // Precios e Inventario (Soles S/)
    precio: 230.00,
    costo: 185.00,
    stockLlenos: 16,
    stockVacios: 6,

    // Multimedia y Estilos
    imagen: "/imgwii/productos/BALON-45KG.webp",
    tag: "badge-blue",
    icon: "fa-solid fa-industry",

    // Textos Bilingües
    nombre: {
      es: "Balón SOLGAS 45 kg",
      en: "SOLGAS 45 kg Cylinder"
    },
    nombreCorto: {
      es: "Solgas 45 kg",
      en: "Solgas 45 kg"
    },
    badge: {
      es: "Comercial",
      en: "Commercial"
    },
    tipoUso: {
      es: "Negocio",
      en: "Business"
    },
    capacidad: {
      es: "45 kg Neto",
      en: "45 kg Net"
    },
    pesoTotal: {
      es: "95.0 kg aprox.",
      en: "Approx. 95.0 kg"
    },
    valvula: {
      es: "Rosca Industrial de Alta Presión",
      en: "High-Pressure Industrial Thread"
    },
    seguridad: {
      es: "Precinto verificado Osinergmin",
      en: "Osinergmin verified security seal"
    },
    garantia: {
      es: "Tarifa especial negocios",
      en: "Special business rate"
    },
    despacho: {
      es: "Despacho en puerta · Incluido",
      en: "Doorstep delivery · Included"
    },
    garantiasList: {
      es: [
        "Poder calórico superior para cocinas de alto tráfico",
        "Certificación industrial y factura electrónica",
        "Atención prioritaria y cambio de batería programado",
        "Transporte seguro y anclaje por personal calificado"
      ],
      en: [
        "Superior heat output for high-traffic kitchens",
        "Industrial certification & electronic invoicing",
        "Priority attention and scheduled tank swap",
        "Safe transport and anchoring by qualified staff"
      ]
    }
  },
  {
    id: "masgas-10kg",
    codigo: "GAS-003",
    userId: "admin_solgas",
    creado: "2026-09-01T08:00:00.000Z",
    actualizado: "2026-09-15T00:00:00.000Z",
    pin: false,
    orden: 3,
    activo: true,

    // Precios e Inventario (Soles S/)
    precio: 55.00,
    costo: 41.00,
    stockLlenos: 22,
    stockVacios: 10,

    // Multimedia y Estilos
    imagen: "/imgwii/productos/MASGAS-10KG.webp",
    tag: "badge-amber",
    icon: "fa-solid fa-piggy-bank",

    // Textos Bilingües
    nombre: {
      es: "Balón MASGAS 10 kg",
      en: "MASGAS 10 kg Cylinder"
    },
    nombreCorto: {
      es: "Masgas 10 kg",
      en: "Masgas 10 kg"
    },
    badge: {
      es: "Económico",
      en: "Economical"
    },
    tipoUso: {
      es: "Ahorro",
      en: "Savings"
    },
    capacidad: {
      es: "10 kg Neto",
      en: "10 kg Net"
    },
    pesoTotal: {
      es: "22.4 kg garantizado",
      en: "22.4 kg guaranteed"
    },
    valvula: {
      es: "Rosca Estándar / Universal",
      en: "Standard / Universal Thread"
    },
    seguridad: {
      es: "Precinto verificado Osinergmin",
      en: "Osinergmin verified security seal"
    },
    garantia: {
      es: "Opción más económica",
      en: "Most economical choice"
    },
    despacho: {
      es: "Despacho en puerta · Incluido",
      en: "Doorstep delivery · Included"
    },
    garantiasList: {
      es: [
        "Misma garantía de peso exacto con balanza digital",
        "Llama azul constante y duradera",
        "Cilindro inspeccionado libre de corrosión",
        "Entrega inmediata sin costo de flete en Surquillo"
      ],
      en: [
        "Same exact weight guarantee with digital scale",
        "Consistent and long-lasting blue flame",
        "Inspected cylinder free of corrosion",
        "Immediate delivery with zero freight fee in Surquillo"
      ]
    }
  },
  {
    id: "kit-regulador",
    codigo: "ACC-004",
    userId: "admin_solgas",
    creado: "2026-09-01T08:00:00.000Z",
    actualizado: "2026-09-15T00:00:00.000Z",
    pin: false,
    orden: 4,
    activo: true,

    // Precios e Inventario (Soles S/)
    precio: 70.00,
    costo: 45.00,
    stockLlenos: 18,
    stockVacios: 0,

    // Multimedia y Estilos
    imagen: "/imgwii/productos/REGULADOR.webp",
    tag: "badge-purple",
    icon: "fa-solid fa-shield-halved",

    // Textos Bilingües
    nombre: {
      es: "Kit Regulador Premium SOLGAS",
      en: "SOLGAS Premium Regulator Kit"
    },
    nombreCorto: {
      es: "Kit Regulador",
      en: "Regulator Kit"
    },
    badge: {
      es: "Antifugas",
      en: "Anti-leak"
    },
    tipoUso: {
      es: "Seguridad",
      en: "Safety"
    },
    capacidad: {
      es: "Click-On",
      en: "Click-On"
    },
    pesoTotal: {
      es: "0.85 kg bronce macizo",
      en: "0.85 kg solid brass"
    },
    valvula: {
      es: "Sistema Click-On de Traba Automática",
      en: "Click-On Automatic Lock System"
    },
    seguridad: {
      es: "Precinto verificado Osinergmin",
      en: "Osinergmin verified security seal"
    },
    garantia: {
      es: "Instalación y prueba GRATIS",
      en: "FREE installation and test"
    },
    despacho: {
      es: "Despacho en puerta · Incluido",
      en: "Doorstep delivery · Included"
    },
    garantiasList: {
      es: [
        "Bloqueo instantáneo ante rotura o fuga de manguera",
        "Cuerpo de aleación anti-deflagrante reforzado",
        "Cumple Norma Técnica Peruana ITINTEC / Osinergmin",
        "Instalado y calibrado por nuestro personal en puerta"
      ],
      en: [
        "Instant lock upon hose rupture or gas leak",
        "Reinforced flameproof alloy body",
        "Complies with Peruvian ITINTEC / Osinergmin Standards",
        "Installed and calibrated by our technician at doorstep"
      ]
    }
  }
];
