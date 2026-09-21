// src/core/seo.js
// --- [Metadatos SEO] titulo = ~47 caracteres, descripcion = ~150 caracteres, keywords = 5 palabras -> no eliminar esta linea.
import app from '../app.js';
import { datosNegocio } from '../negocio.js';

export const seo = {
  inicio: {
    es: {
      title: "Solgas Surquillo | Balón con Peso Exacto en 15-20 min",
      description: "¿Cansado de balones que duran poco? En Solgas Surquillo garantizamos balones con peso exacto desde planta Solgas y base Jr. Dante 260. Despacho en 15-20 min.",
      path: '/',
      keywords: [
        'gas a domicilio surquillo',
        'solgas surquillo telefono',
        'balon de gas peso exacto',
        'solgas miraflores delivery',
        'gas urgente san borja'
      ],
      audience: ['hogares', 'familias', 'restaurantes', 'negocios', 'vecinos'],
      intent: 'pedir balon de gas a domicilio con peso exacto en surquillo y miraflores'
    },
    en: {
      title: "Solgas Surquillo | 100% Full Gas Cylinder Delivery",
      description: "Tired of underfilled gas? At Solgas Surquillo we guarantee exact weight cylinders from Solgas plant and central base. Fast delivery in 15-20 min.",
      path: '/en',
      keywords: [
        'gas delivery surquillo',
        'lpg cylinder miraflores',
        'solgas english delivery lima',
        'cooking gas san isidro',
        'gas cylinder exact weight'
      ],
      audience: ['residents', 'expats', 'families', 'restaurants'],
      intent: 'order home delivery lpg gas cylinder in lima'
    }
  },
  cliente: {
    es: {
      title: "Mi Cuenta | Solgas Surquillo Gaswii",
      description: "Gestiona tus pedidos de gas, consulta tu historial de balones y repite tu pedido en un solo clic con entrega express.",
      path: '/cliente',
      keywords: ['pedidos solgas', 'cuenta gaswii', 'repetir pedido gas', 'historial balones'],
      audience: ['clientes', 'vecinos'],
      intent: 'gestionar pedidos de gas'
    },
    en: {
      title: "My Account | Solgas Surquillo Gaswii",
      description: "Manage your LPG gas orders, check order history, and reorder your cylinder in one single click with express delivery.",
      path: '/en/cliente',
      keywords: ['solgas account', 'gaswii orders', 'reorder gas lima'],
      audience: ['customers', 'residents'],
      intent: 'manage gas orders'
    }
  },
  personal: {
    es: {
      title: "Panel Repartidor | Solgas Surquillo",
      description: "Control de despachos de gas, registro de pesaje con balanza digital y atención de pedidos express en Surquillo.",
      path: '/personal',
      keywords: ['repartidor solgas', 'despacho gaswii', 'balanza digital'],
      audience: ['repartidores', 'tecnicos'],
      intent: 'gestionar entregas de balones de gas'
    },
    en: {
      title: "Delivery Driver Hub | Solgas Surquillo",
      description: "LPG cylinder dispatch management, digital scale weight verification, and express delivery tracking.",
      path: '/en/personal',
      keywords: ['gas driver', 'gas delivery tracking'],
      audience: ['drivers', 'technicians'],
      intent: 'manage cylinder dispatches'
    }
  }
};

/**
 * Genera metadatos completos para el <head> (OpenGraph, Twitter, Hreflang, Canonical)
 */
export function getMeta(ruta = '/', idioma = 'es') {
  const clave = ruta === '/' || ruta === '/en' ? 'inicio' : ruta.replace(/^\/(en\/)?/, '');
  const data = seo[clave] ? seo[clave][idioma] : seo.inicio[idioma];
  const urlBase = (app.linkweb || 'https://gaswii.amorwii.workers.dev').replace(/\/$/, '');
  const canonical = `${urlBase}${ruta}`;

  return {
    title: data.title,
    description: data.description,
    keywords: data.keywords.join(', '),
    canonical,
    ogTitle: data.title,
    ogDescription: data.description,
    ogImage: `${urlBase}/imgwii/01-solgas-surquillo.webp`,
    ogUrl: canonical,
    ogType: 'website',
    siteName: datosNegocio.nombre,
    telefono: datosNegocio.telefonoMostrado,
    locale: idioma === 'es' ? 'es_PE' : 'en_US',
    localeAlternate: idioma === 'es' ? 'en_US' : 'es_PE',
    hreflang: {
      es: `${urlBase}/`,
      en: `${urlBase}/en`,
      default: `${urlBase}/`
    }
  };
}

/**
 * Genera el marcado de datos estructurados Schema.org JSON-LD para Google Rich Snippets
 */
