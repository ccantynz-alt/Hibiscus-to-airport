import { createSuburbPage } from './SuburbTemplate';

const AlbanyShuttle = createSuburbPage(
  'Albany',
  '25 min',
  [
    'Albany Mall',
    'Westfield Albany',
    'Albany Business District',
    'Massey University',
    'AUT North Campus',
    'Albany Village',
    'Residential Areas',
    'Albany Stadium',
    'Parks and Reserves',
    'Hospital',
    'Commercial Hub',
    'Public Transport Centre'
  ],
  {
    title: 'Albany to Auckland Airport Shuttle',
    description: 'Express airport shuttle from Albany to Auckland Airport. Quick motorway access, premium vehicles. Book online 24/7.',
    path: '/albany-airport-shuttle'
  }
);

export default AlbanyShuttle;