# CLAUDE.md - Source of Truth for Hibiscus to Airport

## Business Details (DO NOT INVENT OR CHANGE)

- **Business Name:** Hibiscus to Airport
- **Website:** https://hibiscustoairport.co.nz
- **Phone:** 021 743 321 (international: +64-21-743-321)
- **Customer Email:** info@bookaride.co.nz
- **Admin/System Email:** bookings@bookaride.co.nz
- **Service Area:** Hibiscus Coast (Orewa, Whangaparaoa, Silverdale, Red Beach, Gulf Harbour, Stanmore Bay) to Auckland Airport
- **Hours:** 24/7 including public holidays
- **Currency:** NZD

## Architecture

- **Frontend:** React app deployed on Vercel
- **Backend:** FastAPI (Python) deployed on Render
- **Database:** MongoDB (Motor async driver)
- **Payments:** Stripe
- **SMS:** Twilio
- **Email:** Gmail API (service account) with SMTP fallback
- **Analytics:** PostHog

## Important Rules for AI Sessions

1. **Never invent contact details.** Use only the emails and phone numbers listed above. If you don't know a detail, ask - don't guess.
2. **No contact form.** The site drives users to book directly. The Contact section is a booking CTA with phone/email, not a message form.
3. **Don't create backup files.** Edit files in place.
4. **Don't rename or reorganise files** without being asked.
5. **Test changes** against existing patterns in the codebase before introducing new ones.

## Key Files

- `frontend/public/index.html` - SEO meta tags, JSON-LD schemas
- `frontend/src/pages/HomePage.jsx` - Main landing page
- `frontend/src/pages/BookingPage.jsx` - Booking form
- `backend/booking_routes.py` - Booking API endpoints
- `backend/admin_routes.py` - Admin dashboard API
- `backend/utils.py` - Email, SMS, pricing engine
- `backend/server.py` - FastAPI app setup, CORS, middleware
- `backend/db.py` - MongoDB connection
