import React from 'react';
import { Helmet } from 'react-helmet-async';

const BASE_URL = 'https://hibiscustoairport.co.nz';

const PageMeta = ({ title, description, path = '/', noIndex = false }) => {
  const fullTitle = title
    ? `${title} | Hibiscus to Airport`
    : 'Hibiscus to Airport - Premium Airport Shuttle Service';
  const url = `${BASE_URL}${path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
    </Helmet>
  );
};

export default PageMeta;
