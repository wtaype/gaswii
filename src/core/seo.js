// src/core/seo.js
// --- [Metadatos SEO] titulo = ~47 caracteres, descripcion = ~150 caracteres, keywords = 5 palabras -> no eliminar esta linea.
import app from '../app.js';
import { datosNegocio } from '../negocio.js';

// ==========================================
// 1. ASSET CANÓNICO DE IMAGEN PARA GOOGLE SERP Y REDES SOCIALES
// ==========================================
export const SEO_IMAGEN = {
  url: 'https://solgassurquillo.com/imgwii/productos/BALON-10KG.webp',
  width: 1200,
  height: 630,
  type: 'image/webp',
  alt: 'Balón de Gas Solgas 10 kg con Válvula Premium y Balanza Digital - Solgas Surquillo',
  caption: 'Distribuidor Autorizado Solgas Surquillo - Delivery en 15 Minutos'
};

// ==========================================
// 2. METADATOS CANÓNICOS DE INICIO (PÁGINA PRINCIPAL)
// ==========================================
export const SEO_INICIO = {
  es: {
    title: "Solgas Surquillo | Balón de Gas a Domicilio en 15 Min - Pedir Aquí",
    description: "Pide tu balón de gas Solgas en Surquillo al 936 369 384. Entrega express en 15 min con balanza digital a tu puerta y garantía oficial de fábrica.",
    path: '/',
    keywords: [
      'solgas surquillo',
      'gas surquillo',
      'pedir gas surquillo',
      'solgas surquillo telefono',
      'solgas miraflores',
      'delivery de gas san borja',
      'pedir gas san isidro',
      'balon de gas a domicilio',
      'balon solgas 10 kg precio',
      'balon solgas 45 kg',
      'gas con balanza digital lima',
      'solgas dante surquillo',
      'gas de cocina surquillo 15 minutos'
    ],
    audience: ['hogares', 'familias', 'restaurantes', 'negocios', 'vecinos'],
    intent: 'pedir gas de cocina a domicilio con peso exacto en surquillo, miraflores, san borja, san isidro y lima'
  },
  en: {
    title: "Solgas Surquillo | Express LPG Cooking Gas Delivery Lima 15 Min",
    description: "Order official Solgas LPG cylinders in Surquillo & Miraflores. 15-minute express delivery with certified digital weight scale and factory warranty.",
    path: '/en',
    keywords: [
      'solgas surquillo',
      'gas delivery lima',
      'cooking gas surquillo',
      'solgas miraflores delivery',
      'lpg gas san isidro',
      'order gas cylinder lima',
      'express gas delivery lima'
    ],
    audience: ['residents', 'expats', 'families', 'restaurants'],
    intent: 'order home delivery lpg cooking gas cylinder in lima'
  }
};

// ==========================================
// 3. MAPA DE RUTAS PÚBLICAS (EXCLUYE AUTH: CLIENTE Y PERSONAL)
// ==========================================
export const seo = {
  inicio: SEO_INICIO
};

/**
 * Genera metadatos completos para el <head> (OpenGraph, Twitter, Hreflang, Canonical)
 * Prioriza dinámicamente datos de Firestore (colección 'negocio' -> 'seo')
 */