export function getJsonLd(ruta = '/', idioma = 'es') {
  const urlBase = (app.linkweb || 'https://gaswii.amorwii.workers.dev').replace(/\/$/, '');
  const isEn = idioma === 'en';

  return {
    '@context': 'https://schema.org',
    '@graph': [
      // 1. Negocio Local y Servicio de Emergencia
      {
        '@type': ['LocalBusiness', 'HomeGoodsStore', 'EmergencyService'],
        '@id': `${urlBase}/#localbusiness`,
        name: datosNegocio.nombre,
        description: isEn 
          ? "Authorized OSINERGMIN LPG gas cylinder distributor with mandatory digital scale weighing at your door."
          : "Distribuidor autorizado OSINERGMIN de balones de gas GLP con pesaje digital obligatorio frente a tu puerta.",
        url: urlBase,
        telephone: datosNegocio.telefonoMostrado,
        image: `${urlBase}/imgwii/01-solgas-surquillo.webp`,
        priceRange: "S/ 55 - S/ 230",
        paymentAccepted: ["Cash", "Credit Card", "Debit Card", "Yape", "Plin"],
        currenciesAccepted: "PEN",
        address: {
          '@type': 'PostalAddress',
          streetAddress: datosNegocio.direccionSede,
          addressLocality: datosNegocio.distritoSede,
          addressRegion: datosNegocio.ciudad,
          postalCode: '15047',
          addressCountry: datosNegocio.pais
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: datosNegocio.coordenadas.lat,
          longitude: datosNegocio.coordenadas.lng
        },
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            opens: '06:00',
            closes: '23:00'
          }
        ],
        areaServed: datosNegocio.distritos.map(d => ({
          '@type': 'AdministrativeArea',
          name: d.nombre
        }))
      },
      // 2. Catálogo Oficial de Productos con Ofertas
      ...datosNegocio.productos.map(p => {
        const prodNom = typeof p.nombre === 'object' ? (isEn ? (p.nombre.en || p.nombre.es) : p.nombre.es) : (isEn ? (p.nombreEn || p.nombre) : p.nombre);
        const prodTipo = typeof p.tipoUso === 'object' ? (isEn ? (p.tipoUso.en || p.tipoUso.es) : p.tipoUso.es) : (p.tipoUso || 'GLP');
        const prodValv = typeof p.valvula === 'object' ? (isEn ? (p.valvula.en || p.valvula.es) : p.valvula.es) : (p.valvula || 'Estándar');
        const precioNum = Number(p.precioPEN ?? p.precio ?? p.price ?? 65);
        const imgUrl = p.imagen || p.img || '/imgwii/productos/BALON-10KG.webp';

        return {
          '@type': 'Product',
          '@id': `${urlBase}/#producto-${p.id || p.slug || 'solgas-10kg'}`,
          name: prodNom || 'Balón de Gas GLP',
          description: `${prodTipo}. Válvula: ${prodValv}.`,
          image: `${urlBase}${imgUrl}`,
          brand: {
            '@type': 'Brand',
            name: (p.id || '').includes('masgas') ? 'Masgas' : 'Solgas'
          },
          offers: {
            '@type': 'Offer',
            url: urlBase,
            priceCurrency: 'PEN',
            price: isNaN(precioNum) ? '65.00' : precioNum.toFixed(2),
            availability: 'https://schema.org/InStock',
            seller: {
              '@type': 'LocalBusiness',
              name: datosNegocio.nombre
            }
          }
        };
      }),
      // 3. FAQPage para Preguntas y Respuestas en Google
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: isEn ? "How do I know the cylinder is 100% full?" : "¿Cómo sé que el balón viene con el peso exacto?",
            acceptedAnswer: {
              '@type': 'Answer',
              text: isEn 
                ? "Our gas cylinders come with calibrated exact weight directly from the official Solgas plant and verified at our central hub in Jr. Dante 260 before dispatch, with factory tamper-evident seals intact."
                : "Nuestros balones vienen con peso exacto calibrado directamente desde la planta envasadora oficial de Solgas y verificado en nuestra base central de Jr. Dante 260 antes del despacho, con precinto de fábrica 100% intacto."
            }
          },
          {
            '@type': 'Question',
            name: isEn ? "Is there any delivery charge?" : "¿Cobran costo adicional por el delivery?",
            acceptedAnswer: {
              '@type': 'Answer',
              text: isEn 
                ? "No, delivery and technical safety installation are completely free in Surquillo, Miraflores, San Borja, and San Isidro."
                : "No, el despacho y la instalación técnica con prueba de hermeticidad cero fugas son totalmente gratuitos en Surquillo, Miraflores, San Borja y San Isidro."
            }
          },
          {
            '@type': 'Question',
            name: isEn ? "How long does delivery take?" : "¿Cuánto tiempo tarda en llegar el pedido?",
            acceptedAnswer: {
              '@type': 'Answer',
              text: isEn 
                ? "Estimated delivery time is between 12 and 20 minutes from our central hub at Jr. Dante 260, Surquillo."
                : "El tiempo estimado de entrega es de 12 a 20 minutos despachando desde nuestra sede central en Jr. Dante 260, Surquillo."
            }
          }
        ]
      }
    ]
  };
}

export default { seo, getMeta, getJsonLd };