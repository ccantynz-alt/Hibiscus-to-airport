# Hibiscus to Airport - Product Requirements Document

## Project Overview
An elegant, professional airport shuttle and private transfer service website cloning `bookaride.co.nz` with comprehensive booking, admin management, and automated notification systems.

## Core Features Implemented

### 1. Public Website
- Landing page with professional design
- Multi-step booking form with real-time pricing
- Google Maps integration for address autocomplete and distance calculation
- Multiple local SEO pages (12 suburb-specific landing pages)
- AI-powered chatbot for customer inquiries

### 2. Admin Dashboard
- Secure login with password and Google OAuth
- Booking management with compact, professional table layout
- "Return Trips Pending" section for easy tracking
- Driver assignment with SMS/Email notifications
- Promo code management
- Analytics overview
- **Cancel Booking** - Sends SMS & Email to customer confirming cancellation (Added: Jan 5, 2026)

### 3. Driver System
- Driver management portal
- Job accept/decline flow with SMS notifications
- GPS tracking for real-time customer updates
- Driver arrivals page

### 4. Notifications
- Email confirmations (customer & admin)
- SMS notifications via Twilio
- Automated reminder system
- **Cancellation notifications** - SMS and Email sent when booking cancelled (Added: Jan 5, 2026)

### 5. Payment Integration
- Stripe Checkout integration
- Payment link generation for admin
- Afterpay (pending implementation)

## Technical Stack
- **Frontend:** React, TailwindCSS, shadcn/ui
- **Backend:** FastAPI (Python)
- **Database:** MongoDB
- **Integrations:** Stripe, Twilio, Google Maps API, Google Calendar API, AviationStack

## Recent Updates

### January 5, 2026 (Latest)
- **Complete Admin Panel Redesign:** Premium white and gold theme with:
  - Collapsible sidebar navigation
  - Modern card-based stats dashboard
  - Quick alerts for Today/Tomorrow bookings and Return Trips
  - Clean, professional table design
  - Refined modals with gold accents
  - All original functionality preserved (calendar sync, notifications, cancel booking)
  
- **Cancel Booking Feature:** Added Cancel button to admin panel (in booking table and modal). When clicked, sends cancellation SMS and email to customer, then soft-deletes booking to deleted_bookings collection (can be restored).

## Pending Tasks

### P0 - Critical
- **Google Calendar Authorization:** User needs to complete one-time OAuth authorization for calendar sync to work

### P1 - High Priority
- Create remaining Local SEO Pages
- Activate WhatsApp AI Bot (backend ready, needs Twilio webhook connection)

### P2 - Medium Priority
- Implement Afterpay Integration
- Build enhanced Driver Portal

### P3 - Future
- Admin "Applications" Tab
- Switch to Mailgun for email delivery
- Code refactoring (AdminDashboard.jsx, booking_routes.py)
- Driver auto-dispatch based on availability/location

## Key Credentials
- Admin URL: `/admin/login`
- Username: `admin`
- Password: `Kongkong2025!@`

## API Endpoints Reference

### Booking Management
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - List all bookings
- `DELETE /api/bookings/{id}` - Cancel booking (sends notifications)
- `GET /api/bookings/deleted/list` - List deleted bookings
- `POST /api/bookings/restore/{id}` - Restore deleted booking

### Admin Actions
- `POST /api/bookings/{id}/send-payment-link` - Send Stripe payment link
- `POST /api/bookings/{id}/assign-driver` - Assign driver to booking
- `POST /api/bookings/sync-all-to-calendar` - Manual calendar sync
