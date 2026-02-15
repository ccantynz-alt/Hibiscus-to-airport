// Centralized backend URL configuration.
//
// IMPORTANT:
// - Many pages (Admin + Booking) depend on this single value.
// - If the env var is missing in Vercel, we must default to the production API
//   custom domain, otherwise different parts of the app can talk to different
//   backends/DBs (login vs bookings) and the admin can appear "empty".
export const BACKEND_URL = (
  process.env.REACT_APP_BACKEND_URL ||
  process.env.REACT_APP_API_BASE ||
  'https://api.hibiscustoairport.co.nz'
).replace(/\/+$/, '');
