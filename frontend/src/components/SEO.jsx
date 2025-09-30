import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title = "Franco Salon Exclusivo",
  description = "Experiencia de compra premium y elegante con productos exclusivos para peluquería profesional",
  keywords = "franco, salon exclusivo, peluquería, productos profesionales, aceite, acondicionador, aerosol, cera, gel, máscara, oxidantes, shampoo, spray",
  image = "/og-image.jpg",
  url = "",
  type = "website",
  structuredData = null
}) => {
  const fullUrl = url ? `https://franco-salon-exclusivo.com${url}` : "https://franco-salon-exclusivo.com";
  const fullImageUrl = image.startsWith('http') ? image : `https://franco-salon-exclusivo.com${image}`;

  return (
    <Helmet>
      {/* Meta tags básicos */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="Franco Salon Exclusivo" />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:site_name" content="Franco Salon Exclusivo" />
      <meta property="og:locale" content="es_ES" />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={fullUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />

      {/* Datos estructurados JSON-LD */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
