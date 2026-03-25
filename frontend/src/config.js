// Centralized backend URL configuration
// With Vercel Serverless Functions, API routes are on the same domain.
// BACKEND_URL defaults to empty string so all calls go to /api/... on same origin.
// Set REACT_APP_BACKEND_URL only for local dev pointing at a separate backend.
export const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || '';

// Google Maps API key — MUST be set via REACT_APP_GOOGLE_MAPS_API_KEY env var
// in Vercel (or .env.local for local dev). No fallback — autocomplete will
// gracefully degrade to plain text inputs when the key is missing.
export const GOOGLE_MAPS_API_KEY =
  process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';
