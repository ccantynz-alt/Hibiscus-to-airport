import React from 'react';
import { Helmet } from 'react-helmet-async';

const BASE_URL = 'https://hibiscustoairport.co.nz';

const PageMeta = ({ title, description, path = '/', noIndex = false, breadcrumbs }) => {
  const fullTitle = title
    ? `${title} | Hibiscus to Airport`
    : 'Hibiscus to Airport - Premium Airport Shuttle Service';
  const url = `${BASE_URL}${path}`;

  // Build breadcrumb list: use provided breadcrumbs or generate default Home → current page
  const breadcrumbItems = breadcrumbs || (title
    ? [
        { name: 'Home', path: '/' },
        { name: title, path },
      ]
    : [{ name: 'Home', path: '/' }]);

  const breadcrumbSchema = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${BASE_URL}${item.path}`,
    })),
  });

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <script type="application/ld+json">{breadcrumbSchema}</script>
    </Helmet>
  );
};

export default PageMeta;
