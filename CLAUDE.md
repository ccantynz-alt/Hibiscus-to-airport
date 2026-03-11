# CLAUDE.md - Source of Truth for Hibiscus to Airport

## Business Details (DO NOT INVENT OR CHANGE)

- **Business Name:** Hibiscus to Airport
- **Website:** https://hibiscustoairport.co.nz
- **Phone:** 021 743 321 (international: +64-21-743-321)
- **Customer-facing Email:** info@bookaride.co.nz (shown on website)
- **Booking Admin Email:** bookings@bookaride.co.nz (where booking notifications go)
- **Sender Email (from):** noreply@bookaride.co.nz (outgoing emails sent from this address)
- **Service Area:** Hibiscus Coast (Orewa, Whangaparaoa, Silverdale, Red Beach, Gulf Harbour, Stanmore Bay) to Auckland Airport
- **Hours:** 24/7 including public holidays
- **Currency:** NZD

## Architecture (DO NOT CHANGE WITHOUT OWNER APPROVAL)

- **Frontend:** React app deployed on Vercel
- **Backend:** FastAPI (Python) deployed on Render
- **Database:** Neon (PostgreSQL) via asyncpg — DO NOT use MongoDB
- **Payments:** Stripe
- **SMS:** Twilio
- **Email:** Mailgun HTTP API — DO NOT use Gmail API or raw SMTP
- **Analytics:** PostHog
- **Geocoding / Autocomplete:** Google Maps API (`@react-google-maps/api`) — API key set in Vercel as `REACT_APP_GOOGLE_MAPS_API_KEY`. Falls back to plain text inputs when key is missing.

## Important Rules for AI Sessions

1. **Never invent contact details.** Use only the emails and phone numbers listed above. If you don't know a detail, ask — don't guess.
2. **No contact form.** The site drives users to book directly. The Contact section is a booking CTA with phone/email, not a message form.
3. **Don't create backup files.** Edit files in place.
4. **Don't rename or reorganise files** without being asked.
5. **Test changes** against existing patterns in the codebase before introducing new ones.
6. **Never swap out the database or email provider.** The stack is Neon (PostgreSQL) + Mailgun. Do not introduce MongoDB, Firebase, Gmail API, SendGrid, or any other provider.
7. **Never change business contact details** (phone, emails, website URL). These are listed above and must not be altered.
8. **Phone number is 021 743 321.** Any other phone number (e.g., 021 123 4567) is wrong. Fix it if you see it.

## Key Files

- `frontend/public/index.html` - SEO meta tags, JSON-LD schemas
- `frontend/src/pages/HomePage.jsx` - Main landing page
- `frontend/src/pages/BookingPage.jsx` - Booking form
- `backend/booking_routes.py` - Booking API endpoints
- `backend/admin_routes.py` - Admin dashboard API
- `backend/utils.py` - Email (Mailgun), SMS (Twilio), pricing engine
- `backend/server.py` - FastAPI app setup, CORS, middleware
- `backend/db.py` - Neon PostgreSQL connection and schema init
