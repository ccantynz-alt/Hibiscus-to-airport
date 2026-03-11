// Centralized backend URL configuration
// Falls back to the known Render deployment if REACT_APP_BACKEND_URL is not set.
export const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || 'https://hibiscus-to-airport-1.onrender.com';

// Google Maps API key — MUST be set via REACT_APP_GOOGLE_MAPS_API_KEY env var
// in Vercel (or .env.local for local dev). No fallback — autocomplete will
// gracefully degrade to plain text inputs when the key is missing.
export const GOOGLE_MAPS_API_KEY =
  process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';
