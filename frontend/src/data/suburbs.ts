export interface SuburbData {
  slug: string;
  name: string;
  title: string;
  description: string;
  travelTime: string;
  distance: string;
  heroTagline: string;
  heroDescription: string;
  features: string[];
  region: "hibiscus-coast" | "north-shore" | "northern-towns" | "matakana";
}

export const suburbs: SuburbData[] = [
  // Hibiscus Coast
  {
    slug: "orewa-airport-shuttle",
    name: "Orewa",
    title: "Orewa to Auckland Airport Shuttle",
    description: "Premium airport shuttle from Orewa to Auckland Airport. Local drivers, 24/7 service, competitive prices. Book your Orewa airport transfer online.",
    travelTime: "45 min",
    distance: "48 km",
    heroTagline: "Premium Transfers to Auckland Airport",
    heroDescription: "Your trusted local airport shuttle from Orewa to Auckland Airport. Fast, reliable, and affordable using the Northern Busway Express route.",
    features: ["Northern Busway Express route", "Door-to-door pickup", "Local Orewa drivers", "24/7 service including holidays"],
    region: "hibiscus-coast",
  },
  {
    slug: "silverdale-airport-shuttle",
    name: "Silverdale",
    title: "Silverdale to Auckland Airport Shuttle",
    description: "Reliable airport shuttle from Silverdale to Auckland Airport. Professional drivers, 24/7 availability. Book your Silverdale transfer online.",
    travelTime: "50 min",
    distance: "52 km",
    heroTagline: "Direct Transfers to Auckland Airport",
    heroDescription: "Convenient airport shuttle service from Silverdale to Auckland Airport. Professional drivers who know the fastest routes.",
    features: ["Direct motorway access", "Door-to-door service", "Professional drivers", "24/7 availability"],
    region: "hibiscus-coast",
  },
  {
    slug: "whangaparaoa-airport-shuttle",
    name: "Whangaparaoa",
    title: "Whangaparaoa to Auckland Airport Shuttle",
    description: "Airport shuttle from Whangaparaoa Peninsula to Auckland Airport. Reliable 24/7 service covering Gulf Harbour to Stanmore Bay. Book online.",
    travelTime: "55 min",
    distance: "54 km",
    heroTagline: "Peninsula to Airport Transfers",
    heroDescription: "Reliable airport shuttle covering the entire Whangaparaoa Peninsula. From Gulf Harbour to Stanmore Bay, we've got you covered.",
    features: ["Full peninsula coverage", "Gulf Harbour pickups", "Stanmore Bay pickups", "24/7 including public holidays"],
    region: "hibiscus-coast",
  },
  {
    slug: "red-beach-airport-shuttle",
    name: "Red Beach",
    title: "Red Beach to Auckland Airport Shuttle",
    description: "Airport shuttle from Red Beach to Auckland Airport. Local service, competitive pricing, 24/7 availability. Book your Red Beach transfer.",
    travelTime: "50 min",
    distance: "50 km",
    heroTagline: "Coastal Suburb to Airport",
    heroDescription: "Hassle-free airport transfers from Red Beach to Auckland Airport. Enjoy a comfortable ride with local drivers who know the area.",
    features: ["Local Red Beach pickups", "Competitive coastal pricing", "Comfortable vehicles", "24/7 service"],
    region: "hibiscus-coast",
  },
  {
    slug: "gulf-harbour-airport-shuttle",
    name: "Gulf Harbour",
    title: "Gulf Harbour to Auckland Airport Shuttle",
    description: "Airport shuttle from Gulf Harbour to Auckland Airport. Door-to-door service from the marina precinct. Book your transfer online.",
    travelTime: "60 min",
    distance: "58 km",
    heroTagline: "Marina to Airport Service",
    heroDescription: "Premium airport transfers from Gulf Harbour. Whether you're heading to the airport for business or holiday, we provide reliable door-to-door service.",
    features: ["Marina precinct pickups", "Door-to-door service", "Flight monitoring", "Early morning availability"],
    region: "hibiscus-coast",
  },
  {
    slug: "stanmore-bay-airport-shuttle",
    name: "Stanmore Bay",
    title: "Stanmore Bay to Auckland Airport Shuttle",
    description: "Airport shuttle from Stanmore Bay to Auckland Airport. Reliable local service with competitive pricing. Book online 24/7.",
    travelTime: "55 min",
    distance: "53 km",
    heroTagline: "Bay to Airport Transfers",
    heroDescription: "Convenient airport shuttle service from Stanmore Bay. Reliable pickups, professional drivers, and competitive prices.",
    features: ["Local Stanmore Bay service", "Professional drivers", "Competitive pricing", "Early morning and late night"],
    region: "hibiscus-coast",
  },
  // North Shore
  {
    slug: "albany-airport-shuttle",
    name: "Albany",
    title: "Albany to Auckland Airport Shuttle",
    description: "Airport shuttle from Albany to Auckland Airport. Fast motorway access, professional service. Book your Albany airport transfer.",
    travelTime: "35 min",
    distance: "38 km",
    heroTagline: "Fast Motorway Transfers",
    heroDescription: "Quick airport transfers from Albany via the Northern Motorway. Professional drivers and competitive pricing.",
    features: ["Fast motorway access", "Shopping centre pickups", "Professional service", "Competitive pricing"],
    region: "north-shore",
  },
  {
    slug: "takapuna-airport-shuttle",
    name: "Takapuna",
    title: "Takapuna to Auckland Airport Shuttle",
    description: "Airport shuttle from Takapuna to Auckland Airport. Premium North Shore transfer service. Book your Takapuna shuttle online.",
    travelTime: "30 min",
    distance: "32 km",
    heroTagline: "North Shore Premium Transfers",
    heroDescription: "Premium airport shuttle from Takapuna. Enjoy a comfortable ride from the heart of the North Shore to Auckland Airport.",
    features: ["Beach side pickups", "Premium vehicles", "Short transfer time", "24/7 availability"],
    region: "north-shore",
  },
  {
    slug: "browns-bay-airport-shuttle",
    name: "Browns Bay",
    title: "Browns Bay to Auckland Airport Shuttle",
    description: "Airport shuttle from Browns Bay to Auckland Airport. Reliable East Coast Bays service. Book your transfer online.",
    travelTime: "40 min",
    distance: "40 km",
    heroTagline: "East Coast Bays to Airport",
    heroDescription: "Reliable airport shuttle from Browns Bay and the East Coast Bays area. Professional service at competitive prices.",
    features: ["East Coast Bays coverage", "Reliable service", "Local drivers", "Affordable pricing"],
    region: "north-shore",
  },
  {
    slug: "devonport-airport-shuttle",
    name: "Devonport",
    title: "Devonport to Auckland Airport Shuttle",
    description: "Airport shuttle from Devonport to Auckland Airport. Historic village to airport transfers. Book online.",
    travelTime: "35 min",
    distance: "35 km",
    heroTagline: "Village to Airport Service",
    heroDescription: "Convenient airport transfers from Devonport. Skip the ferry hassle and get a direct door-to-door shuttle to Auckland Airport.",
    features: ["Direct door-to-door", "Skip the ferry", "Village pickups", "Professional drivers"],
    region: "north-shore",
  },
  // Northern Towns
  {
    slug: "warkworth-airport-shuttle",
    name: "Warkworth",
    title: "Warkworth to Auckland Airport Shuttle",
    description: "Airport shuttle from Warkworth to Auckland Airport. Long-distance transfer service with competitive pricing. Book online.",
    travelTime: "75 min",
    distance: "78 km",
    heroTagline: "Northern Transfer Service",
    heroDescription: "Reliable long-distance airport shuttle from Warkworth to Auckland Airport. Comfortable vehicles for the journey south.",
    features: ["Long-distance expertise", "Comfortable vehicles", "Competitive km rates", "Flight time monitoring"],
    region: "northern-towns",
  },
  {
    slug: "millwater-airport-shuttle",
    name: "Millwater",
    title: "Millwater to Auckland Airport Shuttle",
    description: "Airport shuttle from Millwater to Auckland Airport. Modern suburb, reliable service. Book your Millwater airport transfer.",
    travelTime: "50 min",
    distance: "50 km",
    heroTagline: "Modern Suburb to Airport",
    heroDescription: "Quick and reliable airport transfers from Millwater. Professional service for this growing Hibiscus Coast community.",
    features: ["Millwater community service", "Quick motorway access", "Professional drivers", "24/7 availability"],
    region: "northern-towns",
  },
  {
    slug: "dairy-flat-airport-shuttle",
    name: "Dairy Flat",
    title: "Dairy Flat to Auckland Airport Shuttle",
    description: "Airport shuttle from Dairy Flat to Auckland Airport. Rural area coverage with reliable service. Book online.",
    travelTime: "40 min",
    distance: "42 km",
    heroTagline: "Rural to Airport Service",
    heroDescription: "Reliable airport shuttle covering the Dairy Flat area. Door-to-door service from rural properties to Auckland Airport.",
    features: ["Rural property pickups", "Direct routes", "Reliable service", "Competitive pricing"],
    region: "northern-towns",
  },
];

export function getSuburbBySlug(slug: string): SuburbData | undefined {
  return suburbs.find((s) => s.slug === slug);
}

export function getSuburbsByRegion(region: SuburbData["region"]): SuburbData[] {
  return suburbs.filter((s) => s.region === region);
}
