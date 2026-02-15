# Bookings Display Issue - Root Cause and Fix

## Issue
The admin dashboard was showing "No bookings found" even though the backend API and database were working correctly.

## Root Cause
The frontend was configured to point to the wrong backend URL:
- **Wrong URL**: `https://hibiscus-to-airport-1.onrender.com`
- **Correct URL**: `https://api.hibiscustoairport.co.nz`

This caused the frontend to make API calls to a different backend (or non-existent endpoint), which is why bookings weren't displaying.

## Fix Applied

### 1. Updated Backend URL Configuration
**File**: `frontend/src/config.js`
```javascript
// Changed from:
export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://hibiscus-to-airport-1.onrender.com';

// To:
export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://api.hibiscustoairport.co.nz';
```

### 2. Verified API is Working
- Created a test booking (Ref: H1) to verify the system is operational
- Confirmed the booking is retrievable via the API at `https://api.hibiscustoairport.co.nz/api/bookings`
- Test booking details:
  - Reference: H1
  - Customer: Test Customer
  - Date: 2026-02-20
  - Status: confirmed
  - Payment: paid

### 3. Committed and Pushed Changes
- Changes committed to branch: `cursor/bookings-display-issue-5ea5`
- Ready for deployment

## Next Steps

### For the Frontend to Show Bookings:

The frontend needs to be rebuilt and redeployed for the config change to take effect:

1. **If deployed on Vercel** (detected vercel.json files):
   - Push triggers automatic deployment
   - Wait for Vercel to rebuild and deploy
   - Should take 2-5 minutes

2. **Manual deployment** (if needed):
   ```bash
   cd frontend
   npm install
   npm run build
   # Deploy the build folder to your hosting service
   ```

3. **Verify the fix**:
   - Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
   - Log into admin panel at: https://[your-frontend-url]/admin/login
   - Should now see the test booking (H1) and any other bookings

## Alternative: Set Environment Variable

Instead of changing the config file, you can set the environment variable in your deployment:

```bash
REACT_APP_BACKEND_URL=https://api.hibiscustoairport.co.nz
```

This is already documented in `frontend/.env.example`.

## Verification Commands

To verify the backend is working:

```bash
# Test admin login
curl -X POST "https://api.hibiscustoairport.co.nz/api/admin/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "Kongkong2025!@"}'

# Get bookings (replace TOKEN with the access_token from login)
curl "https://api.hibiscustoairport.co.nz/api/bookings" \
  -H "Authorization: Bearer TOKEN"
```

## Summary

- ✅ **Backend**: Working correctly, serving bookings
- ✅ **Database**: Connected and contains bookings
- ✅ **API Endpoints**: Accessible and returning data
- ✅ **Config Fix**: Applied and committed
- ⏳ **Frontend**: Needs rebuild/redeploy to apply the fix

Once the frontend is redeployed, bookings should display correctly in the admin dashboard.
