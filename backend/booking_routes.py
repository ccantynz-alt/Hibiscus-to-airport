from fastapi.responses import JSONResponse
from fastapi import APIRouter, HTTPException, Depends, Response, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone, timedelta
import uuid
import os
import secrets
import httpx
import csv
import io
from dotenv import load_dotenv
from pathlib import Path
from auth import get_current_user, verify_password, create_access_token, get_password_hash

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')
from utils import (
    calculate_distance,
    calculate_price,
    send_customer_confirmation,
    send_admin_notification,
    send_admin_sms_notification,
    send_customer_sms,
    generate_booking_reference,
    send_cancellation_email,
    send_cancellation_sms,
    send_password_reset_email,
    sync_contact_to_icloud,
    is_urgent_booking,
    send_urgent_admin_email,
    send_urgent_admin_sms,
    format_date_nz
)
import stripe
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# Neon PostgreSQL connection pool
from db import get_pool
import json


# ---------- row ↔ camelCase helpers ----------

def row_to_booking(row):
    """Convert asyncpg Record to camelCase dict for API response."""
    if row is None:
        return None
    d = dict(row)
    return {
        "id": d.get("id"),
        "booking_ref": d.get("booking_ref"),
        "name": d.get("name"),
        "email": d.get("email"),
        "phone": d.get("phone"),
        "pickupAddress": d.get("pickup_address", ""),
        "dropoffAddress": d.get("dropoff_address", ""),
        "date": d.get("date", ""),
        "time": d.get("time", ""),
        "passengers": d.get("passengers", "1"),
        "notes": d.get("notes", ""),
        "serviceType": d.get("service_type", ""),
        "departureFlightNumber": d.get("departure_flight_number", ""),
        "departureTime": d.get("departure_time", ""),
        "arrivalFlightNumber": d.get("arrival_flight_number", ""),
        "arrivalTime": d.get("arrival_time", ""),
        "vipPickup": d.get("vip_pickup", False),
        "oversizedLuggage": d.get("oversized_luggage", False),
        "returnTrip": d.get("return_trip", False),
        "pricing": d.get("pricing"),
        "totalPrice": float(d["total_price"]) if d.get("total_price") is not None else 0,
        "status": d.get("status", "pending"),
        "payment_status": d.get("payment_status", "unpaid"),
        "payment_method": d.get("payment_method"),
        "lastEmailSent": d.get("last_email_sent"),
        "lastSmsSent": d.get("last_sms_sent"),
        "paymentLinkSent": d.get("payment_link_sent"),
        "trackingId": d.get("tracking_id"),
        "trackingStatus": d.get("tracking_status"),
        "assignedDriverId": d.get("assigned_driver_id"),
        "assignedDriverName": d.get("assigned_driver_name"),
        "driverPayout": float(d["driver_payout"]) if d.get("driver_payout") is not None else None,
        "driverNotes": d.get("driver_notes"),
        "acceptanceToken": d.get("acceptance_token"),
        "driverAccepted": d.get("driver_accepted"),
        "driverAcceptedAt": d.get("driver_accepted_at"),
        "driverDeclinedAt": d.get("driver_declined_at"),
        "driverDeclineReason": d.get("driver_decline_reason"),
        "driverAssignedAt": d.get("driver_assigned_at"),
        "driverLocation": d.get("driver_location"),
        "driverEtaMinutes": d.get("driver_eta_minutes"),
        "autoDispatched": d.get("auto_dispatched", False),
        "reminderSent": d.get("reminder_sent", False),
        "reminderSentAt": d.get("reminder_sent_at"),
        "returnDriverId": d.get("return_driver_id"),
        "returnDriverName": d.get("return_driver_name"),
        "returnDriverPayout": float(d["return_driver_payout"]) if d.get("return_driver_payout") is not None else None,
        "returnDriverNotes": d.get("return_driver_notes"),
        "returnAcceptanceToken": d.get("return_acceptance_token"),
        "returnDriverAccepted": d.get("return_driver_accepted"),
        "returnTrackingStatus": d.get("return_tracking_status"),
        "returnDriverAssignedAt": d.get("return_driver_assigned_at"),
        "googleCalendarEventId": d.get("google_calendar_event_id"),
        "additionalPickups": d.get("additional_pickups", []),
        "createdAt": d.get("created_at"),
        "updatedAt": d.get("updated_at"),
    }

def row_to_driver(row):
    if row is None:
        return None
    d = dict(row)
    return {
        "id": d["id"],
        "name": d["name"],
        "phone": d.get("phone"),
        "email": d.get("email"),
        "vehicle": d.get("vehicle"),
        "license": d.get("license"),
        "status": d.get("status", "active"),
        "active": d.get("active", True),
        "createdAt": d.get("created_at"),
        "updatedAt": d.get("updated_at"),
    }

def row_to_promo(row):
    if row is None:
        return None
    d = dict(row)
    return {
        "id": d["id"],
        "code": d["code"],
        "discount_type": d.get("discount_type", "percentage"),
        "discount_value": float(d["discount_value"]) if d.get("discount_value") is not None else 0,
        "min_booking_amount": float(d["min_booking_amount"]) if d.get("min_booking_amount") is not None else 0,
        "max_uses": d.get("max_uses"),
        "uses_count": d.get("uses_count", 0),
        "expiry_date": d.get("expiry_date"),
        "active": d.get("active", True),
        "description": d.get("description"),
        "created_at": d.get("created_at"),
    }

def row_to_seo(row):
    if row is None:
        return None
    d = dict(row)
    return {
        "page_slug": d["page_slug"],
        "page_title": d.get("page_title"),
        "meta_description": d.get("meta_description"),
        "meta_keywords": d.get("meta_keywords"),
        "hero_heading": d.get("hero_heading"),
        "hero_subheading": d.get("hero_subheading"),
        "cta_text": d.get("cta_text"),
        "createdAt": d.get("created_at"),
        "updatedAt": d.get("updated_at"),
    }

async def _pg_update(table, fields_dict, where_col, where_val):
    """Helper: build and execute a dynamic UPDATE."""
    pool = await get_pool()
    if not fields_dict:
        return
    parts, vals = [], []
    idx = 1
    for col, val in fields_dict.items():
        parts.append(f"{col} = ${idx}")
        vals.append(val)
        idx += 1
    vals.append(where_val)
    sql = f"UPDATE {table} SET {', '.join(parts)} WHERE {where_col} = ${idx}"
    await pool.execute(sql, *vals)


# Stripe setup
stripe.api_key = os.environ.get('STRIPE_SECRET_KEY')

# Models
class PriceCalculation(BaseModel):
    pickupAddress: str
    dropoffAddress: str
    passengers: int = 1

class BookingCreate(BaseModel):
    model_config = {"extra": "ignore"}

    name: str
    email: str
    phone: str
    pickupAddress: str
    dropoffAddress: str
    date: str
    time: str
    passengers: str
    notes: Optional[str] = ""
    pricing: dict
    totalPrice: Optional[float] = None
    status: Optional[str] = "pending"
    payment_status: Optional[str] = "unpaid"
    payment_method: Optional[str] = None
    # Flight information
    departureFlightNumber: Optional[str] = ""
    departureTime: Optional[str] = ""
    arrivalFlightNumber: Optional[str] = ""
    arrivalTime: Optional[str] = ""
    # Service options
    serviceType: Optional[str] = ""
    vipPickup: Optional[bool] = False
    oversizedLuggage: Optional[bool] = False
    returnTrip: Optional[bool] = False
    # Multi-stop
    additionalPickups: Optional[list] = []

class AdminLogin(BaseModel):
    username: str
    password: str

class PasswordChange(BaseModel):
    current_password: str
    new_password: str

class PromoCode(BaseModel):
    code: str
    discount_type: str  # 'percentage' or 'fixed'
    discount_value: float  # e.g., 10 for 10% or 10 for $10 off
    min_booking_amount: Optional[float] = 0
    max_uses: Optional[int] = None
    expiry_date: Optional[str] = None
    active: Optional[bool] = True
    description: Optional[str] = ""

class BookingUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    pickupAddress: Optional[str] = None
    dropoffAddress: Optional[str] = None
    date: Optional[str] = None
    time: Optional[str] = None
    passengers: Optional[str] = None
    notes: Optional[str] = None
    totalPrice: Optional[float] = None
    status: Optional[str] = None
    payment_status: Optional[str] = None

class DriverCreate(BaseModel):
    name: str
    phone: str
    email: str
    vehicle: Optional[str] = ""
    license: Optional[str] = ""

class DriverUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    vehicle: Optional[str] = None
    license: Optional[str] = None

class PasswordResetRequest(BaseModel):
    email: str

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str

# Public Endpoints

class SEOPageData(BaseModel):
    page_slug: str
    page_title: str
    meta_description: str
    meta_keywords: Optional[str] = ""
    hero_heading: str
    hero_subheading: str
    cta_text: Optional[str] = "Book Now"

@router.post("/calculate-price")
async def calculate_price_endpoint(data: PriceCalculation):
    try:
        distance = calculate_distance(data.pickupAddress, data.dropoffAddress)
        if distance is None:
            raise HTTPException(status_code=400, detail="Could not calculate distance")
        pricing = calculate_price(distance, data.passengers)
        return pricing
    except Exception as e:
        logger.error(f"Price calculation error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/bookings")
