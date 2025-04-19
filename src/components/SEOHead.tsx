import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title: string;
  description: string;
  path: string;
  type?: string;
}

export function SEOHead({ title, description, path, type = 'website' }: SEOHeadProps) {
  const baseUrl = 'https://dolarcambio.com';
  const fullUrl = `${baseUrl}${path}`;
  const fullTitle = `${title} | DolarCambio.com`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="DolarCambio.com" />
      <meta property="og:locale" content="es_AR" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      
      {/* Canonical */}
      <link rel="canonical" href={fullUrl} />
      <link rel="alternate" href={fullUrl} hreflang="es-AR" />

      {/* Structured Data (Schema.org) */}
      <script type="application/ld+json">{`
        {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "url": "${baseUrl}",
          "name": "DolarCambio.com",
          "description": "Cotizaciones del dólar en Argentina en tiempo real. Consulta los diferentes tipos de cambio: oficial, blue, MEP, CCL y más."
        }
      `}</script>
    </Helmet>
  );
}
