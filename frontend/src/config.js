// Centralized backend URL configuration
// Falls back to production API (api.hibiscustoairport.co.nz) if REACT_APP_BACKEND_URL is not set.
export const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || 'https://api.hibiscustoairport.co.nz';
