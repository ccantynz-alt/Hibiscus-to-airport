import { createSuburbPage } from './SuburbTemplate';

const TakapunaShuttle = createSuburbPage(
  'Takapuna',
  '20 min',
  [
    'Takapuna Beach',
    'Hurstmere Road',
    'Takapuna Shopping Centre',
    'The Strand',
    'Bruce Mason Centre',
    'Lake Pupuke',
    'Restaurants and Cafes',
    'Business District',
    'Residential Areas',
    'Public Library',
    'Medical Facilities',
    'Transport Hub'
  ],
  {
    title: 'Takapuna to Auckland Airport Shuttle',
    description: 'Airport shuttle from Takapuna, North Shore to Auckland Airport. Professional transfers with luxury vehicles. Book online 24/7.',
    path: '/takapuna-airport-shuttle'
  }
);

export default TakapunaShuttle;