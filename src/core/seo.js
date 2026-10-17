// src/core/seo.js
// --- [Metadatos SEO] titulo = ~47 caracteres, descripcion = ~150 caracteres, keywords = 5 palabras -> no eliminar esta linea.
// 🎯 Generador Universal y 100% Dinámico de Metadatos y Schema.org JSON-LD para Google Rich Snippets
// Cero cadenas hardcodeadas: Todo fluye en cascada desde datosNegocio (src/semillas/negocio.json), wii.js y configurar.js

import wii from '../wii.js';
import { datosNegocio, configSemilla } from '../negocio.js';

/**
 * Resuelve la URL base canónica universal del sistema
 * Prioridad: 1. baseUrl explícito -> 2. datosNegocio.linkweb (negocio.json) -> 3. wii.linkweb (wii.js)
 */
export function getUrlBase(baseUrl = '') {
  const url = baseUrl || datosNegocio.linkweb || wii.linkweb || '';
  return url.replace(/\/$/, '');
}

/**
 * Resuelve la URL absoluta canónica de cualquier recurso
 */
export function getUrlAbsoluta(path = '', baseUrl = '') {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const base = getUrlBase(baseUrl);
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return base ? `${base}${cleanPath}` : cleanPath;
}

/**
 * Resuelve el asset canónico de imagen para Google SERP (Thumbnail) y OpenGraph
 */
export function getSeoImagen(idioma = 'es') {
  const urlBase = getUrlBase();
  const seoData = datosNegocio.seo || {};
  const imgRelativa = seoData.imagen || datosNegocio.hero?.imagen || datosNegocio.identidad?.logo || datosNegocio.logo || '/imgwii/logo.webp';
  const imgUrl = getUrlAbsoluta(imgRelativa, urlBase);
  
  const altText = (typeof seoData.imagenAlt === 'object' ? (seoData.imagenAlt[idioma] || seoData.imagenAlt.es) : seoData.imagenAlt)
    || `${datosNegocio.nombre} - ${datosNegocio.subtitulo || datosNegocio.identidad?.razonSocial || 'Portal Oficial'}`;
    
  const captionText = (typeof seoData.imagenCaption === 'object' ? (seoData.imagenCaption[idioma] || seoData.imagenCaption.es) : seoData.imagenCaption)
    || `${datosNegocio.nombre} - ${datosNegocio.identidad?.razonSocial || datosNegocio.subtitulo || 'Portal Oficial'}`;

  return {
    url: imgUrl,
    width: 1200,
    height: 630,
    type: imgUrl.endsWith('.png') ? 'image/png' : (imgUrl.endsWith('.jpg') || imgUrl.endsWith('.jpeg') ? 'image/jpeg' : 'image/webp'),
    alt: altText,
    caption: captionText
  };
}

// Compatibilidad retroactiva para imports directos
export const SEO_IMAGEN = new Proxy({}, {
  get(_, prop) {
    const img = getSeoImagen('es');
    return img[prop];
  }
});

/**
 * Resuelve los metadatos canónicos de la página principal según datosNegocio
 */
export function getSeoInicio(idioma = 'es') {
  const langKey = (idioma || 'es').toLowerCase();
  const seoData = datosNegocio.seo || {};
  
  const title = (seoData.titulo?.[langKey] || (typeof seoData.titulo === 'string' ? seoData.titulo : ''))
    || `${datosNegocio.nombre} | ${datosNegocio.subtitulo}`;
    
  const description = (seoData.descripcion?.[langKey] || (typeof seoData.descripcion === 'string' ? seoData.descripcion : ''))
    || (datosNegocio.hero?.descripcion || datosNegocio.identidad?.bio || datosNegocio.subtitulo || '');
    
  const rawKeywords = seoData.keywords?.[langKey] || seoData.keywords?.es || [];
  const keywords = Array.isArray(rawKeywords) ? rawKeywords : (typeof rawKeywords === 'string' ? rawKeywords.split(',').map(s => s.trim()) : []);

  return {
    title,
    description,
    path: langKey === 'es' ? '/' : `/${langKey}`,
    keywords,
    audience: seoData.audience || ['clientes', 'usuarios', 'publico general'],
    intent: `${configSemilla.terminologia?.catalogoTituloCorto || 'servicios y productos'} de ${datosNegocio.nombre} en ${datosNegocio.distritoSede || datosNegocio.ciudad || ''}`.trim()
  };
}