async def create_booking(booking: BookingCreate):
    try:
        booking_id = str(uuid.uuid4())
        booking_ref = await generate_booking_reference()
        
        # Use provided totalPrice or fallback to pricing dict
        total_price = booking.totalPrice if booking.totalPrice is not None else booking.pricing.get('totalPrice', 0)
        
        pool = await get_pool()
        created_at = datetime.utcnow().isoformat()
        await pool.execute("""
            INSERT INTO bookings (id, booking_ref, name, email, phone, pickup_address,
                dropoff_address, date, time, passengers, notes, pricing, total_price,
                status, payment_status, departure_flight_number, departure_time,
                arrival_flight_number, arrival_time, service_type, vip_pickup,
                oversized_luggage, return_trip, created_at)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24)
        """, booking_id, booking_ref, booking.name, booking.email, booking.phone,
            booking.pickupAddress, booking.dropoffAddress, booking.date, booking.time,
            booking.passengers, booking.notes, json.dumps(booking.pricing), total_price,
            booking.status, booking.payment_status, booking.departureFlightNumber,
            booking.departureTime, booking.arrivalFlightNumber, booking.arrivalTime,
            booking.serviceType, booking.vipPickup, booking.oversizedLuggage,
            booking.returnTrip, created_at)
        booking_doc = {
            "id": booking_id, "booking_ref": booking_ref, "name": booking.name,
            "email": booking.email, "phone": booking.phone,
            "pickupAddress": booking.pickupAddress, "dropoffAddress": booking.dropoffAddress,
            "date": booking.date, "time": booking.time, "passengers": booking.passengers,
            "notes": booking.notes, "pricing": booking.pricing, "totalPrice": total_price,
            "status": booking.status, "payment_status": booking.payment_status,
            "departureFlightNumber": booking.departureFlightNumber,
            "departureTime": booking.departureTime,
            "arrivalFlightNumber": booking.arrivalFlightNumber,
            "arrivalTime": booking.arrivalTime,
            "serviceType": booking.serviceType, "vipPickup": booking.vipPickup,
            "oversizedLuggage": booking.oversizedLuggage, "returnTrip": booking.returnTrip,
            "createdAt": created_at
        }
        
        # Sync contact to iCloud/iPhone
        try:
            sync_contact_to_icloud(booking_doc)
        except Exception as sync_error:
            logger.error(f"iCloud sync failed: {str(sync_error)}")
        
        # ALWAYS send admin notification for every new booking
        try:
            send_admin_notification(booking_doc)
            send_admin_sms_notification(booking_doc)  # Also send SMS to admin
            logger.info(f"Admin notification sent for new booking: {booking_ref}")
            
            # Check if this is an URGENT booking (within 24 hours)
            is_urgent, hours_until = is_urgent_booking(booking.date, booking.time)
            if is_urgent:
                logger.warning(f"URGENT BOOKING DETECTED: {booking_ref} - only {hours_until}hrs notice!")
                try:
                    send_urgent_admin_email(booking_doc, hours_until)
                    send_urgent_admin_sms(booking_doc, hours_until)
                    logger.info(f"Urgent notifications sent for booking {booking_ref}")
                except Exception as urgent_error:
                    logger.error(f"Failed to send urgent notifications: {str(urgent_error)}")
        except Exception as admin_notif_error:
            logger.error(f"Failed to send admin notification: {str(admin_notif_error)}")
        
        # If admin creates a confirmed/paid booking, also send customer notifications
        if booking.status == "confirmed" and booking.payment_status == "paid":
            try:
                send_customer_confirmation(booking_doc)
                send_customer_sms(booking_doc)
                logger.info(f"Customer notifications sent for confirmed booking: {booking_ref}")
            except Exception as notif_error:
                logger.error(f"Failed to send customer notifications: {str(notif_error)}")
        
        # ALWAYS add booking to Google Calendar (regardless of status)
        try:
            calendar_event_id = await add_booking_to_google_calendar(booking_doc)
            if calendar_event_id:
                logger.info(f"Booking {booking_ref} added to Google Calendar")
        except Exception as cal_error:
            logger.error(f"Failed to add booking to Google Calendar: {str(cal_error)}")
        
        logger.info(f"Booking created: {booking_ref} ({booking_id})")
        return {
            "message": "Booking created successfully",
            "booking_id": booking_id,
            "booking_ref": booking_ref,
            "status": booking.status
        }
    except Exception as e:
        logger.error(f"Booking creation error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================
# RESEND NOTIFICATIONS & DUPLICATE BOOKING
# ============================================

# Safety cooldown period (in minutes) to prevent duplicate notifications
NOTIFICATION_COOLDOWN_MINUTES = 5

def check_notification_cooldown(last_sent: str, cooldown_minutes: int = NOTIFICATION_COOLDOWN_MINUTES) -> tuple[bool, int]:
    """
    Check if enough time has passed since last notification.
    Returns (can_send, minutes_remaining)
    """
    if not last_sent:
        return True, 0
    
    try:
        last_sent_time = datetime.fromisoformat(last_sent.replace('Z', '+00:00'))
        now = datetime.now(timezone.utc)
        elapsed = (now - last_sent_time).total_seconds() / 60
        
        if elapsed < cooldown_minutes:
            minutes_remaining = int(cooldown_minutes - elapsed) + 1
            return False, minutes_remaining
        return True, 0
    except:
        return True, 0

@router.post("/bookings/{booking_id}/resend-email")
async def resend_email_confirmation(booking_id: str, force: bool = False):
    """Resend email confirmation to customer (with cooldown protection)"""
    try:
        pool = await get_pool()
        row = await pool.fetchrow("SELECT * FROM bookings WHERE id = $1", booking_id)
        booking = row_to_booking(row)
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        
        # Check cooldown unless force=True
        if not force:
            can_send, minutes_remaining = check_notification_cooldown(booking.get('last_email_sent'))
            if not can_send:
                raise HTTPException(
                    status_code=429, 
                    detail=f"Email was recently sent. Please wait {minutes_remaining} minute(s) before sending again."
                )
        
        send_customer_confirmation(booking)
        
        # Update booking to track notification sent
        pool = await get_pool()
        await pool.execute("UPDATE bookings SET last_email_sent = $1 WHERE id = $2", datetime.now(timezone.utc).isoformat(), booking_id)
        
        logger.info(f"Email confirmation resent to {booking['email']} for booking {booking['booking_ref']}")
        return {"message": f"Email sent to {booking['email']}", "booking_ref": booking['booking_ref']}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Resend email error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/bookings/{booking_id}/resend-sms")
async def resend_sms_confirmation(booking_id: str, force: bool = False):
    """Resend SMS confirmation to customer (with cooldown protection)"""
    try:
        pool = await get_pool()
        row = await pool.fetchrow("SELECT * FROM bookings WHERE id = $1", booking_id)
        booking = row_to_booking(row)
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        
        # Check cooldown unless force=True
        if not force:
            can_send, minutes_remaining = check_notification_cooldown(booking.get('last_sms_sent'))
            if not can_send:
                raise HTTPException(
                    status_code=429, 
                    detail=f"SMS was recently sent. Please wait {minutes_remaining} minute(s) before sending again."
                )
        
        send_customer_sms(booking)
        
        # Update booking to track notification sent
        pool = await get_pool()
        await pool.execute("UPDATE bookings SET last_sms_sent = $1 WHERE id = $2", datetime.now(timezone.utc).isoformat(), booking_id)
        
        logger.info(f"SMS confirmation resent to {booking['phone']} for booking {booking['booking_ref']}")
        return {"message": f"SMS sent to {booking['phone']}", "booking_ref": booking['booking_ref']}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Resend SMS error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/bookings/{booking_id}/resend-all")
async def resend_all_confirmations(booking_id: str, force: bool = False):
    """Resend both email and SMS confirmation to customer (with cooldown protection)"""
    try:
        pool = await get_pool()
        row = await pool.fetchrow("SELECT * FROM bookings WHERE id = $1", booking_id)
        booking = row_to_booking(row)
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        
        # Check cooldowns unless force=True
        if not force:
            email_can_send, email_wait = check_notification_cooldown(booking.get('last_email_sent'))
            sms_can_send, sms_wait = check_notification_cooldown(booking.get('last_sms_sent'))
            
            if not email_can_send and not sms_can_send:
                raise HTTPException(
                    status_code=429, 
                    detail=f"Both notifications were recently sent. Please wait {max(email_wait, sms_wait)} minute(s)."
                )
        
        messages_sent = []
        
        # Send email if allowed
        if force or check_notification_cooldown(booking.get('last_email_sent'))[0]:
            send_customer_confirmation(booking)
            messages_sent.append("email")
        
        # Send SMS if allowed
        if force or check_notification_cooldown(booking.get('last_sms_sent'))[0]:
            send_customer_sms(booking)
            messages_sent.append("SMS")
        
        # Update booking
        update_fields = {}
        if "email" in messages_sent:
            update_fields["last_email_sent"] = datetime.now(timezone.utc).isoformat()
        if "SMS" in messages_sent:
            update_fields["last_sms_sent"] = datetime.now(timezone.utc).isoformat()
        
        if update_fields:
            # Map camelCase keys to snake_case for DB columns
            _camel_map = {"pickupAddress":"pickup_address","dropoffAddress":"dropoff_address","totalPrice":"total_price","updatedAt":"updated_at","createdAt":"created_at","serviceType":"service_type","departureFlightNumber":"departure_flight_number","departureTime":"departure_time","arrivalFlightNumber":"arrival_flight_number","arrivalTime":"arrival_time","vipPickup":"vip_pickup","oversizedLuggage":"oversized_luggage","returnTrip":"return_trip"}
            _mapped = {_camel_map.get(k, k): v for k, v in update_fields.items()}
            await _pg_update("bookings", _mapped, "id", booking_id)
        
        logger.info(f"Confirmations resent for booking {booking['booking_ref']}: {', '.join(messages_sent)}")
        return {
            "message": f"Sent: {', '.join(messages_sent)} to {booking['name']}", 
            "booking_ref": booking['booking_ref'],
            "notifications_sent": messages_sent
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Resend all error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/bookings/{booking_id}/duplicate")
async def duplicate_booking(booking_id: str):
    """Create a duplicate of an existing booking"""
    try:
        pool = await get_pool()
        row = await pool.fetchrow("SELECT * FROM bookings WHERE id = $1", booking_id)
        original = row_to_booking(row)
        if not original:
            raise HTTPException(status_code=404, detail="Booking not found")
        
        # Generate new booking ref
        pool = await get_pool()
        last_row = await pool.fetchrow("SELECT booking_ref FROM bookings WHERE booking_ref LIKE 'H%' ORDER BY booking_ref DESC LIMIT 1")
        if last_row and last_row['booking_ref']:
            last_num = int(last_row['booking_ref'].replace('H', ''))
            new_ref = f"H{last_num + 1}"
        else:
            new_ref = "H1"
        
        # Create new booking
        new_id = str(uuid.uuid4())
        new_booking = {
            **original,
            "id": new_id,
            "booking_ref": new_ref,
            "status": "pending",
            "payment_status": "unpaid",
            "createdAt": datetime.now(timezone.utc).isoformat(),
            "notes": f"Duplicated from {original['booking_ref']}. {original.get('notes', '')}"
        }
        
        # Remove tracking fields from duplicate
        new_booking.pop('last_email_sent', None)
        new_booking.pop('last_sms_sent', None)
        new_booking.pop('tracking_id', None)
        new_booking.pop('tracking_status', None)
        
        pool = await get_pool()
        await pool.execute("""
            INSERT INTO bookings (id, booking_ref, name, email, phone, pickup_address,
                dropoff_address, date, time, passengers, notes, pricing, total_price,
                status, payment_status, service_type, created_at)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb,$13,$14,$15,$16,$17)
        """, new_booking.get("id"), new_booking.get("booking_ref"), new_booking.get("name"), new_booking.get("email"),
            new_booking.get("phone"), new_booking.get("pickupAddress", new_booking.get("pickup_address")),
            new_booking.get("dropoffAddress", new_booking.get("dropoff_address")),
            new_booking.get("date"), new_booking.get("time"), str(new_booking.get("passengers", "1")),
            new_booking.get("notes"), json.dumps(new_booking.get("pricing")) if new_booking.get("pricing") else None,
            float(new_booking.get("totalPrice", new_booking.get("total_price", 0)) or 0),
            new_booking.get("status", "pending"), new_booking.get("payment_status", "unpaid"),
            new_booking.get("serviceType", new_booking.get("service_type")),
            new_booking.get("createdAt", new_booking.get("created_at", datetime.utcnow().isoformat())))
        
        logger.info(f"Booking duplicated: {original['booking_ref']} -> {new_ref}")
        return {
            "message": f"Booking duplicated successfully",
            "original_ref": original['booking_ref'],
            "new_ref": new_ref,
            "new_id": new_id
        }
    except Exception as e:
        logger.error(f"Duplicate booking error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/payment/create-checkout")
async def create_checkout_session(booking_data: dict):
    try:
        booking_id = booking_data.get('booking_id')
        pool = await get_pool()
        row = await pool.fetchrow("SELECT * FROM bookings WHERE id = $1", booking_id)
        booking = row_to_booking(row)
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        
        frontend_url = os.environ.get('FRONTEND_URL', os.environ.get('REACT_APP_BACKEND_URL', 'https://hibiscustoairport.co.nz')).replace('/api', '')
        success_url = f"{frontend_url}/payment/success?session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = f"{frontend_url}/payment/cancel"
        
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'nzd',
                    'product_data': {
                        'name': 'Airport Shuttle Service',
                        'description': f"From {booking['pickupAddress']} to {booking['dropoffAddress']}"
                    },
                    'unit_amount': int(booking['totalPrice'] * 100),
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={'booking_id': booking_id}
        )
        return {"session_id": session.id, "url": session.url}
    except Exception as e:
        logger.error(f"Checkout error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/bookings/{booking_id}/send-payment-link")
async def send_payment_link(booking_id: str):
    """Generate and send a payment link to the customer via email and SMS"""
    try:
        pool = await get_pool()
        row = await pool.fetchrow("SELECT * FROM bookings WHERE id = $1", booking_id)
        booking = row_to_booking(row)
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        
        if booking.get('payment_status') == 'paid':
            raise HTTPException(status_code=400, detail="This booking is already paid")
        
        # Create Stripe checkout session
        frontend_url = os.environ.get('FRONTEND_URL', os.environ.get('REACT_APP_BACKEND_URL', 'https://hibiscustoairport.co.nz')).replace('/api', '')
        success_url = f"{frontend_url}/payment/success?session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = f"{frontend_url}/payment/cancel"
        
        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'nzd',
                    'product_data': {
                        'name': 'Hibiscus to Airport - Shuttle Service',
                        'description': f"Booking {booking.get('booking_ref', booking_id)} - {booking['pickupAddress'][:30]} to {booking['dropoffAddress'][:30]}"
                    },
                    'unit_amount': int(booking['totalPrice'] * 100),
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={'booking_id': booking_id},
            expires_at=int((datetime.now(timezone.utc) + timedelta(hours=24)).timestamp())
        )
        
        payment_url = session.url
        
        # Send Email with payment link
        email_sent = False
        try:
            email_subject = f"Payment Link - Booking {booking.get('booking_ref', 'N/A')}"
            email_body = f"""
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
              <div style="background: #1a1a1a; padding: 25px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="margin: 0; font-size: 24px; color: #d4af37;">Hibiscus to Airport</h1>
                <p style="margin: 10px 0 0; color: #fff;">Payment Request</p>
              </div>
              
              <div style="background: #f9f9f9; padding: 25px; border: 1px solid #ddd; border-top: none;">
                <p style="font-size: 16px; color: #333;">Hi {booking['name']},</p>
                
                <p>Please complete your payment for your upcoming airport transfer:</p>
                
                <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #eee;">
                  <p style="margin: 5px 0;"><strong>Booking Reference:</strong> {booking.get('booking_ref', 'N/A')}</p>
                  <p style="margin: 5px 0;"><strong>Date:</strong> {format_date_nz(booking['date'])} at {booking['time']}</p>
                  <p style="margin: 5px 0;"><strong>From:</strong> {booking['pickupAddress']}</p>
                  <p style="margin: 5px 0;"><strong>To:</strong> {booking['dropoffAddress']}</p>
                  <p style="margin: 15px 0 5px; font-size: 20px;"><strong>Amount Due: ${booking['totalPrice']:.2f} NZD</strong></p>
                </div>
                
                <div style="text-align: center; margin: 25px 0;">
                  <a href="{payment_url}" style="background: #d4af37; color: #000; padding: 15px 40px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
                    Pay Now - ${booking['totalPrice']:.2f}
                  </a>
                </div>
                
                <p style="font-size: 12px; color: #666; text-align: center;">This payment link expires in 24 hours.</p>
              </div>
              
              <div style="text-align: center; padding: 20px; color: #666; font-size: 12px;">
                <p>Questions? Call us at 021 743 321</p>
              </div>
            </div>
            """
            from utils import send_email
            send_email(booking['email'], email_subject, email_body)
            email_sent = True
        except Exception as e:
            logger.error(f"Failed to send payment email: {str(e)}")
        
        # Send SMS with payment link
        sms_sent = False
        try:
            from utils import send_sms
            sms_message = f"""Hibiscus to Airport - Payment Request

Booking: {booking.get('booking_ref', 'N/A')}
Amount: ${booking['totalPrice']:.2f} NZD

Pay securely here:
{payment_url}

Link expires in 24hrs.
Questions? 021 743 321"""
            send_sms(booking['phone'], sms_message)
            sms_sent = True
        except Exception as e:
            logger.error(f"Failed to send payment SMS: {str(e)}")
        
        # Update booking with payment link sent timestamp
        pool = await get_pool()
        await pool.execute("UPDATE bookings SET payment_link_sent = $1 WHERE id = $2", datetime.now(timezone.utc).isoformat(), booking_id)
        
        return {
            "success": True,
            "payment_url": payment_url,
            "email_sent": email_sent,
            "sms_sent": sms_sent,
            "message": f"Payment link sent! Email: {'Yes' if email_sent else 'No'}, SMS: {'Yes' if sms_sent else 'No'}"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Send payment link error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/payment/status/{booking_id}")
async def check_payment_status(booking_id: str):
    try:
        pool = await get_pool()
        row = await pool.fetchrow("SELECT * FROM bookings WHERE id = $1", booking_id)
        booking = row_to_booking(row)
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        return {
            "status": booking.get('payment_status', 'unpaid'),
            "booking": {
                "id": booking['id'],
                "status": booking['status'],
                "name": booking['name']
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    try:
        payload = await request.body()
        sig_header = request.headers.get("stripe-signature", "")
        webhook_secret = os.environ.get("STRIPE_WEBHOOK_SECRET", "")

        if not webhook_secret:
            logger.error("STRIPE_WEBHOOK_SECRET not set — rejecting webhook for security")
            raise HTTPException(status_code=500, detail="Webhook secret not configured")

        try:
            event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
        except stripe.error.SignatureVerificationError:
            logger.warning("Stripe webhook signature verification failed")
            raise HTTPException(status_code=400, detail="Invalid signature")

        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']
            booking_id = session['metadata']['booking_id']
            pool = await get_pool()
            await pool.execute("UPDATE bookings SET status = $1, payment_status = $2 WHERE id = $3", "confirmed", "paid", booking_id)
            pool = await get_pool()
            row = await pool.fetchrow("SELECT * FROM bookings WHERE id = $1", booking_id)
            booking = row_to_booking(row)
            send_customer_confirmation(booking)
            send_customer_sms(booking)
            send_admin_notification(booking)
            send_admin_sms_notification(booking)  # SMS alert to admin
            
            # Add booking to Google Calendar
            try:
                calendar_event_id = await add_booking_to_google_calendar(booking)
                if calendar_event_id:
                    logger.info(f"Booking {booking_id} added to Google Calendar")
            except Exception as cal_error:
                logger.error(f"Failed to add booking to Google Calendar: {str(cal_error)}")
            
            logger.info(f"Payment confirmed: {booking_id}")
        return {"status": "success"}
    except Exception as e:
        logger.error(f"Webhook error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Admin Endpoints
@router.post("/admin/login")
async def admin_login(credentials: AdminLogin):
    try:
        pool = await get_pool()
        row = await pool.fetchrow("SELECT * FROM admins WHERE username = $1", credentials.username)
        admin = dict(row) if row else None
        if not admin:
            # Check for initial admin setup via ADMIN_INIT_PASSWORD env var (first-time only)
            init_password = os.environ.get("ADMIN_INIT_PASSWORD", "")
            if init_password and credentials.username == "admin" and credentials.password == init_password:
                hashed_password = get_password_hash(credentials.password)
                admin_doc = {
                    "id": str(uuid.uuid4()),
                    "username": "admin",
                    "password": hashed_password,
                    "createdAt": datetime.now(timezone.utc).isoformat()
                }
                pool = await get_pool()
                await pool.execute(
                    "INSERT INTO admins (id, username, password, created_at) VALUES ($1, $2, $3, $4)",
                    admin_doc["id"], admin_doc["username"], admin_doc["password"], admin_doc.get("createdAt", datetime.utcnow().isoformat()))
                admin = admin_doc
                logger.info("Initial admin account created — remove ADMIN_INIT_PASSWORD from env vars now")
            else:
                raise HTTPException(status_code=401, detail="Invalid credentials")
        
        if not verify_password(credentials.password, admin['password']):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        access_token = create_access_token(data={"sub": admin['username']})
        return {"access_token": access_token, "token_type": "bearer"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/admin/change-password", dependencies=[Depends(get_current_user)])
async def change_password(password_data: PasswordChange, current_user: dict = Depends(get_current_user)):
    try:
        username = current_user.get("sub")
        pool = await get_pool()
        row = await pool.fetchrow("SELECT * FROM admins WHERE username = $1", username)
        admin = dict(row) if row else None
        
        if not admin:
            raise HTTPException(status_code=404, detail="Admin user not found")
        
        # Verify current password
        if not verify_password(password_data.current_password, admin['password']):
            raise HTTPException(status_code=401, detail="Current password is incorrect")
        
        # Hash and update new password
        new_hashed_password = get_password_hash(password_data.new_password)
        pool = await get_pool()
        await pool.execute("UPDATE admins SET password = $1, updated_at = $2 WHERE username = $3", new_hashed_password, datetime.utcnow().isoformat(), username)
        
        logger.info(f"Password changed successfully for admin: {username}")
        return {"message": "Password changed successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Password change error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# PASSWORD RESET ENDPOINTS
# ============================================

@router.post("/admin/forgot-password")
async def forgot_password(request: PasswordResetRequest):
    """Send password reset email to admin"""
    try:
        # Check if email matches admin account
        pool = await get_pool()
        row = await pool.fetchrow("SELECT * FROM admins WHERE email = $1", request.email)
        admin = dict(row) if row else None
        
        # For security, always return success even if email not found
        if not admin:
            logger.warning(f"Password reset requested for unknown email: {request.email}")
            return {"message": "If this email exists, a reset link has been sent"}
        
        # Generate reset token
        reset_token = secrets.token_urlsafe(32)
        expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
        
        # Store reset token
        pool = await get_pool()
        await pool.execute("DELETE FROM password_resets WHERE email = $1", request.email)  # Remove old tokens
        pool = await get_pool()

        await pool.execute("INSERT INTO password_resets (email,token,expires_at,created_at) VALUES ($1,$2,$3,$4)",

            request.email, reset_token, expires_at.isoformat(), datetime.now(timezone.utc).isoformat())
        
        # Send email
        await send_password_reset_email(request.email, reset_token)
        
        logger.info(f"Password reset email sent to: {request.email}")
        return {"message": "If this email exists, a reset link has been sent"}
    except Exception as e:
        logger.error(f"Password reset error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process reset request")

@router.post("/admin/reset-password")
async def reset_password(request: PasswordResetConfirm):
    """Reset password using token"""
    try:
        # Find reset token
        pool = await get_pool()
        row = await pool.fetchrow("SELECT * FROM password_resets WHERE token = $1", request.token)
        reset_record = dict(row) if row else None
        
        if not reset_record:
            raise HTTPException(status_code=400, detail="Invalid or expired reset link")
        
        # Check expiry
        expires_at = datetime.fromisoformat(reset_record["expires_at"].replace('Z', '+00:00'))
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        
        if expires_at < datetime.now(timezone.utc):
            pool = await get_pool()
            await pool.execute("DELETE FROM password_resets WHERE token = $1", request.token)
            raise HTTPException(status_code=400, detail="Reset link has expired")
        
        # Update password
        new_hashed_password = get_password_hash(request.new_password)
        pool = await get_pool()
        result = await pool.execute("UPDATE admins SET password = $1, updated_at = $2 WHERE email = $3", new_hashed_password, datetime.now(timezone.utc).isoformat(), reset_record["email"])
        
        # Delete used token
        pool = await get_pool()
        await pool.execute("DELETE FROM password_resets WHERE token = $1", request.token)
        
        logger.info(f"Password reset successfully for: {reset_record['email']}")
        return {"message": "Password reset successfully. You can now login with your new password."}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Password reset confirm error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/admin/me")
async def get_admin_profile(request: Request):
    """Get current admin profile from JWT token"""
    try:
        token = request.cookies.get("admin_session")

        if not token:
            auth_header = request.headers.get("Authorization", "")
            if auth_header.startswith("Bearer "):
                token = auth_header[7:]

        if not token:
            raise HTTPException(status_code=401, detail="Not authenticated")

        from auth import decode_token
        payload = decode_token(token)
        if not payload:
            raise HTTPException(status_code=401, detail="Invalid token")

        email = payload.get("sub")
        pool = await get_pool()

        row = await pool.fetchrow("SELECT id, username, email, created_at, updated_at FROM admins WHERE email = $1 OR username = $1", email)

        admin = dict(row) if row else None
        if not admin:
            raise HTTPException(status_code=404, detail="Admin not found")
        return admin
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get admin profile error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# SEO Management Endpoints
@router.get("/seo/pages", dependencies=[Depends(get_current_user)])
async def get_all_seo_pages():
    """Get all SEO page configurations"""
    try:
        pool = await get_pool()
        rows = await pool.fetch("SELECT * FROM seo_pages")
        pages = [row_to_seo(r) for r in rows]
        return pages
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/seo/pages/{page_slug}")
async def get_seo_page(page_slug: str):
    """Get SEO configuration for a specific page (public endpoint)"""
    try:
        pool = await get_pool()
        row = await pool.fetchrow("SELECT * FROM seo_pages WHERE page_slug = $1", page_slug)
        page = row_to_seo(row)
        if not page:
            # Return defaults if not found
            return {
                "page_slug": page_slug,
                "page_title": "Hibiscus to Airport",
                "meta_description": "Professional airport shuttle service",
                "meta_keywords": "",
                "hero_heading": "Airport Shuttle Service",
                "hero_subheading": "Reliable transport to Auckland Airport",
                "cta_text": "Book Now"
            }
        return page
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/seo/pages", dependencies=[Depends(get_current_user)])
async def create_or_update_seo_page(seo_data: SEOPageData):
    """Create or update SEO configuration for a page"""
    try:
        pool = await get_pool()
        row = await pool.fetchrow("SELECT * FROM seo_pages WHERE page_slug = $1", seo_data.page_slug)
        existing = dict(row) if row else None
        page_doc = {
            "page_slug": seo_data.page_slug,
            "page_title": seo_data.page_title,
            "meta_description": seo_data.meta_description,
            "meta_keywords": seo_data.meta_keywords,
            "hero_heading": seo_data.hero_heading,
            "hero_subheading": seo_data.hero_subheading,
            "cta_text": seo_data.cta_text,
            "updatedAt": datetime.utcnow().isoformat()
        }
        
        if existing:
            # TODO-MIGRATE: seo_pages.update_one
            _camel_map = {"pickupAddress":"pickup_address","dropoffAddress":"dropoff_address","totalPrice":"total_price","updatedAt":"updated_at","createdAt":"created_at"}
            _mapped = {_camel_map.get(k, k): v for k, v in page_doc.items()}
            await _pg_update("seo_pages", _mapped, "page_slug", seo_data.page_slug)
            logger.info(f"SEO page updated: {seo_data.page_slug}")
        else:
            page_doc["createdAt"] = datetime.utcnow().isoformat()
            pool = await get_pool()
            await pool.execute(
                "INSERT INTO seo_pages (page_slug,page_title,meta_description,meta_keywords,hero_heading,hero_subheading,cta_text,created_at,updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)",
                page_doc["page_slug"], page_doc.get("page_title"), page_doc.get("meta_description"), page_doc.get("meta_keywords"),
                page_doc.get("hero_heading"), page_doc.get("hero_subheading"), page_doc.get("cta_text"),
                page_doc.get("createdAt", datetime.utcnow().isoformat()), page_doc.get("updatedAt"))
            logger.info(f"SEO page created: {seo_data.page_slug}")
        
        return {"message": "SEO page saved successfully", "page_slug": seo_data.page_slug}
    except Exception as e:
        logger.error(f"SEO page save error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/seo/pages/{page_slug}", dependencies=[Depends(get_current_user)])
async def delete_seo_page(page_slug: str):
    """Delete SEO configuration for a page"""
    try:
        pool = await get_pool()
        await pool.execute("DELETE FROM seo_pages WHERE page_slug = $1", page_slug)
        return {"message": "SEO page deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"SEO page delete error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))




@router.get("/bookings", dependencies=[Depends(get_current_user)])
async def get_all_bookings():
    try:
        pool = await get_pool()
        rows = await pool.fetch("SELECT * FROM bookings ORDER BY created_at DESC")
        bookings = [row_to_booking(r) for r in rows]
        return bookings
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/bookings/export/csv", dependencies=[Depends(get_current_user)])
async def export_bookings_csv():
    """Export all bookings as CSV file"""
    try:
        pool = await get_pool()
        rows = await pool.fetch("SELECT * FROM bookings ORDER BY created_at DESC")
        bookings = [row_to_booking(r) for r in rows]
        
        # Create CSV in memory
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write headers
        headers = [
            'Booking Ref', 'Date', 'Time', 'Customer Name', 'Email', 'Phone',
            'Pickup Address', 'Dropoff Address', 'Passengers', 'Total Price',
            'Payment Status', 'Status', 'Notes', 'Created At'
        ]
        writer.writerow(headers)
        
        # Write booking rows
        for b in bookings:
            row = [
                b.get('booking_ref', 'N/A'),
                b.get('date', ''),
                b.get('time', ''),
                b.get('name', ''),
                b.get('email', ''),
                b.get('phone', ''),
                b.get('pickupAddress', ''),
                b.get('dropoffAddress', ''),
                b.get('passengers', ''),
                f"${b.get('totalPrice', 0):.2f}" if b.get('totalPrice') else '',
                b.get('payment_status', ''),
                b.get('status', ''),
                b.get('notes', ''),
                b.get('createdAt', '')
            ]
            writer.writerow(row)
        
        # Get the CSV content
        csv_content = output.getvalue()
        output.close()
        
        # Generate filename with timestamp
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"hibiscus_bookings_{timestamp}.csv"
        
        # Return as streaming response
        return StreamingResponse(
            iter([csv_content]),
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "Cache-Control": "no-cache"
            }
        )
    except Exception as e:
        logger.error(f"CSV export error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/bookings/import/template", dependencies=[Depends(get_current_user)])
async def download_import_template():
    """Download CSV template for bulk booking import"""
    template_headers = [
        'Customer Name', 'Email', 'Phone', 'Pickup Address', 'Dropoff Address',
        'Date (YYYY-MM-DD)', 'Time (HH:MM)', 'Passengers', 'Total Price',
        'Status (confirmed/pending)', 'Payment Status (paid/unpaid)', 
        'Flight Number', 'Flight Time', 'Notes'
    ]
    
    # Sample row to show format
    sample_row = [
        'John Smith', 'john@example.com', '+6421234567', 
        '123 Main St, Orewa', 'Auckland Airport',
        '2025-12-25', '08:30', '2', '165.00',
        'confirmed', 'paid', 'NZ123', '10:30am', 'Extra luggage'
    ]
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(template_headers)
    writer.writerow(sample_row)  # Example row
    
    csv_content = output.getvalue()
    output.close()
    
    return StreamingResponse(
        iter([csv_content]),
        media_type="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=booking_import_template.csv",
            "Cache-Control": "no-cache"
        }
    )

@router.post("/bookings/import/csv", dependencies=[Depends(get_current_user)])
async def import_bookings_csv(data: dict):
    """Import bookings from CSV data"""
    try:
        csv_rows = data.get('rows', [])
        if not csv_rows:
            raise HTTPException(status_code=400, detail="No booking data provided")
        
        imported_count = 0
        errors = []
        imported_refs = []
        
        for i, row in enumerate(csv_rows):
            try:
                # Skip empty rows
                if not row.get('name') and not row.get('Customer Name'):
                    continue
                
                # Generate booking reference
                booking_id = str(uuid.uuid4())
                booking_ref = await generate_booking_reference()
                
                # Parse the row (handle both formats)
                name = row.get('Customer Name') or row.get('name', '')
                email = row.get('Email') or row.get('email', '')
                phone = row.get('Phone') or row.get('phone', '')
                pickup = row.get('Pickup Address') or row.get('pickupAddress', '')
                dropoff = row.get('Dropoff Address') or row.get('dropoffAddress', '')
                date = row.get('Date (YYYY-MM-DD)') or row.get('date', '')
                time = row.get('Time (HH:MM)') or row.get('time', '')
                passengers = row.get('Passengers') or row.get('passengers', '1')
                total_price = float(row.get('Total Price') or row.get('totalPrice', 0) or 0)
                status = row.get('Status (confirmed/pending)') or row.get('status', 'pending')
                payment_status = row.get('Payment Status (paid/unpaid)') or row.get('payment_status', 'unpaid')
                flight_number = row.get('Flight Number') or row.get('flightNumber', '')
                flight_time = row.get('Flight Time') or row.get('flightTime', '')
                notes = row.get('Notes') or row.get('notes', '')
                
                # Clean up status values
                status = 'confirmed' if 'confirm' in status.lower() else 'pending'
                payment_status = 'paid' if 'paid' in payment_status.lower() else 'unpaid'
                
                # Build flight notes if provided
                if flight_number or flight_time:
                    flight_info = f"Flight: {flight_number}" if flight_number else ""
                    if flight_time:
                        flight_info += f" at {flight_time}" if flight_info else f"Flight time: {flight_time}"
                    notes = f"{flight_info} | {notes}" if notes else flight_info
                
                booking_doc = {
                    "id": booking_id,
                    "booking_ref": booking_ref,
                    "name": name,
                    "email": email,
                    "phone": phone,
                    "pickupAddress": pickup,
                    "dropoffAddress": dropoff,
                    "date": date,
                    "time": time,
                    "passengers": str(passengers),
                    "notes": notes,
                    "pricing": {
                        "distance": 0,
                        "basePrice": total_price,
                        "airportFee": 0,
                        "passengerFee": 0,
                        "totalPrice": total_price
                    },
                    "totalPrice": total_price,
                    "status": status,
                    "payment_status": payment_status,
                    "createdAt": datetime.utcnow().isoformat()
                }
                
                pool = await get_pool()
                await pool.execute("""
                    INSERT INTO bookings (id, booking_ref, name, email, phone, pickup_address,
                        dropoff_address, date, time, passengers, notes, pricing, total_price,
                        status, payment_status, service_type, created_at)
                    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb,$13,$14,$15,$16,$17)
                """, booking_doc.get("id"), booking_doc.get("booking_ref"), booking_doc.get("name"), booking_doc.get("email"),
                    booking_doc.get("phone"), booking_doc.get("pickupAddress", booking_doc.get("pickup_address")),
                    booking_doc.get("dropoffAddress", booking_doc.get("dropoff_address")),
                    booking_doc.get("date"), booking_doc.get("time"), str(booking_doc.get("passengers", "1")),
                    booking_doc.get("notes"), json.dumps(booking_doc.get("pricing")) if booking_doc.get("pricing") else None,
                    float(booking_doc.get("totalPrice", booking_doc.get("total_price", 0)) or 0),
                    booking_doc.get("status", "pending"), booking_doc.get("payment_status", "unpaid"),
                    booking_doc.get("serviceType", booking_doc.get("service_type")),
                    booking_doc.get("createdAt", booking_doc.get("created_at", datetime.utcnow().isoformat())))
                imported_count += 1
                imported_refs.append(booking_ref)
                
            except Exception as row_error:
                errors.append(f"Row {i+1}: {str(row_error)}")
        
        return {
            "message": f"Successfully imported {imported_count} bookings",
            "imported_count": imported_count,
            "booking_refs": imported_refs,
            "errors": errors if errors else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"CSV import error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/bookings/{booking_id}", dependencies=[Depends(get_current_user)])
async def get_booking(booking_id: str):
    try:
        pool = await get_pool()
        row = await pool.fetchrow("SELECT * FROM bookings WHERE id = $1", booking_id)
        booking = row_to_booking(row)
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        return booking
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching booking: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/bookings/{booking_id}", dependencies=[Depends(get_current_user)])
async def update_booking(booking_id: str, booking_update: BookingUpdate):
    try:
        # Check if booking exists
        pool = await get_pool()
        row = await pool.fetchrow("SELECT * FROM bookings WHERE id = $1", booking_id)
        existing = row_to_booking(row)
        if not existing:
            raise HTTPException(status_code=404, detail="Booking not found")
        
        # Build update dict, excluding None values
        update_data = {k: v for k, v in booking_update.model_dump().items() if v is not None}
        update_data["updatedAt"] = datetime.utcnow().isoformat()
        
        _camel_map = {"pickupAddress":"pickup_address","dropoffAddress":"dropoff_address","totalPrice":"total_price","updatedAt":"updated_at","createdAt":"created_at"}
        _mapped = {_camel_map.get(k, k): v for k, v in update_data.items()}
        await _pg_update("bookings", _mapped, "id", booking_id)
        
        # Get updated booking
        pool = await get_pool()
        row = await pool.fetchrow("SELECT * FROM bookings WHERE id = $1", booking_id)
        updated_booking = row_to_booking(row)
        
        logger.info(f"Booking updated: {booking_id}")
        return {
            "message": "Booking updated successfully",
            "booking": updated_booking
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating booking: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/bookings/{booking_id}", dependencies=[Depends(get_current_user)])
async def update_booking_status(booking_id: str, update_data: dict):
    try:
        # Get current booking to check status change
        pool = await get_pool()
        row = await pool.fetchrow("SELECT * FROM bookings WHERE id = $1", booking_id)
        current_booking = row_to_booking(row)
        
        _camel_map = {"pickupAddress":"pickup_address","dropoffAddress":"dropoff_address","totalPrice":"total_price","updatedAt":"updated_at","createdAt":"created_at"}
        _mapped = {_camel_map.get(k, k): v for k, v in update_data.items()}
        await _pg_update("bookings", _mapped, "id", booking_id)
        
        # If status changed to confirmed, sync to Google Calendar
        if update_data.get('status') == 'confirmed' and current_booking and current_booking.get('status') != 'confirmed':
            try:
                pool = await get_pool()
                row = await pool.fetchrow("SELECT * FROM bookings WHERE id = $1", booking_id)
                updated_booking = row_to_booking(row)
                if updated_booking:
                    calendar_event_id = await add_booking_to_google_calendar(updated_booking)
                    if calendar_event_id:
                        logger.info(f"Booking {booking_id} synced to Google Calendar on confirmation")
            except Exception as cal_error:
                logger.error(f"Failed to sync booking to calendar: {str(cal_error)}")
        
        return {"message": "Booking updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/bookings/{booking_id}", dependencies=[Depends(get_current_user)])
async def delete_booking(booking_id: str):
    """Soft-delete a booking (moves to deleted_bookings collection)"""
    try:
        # Get booking details before deleting
        pool = await get_pool()
        row = await pool.fetchrow("SELECT * FROM bookings WHERE id = $1", booking_id)
        booking = row_to_booking(row)
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        
        # Send cancellation notifications
        try:
            send_cancellation_email(booking)
            send_cancellation_sms(booking)
            logger.info(f"Cancellation notifications sent for booking: {booking.get('booking_ref', booking_id)}")
        except Exception as email_error:
            logger.error(f"Failed to send cancellation notifications: {str(email_error)}")
        
        # SOFT DELETE: Move to deleted_bookings collection instead of hard delete
        booking["deletedAt"] = datetime.utcnow().isoformat()
        booking["deletedBy"] = "admin"
        pool = await get_pool()
        await pool.execute(
            """INSERT INTO deleted_bookings (id, booking_ref, name, email, phone, pickup_address,
                dropoff_address, date, time, passengers, notes, service_type, pricing, total_price,
                status, payment_status, tracking_id, assigned_driver_name, created_at, deleted_at,
                deleted_by, booking_data)
               VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13::jsonb,$14,$15,$16,$17,$18,$19,$20,$21,$22::jsonb)""",
            booking.get("id"), booking.get("booking_ref"), booking.get("name"), booking.get("email"), booking.get("phone"),
            booking.get("pickupAddress", booking.get("pickup_address")),
            booking.get("dropoffAddress", booking.get("dropoff_address")),
            booking.get("date"), booking.get("time"), booking.get("passengers"), booking.get("notes"),
            booking.get("serviceType", booking.get("service_type")),
            json.dumps(booking.get("pricing")) if booking.get("pricing") else None,
            float(booking.get("totalPrice", booking.get("total_price", 0)) or 0),
            booking.get("status"), booking.get("payment_status"),
            booking.get("trackingId", booking.get("tracking_id")),
            booking.get("assignedDriverName", booking.get("assigned_driver_name")),
            booking.get("createdAt", booking.get("created_at")),
            booking.get("deletedAt", datetime.utcnow().isoformat()),
            booking.get("deletedBy", "admin"), json.dumps(booking))
        
        # Remove from active bookings
        pool = await get_pool()
        await pool.execute("DELETE FROM bookings WHERE id = $1", booking_id)
        
        return {
            "message": "Booking cancelled and moved to deleted (can be restored)",
            "booking_ref": booking.get('booking_ref', 'N/A')
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Booking deletion error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/bookings/deleted/list", dependencies=[Depends(get_current_user)])
async def get_deleted_bookings():
    """List all soft-deleted bookings"""
    try:
        pool = await get_pool()
        rows = await pool.fetch("SELECT * FROM deleted_bookings ORDER BY deleted_at DESC")
        deleted = [dict(r) for r in rows]
        return deleted
    except Exception as e:
        logger.error(f"Error fetching deleted bookings: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/bookings/restore/{booking_id}", dependencies=[Depends(get_current_user)])
async def restore_booking(booking_id: str):
    """Restore a soft-deleted booking"""
    try:
        # Find in deleted_bookings
        pool = await get_pool()
        row = await pool.fetchrow("SELECT * FROM deleted_bookings WHERE id = $1", booking_id)
        booking = dict(row) if row else None
        if not booking:
            raise HTTPException(status_code=404, detail="Deleted booking not found")
        
        # Remove deletion metadata
        booking.pop("deletedAt", None)
        booking.pop("deletedBy", None)
        booking["restoredAt"] = datetime.utcnow().isoformat()
        booking["status"] = "pending"  # Reset status to pending after restore
        
        # Move back to active bookings
        pool = await get_pool()
        await pool.execute("""
            INSERT INTO bookings (id, booking_ref, name, email, phone, pickup_address,
                dropoff_address, date, time, passengers, notes, pricing, total_price,
                status, payment_status, service_type, created_at)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb,$13,$14,$15,$16,$17)
        """, booking.get("id"), booking.get("booking_ref"), booking.get("name"), booking.get("email"),
            booking.get("phone"), booking.get("pickupAddress", booking.get("pickup_address")),
            booking.get("dropoffAddress", booking.get("dropoff_address")),
            booking.get("date"), booking.get("time"), str(booking.get("passengers", "1")),
            booking.get("notes"), json.dumps(booking.get("pricing")) if booking.get("pricing") else None,
            float(booking.get("totalPrice", booking.get("total_price", 0)) or 0),
            booking.get("status", "pending"), booking.get("payment_status", "unpaid"),
            booking.get("serviceType", booking.get("service_type")),
            booking.get("createdAt", booking.get("created_at", datetime.utcnow().isoformat())))
        pool = await get_pool()
        await pool.execute("DELETE FROM deleted_bookings WHERE id = $1", booking_id)
        
        logger.info(f"Booking restored: {booking.get('booking_ref', booking_id)}")
        return {
            "message": "Booking restored successfully",
            "booking_ref": booking.get('booking_ref', 'N/A')
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error restoring booking: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/bookings/permanent/{booking_id}", dependencies=[Depends(get_current_user)])
async def permanently_delete_booking(booking_id: str):
    """Permanently delete a booking (no recovery possible)"""
    try:
        pool = await get_pool()
        await pool.execute("DELETE FROM deleted_bookings WHERE id = $1", booking_id)
        
        logger.info(f"Booking permanently deleted: {booking_id}")
        return {"message": "Booking permanently deleted"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error permanently deleting booking: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================
# PROMO CODE MANAGEMENT
# ============================================

@router.get("/promo-codes", dependencies=[Depends(get_current_user)])
async def get_promo_codes():
    """Get all promo codes"""
    try:
        pool = await get_pool()
        rows = await pool.fetch("SELECT * FROM promo_codes")
        codes = [row_to_promo(r) for r in rows]
        return codes
    except Exception as e:
        logger.error(f"Error fetching promo codes: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/promo-codes", dependencies=[Depends(get_current_user)])
async def create_promo_code(promo: PromoCode):
    """Create a new promo code"""
    try:
        # Check if code already exists
        pool = await get_pool()
        row = await pool.fetchrow("SELECT * FROM promo_codes WHERE code = $1", promo.code.upper())
        existing = dict(row) if row else None
        if existing:
            raise HTTPException(status_code=400, detail="Promo code already exists")
        
        promo_doc = {
            "id": str(uuid.uuid4()),
            "code": promo.code.upper(),
            "discount_type": promo.discount_type,
            "discount_value": promo.discount_value,
            "min_booking_amount": promo.min_booking_amount,
            "max_uses": promo.max_uses,
            "uses_count": 0,
            "expiry_date": promo.expiry_date,
            "active": promo.active,
            "description": promo.description,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        pool = await get_pool()
        
        await pool.execute(
        
            "INSERT INTO promo_codes (id,code,discount_type,discount_value,min_booking_amount,max_uses,uses_count,expiry_date,active,description,created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)",
        
            promo_doc["id"], promo_doc["code"], promo_doc["discount_type"], promo_doc["discount_value"],
        
            promo_doc.get("min_booking_amount",0), promo_doc.get("max_uses"), promo_doc.get("uses_count",0),
        
            promo_doc.get("expiry_date"), promo_doc.get("active",True), promo_doc.get("description"), promo_doc.get("created_at"))
        
        logger.info(f"Promo code created: {promo.code.upper()}")
        return {"message": "Promo code created", "promo": promo_doc}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating promo code: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/promo-codes/validate")
async def validate_promo_code(data: dict):
    """Validate a promo code and return discount amount"""
    try:
        code = data.get("code", "").upper()
        booking_amount = data.get("booking_amount", 0)
        
        if not code:
            raise HTTPException(status_code=400, detail="Promo code is required")
        
        pool = await get_pool()
        
        row = await pool.fetchrow("SELECT * FROM promo_codes WHERE code = $1 AND active = TRUE", code)
        
        promo = row_to_promo(row)
        
        if not promo:
            raise HTTPException(status_code=404, detail="Invalid or expired promo code")
        
        # Check expiry
        if promo.get("expiry_date"):
            expiry = datetime.fromisoformat(promo["expiry_date"].replace('Z', '+00:00'))
            if datetime.now(timezone.utc) > expiry:
                raise HTTPException(status_code=400, detail="Promo code has expired")
        
        # Check max uses
        if promo.get("max_uses") and promo.get("uses_count", 0) >= promo["max_uses"]:
            raise HTTPException(status_code=400, detail="Promo code usage limit reached")
        
        # Check minimum booking amount
        if booking_amount < promo.get("min_booking_amount", 0):
            raise HTTPException(
                status_code=400, 
                detail=f"Minimum booking amount of ${promo['min_booking_amount']:.2f} required"
            )
        
        # Calculate discount
        if promo["discount_type"] == "percentage":
            discount = booking_amount * (promo["discount_value"] / 100)
        else:  # fixed
            discount = min(promo["discount_value"], booking_amount)
        
        return {
            "valid": True,
            "code": code,
            "discount_type": promo["discount_type"],
            "discount_value": promo["discount_value"],
            "discount_amount": round(discount, 2),
            "description": promo.get("description", ""),
            "final_amount": round(booking_amount - discount, 2)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error validating promo code: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/promo-codes/{promo_id}", dependencies=[Depends(get_current_user)])
async def update_promo_code(promo_id: str, promo: PromoCode):
    """Update a promo code"""
    try:
        pool = await get_pool()
        result = await pool.execute("UPDATE promo_codes SET code = $1, discount_type = $2, discount_value = $3, min_booking_amount = $4, max_uses = $5, expiry_date = $6, active = $7, description = $8 WHERE id = $9", promo.code.upper(), promo.discount_type, promo.discount_value, promo.min_booking_amount, promo.max_uses, promo.expiry_date, promo.active, promo.description, promo_id)
        
        return {"message": "Promo code updated"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating promo code: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/promo-codes/{promo_id}", dependencies=[Depends(get_current_user)])
async def delete_promo_code(promo_id: str):
    """Delete a promo code"""
    try:
        pool = await get_pool()
        await pool.execute("DELETE FROM promo_codes WHERE id = $1", promo_id)
        return {"message": "Promo code deleted"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting promo code: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# DRIVER MANAGEMENT ENDPOINTS
# ============================================

@router.get("/drivers", dependencies=[Depends(get_current_user)])
async def get_drivers():
    try:
        pool = await get_pool()
        rows = await pool.fetch("SELECT * FROM drivers")
        drivers = [row_to_driver(r) for r in rows]
        return drivers
    except Exception as e:
        logger.error(f"Error fetching drivers: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/drivers", dependencies=[Depends(get_current_user)])
async def create_driver(driver: DriverCreate):
    try:
        driver_id = str(uuid.uuid4())
        driver_doc = {
            "id": driver_id,
            "name": driver.name,
            "phone": driver.phone,
            "email": driver.email,
            "vehicle": driver.vehicle,
            "license": driver.license,
            "status": "active",
            "createdAt": datetime.utcnow().isoformat()
        }
        pool = await get_pool()
        await pool.execute(
            "INSERT INTO drivers (id, name, phone, email, vehicle, license, status, created_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)",
            driver_doc["id"], driver_doc["name"], driver_doc.get("phone"), driver_doc.get("email"),
            driver_doc.get("vehicle"), driver_doc.get("license"), driver_doc.get("status", "active"),
            driver_doc.get("createdAt", datetime.utcnow().isoformat()))
        logger.info(f"Driver created: {driver.name} ({driver_id})")
        return {"message": "Driver created successfully", "id": driver_id}
    except Exception as e:
        logger.error(f"Error creating driver: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/drivers/{driver_id}", dependencies=[Depends(get_current_user)])
async def get_driver(driver_id: str):
    try:
        pool = await get_pool()
        row = await pool.fetchrow("SELECT * FROM drivers WHERE id = $1", driver_id)
        driver = row_to_driver(row)
        if not driver:
            raise HTTPException(status_code=404, detail="Driver not found")
        return driver
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching driver: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/drivers/{driver_id}", dependencies=[Depends(get_current_user)])
async def update_driver(driver_id: str, driver_update: DriverUpdate):
    try:
        pool = await get_pool()
        row = await pool.fetchrow("SELECT * FROM drivers WHERE id = $1", driver_id)
        existing = row_to_driver(row)
        if not existing:
            raise HTTPException(status_code=404, detail="Driver not found")
        
        update_data = {k: v for k, v in driver_update.model_dump().items() if v is not None}
        update_data["updatedAt"] = datetime.utcnow().isoformat()
        
        _camel_map = {"pickupAddress":"pickup_address","dropoffAddress":"dropoff_address","totalPrice":"total_price","updatedAt":"updated_at","createdAt":"created_at"}
        _mapped = {_camel_map.get(k, k): v for k, v in update_data.items()}
        await _pg_update("drivers", _mapped, "id", driver_id)
        
        pool = await get_pool()
        
        row = await pool.fetchrow("SELECT * FROM drivers WHERE id = $1", driver_id)
        
        updated_driver = row_to_driver(row)
        logger.info(f"Driver updated: {driver_id}")
        return {"message": "Driver updated successfully", "driver": updated_driver}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating driver: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/drivers/{driver_id}", dependencies=[Depends(get_current_user)])
async def delete_driver(driver_id: str):
    try:
        pool = await get_pool()
        row = await pool.fetchrow("SELECT * FROM drivers WHERE id = $1", driver_id)
        driver = row_to_driver(row)
        if not driver:
            raise HTTPException(status_code=404, detail="Driver not found")
        
        pool = await get_pool()
        
        await pool.execute("DELETE FROM drivers WHERE id = $1", driver_id)
        logger.info(f"Driver deleted: {driver_id}")
        return {"message": "Driver deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting driver: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# AUTO-DISPATCH SYSTEM
# ============================================

async def get_available_drivers(booking_date: str, booking_time: str):
    """Find drivers who are not assigned to jobs at the given time"""
    try:
        # Get all active drivers
        pool = await get_pool()
        rows = await pool.fetch("SELECT * FROM drivers WHERE active IS NOT FALSE")
        all_drivers = [row_to_driver(r) for r in rows]
        
        # Get bookings for the same date that have assigned drivers
        pool = await get_pool()
        busy_rows = await pool.fetch(
            "SELECT assigned_driver_id, time FROM bookings WHERE date = $1 AND assigned_driver_id IS NOT NULL AND driver_accepted = TRUE AND status != 'cancelled'",
            booking_date)
        busy_bookings = [dict(r) for r in busy_rows]
        
        # Create a set of busy driver IDs (simple: any driver with a job that day)
        # In production, you'd check time overlap more precisely
        busy_driver_ids = {b["assigned_driver_id"] for b in busy_bookings}
        
        # Filter to available drivers
        available_drivers = [d for d in all_drivers if d["id"] not in busy_driver_ids]
        
        return available_drivers
    except Exception as e:
        logger.error(f"Error getting available drivers: {str(e)}")
        return []

@router.get("/bookings/{booking_id}/available-drivers")
async def get_available_drivers_for_booking(booking_id: str, current_user: dict = Depends(get_current_user)):
    """Get list of drivers available for a specific booking"""
    try:
        pool = await get_pool()
        row = await pool.fetchrow("SELECT * FROM bookings WHERE id = $1", booking_id)
        booking = row_to_booking(row)
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        
        available = await get_available_drivers(booking["date"], booking["time"])
        
        return {
            "booking_date": booking["date"],
            "booking_time": booking["time"],
            "available_drivers": available,
            "total_available": len(available)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting available drivers: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/bookings/{booking_id}/auto-dispatch")
async def auto_dispatch_driver(booking_id: str, current_user: dict = Depends(get_current_user)):
    """Automatically assign the first available driver to a booking"""
    try:
        pool = await get_pool()
        row = await pool.fetchrow("SELECT * FROM bookings WHERE id = $1", booking_id)
        booking = row_to_booking(row)
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        
        if booking.get("assigned_driver_id"):
            raise HTTPException(status_code=400, detail="Booking already has a driver assigned")
        
        available = await get_available_drivers(booking["date"], booking["time"])
        
        if not available:
            raise HTTPException(status_code=404, detail="No drivers available for this time slot")
        
        # Pick the first available driver (could be enhanced with priority/rating system)
        driver = available[0]
        
        # Calculate driver payout (80% of total)
        total_price = booking.get("totalPrice", 0) or booking.get("pricing", {}).get("totalPrice", 0)
        driver_payout = round(total_price * 0.8, 2)
        
        # Create tracking session
        tracking_id = str(uuid.uuid4())
        acceptance_token = str(uuid.uuid4())[:8].upper()
        
        # Update booking
        pool = await get_pool()
        await pool.execute("UPDATE bookings SET tracking_id = $1, tracking_status = $2, assigned_driver_id = $3, assigned_driver_name = $4, driver_payout = $5, acceptance_token = $6, driver_accepted = $7, driver_assigned_at = $8, auto_dispatched = $9 WHERE id = $10", tracking_id, "pending_driver_acceptance", driver["id"], driver.get("name"), driver_payout, acceptance_token, None, datetime.now(timezone.utc).isoformat(), True, booking_id)
        
        # Send notification to driver
        await send_driver_job_notification(booking, driver, driver_payout, acceptance_token, "[AUTO-DISPATCH] Please respond ASAP")
        
        logger.info(f"Auto-dispatched driver {driver.get('name')} to booking {booking.get('booking_ref')}")
        
        return {
            "message": f"Auto-dispatched to {driver.get('name')} - awaiting acceptance",
            "driver_name": driver.get("name"),
            "driver_id": driver["id"],
            "driver_payout": driver_payout,
            "tracking_id": tracking_id
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in auto-dispatch: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================
# DRIVER TRACKING & LIVE LOCATION SYSTEM
# ============================================

class DriverLocationUpdate(BaseModel):
    driver_id: str
    booking_id: str
    latitude: float
    longitude: float

class StartTracking(BaseModel):
    booking_id: str
    driver_id: str

class AssignDriverAndTrack(BaseModel):
    booking_id: str
    driver_id: str
    driver_home_lat: Optional[float] = None  # Driver's starting location
    driver_home_lng: Optional[float] = None

# Store active tracking sessions in memory (for simplicity)
# In production, use Redis or database
active_tracking = {}

class DriverAssignmentRequest(BaseModel):
    driver_id: str
    driver_payout: Optional[float] = None  # Override price for driver
    notes_to_driver: Optional[str] = ""

@router.post("/bookings/{booking_id}/assign-driver")
async def assign_driver_to_booking(booking_id: str, data: DriverAssignmentRequest):
    """Admin assigns a driver to a booking with optional payout override"""
    try:
        if not data.driver_id:
            raise HTTPException(status_code=400, detail="driver_id is required")
        
        pool = await get_pool()
        
        row = await pool.fetchrow("SELECT * FROM bookings WHERE id = $1", booking_id)
        
        booking = row_to_booking(row)
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        
        pool = await get_pool()
        
        row = await pool.fetchrow("SELECT * FROM drivers WHERE id = $1", data.driver_id)
        
        driver = row_to_driver(row)
        if not driver:
            raise HTTPException(status_code=404, detail="Driver not found")
        
        # Create tracking session
        tracking_id = str(uuid.uuid4())
        acceptance_token = str(uuid.uuid4())[:8].upper()  # Short token for driver to accept
        
        active_tracking[tracking_id] = {
            "booking_id": booking_id,
            "driver_id": data.driver_id,
            "driver_name": driver.get("name", "Driver"),
            "driver_phone": driver.get("phone", ""),
            "vehicle": driver.get("vehicle", "Toyota Hiace"),
            "pickup_address": booking.get("pickupAddress", ""),
            "customer_name": booking.get("name", ""),
            "customer_phone": booking.get("phone", ""),
            "started_at": datetime.now(timezone.utc).isoformat(),
            "last_location": None,
            "current_eta_minutes": None,
            "sms_sent_5min": False,
            "status": "pending_acceptance"
        }
        
        # Calculate driver payout (use override or default to 80% of total)
        total_price = booking.get("totalPrice", 0) or booking.get("pricing", {}).get("totalPrice", 0)
        driver_payout = data.driver_payout if data.driver_payout is not None else round(total_price * 0.8, 2)
        
        # Update booking with driver assignment and tracking info
        pool = await get_pool()
        await pool.execute("UPDATE bookings SET tracking_id = $1, tracking_status = $2, assigned_driver_id = $3, assigned_driver_name = $4, driver_payout = $5, driver_notes = $6, acceptance_token = $7, driver_accepted = $8, driver_assigned_at = $9 WHERE id = $10", tracking_id, "pending_driver_acceptance", data.driver_id, driver.get("name"), driver_payout, data.notes_to_driver, acceptance_token, None, datetime.now(timezone.utc).isoformat(), booking_id)
        
        # Send notification to driver
        await send_driver_job_notification(booking, driver, driver_payout, acceptance_token, data.notes_to_driver)
        
        logger.info(f"Driver {driver.get('name')} assigned to booking {booking.get('booking_ref')} - awaiting acceptance")
        
        return {
            "message": f"Job sent to {driver.get('name')} - awaiting acceptance",
            "tracking_id": tracking_id,
            "tracking_status": "pending_driver_acceptance",
            "driver_payout": driver_payout,
            "acceptance_token": acceptance_token
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error assigning driver: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/bookings/{booking_id}/unassign-driver")
async def unassign_driver_from_booking(booking_id: str, data: dict = {}):
    """Admin unassigns a driver from a booking"""
    try:
        trip_type = data.get("trip_type", "outbound")  # outbound or return
        
        pool = await get_pool()
        
        row = await pool.fetchrow("SELECT * FROM bookings WHERE id = $1", booking_id)
        
        booking = row_to_booking(row)
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        
        if trip_type == "return":
            # Unassign return trip driver
            driver_name = booking.get("return_driver_name", "Driver")
            pool = await get_pool()
            await pool.execute("UPDATE bookings SET return_driver_id = $1, return_driver_name = $2, return_driver_payout = $3, return_driver_accepted = $4, return_tracking_status = $5, return_acceptance_token = $6 WHERE id = $7", None, None, None, None, None, None, booking_id)
        else:
            # Unassign outbound trip driver
            driver_name = booking.get("assigned_driver_name", "Driver")
            tracking_id = booking.get("tracking_id")
            
            # Remove from active tracking
            if tracking_id and tracking_id in active_tracking:
                del active_tracking[tracking_id]
            
            pool = await get_pool()
            await pool.execute("UPDATE bookings SET tracking_id = $1, tracking_status = $2, assigned_driver_id = $3, assigned_driver_name = $4, driver_payout = $5, driver_notes = $6, acceptance_token = $7, driver_accepted = $8, driver_assigned_at = $9 WHERE id = $10", None, None, None, None, None, None, None, None, None, booking_id)
        
        logger.info(f"Driver {driver_name} unassigned from booking {booking.get('booking_ref')} ({trip_type} trip)")
        
        return {
            "message": f"Driver unassigned from {trip_type} trip successfully",
            "booking_ref": booking.get("booking_ref")
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error unassigning driver: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

class ReturnDriverAssignment(BaseModel):
    driver_id: str
    driver_payout: Optional[float] = None
    notes_to_driver: Optional[str] = ""

@router.post("/bookings/{booking_id}/assign-return-driver")
async def assign_return_driver(booking_id: str, data: ReturnDriverAssignment):
    """Admin assigns a driver specifically for the return trip"""
    try:
        if not data.driver_id:
            raise HTTPException(status_code=400, detail="driver_id is required")
        
        pool = await get_pool()
        
        row = await pool.fetchrow("SELECT * FROM bookings WHERE id = $1", booking_id)
        
        booking = row_to_booking(row)
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        
        # Check if this is a return trip booking
        if not booking.get("returnTrip"):
            raise HTTPException(status_code=400, detail="This booking does not have a return trip")
        
        pool = await get_pool()
        
        row = await pool.fetchrow("SELECT * FROM drivers WHERE id = $1", data.driver_id)
        
        driver = row_to_driver(row)
        if not driver:
            raise HTTPException(status_code=404, detail="Driver not found")
        
        acceptance_token = str(uuid.uuid4())[:8].upper()
        
        # Calculate driver payout
        total_price = booking.get("totalPrice", 0) or booking.get("pricing", {}).get("totalPrice", 0)
        # Return trip is usually half the total (since total includes both ways)
        return_price = total_price / 2
        driver_payout = data.driver_payout if data.driver_payout is not None else round(return_price * 0.8, 2)
        
        # Update booking with return driver assignment
        pool = await get_pool()
        await pool.execute("UPDATE bookings SET return_driver_id = $1, return_driver_name = $2, return_driver_payout = $3, return_driver_notes = $4, return_acceptance_token = $5, return_driver_accepted = $6, return_tracking_status = $7, return_driver_assigned_at = $8 WHERE id = $9", data.driver_id, driver.get("name"), driver_payout, data.notes_to_driver, acceptance_token, None, "pending_driver_acceptance", datetime.now(timezone.utc).isoformat(), booking_id)
        
        # Create a modified booking dict for the return trip notification
        return_booking = booking.copy()
        return_booking["pickupAddress"] = booking.get("dropoffAddress")  # Swap pickup/dropoff for return
        return_booking["dropoffAddress"] = booking.get("pickupAddress")
        return_booking["id"] = f"{booking_id}?trip=return"  # Special identifier for return trip
        
        # Send notification to driver
        await send_driver_job_notification(
            return_booking, 
            driver, 
            driver_payout, 
            acceptance_token, 
            f"[RETURN TRIP] {data.notes_to_driver or ''}"
        )
        
        logger.info(f"Return driver {driver.get('name')} assigned to booking {booking.get('booking_ref')}")
        
        return {
            "message": f"Return trip job sent to {driver.get('name')} - awaiting acceptance",
            "tracking_status": "pending_driver_acceptance",
            "driver_payout": driver_payout,
            "acceptance_token": acceptance_token
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error assigning return driver: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

async def send_driver_job_notification(booking: dict, driver: dict, payout: float, token: str, notes: str = ""):
    """Send email and SMS to driver with job details"""
    try:
        booking_ref = booking.get('booking_ref', 'N/A')
        driver_name = driver.get('name', 'Driver')
        driver_email = driver.get('email')
        driver_phone = driver.get('phone')
        
        # Format date nicely
        booking_date = booking.get('date', 'N/A')
        booking_time = booking.get('time', 'N/A')
        
        # Build acceptance URL
        base_url = os.environ.get('FRONTEND_URL', 'https://hibiscustoairport.co.nz')
        accept_url = f"{base_url}/driver/job/{booking.get('id')}?token={token}"
        
        # Send Email to driver
        if driver_email:
            subject = f"NEW JOB: {booking_ref} - ${payout:.2f}"
            
            email_body = f"""
            <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
              <div style="background: linear-gradient(135deg, #1f2937 0%, #111827 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0;">
                <h1 style="margin: 0; font-size: 24px;">New Job Available</h1>
                <p style="margin: 8px 0 0; color: #f59e0b;">Booking {booking_ref}</p>
              </div>
              
              <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
                <p style="font-size: 16px; color: #374151;">Hi {driver_name},</p>
                
                <p style="font-size: 16px; color: #374151;">
                  You have been assigned a new job. Please review the details below and accept or decline.
                </p>
                
                <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                  <p style="margin: 0; font-size: 14px; color: #92400e;">YOUR PAYOUT</p>
                  <p style="margin: 5px 0 0; font-size: 32px; font-weight: bold; color: #92400e;">${payout:.2f}</p>
                </div>
                
                <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                  <p style="margin: 0;"><strong>Date:</strong> {booking_date}</p>
                  <p style="margin: 10px 0 0;"><strong>Pickup Time:</strong> {booking_time}</p>
                  <p style="margin: 10px 0 0;"><strong>Pickup:</strong> {booking.get('pickupAddress', 'N/A')}</p>
                  <p style="margin: 10px 0 0;"><strong>Drop-off:</strong> {booking.get('dropoffAddress', 'N/A')}</p>
                  <p style="margin: 10px 0 0;"><strong>Passengers:</strong> {booking.get('passengers', 1)}</p>
                  <p style="margin: 10px 0 0;"><strong>Customer:</strong> {booking.get('name', 'N/A')}</p>
                </div>
                
                {f'<div style="background: #e0f2fe; padding: 15px; border-radius: 8px; margin: 20px 0;"><p style="margin: 0; font-size: 14px; color: #0369a1;"><strong>Notes:</strong> {notes}</p></div>' if notes else ''}
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="{accept_url}" style="display: inline-block; background: #f59e0b; color: black; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                    VIEW JOB & RESPOND
                  </a>
                </div>
                
                <p style="font-size: 12px; color: #9ca3af; text-align: center;">
                  Please respond as soon as possible to confirm your availability.
                </p>
              </div>
            </div>
            """
            
            from utils import send_email
            send_email(driver_email, subject, email_body)
            logger.info(f"Job notification email sent to driver {driver_name} at {driver_email}")
        
        # Send SMS to driver
        if driver_phone:
            sms_message = f"""NEW JOB - {booking_ref}

Date: {booking_date} at {booking_time}
From: {booking.get('pickupAddress', 'N/A')[:40]}
To: {booking.get('dropoffAddress', 'N/A')[:40]}
Payout: ${payout:.2f}

Click to accept/decline:
{accept_url}"""
            
            from utils import send_sms
            send_sms(driver_phone, sms_message)
            logger.info(f"Job notification SMS sent to driver {driver_name} at {driver_phone}")
            
    except Exception as e:
        logger.error(f"Error sending driver notification: {str(e)}")

@router.get("/driver/job/{booking_id}")
async def get_driver_job_details(booking_id: str, token: str = None):
    """Get job details for driver to review before accepting"""
    try:
        pool = await get_pool()
        row = await pool.fetchrow("SELECT * FROM bookings WHERE id = $1", booking_id)
        booking = row_to_booking(row)
        if not booking:
            raise HTTPException(status_code=404, detail="Job not found")
        
        # Verify token if provided
        if token and booking.get("acceptance_token") != token:
            raise HTTPException(status_code=403, detail="Invalid token")
        
        driver_id = booking.get("assigned_driver_id")
        pool = await get_pool()
        row = await pool.fetchrow("SELECT * FROM drivers WHERE id = $1", driver_id)
        driver = row_to_driver(row) if driver_id else None
        
        return {
            "booking_id": booking.get("id"),
            "booking_ref": booking.get("booking_ref"),
            "date": booking.get("date"),
            "time": booking.get("time"),
            "pickup_address": booking.get("pickupAddress"),
            "dropoff_address": booking.get("dropoffAddress"),
            "passengers": booking.get("passengers"),
            "customer_name": booking.get("name"),
            "customer_phone": booking.get("phone"),
            "driver_payout": booking.get("driver_payout"),
            "driver_notes": booking.get("driver_notes"),
            "driver_accepted": booking.get("driver_accepted"),
            "status": booking.get("tracking_status"),
            "flight_info": {
                "departure_flight": booking.get("departureFlightNumber"),
                "departure_time": booking.get("departureTime"),
                "arrival_flight": booking.get("arrivalFlightNumber"),
                "arrival_time": booking.get("arrivalTime")
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting driver job: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/driver/job/{booking_id}/respond")
async def driver_respond_to_job(booking_id: str, data: dict):
    """Driver accepts or declines a job"""
    try:
        token = data.get("token")
        accepted = data.get("accepted", False)
        decline_reason = data.get("decline_reason", "")
        
        pool = await get_pool()
        
        row = await pool.fetchrow("SELECT * FROM bookings WHERE id = $1", booking_id)
        
        booking = row_to_booking(row)
        if not booking:
            raise HTTPException(status_code=404, detail="Job not found")
        
        # Verify token
        if booking.get("acceptance_token") != token:
            raise HTTPException(status_code=403, detail="Invalid token")
        
        # Check if already responded
        if booking.get("driver_accepted") is not None:
            return {"message": "You have already responded to this job", "status": "already_responded"}
        
        driver_id = booking.get("assigned_driver_id")
        pool = await get_pool()
        row = await pool.fetchrow("SELECT * FROM drivers WHERE id = $1", driver_id)
        driver = row_to_driver(row) if driver_id else None
        driver_name = driver.get("name", "Driver") if driver else "Driver"
        
        if accepted:
            # Driver accepted
            pool = await get_pool()
            await pool.execute("UPDATE bookings SET driver_accepted = $1, driver_accepted_at = $2, tracking_status = $3 WHERE id = $4", True, datetime.now(timezone.utc).isoformat(), "driver_assigned", booking_id)
            
            # Notify admin
            admin_email = os.environ.get('ADMIN_EMAIL', 'bookings@bookaride.co.nz')
            from utils import send_email
            send_email(
                admin_email,
                f"Driver ACCEPTED: {booking.get('booking_ref')}",
                f"<p><strong>{driver_name}</strong> has ACCEPTED job <strong>{booking.get('booking_ref')}</strong></p><p>Pickup: {booking.get('date')} at {booking.get('time')}</p>"
            )
            
            logger.info(f"Driver {driver_name} ACCEPTED job {booking.get('booking_ref')}")
            
            return {
                "message": "Job accepted! You will receive tracking details before pickup.",
                "status": "accepted",
                "tracking_url": f"/driver/track/{booking_id}"
            }
        else:
            # Driver declined
            pool = await get_pool()
            await pool.execute("UPDATE bookings SET driver_accepted = $1, driver_declined_at = $2, driver_decline_reason = $3, tracking_status = $4, assigned_driver_id = $5, assigned_driver_name = $6 WHERE id = $7", False, datetime.now(timezone.utc).isoformat(), decline_reason, "driver_declined", None, None, booking_id)
            
            # Notify admin
            admin_email = os.environ.get('ADMIN_EMAIL', 'bookings@bookaride.co.nz')
            from utils import send_email
            send_email(
                admin_email,
                f"Driver DECLINED: {booking.get('booking_ref')}",
                f"<p><strong>{driver_name}</strong> has DECLINED job <strong>{booking.get('booking_ref')}</strong></p><p>Reason: {decline_reason or 'No reason given'}</p><p>Please assign another driver.</p>"
            )
            
            logger.info(f"Driver {driver_name} DECLINED job {booking.get('booking_ref')}: {decline_reason}")
            
            return {
                "message": "Job declined. Admin has been notified.",
                "status": "declined"
            }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error responding to job: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/tracking/start")
async def start_driver_tracking(data: StartTracking):
    """Driver starts tracking - called when driver clicks 'On My Way'"""
    try:
        pool = await get_pool()
        row = await pool.fetchrow("SELECT * FROM bookings WHERE id = $1", data.booking_id)
        booking = row_to_booking(row)
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        
        pool = await get_pool()
        
        row = await pool.fetchrow("SELECT * FROM drivers WHERE id = $1", data.driver_id)
        
        driver = row_to_driver(row)
        if not driver:
            raise HTTPException(status_code=404, detail="Driver not found")
        
        # Create tracking session
        tracking_id = str(uuid.uuid4())
        active_tracking[tracking_id] = {
            "booking_id": data.booking_id,
            "driver_id": data.driver_id,
            "driver_name": driver.get("name", "Driver"),
            "driver_phone": driver.get("phone", ""),
            "vehicle": driver.get("vehicle", "Toyota Hiace"),
            "pickup_address": booking.get("pickupAddress", ""),
            "customer_name": booking.get("name", ""),
            "customer_phone": booking.get("phone", ""),
            "started_at": datetime.now(timezone.utc).isoformat(),
            "last_location": None,
            "current_eta_minutes": None,
            "sms_sent_5min": False,  # Flag to prevent duplicate SMS
            "status": "active"
        }
        
        # Update booking with tracking info
        pool = await get_pool()
        await pool.execute("UPDATE bookings SET tracking_id = $1, tracking_status = $2, assigned_driver_id = $3, assigned_driver_name = $4 WHERE id = $5", tracking_id, "driver_on_way", data.driver_id, driver.get("name"), data.booking_id)
        
        logger.info(f"Tracking started: {tracking_id} for booking {data.booking_id} by driver {driver.get('name')}")
        
        return {
            "tracking_id": tracking_id,
            "tracking_url": f"/track/{booking.get('booking_ref', tracking_id)}",
            "message": "Tracking started successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error starting tracking: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/tracking/update-location")
async def update_driver_location(data: DriverLocationUpdate):
    """Driver sends location updates - called periodically from driver's browser"""
    try:
        # Find the tracking session for this booking
        tracking_session = None
        tracking_id = None
        for tid, session in active_tracking.items():
            if session["booking_id"] == data.booking_id and session["driver_id"] == data.driver_id:
                tracking_session = session
                tracking_id = tid
                break
        
        if not tracking_session:
            raise HTTPException(status_code=404, detail="No active tracking session found")
        
        # Update location
        tracking_session["last_location"] = {
            "lat": data.latitude,
            "lng": data.longitude,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Calculate ETA using Google Maps Distance Matrix API
        pickup_address = tracking_session["pickup_address"]
        google_api_key = os.environ.get("GOOGLE_MAPS_API_KEY", "")
        
        if google_api_key and pickup_address:
            try:
                # Call Google Distance Matrix API
                url = f"https://maps.googleapis.com/maps/api/distancematrix/json"
                params = {
                    "origins": f"{data.latitude},{data.longitude}",
                    "destinations": pickup_address,
                    "mode": "driving",
                    "key": google_api_key
                }
                
                async with httpx.AsyncClient() as client:
                    response = await client.get(url, params=params)
                    result = response.json()
                
                if result.get("status") == "OK":
                    element = result["rows"][0]["elements"][0]
                    if element.get("status") == "OK":
                        duration_seconds = element["duration"]["value"]
                        eta_minutes = round(duration_seconds / 60)
                        tracking_session["current_eta_minutes"] = eta_minutes
                        
                        logger.info(f"ETA updated: {eta_minutes} minutes for tracking {tracking_id}")
                        
                        # Check if ETA is 10 minutes or less and SMS not yet sent
                        if eta_minutes <= 10 and not tracking_session["sms_sent_5min"]:
                            # Send SMS to customer
                            await send_5min_arrival_sms(tracking_session, tracking_id)
                            tracking_session["sms_sent_5min"] = True
                            logger.info(f"10-minute arrival SMS sent for tracking {tracking_id}")
                            
            except Exception as eta_error:
                logger.error(f"ETA calculation error: {str(eta_error)}")
        
        # Update tracking in database for persistence
        pool = await get_pool()
        await pool.execute("UPDATE bookings SET driver_location = $1::jsonb, driver_eta_minutes = $2 WHERE id = $3", json.dumps(tracking_session["last_location"]), tracking_session.get("current_eta_minutes"), data.booking_id)
        
        return {
            "status": "updated",
            "eta_minutes": tracking_session.get("current_eta_minutes"),
            "sms_sent": tracking_session["sms_sent_5min"]
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating location: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

async def send_5min_arrival_sms(tracking_session: dict, tracking_id: str):
    """Send SMS to customer when driver is 10 minutes away"""
    try:
        customer_phone = tracking_session.get("customer_phone", "")
        customer_name = tracking_session.get("customer_name", "")
        driver_name = tracking_session.get("driver_name", "Driver")
        
        if not customer_phone:
            logger.error("No customer phone for arrival SMS")
            return
        
        # Get the booking ref for tracking URL
        pool = await get_pool()
        row = await pool.fetchrow("SELECT * FROM bookings WHERE id = $1", tracking_session["booking_id"])
        booking = row_to_booking(row)
        booking_ref = booking.get("booking_ref", tracking_id) if booking else tracking_id
        
        # Format tracking URL (use production domain)
        tracking_url = f"https://hibiscustoairport.co.nz/track/{booking_ref}"
        
        message = f"Hi {customer_name.split()[0]}! Your driver {driver_name} is approximately 10 minutes away. Track live: {tracking_url}"
        
        # Send via Twilio
        account_sid = os.environ.get("TWILIO_ACCOUNT_SID", "")
        auth_token = os.environ.get("TWILIO_AUTH_TOKEN", "")
        from_number = os.environ.get("TWILIO_PHONE_NUMBER", "")
        
        if account_sid and auth_token and from_number:
            from twilio.rest import Client
            client = Client(account_sid, auth_token)
            
            # Format phone number
            to_number = customer_phone
            if not to_number.startswith('+'):
                if to_number.startswith('0'):
                    to_number = '+64' + to_number[1:]
                else:
                    to_number = '+64' + to_number
            
            sms = client.messages.create(
                body=message,
                from_=from_number,
                to=to_number
            )
            logger.info(f"5-min arrival SMS sent to {to_number}: {sms.sid}")
        else:
            logger.error("Twilio credentials not configured")
            
    except Exception as e:
        logger.error(f"Error sending 5-min SMS: {str(e)}")

@router.get("/tracking/{tracking_ref}")
async def get_tracking_info(tracking_ref: str):
    """Get tracking info for customer view - by booking ref, booking ID, or tracking ID"""
    try:
        # First try to find by booking_ref
        pool = await get_pool()
        row = await pool.fetchrow("SELECT * FROM bookings WHERE booking_ref = $1", tracking_ref)
        booking = row_to_booking(row)
        
        if not booking:
            # Try by booking id
            pool = await get_pool()
            row = await pool.fetchrow("SELECT * FROM bookings WHERE id = $1", tracking_ref)
            booking = row_to_booking(row)
        
        if not booking:
            # Try by tracking_id
            pool = await get_pool()
            row = await pool.fetchrow("SELECT * FROM bookings WHERE tracking_id = $1", tracking_ref)
            booking = row_to_booking(row)
        
        if not booking:
            raise HTTPException(status_code=404, detail="Tracking not found")
        
        tracking_id = booking.get("tracking_id")
        
        # Get live data from memory if available
        live_data = active_tracking.get(tracking_id, {})
        
        # Get driver info
        driver_id = booking.get("assigned_driver_id")
        driver = None
        if driver_id:
            pool = await get_pool()
            row = await pool.fetchrow("SELECT * FROM drivers WHERE id = $1", driver_id)
            driver = row_to_driver(row)
        
        return {
            "booking_id": booking.get("id"),
            "booking_ref": booking.get("booking_ref"),
            "customer_name": booking.get("name"),
            "customer_phone": booking.get("phone"),
            "pickup_address": booking.get("pickupAddress"),
            "dropoff_address": booking.get("dropoffAddress"),
            "pickup_time": booking.get("time"),
            "pickup_date": booking.get("date"),
            "tracking_status": booking.get("tracking_status", "pending"),
            "driver": {
                "id": driver.get("id") if driver else None,
                "name": driver.get("name") if driver else live_data.get("driver_name", "Driver"),
                "phone": driver.get("phone") if driver else live_data.get("driver_phone", ""),
                "vehicle": driver.get("vehicle") if driver else live_data.get("vehicle", "Toyota Hiace"),
            } if driver or live_data else None,
            "location": live_data.get("last_location") or booking.get("driver_location"),
            "eta_minutes": live_data.get("current_eta_minutes") or booking.get("driver_eta_minutes"),
            "started_at": live_data.get("started_at")
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting tracking info: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/tracking/stop/{booking_id}")
async def stop_tracking(booking_id: str):
    """Stop tracking when driver arrives or trip ends"""
    try:
        # Find and remove tracking session
        tracking_id = None
        for tid, session in list(active_tracking.items()):
            if session["booking_id"] == booking_id:
                tracking_id = tid
                del active_tracking[tid]
                break
        
        # Update booking
        pool = await get_pool()
        await pool.execute("UPDATE bookings SET tracking_status = $1 WHERE id = $2", "arrived", booking_id)
        
        logger.info(f"Tracking stopped for booking {booking_id}")
        return {"message": "Tracking stopped", "status": "arrived"}
    except Exception as e:
        logger.error(f"Error stopping tracking: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))



# ============================================
# FLIGHT TRACKING ENDPOINT
# ============================================

@router.get("/flight/track")
async def track_flight(flight_number: str):
    """Track flight status via AviationStack API"""
    try:
        aviationstack_key = os.environ.get('AVIATIONSTACK_API_KEY')
        
        if not aviationstack_key:
            # Return demo data if API key not configured
            # This allows the feature to work in demo mode
            import random
            statuses = ['scheduled', 'active', 'landed', 'delayed']
            status = random.choice(statuses)
            
            # Generate realistic demo data
            demo_data = {
                "flight_number": flight_number.upper(),
                "airline": "Air New Zealand" if flight_number.upper().startswith("NZ") else "Qantas" if flight_number.upper().startswith("QF") else "Unknown Airline",
                "status": status,
                "departure": {
                    "airport": "Auckland International Airport",
                    "iata": "AKL",
                    "scheduled": "2025-12-20T08:30:00",
                    "estimated": "2025-12-20T08:35:00" if status == 'delayed' else "2025-12-20T08:30:00",
                    "actual": None if status in ['scheduled', 'delayed'] else "2025-12-20T08:32:00",
                    "terminal": "I",
                    "gate": "15"
                },
                "arrival": {
                    "airport": "Sydney International Airport" if flight_number.upper().startswith("NZ") else "Melbourne Airport",
                    "iata": "SYD" if flight_number.upper().startswith("NZ") else "MEL",
                    "scheduled": "2025-12-20T13:15:00",
                    "estimated": "2025-12-20T13:45:00" if status == 'delayed' else "2025-12-20T13:15:00",
                    "actual": None if status in ['scheduled', 'delayed', 'active'] else "2025-12-20T13:12:00",
                    "terminal": "1",
                    "gate": "42"
                },
                "demo_mode": True,
                "message": "Demo mode - Add AVIATIONSTACK_API_KEY for live data"
            }
            return demo_data
        
        # Real API call when key is configured
        import httpx
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "http://api.aviationstack.com/v1/flights",
                params={
                    "access_key": aviationstack_key,
                    "flight_iata": flight_number.upper()
                },
                timeout=10.0
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="Flight API error")
            
            data = response.json()
            
            if not data.get('data') or len(data['data']) == 0:
                raise HTTPException(status_code=404, detail="Flight not found")
            
            flight = data['data'][0]
            
            return {
                "flight_number": flight.get('flight', {}).get('iata', flight_number),
                "airline": flight.get('airline', {}).get('name', 'Unknown'),
                "status": flight.get('flight_status', 'unknown'),
                "departure": {
                    "airport": flight.get('departure', {}).get('airport', 'Unknown'),
                    "iata": flight.get('departure', {}).get('iata', ''),
                    "scheduled": flight.get('departure', {}).get('scheduled', ''),
                    "estimated": flight.get('departure', {}).get('estimated', ''),
                    "actual": flight.get('departure', {}).get('actual', ''),
                    "terminal": flight.get('departure', {}).get('terminal', ''),
                    "gate": flight.get('departure', {}).get('gate', '')
                },
                "arrival": {
                    "airport": flight.get('arrival', {}).get('airport', 'Unknown'),
                    "iata": flight.get('arrival', {}).get('iata', ''),
                    "scheduled": flight.get('arrival', {}).get('scheduled', ''),
                    "estimated": flight.get('arrival', {}).get('estimated', ''),
                    "actual": flight.get('arrival', {}).get('actual', ''),
                    "terminal": flight.get('arrival', {}).get('terminal', ''),
                    "gate": flight.get('arrival', {}).get('gate', '')
                },
                "demo_mode": False
            }
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Flight tracking error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


from fastapi import Form



# ============================================
# GOOGLE CALENDAR INTEGRATION
# ============================================
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from google.auth.transport.requests import Request as GoogleRequest
from fastapi.responses import RedirectResponse

# Google Calendar OAuth Configuration
GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')
GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET')
GOOGLE_CALENDAR_ID = os.environ.get('GOOGLE_CALENDAR_ID', 'primary')
GOOGLE_SCOPES = ['https://www.googleapis.com/auth/calendar']

# Get frontend URL for redirect
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'https://hibiscustoairport.co.nz')

@router.get("/calendar/auth/url")
async def get_calendar_auth_url(current_user: dict = Depends(get_current_user)):
    """Generate Google OAuth URL for calendar authorization"""
    try:
        # Build the redirect URI using the backend URL
        backend_url = os.environ.get('BACKEND_URL', 'https://hibiscustoairport.co.nz')
        redirect_uri = f"{backend_url}/api/calendar/auth/callback"
        
        # Build authorization URL
        auth_url = (
            f"https://accounts.google.com/o/oauth2/v2/auth?"
            f"client_id={GOOGLE_CLIENT_ID}"
            f"&redirect_uri={redirect_uri}"
            f"&response_type=code"
            f"&scope=https://www.googleapis.com/auth/calendar"
            f"&access_type=offline"
            f"&prompt=consent"
        )
        
        logger.info(f"Generated calendar auth URL with redirect: {redirect_uri}")
        return {"authorization_url": auth_url}
    except Exception as e:
        logger.error(f"Error generating calendar auth URL: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/calendar/auth/callback")
async def calendar_auth_callback(code: str = None, error: str = None):
    """Handle Google OAuth callback and store tokens"""
    try:
        if error:
            logger.error(f"OAuth error: {error}")
            return RedirectResponse(f"{FRONTEND_URL}/admin?calendar_error={error}")
        
        if not code:
            return RedirectResponse(f"{FRONTEND_URL}/admin?calendar_error=no_code")
        
        # Get backend URL for redirect_uri
        backend_url = os.environ.get('BACKEND_URL', 'https://hibiscustoairport.co.nz')
        redirect_uri = f"{backend_url}/api/calendar/auth/callback"
        
        # Exchange code for tokens using direct HTTP request
        import requests
        token_resp = requests.post('https://oauth2.googleapis.com/token', data={
            'code': code,
            'client_id': GOOGLE_CLIENT_ID,
            'client_secret': GOOGLE_CLIENT_SECRET,
            'redirect_uri': redirect_uri,
            'grant_type': 'authorization_code'
        }).json()
        
        if 'error' in token_resp:
            logger.error(f"Token exchange error: {token_resp}")
            return RedirectResponse(f"{FRONTEND_URL}/admin?calendar_error={token_resp.get('error_description', token_resp.get('error'))}")
        
        # Store tokens in database
        pool = await get_pool()
        await pool.execute("UPDATE google_calendar_tokens SET access_token = $1, refresh_token = $2, token_type = $3, expires_in = $4, scope = $5, updated_at = $6 WHERE type = $7", token_resp.get('access_token'), token_resp.get('refresh_token'), token_resp.get('token_type'), token_resp.get('expires_in'), token_resp.get('scope'), datetime.now(timezone.utc).isoformat(), "admin_calendar")
        
        logger.info("Google Calendar tokens stored successfully")
        return RedirectResponse(f"{FRONTEND_URL}/admin?calendar_authorized=true")
        
    except Exception as e:
        logger.error(f"Calendar auth callback error: {str(e)}")
        return RedirectResponse(f"{FRONTEND_URL}/admin?calendar_error={str(e)}")

@router.get("/calendar/status")
async def get_calendar_status(current_user: dict = Depends(get_current_user)):
    """Check if Google Calendar is authorized"""
    try:
        pool = await get_pool()
        row = await pool.fetchrow("SELECT * FROM google_calendar_tokens WHERE type = $1", "admin_calendar")
        tokens = dict(row) if row else None
        if tokens and tokens.get('refresh_token'):
            return {
                "authorized": True,
                "updated_at": tokens.get('updated_at')
            }
        return {"authorized": False}
    except Exception as e:
        logger.error(f"Error checking calendar status: {str(e)}")
        return {"authorized": False}


@router.post("/bookings/{booking_id}/sync-calendar")
async def sync_booking_to_calendar(booking_id: str, current_user: dict = Depends(get_current_user)):
    """Manually sync a specific booking to Google Calendar"""
    try:
        pool = await get_pool()
        row = await pool.fetchrow("SELECT * FROM bookings WHERE id = $1", booking_id)
        booking = row_to_booking(row)
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        
        calendar_event_id = await add_booking_to_google_calendar(booking)
        if calendar_event_id:
            return {
                "success": True,
                "message": f"Booking {booking.get('booking_ref', booking_id)} synced to Google Calendar",
                "event_id": calendar_event_id
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to sync - check if calendar is authorized")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Calendar sync error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/calendar/sync-all")
async def sync_all_bookings_to_calendar(current_user: dict = Depends(get_current_user)):
    """Sync all upcoming bookings to Google Calendar"""
    try:
        from datetime import datetime
        today = datetime.now().strftime("%Y-%m-%d")
        
        # Get all upcoming bookings (today and future)
        pool = await get_pool()
        rows = await pool.fetch("SELECT * FROM bookings ORDER BY created_at DESC")
        bookings = [row_to_booking(r) for r in rows]
        
        synced = 0
        failed = 0
        
        for booking in bookings:
            try:
                event_id = await add_booking_to_google_calendar(booking)
                if event_id:
                    synced += 1
                else:
                    failed += 1
            except Exception as e:
                logger.error(f"Failed to sync booking {booking.get('booking_ref')}: {str(e)}")
                failed += 1
        
        return {
            "success": True,
            "message": f"Synced {synced} bookings to Google Calendar ({failed} failed)",
            "synced": synced,
            "failed": failed,
            "total": len(bookings)
        }
    except Exception as e:
        logger.error(f"Sync all bookings error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

async def get_calendar_credentials():
    """Get valid Google Calendar credentials with auto-refresh"""
    try:
        pool = await get_pool()
        row = await pool.fetchrow("SELECT * FROM google_calendar_tokens WHERE type = $1", "admin_calendar")
        tokens = dict(row) if row else None
        if not tokens or not tokens.get('refresh_token'):
            logger.warning("No Google Calendar tokens found")
            return None
        
        creds = Credentials(
            token=tokens.get('access_token'),
            refresh_token=tokens.get('refresh_token'),
            token_uri='https://oauth2.googleapis.com/token',
            client_id=GOOGLE_CLIENT_ID,
            client_secret=GOOGLE_CLIENT_SECRET,
            scopes=GOOGLE_SCOPES
        )
        
        # Refresh if expired
        if creds.expired and creds.refresh_token:
            creds.refresh(GoogleRequest())
            # Update stored access token
            pool = await get_pool()
            await pool.execute("UPDATE google_calendar_tokens SET access_token = $1 WHERE type = $2", creds.token, "admin_calendar")
        
        return creds
    except Exception as e:
        logger.error(f"Error getting calendar credentials: {str(e)}")
        return None

async def add_booking_to_google_calendar(booking: dict):
    """Add a booking as an event to Google Calendar"""
    try:
        creds = await get_calendar_credentials()
        if not creds:
            logger.warning("Calendar not authorized - skipping calendar event creation")
            return None
        
        service = build('calendar', 'v3', credentials=creds)
        
        # Parse booking date and time
        booking_date = booking.get('date', '')
        booking_time = booking.get('time', '00:00')
        booking_ref = booking.get('booking_ref', 'N/A')
        
        # Format datetime for Google Calendar (NZ timezone)
        try:
            start_datetime = f"{booking_date}T{booking_time}:00"
            # Add 1 hour for estimated end time
            end_hour = int(booking_time.split(':')[0]) + 1
            end_time = f"{end_hour:02d}:{booking_time.split(':')[1]}"
            end_datetime = f"{booking_date}T{end_time}:00"
        except:
            start_datetime = f"{booking_date}T09:00:00"
            end_datetime = f"{booking_date}T10:00:00"
        
        # Build event description
        description = f"""
BOOKING REFERENCE: {booking_ref}

Customer: {booking.get('name', 'N/A')}
Phone: {booking.get('phone', 'N/A')}
Email: {booking.get('email', 'N/A')}

Pickup: {booking.get('pickupAddress', 'N/A')}
Drop-off: {booking.get('dropoffAddress', 'N/A')}

Passengers: {booking.get('passengers', 1)}
Total: ${booking.get('pricing', {}).get('totalPrice', 0):.2f} NZD

Flight Info:
- Departure: {booking.get('departureFlightNumber', 'N/A')} at {booking.get('departureTime', 'N/A')}
- Arrival: {booking.get('arrivalFlightNumber', 'N/A')} at {booking.get('arrivalTime', 'N/A')}

Notes: {booking.get('notes', 'None')}

Status: {booking.get('status', 'pending').upper()}
Payment: {booking.get('payment_status', 'pending').upper()}
""".strip()
        
        event = {
            'summary': f"{booking_ref} - {booking.get('name', 'Customer')} | {booking.get('passengers', 1)} pax",
            'location': booking.get('pickupAddress', ''),
            'description': description,
            'start': {
                'dateTime': start_datetime,
                'timeZone': 'Pacific/Auckland',
            },
            'end': {
                'dateTime': end_datetime,
                'timeZone': 'Pacific/Auckland',
            },
            'reminders': {
                'useDefault': False,
                'overrides': [
                    {'method': 'popup', 'minutes': 60},
                    {'method': 'popup', 'minutes': 30},
                ],
            },
        }
        
        # Create the event
        calendar_id = GOOGLE_CALENDAR_ID or 'primary'
        created_event = service.events().insert(calendarId=calendar_id, body=event).execute()
        
        logger.info(f"Created Google Calendar event for booking {booking_ref}: {created_event.get('id')}")
        
        # Store the event ID with the booking for future updates/deletion
        pool = await get_pool()
        await pool.execute("UPDATE bookings SET google_calendar_event_id = $1 WHERE id = $2", created_event.get('id'), booking.get('id'))
        
        return created_event.get('id')
        
    except Exception as e:
        logger.error(f"Error adding booking to Google Calendar: {str(e)}")
        return None

@router.post("/calendar/test-event")
async def create_test_calendar_event(current_user: dict = Depends(get_current_user)):
    """Create a test event to verify Google Calendar integration"""
    try:
        creds = await get_calendar_credentials()
        if not creds:
            raise HTTPException(status_code=400, detail="Google Calendar not authorized. Please authorize first.")
        
        service = build('calendar', 'v3', credentials=creds)
        
        # Create a test event for tomorrow
        tomorrow = datetime.now(timezone.utc) + timedelta(days=1)
        start_datetime = tomorrow.replace(hour=10, minute=0, second=0, microsecond=0).isoformat()
        end_datetime = tomorrow.replace(hour=11, minute=0, second=0, microsecond=0).isoformat()
        
        event = {
            'summary': 'Test Booking - Hibiscus to Airport',
            'location': 'Auckland Airport',
            'description': 'This is a test event to verify Google Calendar integration is working correctly.',
            'start': {
                'dateTime': start_datetime,
                'timeZone': 'Pacific/Auckland',
            },
            'end': {
                'dateTime': end_datetime,
                'timeZone': 'Pacific/Auckland',
            },
        }
        
        calendar_id = GOOGLE_CALENDAR_ID or 'primary'
        created_event = service.events().insert(calendarId=calendar_id, body=event).execute()
        
        return {
            "success": True,
            "message": "Test event created successfully!",
            "event_id": created_event.get('id'),
            "event_link": created_event.get('htmlLink')
        }
        
    except Exception as e:
        logger.error(f"Error creating test calendar event: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================
# DAY-BEFORE BOOKING REMINDERS
# ============================================

async def send_booking_reminder(booking: dict):
    """Send day-before reminder for a booking"""
    try:
        booking_ref = booking.get('booking_ref', 'N/A')
        formatted_date = booking.get('date', 'N/A')
        
        # Send reminder email
        subject = f"Reminder: Your Airport Transfer Tomorrow - {booking_ref}"
        
        body = f"""
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <div style="background: linear-gradient(135deg, #1f2937 0%, #111827 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">Transfer Reminder</h1>
            <p style="margin: 8px 0 0; color: #f59e0b;">Your transfer is tomorrow!</p>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
            <p style="font-size: 16px; color: #374151;">Hi {booking['name']},</p>
            
            <p style="font-size: 16px; color: #374151;">
              Just a friendly reminder that your airport transfer is scheduled for <strong>tomorrow</strong>.
            </p>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <p style="margin: 0;"><strong>Booking Reference:</strong> {booking_ref}</p>
              <p style="margin: 10px 0 0;"><strong>Date & Time:</strong> {formatted_date} at {booking['time']}</p>
              <p style="margin: 10px 0 0;"><strong>Pickup:</strong> {booking['pickupAddress']}</p>
              <p style="margin: 10px 0 0;"><strong>Drop-off:</strong> {booking['dropoffAddress']}</p>
              <p style="margin: 10px 0 0;"><strong>Passengers:</strong> {booking.get('passengers', 1)}</p>
            </div>
            
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; font-size: 14px; color: #92400e;">
                <strong>Please be ready 5-10 minutes before your pickup time.</strong><br>
                Your driver will contact you when they are on their way.
              </p>
            </div>
            
            <p style="font-size: 14px; color: #6b7280;">
              If you need to make any changes, please contact us:<br>
              021 743 321<br>
              bookings@bookaride.co.nz
            </p>
          </div>
        </div>
        """
        
        from utils import send_email, send_sms
        send_email(booking['email'], subject, body)
        
        # Send reminder SMS
        sms_message = f"""REMINDER: Your airport transfer is tomorrow!

Ref: {booking_ref}
Pickup: {formatted_date} at {booking['time']}
From: {booking['pickupAddress'][:50]}...

Be ready 5-10 mins early.
Questions? 021 743 321"""
        
        send_sms(booking['phone'], sms_message)
        
        logger.info(f"Reminder sent for booking {booking_ref}")
        return True
        
    except Exception as e:
        logger.error(f"Error sending reminder for booking {booking.get('booking_ref', 'unknown')}: {str(e)}")
        return False

@router.post("/reminders/send-tomorrow")
async def send_tomorrow_reminders(current_user: dict = Depends(get_current_user)):
    """Send reminders for all bookings scheduled for tomorrow"""
    try:
        # Calculate tomorrow's date
        tomorrow = (datetime.now(timezone.utc) + timedelta(days=1)).strftime('%Y-%m-%d')
        
        # Find all confirmed bookings for tomorrow that haven't received reminders
        pool = await get_pool()
        rows = await pool.fetch("SELECT * FROM bookings WHERE status = 'confirmed' AND date = $1 AND (reminder_sent IS NULL OR reminder_sent = FALSE)", tomorrow_date)
        bookings = [row_to_booking(r) for r in rows]
        
        sent_count = 0
        failed_count = 0
        
        for booking in bookings:
            success = await send_booking_reminder(booking)
            if success:
                # Mark reminder as sent
                pool = await get_pool()
                await pool.execute("UPDATE bookings SET reminder_sent = $1, reminder_sent_at = $2 WHERE id = $3", True, datetime.now(timezone.utc).isoformat(), booking['id'])
                sent_count += 1
            else:
                failed_count += 1
        
        return {
            "message": f"Reminders processed for {tomorrow}",
            "sent": sent_count,
            "failed": failed_count,
            "total_bookings": len(bookings)
        }
        
    except Exception as e:
        logger.error(f"Error sending tomorrow reminders: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/reminders/pending")
async def get_pending_reminders(current_user: dict = Depends(get_current_user)):
    """Get list of bookings pending reminders for tomorrow"""
    try:
        tomorrow = (datetime.now(timezone.utc) + timedelta(days=1)).strftime('%Y-%m-%d')
        
        pool = await get_pool()
        rows = await pool.fetch("SELECT * FROM bookings WHERE status = 'confirmed' AND date = $1 AND (reminder_sent IS NULL OR reminder_sent = FALSE)", tomorrow_date)
        bookings = [row_to_booking(r) for r in rows]
        
        return {
            "date": tomorrow,
            "pending_count": len(bookings),
            "bookings": bookings
        }
        
    except Exception as e:
        logger.error(f"Error fetching pending reminders: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# === DOMINAT8_ADMIN_DIAGNOSTICS_V1 ===
# Adds:
#  - GET  /health                 => confirms API is up (and optionally DB reachable)
#  - GET  /admin/bookings/latest  => shows latest bookings (requires ADMIN_TOKEN)
#  - POST /admin/bookings/test-write => writes a test booking (requires ADMIN_TOKEN)

import os
from datetime import datetime, timezone
from fastapi import HTTPException

ADMIN_TOKEN = os.getenv("ADMIN_TOKEN", "")

def _require_admin(x_admin_token: str | None):
    if not ADMIN_TOKEN:
        raise HTTPException(status_code=500, detail="ADMIN_TOKEN not set on server")
    if not x_admin_token or x_admin_token != ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="Unauthorized")

@router.get("/health")
async def health():
    # If DB is reachable, this should not throw
    ok_db = True
    err = None
    try:
        # lightweight ping: count 0/1 doc
        (await (await get_pool()).fetchval("SELECT COUNT(*) FROM bookings LIMIT 1"))
    except Exception as e:
        ok_db = False
        err = str(e)
    return {
        "ok": True,
        "service": "hibiscus-backend",
        "db_ok": ok_db,
        "db_error": err,
        "ts": datetime.now(timezone.utc).isoformat()
    }

@router.get("/admin/bookings/latest")
async def admin_latest_bookings(limit: int = 25, x_admin_token: str | None = None):
    _require_admin(x_admin_token)
    if limit < 1: limit = 1
    if limit > 200: limit = 200
    items = []
    cursor = db.bookings.find({}).sort("_id", -1).limit(limit)
    async for doc in cursor:
        # sanitize Mongo _id for JSON
        if "_id" in doc:
            doc["_id"] = str(doc["_id"])
        items.append(doc)
    return {"ok": True, "count": len(items), "items": items}

@router.post("/admin/bookings/test-write")
async def admin_test_write(x_admin_token: str | None = None):
    _require_admin(x_admin_token)
    now = datetime.now(timezone.utc)
    test_doc = {
        "id": "TEST_WRITE_" + now.strftime("%Y%m%d_%H%M%S"),
        "booking_ref": "TEST",
        "name": "TEST_WRITE",
        "email": "test@example.com",
        "phone": "000000000",
        "pickupAddress": "TEST",
        "dropoffAddress": "TEST",
        "date": now.strftime("%Y-%m-%d"),
        "time": now.strftime("%H:%M"),
        "passengers": 0,
        "notes": "TEST_WRITE - safe to delete later",
        "pricing": {"totalPrice": 0},
        "status": "test",
        "payment_status": "test",
        "serviceType": "test",
        "created_at_utc": now.isoformat()
    }
    pool = await get_pool()
    await pool.execute("""
        INSERT INTO bookings (id, booking_ref, name, email, phone, pickup_address,
            dropoff_address, date, time, passengers, notes, pricing, total_price,
            status, payment_status, service_type, created_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb,$13,$14,$15,$16,$17)
    """, test_doc.get("id"), test_doc.get("booking_ref"), test_doc.get("name"), test_doc.get("email"),
        test_doc.get("phone"), test_doc.get("pickupAddress", test_doc.get("pickup_address")),
        test_doc.get("dropoffAddress", test_doc.get("dropoff_address")),
        test_doc.get("date"), test_doc.get("time"), str(test_doc.get("passengers", "1")),
        test_doc.get("notes"), json.dumps(test_doc.get("pricing")) if test_doc.get("pricing") else None,
        float(test_doc.get("totalPrice", test_doc.get("total_price", 0)) or 0),
        test_doc.get("status", "pending"), test_doc.get("payment_status", "unpaid"),
        test_doc.get("serviceType", test_doc.get("service_type")),
        test_doc.get("createdAt", test_doc.get("created_at", datetime.utcnow().isoformat())))
    return {"ok": True, "insertedId": str(r.inserted_id), "test_id": test_doc["id"]}
# === /DOMINAT8_ADMIN_DIAGNOSTICS_V1 ===

# === HTA BREAK-GLASS ADMIN BOOTSTRAP (token-gated) ===
# POST /api/admin/bootstrap
# Header: x-admin-token: <ADMIN_TOKEN>
# Body: { "username": "...", "password": "..." }
import os
from typing import Optional

try:
    from pydantic import BaseModel
except Exception:
    BaseModel = object

try:
    # Prefer shared hashing from auth.py to match existing login verification
    from auth import hash_password as _hash_password  # type: ignore
except Exception:
    try:
        from auth import get_password_hash as _hash_password  # type: ignore
    except Exception:
        _hash_password = None

class _BootstrapBody(BaseModel):
    username: str
    password: str

@router.post("/admin/bootstrap")
async def admin_bootstrap(body: _BootstrapBody, x_admin_token: Optional[str] = None):
    expected = (os.getenv("ADMIN_TOKEN") or "").strip()
    provided = (x_admin_token or "").strip()
    if (not expected) or (provided != expected):
        return JSONResponse(status_code=401, content={"detail": "Unauthorized"})

    if _hash_password is None:
        return JSONResponse(status_code=500, content={"detail": "Password hashing not configured (auth.py hash function not found)"})

    pwd_hash = _hash_password(body.password)
    now = datetime.now(timezone.utc)

    pool = await get_pool()
    await pool.execute("UPDATE admins SET username = $1, password = $2, updated_at = $3 WHERE username = $4", body.username, pwd_hash, now.isoformat(), body.username)

    return {"ok": True, "username": body.username}
# === END BREAK-GLASS ADMIN BOOTSTRAP ===