import { Helmet } from 'react-helmet-async';

export default function SEO({ 
  title, 
  description = 'Your ultimate anime & web series tracking platform. Discover, track, and share your entertainment journey.', 
  type = 'website', 
  image = 'https://listit.app/default-og-image.jpg', 
  url, 
  structuredData 
}) {
  const siteName = 'listIt';
  const fullTitle = title ? `${title} | ${siteName}` : `${siteName} — Anime & Web Series Tracking Platform`;
  
  return (
    <Helmet>
      {/* Standard SEO */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:site_name" content={siteName} />
      {image && <meta property="og:image" content={image} />}
      {url && <meta property="og:url" content={url} />}
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}
      
      {/* Structured Data (JSON-LD) */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
}
