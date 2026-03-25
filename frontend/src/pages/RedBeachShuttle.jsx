import { createSuburbPage } from './SuburbTemplate';

const RedBeachShuttle = createSuburbPage(
  'Red Beach',
  '50 min',
  [
    'Red Beach Town Centre',
    'Whangaparaoa Road',
    'Red Beach Schools',
    'Coastal Reserves',
    'Business Areas',
    'Residential Zones',
    'Stanmore Bay Connection',
    'Community Facilities',
    'Shopping Districts',
    'Beach Access Areas',
    'Local Parks',
    'Nearby Schools'
  ],
  {
    title: 'Red Beach to Auckland Airport Shuttle',
    description: 'Door-to-door airport shuttle from Red Beach to Auckland Airport. Premium vehicles, local drivers. Book online 24/7.',
    path: '/red-beach-airport-shuttle'
  }
);

export default RedBeachShuttle;