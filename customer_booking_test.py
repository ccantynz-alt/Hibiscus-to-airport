#!/usr/bin/env python3
"""
Customer Booking Flow Test - Hibiscus to Airport
Tests the complete customer booking flow as reported by customer
"""

import requests
import json
import uuid
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/backend/.env')

# Configuration
BASE_URL = "https://hibiscus-airport-1.preview.emergentagent.com"
API_URL = f"{BASE_URL}/api"

def test_customer_booking_flow():
    """Test the complete customer booking flow as reported"""
    print("🚨 TESTING CUSTOMER BOOKING FLOW - PAYMENT & CONFIRMATION ISSUE")
    print("="*70)
    
    results = []
    
    # Step 1: Price Calculation API
    print("\n1. Testing Price Calculation API...")
    try:
        price_payload = {
            'pickupAddress': '10 Hibiscus Coast Highway, Orewa',
            'dropoffAddress': 'Auckland Airport',
            'passengers': 2
        }
        
        response = requests.post(f"{API_URL}/calculate-price", json=price_payload, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Price calculation successful:")
            print(f"   Distance: {data.get('distance', 'N/A')}km")
            print(f"   Base Price: ${data.get('basePrice', 'N/A')}")
            print(f"   Airport Fee: ${data.get('airportFee', 'N/A')}")
            print(f"   Passenger Fee: ${data.get('passengerFee', 'N/A')}")
            print(f"   Total Price: ${data.get('totalPrice', 'N/A')}")
            results.append(("Price Calculation", True, data))
        else:
            print(f"❌ Price calculation failed: HTTP {response.status_code}")
            print(f"   Response: {response.text}")
            results.append(("Price Calculation", False, f"HTTP {response.status_code}"))
            return results
            
    except Exception as e:
        print(f"❌ Price calculation error: {str(e)}")
        results.append(("Price Calculation", False, str(e)))
        return results
    
    # Step 2: Booking Creation
    print("\n2. Testing Booking Creation...")
    try:
        booking_data = {
            'name': 'Test Customer',
            'email': 'test@example.com',
            'phone': '+6421234567',
            'pickupAddress': '10 Hibiscus Coast Highway, Orewa',
            'dropoffAddress': 'Auckland International Airport',
            'date': '2025-12-25',
            'time': '10:00',
            'passengers': '2',
            'notes': 'Customer booking flow test',
            'pricing': data  # Use pricing from step 1
        }
        
        response = requests.post(f"{API_URL}/bookings", json=booking_data, timeout=30)
        
        if response.status_code == 200:
            booking_result = response.json()
            booking_id = booking_result.get('booking_id')
            booking_ref = booking_result.get('booking_ref', 'N/A')
            
            print(f"✅ Booking created successfully:")
            print(f"   Booking ID: {booking_id}")
            print(f"   Booking Reference: {booking_ref}")
            print(f"   Status: {booking_result.get('status', 'N/A')}")
            print(f"   Payment Status: {booking_result.get('payment_status', 'N/A')}")
            results.append(("Booking Creation", True, booking_result))
        else:
            print(f"❌ Booking creation failed: HTTP {response.status_code}")
            print(f"   Response: {response.text}")
            results.append(("Booking Creation", False, f"HTTP {response.status_code}"))
            return results
            
    except Exception as e:
        print(f"❌ Booking creation error: {str(e)}")
        results.append(("Booking Creation", False, str(e)))
        return results
    
    # Step 3: Stripe Checkout
    print("\n3. Testing Stripe Checkout...")
    try:
        checkout_payload = {'booking_id': booking_id}
        response = requests.post(f"{API_URL}/payment/create-checkout", json=checkout_payload, timeout=30)
        
        if response.status_code == 200:
            checkout_data = response.json()
            session_id = checkout_data.get('session_id')
            checkout_url = checkout_data.get('url')
            
            print(f"✅ Stripe checkout session created:")
            print(f"   Session ID: {session_id}")
            print(f"   Checkout URL: {checkout_url}")
            
            # Validate URL
            if 'checkout.stripe.com' in checkout_url:
                print(f"✅ Valid Stripe checkout URL")
                results.append(("Stripe Checkout", True, checkout_data))
            else:
                print(f"❌ Invalid Stripe checkout URL: {checkout_url}")
                results.append(("Stripe Checkout", False, "Invalid URL"))
        else:
            print(f"❌ Stripe checkout failed: HTTP {response.status_code}")
            print(f"   Response: {response.text}")
            results.append(("Stripe Checkout", False, f"HTTP {response.status_code}: {response.text}"))
            
    except Exception as e:
        print(f"❌ Stripe checkout error: {str(e)}")
        results.append(("Stripe Checkout", False, str(e)))
    
    # Step 4: Test Webhook Processing
    print("\n4. Testing Webhook Processing...")
    try:
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
        
        response = requests.post(f"{API_URL}/webhook/stripe", json=webhook_payload, timeout=30)
        
        if response.status_code == 200:
            print(f"✅ Webhook processed successfully")
            print(f"   Response: {response.json()}")
            results.append(("Webhook Processing", True, response.json()))
        else:
            print(f"❌ Webhook processing failed: HTTP {response.status_code}")
            print(f"   Response: {response.text}")
            results.append(("Webhook Processing", False, f"HTTP {response.status_code}"))
            
    except Exception as e:
        print(f"❌ Webhook processing error: {str(e)}")
        results.append(("Webhook Processing", False, str(e)))
    
    # Step 5: Check Backend Logs for Errors
    print("\n5. Checking Backend Logs for Errors...")
    try:
        import subprocess
        
        # Check error logs
        error_logs = subprocess.run(['tail', '-50', '/var/log/supervisor/backend.err.log'], 
                                  capture_output=True, text=True)
        
        # Check output logs for SMTP/email errors
        output_logs = subprocess.run(['tail', '-100', '/var/log/supervisor/backend.out.log'], 
                                   capture_output=True, text=True)
        
        print("📋 Recent Backend Error Logs:")
        if error_logs.stdout.strip():
            print(error_logs.stdout)
        else:
            print("   No recent errors in error log")
        
        print("\n📋 Checking for SMTP/Email errors in output logs:")
        smtp_errors = []
        email_errors = []
        
        for line in output_logs.stdout.split('\n'):
            if any(keyword in line.lower() for keyword in ['smtp', 'email', '535', 'authentication', 'password']):
                smtp_errors.append(line)
            if any(keyword in line.lower() for keyword in ['twilio', 'sms', 'notification']):
                email_errors.append(line)
        
        if smtp_errors:
            print("🚨 SMTP/Email related log entries found:")
            for error in smtp_errors[-5:]:  # Show last 5
                print(f"   {error}")
        else:
            print("   No SMTP/Email errors found in recent logs")
            
        if email_errors:
            print("📱 SMS/Notification related log entries:")
            for error in email_errors[-3:]:  # Show last 3
                print(f"   {error}")
        
        results.append(("Backend Logs Check", True, {"smtp_errors": len(smtp_errors), "sms_logs": len(email_errors)}))
        
    except Exception as e:
        print(f"❌ Log check error: {str(e)}")
        results.append(("Backend Logs Check", False, str(e)))
    
    # Step 6: Test Email/SMS Configuration
    print("\n6. Testing Email/SMS Configuration...")
    try:
        # Check environment variables
        smtp_config = {
            'SMTP_SERVER': os.environ.get('SMTP_SERVER'),
            'SMTP_PORT': os.environ.get('SMTP_PORT'),
            'SMTP_USERNAME': os.environ.get('SMTP_USERNAME'),
            'SMTP_PASSWORD': os.environ.get('SMTP_PASSWORD'),
            'SENDER_EMAIL': os.environ.get('SENDER_EMAIL')
        }
        
        twilio_config = {
            'TWILIO_ACCOUNT_SID': os.environ.get('TWILIO_ACCOUNT_SID'),
            'TWILIO_AUTH_TOKEN': os.environ.get('TWILIO_AUTH_TOKEN'),
            'TWILIO_PHONE_NUMBER': os.environ.get('TWILIO_PHONE_NUMBER')
        }
        
        print("📧 SMTP Configuration:")
        for key, value in smtp_config.items():
            if value:
                if 'PASSWORD' in key:
                    print(f"   {key}: {'*' * len(value)}")
                else:
                    print(f"   {key}: {value}")
            else:
                print(f"   {key}: ❌ MISSING")
        
        print("\n📱 Twilio Configuration:")
        for key, value in twilio_config.items():
            if value:
                if 'TOKEN' in key:
                    print(f"   {key}: {'*' * len(value)}")
                else:
                    print(f"   {key}: {value}")
            else:
                print(f"   {key}: ❌ MISSING")
        
        # Test SMTP connection
        try:
            import smtplib
            server = smtplib.SMTP(smtp_config['SMTP_SERVER'], int(smtp_config['SMTP_PORT']))
            server.starttls()
            server.login(smtp_config['SMTP_USERNAME'], smtp_config['SMTP_PASSWORD'])
            server.quit()
            print("✅ SMTP connection test successful")
            smtp_status = True
        except Exception as smtp_error:
            print(f"❌ SMTP connection failed: {str(smtp_error)}")
            smtp_status = False
        
        # Test Twilio credentials
        try:
            from twilio.rest import Client
            client = Client(twilio_config['TWILIO_ACCOUNT_SID'], twilio_config['TWILIO_AUTH_TOKEN'])
            account = client.api.accounts(twilio_config['TWILIO_ACCOUNT_SID']).fetch()
            print(f"✅ Twilio connection successful - Account Status: {account.status}")
            twilio_status = True
        except Exception as twilio_error:
            print(f"❌ Twilio connection failed: {str(twilio_error)}")
            twilio_status = False
        
        results.append(("Email/SMS Config", smtp_status and twilio_status, {
            "smtp_status": smtp_status,
            "twilio_status": twilio_status
        }))
        
    except Exception as e:
        print(f"❌ Configuration test error: {str(e)}")
        results.append(("Email/SMS Config", False, str(e)))
    
    return results

def main():
    """Run the customer booking flow test"""
    results = test_customer_booking_flow()
    
    print("\n" + "="*70)
    print("🎯 CUSTOMER BOOKING FLOW TEST SUMMARY")
    print("="*70)
    
    passed = sum(1 for _, success, _ in results if success)
    total = len(results)
    
    print(f"Total Tests: {total}")
    print(f"Passed: {passed}")
    print(f"Failed: {total - passed}")
    print(f"Success Rate: {(passed/total)*100:.1f}%")
    
    print("\n📋 Detailed Results:")
    for test_name, success, details in results:
        status = "✅" if success else "❌"
        print(f"{status} {test_name}")
        if not success:
            print(f"   Error: {details}")
    
    # Critical issues summary
    failed_tests = [name for name, success, _ in results if not success]
    if failed_tests:
        print(f"\n🚨 CRITICAL ISSUES FOUND:")
        for test in failed_tests:
            print(f"   - {test}")
        print("\n💡 CUSTOMER IMPACT:")
        if "Stripe Checkout" in failed_tests:
            print("   - Customers CANNOT make payments")
        if "Email/SMS Config" in failed_tests:
            print("   - Customers NOT receiving confirmation emails/SMS")
        if "Webhook Processing" in failed_tests:
            print("   - Payment confirmations NOT being processed")
    else:
        print("\n✅ ALL TESTS PASSED - Booking flow is working correctly")

if __name__ == "__main__":
    main()