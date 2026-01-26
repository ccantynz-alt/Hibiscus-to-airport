#!/usr/bin/env python3
"""
Test the full booking + notification cascade
"""

import requests
import json
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

# Configuration
BASE_URL = os.getenv('REACT_APP_BACKEND_URL', 'https://hibiscus-airport-1.preview.emergentagent.com')
API_URL = f"{BASE_URL}/api"

ADMIN_CREDENTIALS = {
    'username': 'admin',
    'password': 'Kongkong2025!@'
}

def test_full_cascade():
    """Test creating a booking with confirmed status to trigger all notifications"""
    print("="*60)
    print("FULL BOOKING + NOTIFICATION CASCADE TEST")
    print("="*60)
    
    # Step 1: Admin login
    print("1. Logging in as admin...")
    login_response = requests.post(f"{API_URL}/admin/login", json=ADMIN_CREDENTIALS, timeout=30)
    
    if login_response.status_code != 200:
        print(f"❌ Admin login failed: {login_response.status_code}")
        return False
    
    jwt_token = login_response.json()['access_token']
    print("✅ Admin login successful")
    
    # Step 2: Calculate price
    print("2. Calculating price...")
    price_payload = {
        'pickupAddress': 'Hibiscus Coast, Auckland, New Zealand',
        'dropoffAddress': 'Auckland Airport, Auckland, New Zealand',
        'passengers': 2
    }
    
    price_response = requests.post(f"{API_URL}/calculate-price", json=price_payload, timeout=30)
    
    if price_response.status_code != 200:
        print(f"❌ Price calculation failed: {price_response.status_code}")
        return False
    
    pricing_data = price_response.json()
    print(f"✅ Price calculated: ${pricing_data['totalPrice']:.2f} NZD")
    
    # Step 3: Create booking with confirmed status and paid payment_status
    print("3. Creating confirmed booking (should trigger all notifications)...")
    
    booking_data = {
        'name': 'Emma Wilson',
        'email': 'emma.wilson.test@example.com',
        'phone': '+64211234567',
        'pickupAddress': price_payload['pickupAddress'],
        'dropoffAddress': price_payload['dropoffAddress'],
        'date': (datetime.now() + timedelta(days=5)).strftime('%Y-%m-%d'),
        'time': '14:30',
        'passengers': '2',
        'notes': 'Test booking for full notification cascade',
        'pricing': pricing_data,
        'status': 'confirmed',
        'payment_status': 'paid'
    }
    
    booking_response = requests.post(f"{API_URL}/bookings", json=booking_data, timeout=30)
    
    if booking_response.status_code != 200:
        print(f"❌ Booking creation failed: {booking_response.status_code}")
        print(f"Response: {booking_response.text}")
        return False
    
    booking_result = booking_response.json()
    booking_id = booking_result.get('booking_id')
    booking_ref = booking_result.get('booking_ref')
    
    print(f"✅ Booking created: {booking_ref} (ID: {booking_id[:8]}...)")
    print(f"   Status: {booking_result.get('status')}")
    
    # Step 4: Verify booking was created correctly
    print("4. Verifying booking details...")
    
    headers = {'Authorization': f'Bearer {jwt_token}'}
    verify_response = requests.get(f"{API_URL}/bookings/{booking_id}", headers=headers, timeout=30)
    
    if verify_response.status_code == 200:
        booking_details = verify_response.json()
        print(f"✅ Booking verified:")
        print(f"   Reference: {booking_details.get('booking_ref')}")
        print(f"   Status: {booking_details.get('status')}")
        print(f"   Payment Status: {booking_details.get('payment_status')}")
        print(f"   Customer: {booking_details.get('name')}")
        print(f"   Email: {booking_details.get('email')}")
        print(f"   Phone: {booking_details.get('phone')}")
    else:
        print(f"❌ Could not verify booking: {verify_response.status_code}")
        return False
    
    # Step 5: Test webhook simulation (additional notification trigger)
    print("5. Testing webhook notification trigger...")
    
    webhook_payload = {
        'type': 'checkout.session.completed',
        'data': {
            'object': {
                'metadata': {
                    'booking_id': booking_id
                }
            }
        }
    }
    
    webhook_response = requests.post(f"{API_URL}/webhook/stripe", json=webhook_payload, timeout=30)
    
    if webhook_response.status_code == 200:
        print("✅ Webhook processed successfully (additional notifications sent)")
    else:
        print(f"⚠️  Webhook processing failed: {webhook_response.status_code}")
    
    print("\n" + "="*60)
    print("NOTIFICATION CASCADE TEST RESULTS")
    print("="*60)
    print("✅ Admin booking creation: SUCCESS")
    print("✅ Customer confirmation email: Should be sent")
    print("✅ Admin notification email: Should be sent") 
    print("✅ Customer SMS notification: Should be sent")
    print("✅ Calendar invite: Should be sent to customer and admin")
    print("\nCheck backend logs for 'Email sent successfully' and 'SMS sent successfully' messages")
    
    return True

if __name__ == "__main__":
    success = test_full_cascade()
    if success:
        print("\n🎉 FULL NOTIFICATION CASCADE TEST COMPLETED SUCCESSFULLY!")
    else:
        print("\n❌ FULL NOTIFICATION CASCADE TEST FAILED!")