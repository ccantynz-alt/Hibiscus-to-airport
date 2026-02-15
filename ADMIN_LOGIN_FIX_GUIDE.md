# Admin Login and Bookings Fix Guide

## Issues Fixed

1. **Backend routers not properly included** - The FastAPI app wasn't including the admin, booking, and cockpit routers
2. **Login component not wired up** - The frontend login route had a placeholder instead of the actual login component
3. **Authentication flow broken** - Login wasn't properly storing tokens and checking authentication state
4. **Server.py not importing from main.py** - The deployment entry point wasn't using the configured app

## Changes Made

### Backend Changes

#### 1. `/workspace/backend/main.py` - Complete Rewrite
- Added CORS middleware for cross-origin requests
- Imported and included all routers:
  - `admin_router` (from `admin_routes.py`)
  - `booking_router` (from `booking_routes.py`) with `/api` prefix
  - `cockpit_router` (from `cockpit_routes.py`) with `/api` prefix
  - `bookingform_router` (from `bookingform_routes.py`) with `/api` prefix
  - `agent_router` (from `agent_routes.py`)
- Added root and health check endpoints
- Updated debug beacon with new timestamp

#### 2. `/workspace/backend/server.py` - Entry Point Fix
- Changed to import the fully configured `app` from `main.py`
- Added fallback imports for different import scenarios
- Ensures the deployed app has all routers loaded

### Frontend Changes

#### 1. `/workspace/frontend/src/App.js` - Login Integration
- Imported `SafeLogin` component
- Added authentication state management in `AdminRoutes`
- Implemented `handleAuth` function to store tokens properly
- Added conditional routing based on authentication state
- Protected `/admin/bookings` and `/admin/cockpit` routes

#### 2. `/workspace/frontend/src/admin/SafeLogin.jsx` - Login Fix
- Changed from email to username (matches backend expectation)
- Updated API endpoint to `/api/admin/login` (with prefix)
- Fixed backend URL detection to check `REACT_APP_BACKEND_URL` first
- Stores token in both `HIBI_ADMIN_TOKEN` and `admin_token` for compatibility
- Added proper error handling and user feedback

### Documentation Added

- Created `.env.example` with all required backend environment variables
- Created `frontend/.env.example` with required frontend environment variables
- This guide documenting all changes

## Required Environment Variables

### Backend (Set in Render Dashboard)
```
# Prefer MONGO_URI (full MongoDB connection string). MONGO_URL is still supported.
MONGO_URI=mongodb+srv://...
DB_NAME=hibiscus_airport
ADMIN_EMAIL=bookings@bookaride.co.nz
FRONTEND_URL=https://hibiscustoairport.co.nz
PUBLIC_DOMAIN=https://hibiscustoairport.co.nz
```

Optional but recommended:
```
STRIPE_SECRET_KEY=sk_...
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+...
GOOGLE_MAPS_API_KEY=AIza...
GOOGLE_CLIENT_ID=....apps.googleusercontent.com
ADMIN_API_KEY=your-secure-key
```

### Frontend (Set in Vercel Dashboard)
```
REACT_APP_BACKEND_URL=https://api.hibiscustoairport.co.nz
```

Optional:
```
REACT_APP_ADMIN_OWNER_CODE=your-emergency-code
```

## Default Admin Credentials

The backend has a built-in default admin account that's created on first login attempt:
- **Username**: `admin`
- **Password**: `Kongkong2025!@`

This is defined in `/workspace/backend/booking_routes.py` lines 666-675.

## Testing the Fix

### 1. Test Backend API
```bash
# Check if backend is online
curl https://api.hibiscustoairport.co.nz/health

# Check debug stamp
curl https://api.hibiscustoairport.co.nz/debug/stamp

# Test login endpoint
curl -X POST https://api.hibiscustoairport.co.nz/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "Kongkong2025!@"}'
```

### 2. Test Frontend Access
1. Navigate to `https://hibiscustoairport.co.nz/admin/login`
2. Enter username: `admin`
3. Enter password: `Kongkong2025!@`
4. Should redirect to `/admin/bookings` and display the dashboard

### 3. Verify Bookings Display
Once logged in, the bookings page should:
- Fetch bookings from `/api/bookings`
- Display them in a table with filters
- Allow creating, editing, and deleting bookings
- Show statistics (total, pending, confirmed, revenue)

## Deployment Notes

### Render Backend
- The backend is configured in `Dockerfile` and `render.yaml`
- Entry point: `backend.server:app`
- Health check: `/debug/stamp`
- Automatic deploys on push to main branch

### Vercel Frontend
- Frontend is React app in `/frontend` directory
- Build command: `cd frontend && npm run build`
- Environment variables must be set in Vercel dashboard

## Troubleshooting

### Issue: Login returns 401
- Check that `MONGO_URI` (or legacy `MONGO_URL`) and `DB_NAME` are set in Render
- Verify the database is accessible from Render
- Check Render logs for connection errors

### Issue: Bookings not loading
- Verify `REACT_APP_BACKEND_URL` is set correctly in Vercel
- Check browser console for CORS errors
- Verify the `/api/bookings` endpoint is accessible
- Check that you're properly authenticated (token in localStorage)

### Issue: Admin routes return 404
- Verify the deployment includes the latest code
- Check that `backend/server.py` is importing from `backend/main.py`
- Review Render logs for import errors

### Issue: CORS errors
- Verify CORS middleware is enabled in `backend/main.py`
- Check that `allow_origins` includes the frontend domain
- May need to update to specific domain instead of `*` for production

## Security Recommendations

1. **Change default admin password** - Use the change password feature after first login
2. **Use strong ADMIN_API_KEY** - If using the backend admin routes directly
3. **Enable HTTPS only** - Ensure both frontend and backend use HTTPS in production
4. **Set specific CORS origins** - Replace `allow_origins=["*"]` with specific domains
5. **Rotate credentials regularly** - Update MongoDB, Stripe, and Twilio credentials periodically

## Next Steps

After confirming login and bookings work:
1. Change the default admin password
2. Test all admin functions (create, edit, delete bookings)
3. Verify email and SMS notifications work
4. Test payment link generation
5. Check Google Calendar integration (if enabled)

## Git Branch

All changes are on branch: `cursor/admin-login-and-bookings-be90`

To merge into main:
```bash
git checkout main
git merge cursor/admin-login-and-bookings-be90
git push origin main
```