export function getMeta(ruta = '/', idioma = 'es') {
  const clave = ruta === '/' || ruta === '/en' ? 'inicio' : ruta.replace(/^\/(en\/)?/, '');
  const data = seo[clave] ? seo[clave][idioma] : seo.inicio[idioma];
  const urlBase = (app.linkweb || 'https://gaswii.amorwii.workers.dev').replace(/\/$/, '');
  const canonical = `${urlBase}${ruta}`;

  // Priorizar SEO dinámico desde la colección 'negocio' en Firestore para la página principal
  const seoDinamico = clave === 'inicio' ? datosNegocio.seo : null;
  const title = (seoDinamico?.titulo?.[idioma]?.trim()) || data.title;
  const description = (seoDinamico?.descripcion?.[idioma]?.trim()) || data.description;
  const dynamicKeywords = seoDinamico?.keywords?.[idioma];
  const keywordsList = Array.isArray(dynamicKeywords) && dynamicKeywords.length > 0 
    ? dynamicKeywords 
    : data.keywords;
  const keywords = keywordsList.join(', ');

  const imgCanonical = SEO_IMAGEN.url.startsWith('http') 
    ? SEO_IMAGEN.url 
    : `${urlBase}${SEO_IMAGEN.url}`;

  return {
    title,
    description,
    keywords,
    canonical,
    ogTitle: title,
    ogDescription: description,
    ogImage: imgCanonical,
    ogImageWidth: SEO_IMAGEN.width,
    ogImageHeight: SEO_IMAGEN.height,
    ogImageType: SEO_IMAGEN.type,
    ogImageAlt: SEO_IMAGEN.alt,
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
 * Preserva al 100% el catálogo de productos con precios, stock, ratings y FAQs
 */
export function getJsonLd(ruta = '/', idioma = 'es') {
  const urlBase = (app.linkweb || 'https://gaswii.amorwii.workers.dev').replace(/\/$/, '');
  const isEn = idioma === 'en';
  const canonical = `${urlBase}${ruta}`;
  const data = seo.inicio[idioma] || SEO_INICIO.es;
  const seoDinamico = ruta === '/' || ruta === '/en' ? datosNegocio.seo : null;
  const title = (seoDinamico?.titulo?.[idioma]?.trim()) || data.title;
  const description = (seoDinamico?.descripcion?.[idioma]?.trim()) || data.description;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      // 0. Entidad WebPage con PrimaryImageOfPage (Requisito Google SERP Image Thumbnail)
      {
        '@type': 'WebPage',
        '@id': `${urlBase}/#webpage`,
        url: canonical,
        name: title,
        description: description,
        inLanguage: isEn ? 'en-US' : 'es-PE',
        isPartOf: {
          '@type': 'WebSite',
          '@id': `${urlBase}/#website`,
          url: urlBase,
          name: datosNegocio.nombre
        },
        primaryImageOfPage: {
          '@type': 'ImageObject',
          '@id': `${urlBase}/#primaryimage`,
          url: SEO_IMAGEN.url,
          contentUrl: SEO_IMAGEN.url,
          width: SEO_IMAGEN.width,
          height: SEO_IMAGEN.height,
          caption: SEO_IMAGEN.caption
        }
      },
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
        image: SEO_IMAGEN.url,
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
      // 2. Catálogo Oficial de Productos Dinámicos desde Firestore (Google Shopping & Free Listings)
      ...datosNegocio.productos.map(p => {
        const prodNom = isEn ? (p.nombreEn || p.nombre) : p.nombre;
        const prodDesc = isEn ? (p.descripcionEn || p.descripcion) : p.descripcion;
        const precioNum = Number(p.precioPEN ?? p.precio ?? 65);
        const stockActual = Number(p.stock ?? 10);
        const imgUrl = (p.imagen || '/imgwii/productos/BALON-10KG.webp').startsWith('http') 
          ? (p.imagen || '') 
          : `${urlBase}${p.imagen || '/imgwii/productos/BALON-10KG.webp'}`;
        const prodId = (p.id || p.slug || 'solgas-10kg').toUpperCase();

        return {
          '@type': 'Product',
          '@id': `${urlBase}/#producto-${p.id || p.slug || 'solgas-10kg'}`,
          name: prodNom || 'Balón de Gas Solgas 10 kg',
          description: prodDesc || `${p.tipoUso || 'GLP doméstico'}. Válvula: ${p.valvula || 'Premium'}.`,
          image: imgUrl,
          sku: p.sku || `SOLGAS-${prodId}`,
          mpn: p.mpn || `SG-${prodId}-PE`,
          brand: {
            '@type': 'Brand',
            name: (p.id || '').includes('masgas') ? 'Masgas' : 'Solgas'
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.9',
            reviewCount: '1280',
            bestRating: '5',
            worstRating: '1'
          },
          offers: {
            '@type': 'Offer',
            url: `${urlBase}/#productos`,
            priceCurrency: 'PEN',
            price: isNaN(precioNum) ? '65.00' : precioNum.toFixed(2),
            priceValidUntil: '2027-12-31',
            availability: stockActual > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            itemCondition: 'https://schema.org/NewCondition',
            seller: {
              '@type': 'LocalBusiness',
              name: datosNegocio.nombre
            },
            shippingDetails: {
              '@type': 'OfferShippingDetails',
              shippingRate: { '@type': 'MonetaryAmount', value: 0, currency: 'PEN' },
              shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'PE', addressRegion: 'Lima' },
              deliveryTime: {
                '@type': 'ShippingDeliveryTime',
                handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 5, unitCode: 'MIN' },
                transitTime: { '@type': 'QuantitativeValue', minValue: 15, maxValue: 25, unitCode: 'MIN' }
              }
            },
            hasMerchantReturnPolicy: {
              '@type': 'MerchantReturnPolicy',
              applicableCountry: 'PE',
              returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
              merchantReturnDays: 1,
              returnMethod: 'https://schema.org/ReturnAtKiosk',
              returnFees: 'https://schema.org/FreeReturn'
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

export default { seo, SEO_IMAGEN, SEO_INICIO, getMeta, getJsonLd };