import { createSuburbPage } from './SuburbTemplate';

const ManlyShuttle = createSuburbPage(
  'Manly',
  '35 min',
  [
    'Manly Beach',
    'Wharf Village',
    'Coastal Walk',
    'Manly Sailing Club',
    'Beachfront Dining',
    'Historic Village',
    'Marina',
    'Beach Reserve',
    'Community Centre',
    'Local Markets',
    'Seaside Properties',
    'Public Transport'
  ],
  {
    title: 'Manly to Auckland Airport Shuttle',
    description: 'Airport shuttle from Manly, Whangaparaoa to Auckland Airport. Fast, affordable transfers. Book online for instant quotes.',
    path: '/manly-airport-shuttle'
  }
);

export default ManlyShuttle;