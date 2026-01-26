#!/usr/bin/env python3
"""
Additional specific tests for the review request
"""

import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

# Configuration
BASE_URL = os.getenv('REACT_APP_BACKEND_URL', 'https://hibiscus-airport-1.preview.emergentagent.com')
API_URL = f"{BASE_URL}/api"

def test_specific_scenarios():
    """Test the exact scenarios from the review request"""
    print("="*60)
    print("ADDITIONAL SPECIFIC TESTS FROM REVIEW REQUEST")
    print("="*60)
    
    # 1. Admin Login Test with exact credentials
    print("1. Testing Admin Login with exact credentials...")
    admin_response = requests.post(f"{API_URL}/admin/login", json={
        'username': 'admin',
        'password': 'Kongkong2025!@'
    })
    
    if admin_response.status_code == 200:
        jwt_token = admin_response.json()['access_token']
        print("✅ Admin login successful, JWT token received")
    else:
        print(f"❌ Admin login failed: {admin_response.status_code}")
        return
    
    # 2. Test Admin Endpoints
    print("\n2. Testing Admin Endpoints...")
    headers = {'Authorization': f'Bearer {jwt_token}'}
    
    # GET /api/bookings
    bookings_response = requests.get(f"{API_URL}/bookings", headers=headers)
    if bookings_response.status_code == 200:
        bookings = bookings_response.json()
        print(f"✅ GET /api/bookings successful - {len(bookings)} bookings retrieved")
    else:
        print(f"❌ GET /api/bookings failed: {bookings_response.status_code}")
    
    # GET /api/seo/pages
    seo_response = requests.get(f"{API_URL}/seo/pages", headers=headers)
    if seo_response.status_code == 200:
        seo_pages = seo_response.json()
        print(f"✅ GET /api/seo/pages successful - {len(seo_pages)} pages retrieved")
    else:
        print(f"❌ GET /api/seo/pages failed: {seo_response.status_code}")
    
    # 3. Customer Booking Flow
    print("\n3. Testing Customer Booking Flow...")
    
    # Calculate price with exact addresses from review
    price_payload = {
        'pickupAddress': 'Orewa, Auckland, New Zealand',
        'dropoffAddress': 'Auckland Airport, New Zealand',
        'passengers': 2
    }
    
    price_response = requests.post(f"{API_URL}/calculate-price", json=price_payload)
    if price_response.status_code == 200:
        pricing_data = price_response.json()
        print(f"✅ Price calculation successful:")
        print(f"   Distance: {pricing_data['distance']}km")
        print(f"   Total Price: ${pricing_data['totalPrice']} NZD")
    else:
        print(f"❌ Price calculation failed: {price_response.status_code}")
        return
    
    # Create booking with full data
    booking_payload = {
        'name': 'John Smith',
        'email': 'john.smith@example.com',
        'phone': '+64211234567',
        'pickupAddress': 'Orewa, Auckland, New Zealand',
        'dropoffAddress': 'Auckland Airport, New Zealand',
        'date': '2025-01-20',
        'time': '10:00',
        'passengers': '2',
        'notes': 'Test booking from review request',
        'pricing': pricing_data
    }
    
    booking_response = requests.post(f"{API_URL}/bookings", json=booking_payload)
    if booking_response.status_code == 200:
        booking_data = booking_response.json()
        booking_id = booking_data['booking_id']
        print(f"✅ Booking created successfully - ID: {booking_id[:8]}...")
    else:
        print(f"❌ Booking creation failed: {booking_response.status_code}")
        return
    
    # Create Stripe checkout
    checkout_payload = {'booking_id': booking_id}
    checkout_response = requests.post(f"{API_URL}/payment/create-checkout", json=checkout_payload)
    if checkout_response.status_code == 200:
        checkout_data = checkout_response.json()
        if 'checkout.stripe.com' in checkout_data['url']:
            print("✅ Stripe checkout URL created successfully")
        else:
            print(f"❌ Invalid Stripe URL: {checkout_data['url']}")
    else:
        print(f"❌ Stripe checkout failed: {checkout_response.status_code}")
    
    # 4. Check for common errors
    print("\n4. Checking for common errors...")
    
    # Test non-existent endpoint
    error_response = requests.get(f"{API_URL}/non-existent-endpoint")
    if error_response.status_code == 404:
        print("✅ 404 handling works correctly")
    else:
        print(f"❌ Unexpected response for 404 test: {error_response.status_code}")
    
    # Test invalid booking ID for payment
    invalid_checkout = requests.post(f"{API_URL}/payment/create-checkout", json={'booking_id': 'invalid-id'})
    if invalid_checkout.status_code == 404:
        print("✅ Invalid booking ID properly rejected")
    else:
        print(f"❌ Invalid booking ID handling: {invalid_checkout.status_code}")
    
    print("\n" + "="*60)
    print("ADDITIONAL TESTS COMPLETED")
    print("="*60)

if __name__ == "__main__":
    test_specific_scenarios()