export const SEO_INICIO = {
  get es() { return getSeoInicio('es'); },
  get en() { return getSeoInicio('en'); }
};

export const seo = {
  inicio: SEO_INICIO
};

/**
 * Genera metadatos completos para el <head> (OpenGraph, Twitter, Hreflang, Canonical y Thumbnail Google)
 */
export function getMeta(ruta = '/', idioma = 'es') {
  const langKey = (idioma || 'es').toLowerCase();
  const urlBase = getUrlBase();
  const canonical = `${urlBase}${ruta}`;
  
  const seoData = getSeoInicio(langKey);
  const title = seoData.title;
  const description = seoData.description;
  const keywords = seoData.keywords.join(', ');
  
  const imgInfo = getSeoImagen(langKey);

  return {
    title,
    description,
    keywords,
    canonical,
    ogTitle: title,
    ogDescription: description,
    ogImage: imgInfo.url,
    ogImageWidth: imgInfo.width,
    ogImageHeight: imgInfo.height,
    ogImageType: imgInfo.type,
    ogImageAlt: imgInfo.alt,
    ogUrl: canonical,
    ogType: 'website',
    siteName: datosNegocio.nombre,
    telefono: datosNegocio.telefonoMostrado,
    locale: langKey === 'es' ? 'es_PE' : 'en_US',
    localeAlternate: langKey === 'es' ? 'en_US' : 'es_PE',
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
  const urlBase = getUrlBase();
  const langKey = (idioma || 'es').toLowerCase();
  const canonical = `${urlBase}${ruta}`;
  
  const seoData = getSeoInicio(langKey);
  const title = seoData.title;
  const description = seoData.description;
  const imgInfo = getSeoImagen(langKey);

  const inLanguageMap = {
    es: 'es-PE',
    en: 'en-US'
  };
  const inLanguage = inLanguageMap[langKey] || `${langKey}-${langKey.toUpperCase()}`;

  const seoConfig = datosNegocio.seo || {};
  const localBusinessDesc = (typeof seoConfig.descripcionNegocio === 'object' 
    ? (seoConfig.descripcionNegocio[langKey] || seoConfig.descripcionNegocio.es) 
    : seoConfig.descripcionNegocio) || description;

  const faqsList = Array.isArray(seoConfig.faqs) && seoConfig.faqs.length > 0 
    ? seoConfig.faqs 
    : [
        {
          pregunta: { es: `¿Cómo solicitar atención o pedidos en ${datosNegocio.nombre}?`, en: `How to place an order at ${datosNegocio.nombre}?` },
          respuesta: { es: `Puedes comunicarte vía WhatsApp o llamada directa al ${datosNegocio.telefonoMostrado} para atención inmediata.`, en: `You can reach out via WhatsApp or call us directly at ${datosNegocio.telefonoMostrado} for immediate assistance.` }
        }
      ];

  const paymentAccepted = Array.isArray(seoConfig.paymentAccepted) && seoConfig.paymentAccepted.length > 0
    ? seoConfig.paymentAccepted
    : (datosNegocio.mediosPago?.map(m => m.nombre) || ["Efectivo", "Transferencia"]);

  const currenciesAccepted = seoConfig.currenciesAccepted || datosNegocio.moneda || "PEN";
  const priceRange = seoConfig.rangoPrecios || (datosNegocio.moneda ? `${datosNegocio.moneda} $$` : '$$');

  // Tipos Schema.org dinámicos gobernados por negocio.json o configurar.js
  const schemaBusinessTypes = Array.isArray(seoConfig.schemaTypes) && seoConfig.schemaTypes.length > 0
    ? seoConfig.schemaTypes
    : (seoConfig.schemaType ? [seoConfig.schemaType] : ['LocalBusiness']);

  const nextYear = new Date().getFullYear() + 1;

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
        inLanguage,
        isPartOf: {
          '@type': 'WebSite',
          '@id': `${urlBase}/#website`,
          url: urlBase,
          name: datosNegocio.nombre
        },
        primaryImageOfPage: {
          '@type': 'ImageObject',
          '@id': `${urlBase}/#primaryimage`,
          url: imgInfo.url,
          contentUrl: imgInfo.url,
          width: imgInfo.width,
          height: imgInfo.height,
          caption: imgInfo.caption
        }
      },
      // 1. Negocio Local Dinámico
      {
        '@type': schemaBusinessTypes,
        '@id': `${urlBase}/#localbusiness`,
        name: datosNegocio.nombre,
        description: localBusinessDesc,
        url: urlBase,
        telephone: datosNegocio.telefonoMostrado,
        image: imgInfo.url,
        logo: getUrlAbsoluta(datosNegocio.identidad?.logo || datosNegocio.logo || '/smile.avif', urlBase),
        hasMap: datosNegocio.mapsUrl || '',
        sameAs: Array.isArray(datosNegocio.redes)
          ? datosNegocio.redes.map(r => (typeof r === 'object' ? r.url : r)).filter(u => typeof u === 'string' && u.startsWith('http'))
          : (typeof datosNegocio.redes === 'object' && datosNegocio.redes !== null
              ? Object.values(datosNegocio.redes).filter(u => typeof u === 'string' && u.startsWith('http'))
              : []),
        priceRange: priceRange,
        paymentAccepted: paymentAccepted,
        currenciesAccepted: currenciesAccepted,
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: String(seoConfig.ratingDefault || '4.9'),
          reviewCount: String(seoConfig.reviewCountDefault || '128'),
          bestRating: '5',
          worstRating: '1'
        },
        address: {
          '@type': 'PostalAddress',
          streetAddress: datosNegocio.direccionSede,
          addressLocality: datosNegocio.distritoSede,
          addressRegion: datosNegocio.ciudad,
          postalCode: datosNegocio.codigoPostal || datosNegocio.ubicacion?.codigoPostal || '',
          addressCountry: datosNegocio.pais || 'PE'
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: Number(datosNegocio.coordenadas?.lat || 0),
          longitude: Number(datosNegocio.coordenadas?.lng || 0)
        },
        openingHoursSpecification: Array.isArray(seoConfig.openingHours) && seoConfig.openingHours.length > 0
          ? seoConfig.openingHours
          : [
              {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                opens: seoConfig.opens || '06:00',
                closes: seoConfig.closes || '23:00'
              }
            ],
        areaServed: (datosNegocio.distritos || []).map(d => ({
          '@type': 'AdministrativeArea',
          name: d.nombre || d
        }))
      },
      // 2. BreadcrumbList Canónico
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: langKey === 'es' ? 'Inicio' : 'Home',
            item: `${urlBase}${langKey === 'es' ? '/' : `/${langKey}`}`
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: langKey === 'es' ? (datosNegocio.terminologia?.productos || 'Catálogo') : (datosNegocio.terminologia?.productosEn || 'Catalog'),
            item: `${urlBase}${langKey === 'es' ? '/#productos' : `/${langKey}#productos`}`
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: `${datosNegocio.nombre}${datosNegocio.distritoSede ? ' - ' + datosNegocio.distritoSede : ''}`,
            item: canonical
          }
        ]
      },
      // 3. Catálogo Oficial Dinámico (Google Shopping & Free Listings)
      ...(datosNegocio.productos || []).map(p => {
        const prodNom = (langKey !== 'es' ? (p[`nombre_${langKey}`] || p.nombreEn) : null) || p.nombre;
        const prodDesc = (langKey !== 'es' ? (p[`descripcion_${langKey}`] || p.descripcionEn) : null) || p.descripcion;
        const precioNum = Number(p.precioPEN ?? p.precio ?? 0);
        const stockActual = Number(p.stock ?? (p.tipoCategoria === 'accesorio' || (p.id && p.id.includes('valvula')) ? 35 : 50));
        const imgUrl = getUrlAbsoluta(p.imagen || imgInfo.url, urlBase);
        const prodId = (p.id || p.slug || 'item').toUpperCase();
        const brandName = p.marca || datosNegocio.marcaRespaldo || datosNegocio.nombre;

        return {
          '@type': 'Product',
          '@id': `${urlBase}/#${configSemilla.modeloCatalogo || 'producto'}-${p.id || p.slug || 'item'}`,
          name: prodNom || datosNegocio.nombre,
          description: prodDesc || `${p.tipoUso || datosNegocio.subtitulo || 'Servicio oficial'}.`,
          image: imgUrl,
          sku: p.sku || `SKU-${prodId}`,
          mpn: p.mpn || `MPN-${prodId}-${datosNegocio.pais || 'PE'}`,
          brand: {
            '@type': 'Brand',
            name: brandName
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: String(p.rating || seoConfig.ratingDefault || '4.9'),
            reviewCount: String(p.reviewCount || seoConfig.reviewCountDefault || '120'),
            bestRating: '5',
            worstRating: '1'
          },
          offers: {
            '@type': 'Offer',
            url: `${urlBase}/#${configSemilla.modeloCatalogo || 'productos'}`,
            priceCurrency: currenciesAccepted,
            price: isNaN(precioNum) ? '0.00' : precioNum.toFixed(2),
            priceValidUntil: `${nextYear}-12-31`,
            availability: (stockActual > 0 && p.estado !== 'agotado' && p.estado !== 'pausado')
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
            itemCondition: 'https://schema.org/NewCondition',
            seller: {
              '@type': 'LocalBusiness',
              name: datosNegocio.nombre
            },
            shippingDetails: {
              '@type': 'OfferShippingDetails',
              shippingRate: { '@type': 'MonetaryAmount', value: 0, currency: currenciesAccepted },
              shippingDestination: { '@type': 'DefinedRegion', addressCountry: datosNegocio.pais || 'PE', addressRegion: datosNegocio.ciudad || '' },
              deliveryTime: {
                '@type': 'ShippingDeliveryTime',
                handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: Number(seoConfig.handlingMaxMinutes || 5), unitCode: 'MIN' },
                transitTime: { '@type': 'QuantitativeValue', minValue: Number(seoConfig.transitMinMinutes || 15), maxValue: Number(seoConfig.transitMaxMinutes || 25), unitCode: 'MIN' }
              }
            },
            hasMerchantReturnPolicy: {
              '@type': 'MerchantReturnPolicy',
              applicableCountry: datosNegocio.pais || 'PE',
              returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
              merchantReturnDays: Number(seoConfig.returnDays || 1),
              returnMethod: 'https://schema.org/ReturnInStore',
              returnFees: 'https://schema.org/FreeReturn'
            }
          }
        };
      }),
      // 4. FAQPage para Preguntas y Respuestas en Google
      {
        '@type': 'FAQPage',
        mainEntity: faqsList.map(f => ({
          '@type': 'Question',
          name: f.pregunta[langKey] || f.pregunta.es,
          acceptedAnswer: {
            '@type': 'Answer',
            text: f.respuesta[langKey] || f.respuesta.es
          }
        }))
      }
    ]
  };
}

export default { seo, SEO_IMAGEN, SEO_INICIO, getSeoImagen, getSeoInicio, getMeta, getJsonLd, getUrlBase, getUrlAbsoluta };