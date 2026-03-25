// Centralized backend URL configuration
// With Vercel serverless, the API lives on the same domain under /api/*.
// REACT_APP_BACKEND_URL can override for local dev (e.g. http://localhost:8000).
// In production, empty string means same-origin requests.
export const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || '';

// Google Maps API key — MUST be set via REACT_APP_GOOGLE_MAPS_API_KEY env var
// in Vercel (or .env.local for local dev). No fallback — autocomplete will
// gracefully degrade to plain text inputs when the key is missing.
export const GOOGLE_MAPS_API_KEY =
  process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';
