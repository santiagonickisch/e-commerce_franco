import SEO from './SEO';

const ProductSEO = ({ product }) => {
  if (!product) return null;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": product.image,
    "brand": {
      "@type": "Brand",
      "name": "Franco Salon Exclusivo"
    },
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": "EUR",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "Franco Salon Exclusivo"
      }
    },
    "aggregateRating": product.rating ? {
      "@type": "AggregateRating",
      "ratingValue": product.rating,
      "reviewCount": product.reviews || 0
    } : undefined
  };

  const title = `${product.name} - Franco Salon Exclusivo`;
  const description = `${product.description} - Precio: €${product.price}. Producto profesional para peluquería.`;
  const keywords = `${product.name}, franco salon exclusivo, productos peluquería, ${product.category}, profesional`;

  return (
    <SEO
      title={title}
      description={description}
      keywords={keywords}
      image={product.image}
      url={`/products/${product.id}`}
      type="product"
      structuredData={structuredData}
    />
  );
};

export default ProductSEO;
