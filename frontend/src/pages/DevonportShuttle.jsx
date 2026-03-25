import { createSuburbPage } from './SuburbTemplate';

const DevonportShuttle = createSuburbPage(
  'Devonport',
  '15 min',
  [
    'Devonport Village',
    'Victoria Road',
    'North Head',
    'Mt Victoria',
    'Cheltenham Beach',
    'Devonport Wharf',
    'Navy Base',
    'Historic Buildings',
    'Art Galleries',
    'Restaurants',
    'Ferry Terminal',
    'Boutique Shops'
  ],
  {
    title: 'Devonport to Auckland Airport Shuttle',
    description: 'Airport shuttle from Devonport to Auckland Airport. Skip the ferry hassle with direct transfers. Book online 24/7.',
    path: '/devonport-airport-shuttle'
  }
);

export default DevonportShuttle;