#!/usr/bin/env python3
"""
Direct test of notification functions from utils.py
"""

import sys
import os
sys.path.append('/app/backend')

# Load environment variables first
from dotenv import load_dotenv
load_dotenv('/app/backend/.env')

from utils import send_email, send_sms, send_customer_confirmation, send_admin_notification
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def test_direct_email():
    """Test sending a simple email directly"""
    print("Testing direct email sending...")
    
    try:
        result = send_email(
            to_email="test@example.com",
            subject="Test Email from Hibiscus to Airport",
            body="<p>This is a test email to verify SMTP functionality.</p>"
        )
        
        if result:
            print("✅ Direct email test: SUCCESS")
            return True
        else:
            print("❌ Direct email test: FAILED")
            return False
    except Exception as e:
        print(f"❌ Direct email test: ERROR - {str(e)}")
        return False

def test_direct_sms():
    """Test sending a simple SMS directly"""
    print("Testing direct SMS sending...")
    
    try:
        result = send_sms(
            to_phone="+64211234567",
            message="Test SMS from Hibiscus to Airport notification system."
        )
        
        if result:
            print("✅ Direct SMS test: SUCCESS")
            return True
        else:
            print("❌ Direct SMS test: FAILED")
            return False
    except Exception as e:
        print(f"❌ Direct SMS test: ERROR - {str(e)}")
        return False

def test_customer_confirmation():
    """Test customer confirmation email function"""
    print("Testing customer confirmation email...")
    
    test_booking = {
        'booking_ref': 'H999',
        'name': 'Test Customer',
        'email': 'test.customer@example.com',
        'phone': '+64211234567',
        'pickupAddress': 'Orewa, Auckland, New Zealand',
        'dropoffAddress': 'Auckland Airport, Auckland, New Zealand',
        'date': '2025-12-20',
        'time': '14:30',
        'passengers': '2',
        'pricing': {
            'distance': 52.47,
            'basePrice': 150.00,
            'airportFee': 10.00,
            'passengerFee': 5.00,
            'totalPrice': 165.00
        }
    }
    
    try:
        result = send_customer_confirmation(test_booking)
        
        if result:
            print("✅ Customer confirmation email test: SUCCESS")
            return True
        else:
            print("❌ Customer confirmation email test: FAILED")
            return False
    except Exception as e:
        print(f"❌ Customer confirmation email test: ERROR - {str(e)}")
        return False

def test_admin_notification():
    """Test admin notification email function"""
    print("Testing admin notification email...")
    
    test_booking = {
        'booking_ref': 'H999',
        'name': 'Test Customer',
        'email': 'test.customer@example.com',
        'phone': '+64211234567',
        'pickupAddress': 'Orewa, Auckland, New Zealand',
        'dropoffAddress': 'Auckland Airport, Auckland, New Zealand',
        'date': '2025-12-20',
        'time': '14:30',
        'passengers': '2',
        'pricing': {
            'totalPrice': 165.00
        },
        'payment_status': 'paid'
    }
    
    try:
        result = send_admin_notification(test_booking)
        
        if result:
            print("✅ Admin notification email test: SUCCESS")
            return True
        else:
            print("❌ Admin notification email test: FAILED")
            return False
    except Exception as e:
        print(f"❌ Admin notification email test: ERROR - {str(e)}")
        return False

def main():
    print("="*60)
    print("DIRECT NOTIFICATION FUNCTION TESTING")
    print("="*60)
    
    results = []
    
    # Test each notification function
    results.append(test_direct_email())
    results.append(test_direct_sms())
    results.append(test_customer_confirmation())
    results.append(test_admin_notification())
    
    print("\n" + "="*60)
    print("DIRECT NOTIFICATION TEST SUMMARY")
    print("="*60)
    
    passed = sum(results)
    total = len(results)
    
    print(f"Total Tests: {total}")
    print(f"Passed: {passed}")
    print(f"Failed: {total - passed}")
    print(f"Success Rate: {(passed/total)*100:.1f}%")
    
    if passed == total:
        print("\n🎉 ALL NOTIFICATION FUNCTIONS WORKING CORRECTLY!")
    else:
        print(f"\n⚠️  {total - passed} NOTIFICATION FUNCTIONS FAILED!")

if __name__ == "__main__":
    main()