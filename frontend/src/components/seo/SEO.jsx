import { Helmet } from 'react-helmet-async';

const DEFAULT_IMAGE = 'https://trackwithlistit.vercel.app/nika-moon.png';
const DEFAULT_DESCRIPTION = 'Track anime and web series with ListIt. Manage your watchlist, track episode progress, discover trending shows, and keep your viewing history organized.';
const DEFAULT_KEYWORDS = 'anime tracker, anime watchlist, web series tracker, TV show tracker, anime tracking, track anime, episode tracker, anime list, series tracker';
const SITE_NAME = 'ListIt';
const SITE_ORIGIN = 'https://trackwithlistit.vercel.app';

export default function SEO({ 
  title, 
  description = DEFAULT_DESCRIPTION, 
  keywords = DEFAULT_KEYWORDS,
  type = 'website', 
  image = DEFAULT_IMAGE, 
  url,
  canonical,
  noindex = false,
  structuredData,
  breadcrumbs
}) {
  const fullTitle = title 
    ? (title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`)
    : `${SITE_NAME} — Ultimate Anime & Web Series Tracking Platform`;
  
  const pageUrl = canonical || (url ? (url.startsWith('http') ? url : `${SITE_ORIGIN}${url}`) : undefined);
  const ogImage = image && image.startsWith('http') ? image : (image ? `${SITE_ORIGIN}${image}` : DEFAULT_IMAGE);

  // Generate Breadcrumbs Schema if provided
  let breadcrumbSchema = null;
  if (breadcrumbs && Array.isArray(breadcrumbs) && breadcrumbs.length > 0) {
    breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbs.map((b, idx) => ({
        "@type": "ListItem",
        "position": idx + 1,
        "name": b.name,
        "item": b.url?.startsWith('http') ? b.url : `${SITE_ORIGIN}${b.url || ''}`
      }))
    };
  }

  return (
    <Helmet>
      {/* Standard SEO */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {pageUrl && <link rel="canonical" href={pageUrl} />}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      )}
      
      {/* Open Graph / Facebook / Discord / WhatsApp */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_US" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={title || SITE_NAME} />
      {pageUrl && <meta property="og:url" content={pageUrl} />}
      
      {/* Twitter / X */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@trackwithlistit" />
      <meta name="twitter:creator" content="@trackwithlistit" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Structured Data (JSON-LD) */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}

      {/* Breadcrumb Schema (JSON-LD) */}
      {breadcrumbSchema && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      )}
    </Helmet>
  );
}
