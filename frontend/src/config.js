// Centralized backend URL configuration
// Falls back to the known Render deployment if REACT_APP_BACKEND_URL is not set.
export const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || 'https://hibiscus-to-airport-1.onrender.com';

// Google Maps API key — set REACT_APP_GOOGLE_MAPS_API_KEY in your environment
// for production.  The fallback key is the project's shared dev key.
export const GOOGLE_MAPS_API_KEY =
  process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'AIzaSyCWCQ_4vQX3j9i19Qg6-Fjzg0Muv1KtK5U';
