# Engineering Gaps Report — Hibiscus to Airport

**Date:** 2026-03-24
**Status:** Active — gaps being resolved in architecture migration

---

## CRITICAL (Must Fix)

### 1. Two-System Architecture (Backend on Render)
- **Problem:** FastAPI on Render has cold starts (30-60s), requires separate monitoring, causes CORS issues, doubles deployment complexity
- **Fix:** Migrate all API endpoints to Vercel Serverless Functions (single platform)
- **Status:** IN PROGRESS

### 2. No Rate Limiting
- **Problem:** Zero rate limiting on public endpoints — booking creation, SMS/email resend can be spammed
- **Impact:** Financial damage (Twilio charges per SMS), DoS vulnerability
- **Fix:** Add rate limiting headers + IP-based throttling in serverless functions

### 3. JWT Secret Regenerates on Restart
- **File:** `backend/auth.py:14-18`
- **Problem:** When `JWT_SECRET_KEY` env var is not set, a random secret is generated. All admin sessions invalidated on restart.
- **Fix:** Require JWT_SECRET_KEY as mandatory env var, fail startup if missing

### 4. Password Reset Tokens Never Expire
- **File:** `backend/booking_routes.py:950`
- **Problem:** Token stored with `expires_at` but expiry is never checked during reset
- **Fix:** Validate `expires_at` before allowing password reset

### 5. Unescaped User Input in Email Templates
- **File:** `backend/utils.py:424, 451, 683`
- **Problem:** User names, addresses, notes injected directly into HTML emails without escaping
- **Impact:** HTML injection, potential phishing via crafted booking names
- **Fix:** HTML-escape all user-provided fields before email template insertion

---

## HIGH (Should Fix Soon)

### 6. No Error Boundaries on Public Pages
- **Problem:** Only admin section has ErrorBoundary. If any public component crashes, entire site shows white screen.
- **Fix:** Wrap all page components in ErrorBoundary with fallback UI

### 7. No Input Validation on Booking Model
- **File:** `backend/booking_routes.py:191-219`
- **Problem:** Name, email, phone have no format validation. Passengers is string but should be int.
- **Fix:** Add Zod/regex validation on all booking fields

### 8. Missing Database Indexes
- **File:** `backend/db.py`
- **Problem:** No indexes on booking_ref, email, phone, date, created_at
- **Impact:** Full table scans on every query, gets worse as data grows
- **Fix:** Add indexes on frequently queried columns

### 9. Stripe Webhook Not Idempotent
- **File:** `backend/booking_routes.py:787-828`
- **Problem:** If webhook fires twice, sends duplicate confirmation emails
- **Fix:** Check if payment already processed before sending notifications

### 10. Race Condition in Booking Reference Generation
- **File:** `backend/booking_routes.py:555-560`
- **Problem:** Two simultaneous requests could generate same booking_ref
- **Fix:** Use database sequence or SELECT FOR UPDATE

### 11. N+1 Query in Admin Bookings
- **File:** `backend/admin_routes.py:293`
- **Problem:** `SELECT * FROM bookings LIMIT 500` fetches all columns for 500 rows
- **Fix:** Select only needed columns for list view

---

## MEDIUM (Fix When Touching)

### 12. No 404 Page
- **File:** `frontend/src/App.js:299`
- **Problem:** Unknown routes silently redirect to home. Users don't know page doesn't exist.

### 13. Console.log Statements in Production
- **Problem:** 15+ console.error calls in frontend code leak info to browser console

### 14. Inconsistent API Response Format
- **Problem:** Some endpoints return `{ok, error}`, others return `{message, booking}`

### 15. Calendar Invite Import Order Bug
- **File:** `backend/utils.py:205-220`
- **Problem:** `timezone('Pacific/Auckland')` used at line 205 but `from pytz import timezone` at line 220

### 16. Hardcoded URLs in Email Templates
- **File:** `backend/utils.py:537`
- **Problem:** `hibiscustoairport.co.nz/track/{booking_ref}` hardcoded instead of using env var

### 17. No Audit Logging
- **Problem:** Login attempts, password resets, admin actions not logged with IP/timestamp

---

## RESOLVED

| Gap | Resolution | Date |
|-----|-----------|------|
| Architecture updated to CLAUDE.md | New rules added | 2026-03-24 |
| Engineering quality rules added | 23 mandatory rules in CLAUDE.md | 2026-03-24 |
