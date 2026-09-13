// src/feature/personal/data/productos.js
// Catálogo oficial de balones y accesorios con control de stock

export const productosIniciales = [
  {
    id: 'solgas-10kg',
    codigo: 'GAS-001',
    nombre: 'Balón SOLGAS Premium 10 kg',
    nombreCorto: 'Solgas 10 kg',
    categoria: 'Hogar',
    badge: 'Más Pedido',
    tagClase: 'badge-fire',
    tipoUso: 'Hogar',
    capacidad: '10 kg Neto',
    pesoTotal: '22.5 kg (Tara 12.5 + Gas 10)',
    valvula: 'Click-On (Acople Rápido) o Rosca',
    seguridad: 'Precinto verificado Osinergmin',
    precioPEN: 65.00,
    costoPEN: 48.50,
    garantia: 'Garantía 100% de peso exacto',
    stockLlenos: 84,
    stockVacios: 32,
    imagen: '/imgwii/productos/BALON-10KG.webp',
    activo: true,
    garantiasList: [
      'Válvula de seguridad antifugas original',
      'Pesaje obligatorio en balanza digital en puerta',
      'Precinto termoencogible original de fábrica',
      'Entrega garantizada en menos de 30 minutos'
    ]
  },
  {
    id: 'solgas-45kg',
    codigo: 'GAS-002',
    nombre: 'Balón SOLGAS 45 kg',
    nombreCorto: 'Solgas 45 kg',
    categoria: 'Industrial',
    badge: 'Comercial',
    tagClase: 'badge-blue',
    tipoUso: 'Negocio',
    capacidad: '45 kg Neto',
    pesoTotal: '95.0 kg aprox.',
    valvula: 'Rosca Industrial de Alta Presión',
    seguridad: 'Precinto verificado Osinergmin',
    precioPEN: 230.00,
    costoPEN: 185.00,
    garantia: 'Tarifa especial negocios',
    stockLlenos: 16,
    stockVacios: 6,
    imagen: '/imgwii/productos/BALON-45KG.webp',
    activo: true,
    garantiasList: [
      'Poder calórico superior para cocinas de alto tráfico',
      'Certificación industrial y factura electrónica',
      'Atención prioritaria y cambio de batería programado',
      'Transporte seguro y anclaje por personal calificado'
    ]
  },
  {
    id: 'masgas-10kg',
    codigo: 'GAS-003',
    nombre: 'Balón MASGAS 10 kg',
    nombreCorto: 'Masgas 10 kg',
    categoria: 'Económico',
    badge: 'Económico',
    tagClase: 'badge-amber',
    tipoUso: 'Ahorro',
    capacidad: '10 kg Neto',
    pesoTotal: '22.4 kg garantizado',
    valvula: 'Rosca Estándar / Universal',
    seguridad: 'Precinto verificado',
    precioPEN: 55.00,
    costoPEN: 41.00,
    garantia: 'Opción más económica',
    stockLlenos: 22,
    stockVacios: 10,
    imagen: '/imgwii/productos/MASGAS-10KG.webp',
    activo: true,
    garantiasList: [
      'Misma garantía de peso exacto con balanza digital',
      'Llama azul constante y duradera',
      'Cilindro inspeccionado libre de corrosión',
      'Entrega inmediata sin costo de flete en Surquillo'
    ]
  },
  {
    id: 'kit-regulador',
    codigo: 'ACC-004',
    nombre: 'Kit Regulador Premium SOLGAS',
    nombreCorto: 'Kit Regulador',
    categoria: 'Accesorios',
    badge: 'Antifugas',
    tagClase: 'badge-purple',
    tipoUso: 'Seguridad',
    capacidad: 'Click-On',
    pesoTotal: '0.85 kg bronce macizo',
    valvula: 'Sistema Click-On de Traba Automática',
    seguridad: 'Precinto verificado Osinergmin',
    precioPEN: 70.00,
    costoPEN: 45.00,
    garantia: 'Instalación y prueba GRATIS',
    stockLlenos: 18,
    stockVacios: 0,
    imagen: '/imgwii/productos/REGULADOR.webp',
    activo: true,
    garantiasList: [
      'Bloqueo instantáneo ante rotura o fuga de manguera',
      'Cuerpo de aleación anti-deflagrante reforzado',
      'Cumple Norma Técnica Peruana ITINTEC / Osinergmin',
      'Instalado y calibrado por nuestro personal en puerta'
    ]
  }
];
