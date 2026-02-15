#!/bin/bash

# Test script for admin API endpoints
# Tests the fixed admin login and bookings functionality

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# API Base URL - change this to your deployment URL
API_URL="${API_URL:-https://api.hibiscustoairport.co.nz}"

echo "================================"
echo "Testing Hibiscus to Airport API"
echo "API URL: $API_URL"
echo "================================"
echo

# Test 1: Health check
echo -e "${YELLOW}Test 1: Health Check${NC}"
response=$(curl -s -w "\n%{http_code}" "$API_URL/health")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✓ Health check passed${NC}"
    echo "Response: $body"
else
    echo -e "${RED}✗ Health check failed (HTTP $http_code)${NC}"
    echo "Response: $body"
fi
echo

# Test 2: Debug stamp
echo -e "${YELLOW}Test 2: Debug Stamp${NC}"
response=$(curl -s -w "\n%{http_code}" "$API_URL/debug/stamp")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✓ Debug stamp accessible${NC}"
    echo "Response: $body"
else
    echo -e "${RED}✗ Debug stamp failed (HTTP $http_code)${NC}"
    echo "Response: $body"
fi
echo

# Test 3: Admin login
echo -e "${YELLOW}Test 3: Admin Login${NC}"
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL/api/admin/login" \
    -H "Content-Type: application/json" \
    -d '{"username": "admin", "password": "Kongkong2025!@"}')
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✓ Admin login successful${NC}"
    echo "Response: $body"
    
    # Extract token for next tests
    TOKEN=$(echo "$body" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
    if [ -n "$TOKEN" ]; then
        echo "Token extracted: ${TOKEN:0:20}..."
    fi
else
    echo -e "${RED}✗ Admin login failed (HTTP $http_code)${NC}"
    echo "Response: $body"
fi
echo

# Test 4: Get bookings (requires auth)
if [ -n "$TOKEN" ]; then
    echo -e "${YELLOW}Test 4: Get Bookings (Authenticated)${NC}"
    response=$(curl -s -w "\n%{http_code}" "$API_URL/api/bookings" \
        -H "Authorization: Bearer $TOKEN")
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✓ Bookings endpoint accessible${NC}"
        # Count bookings
        booking_count=$(echo "$body" | grep -o '"id":' | wc -l)
        echo "Found $booking_count booking(s)"
    else
        echo -e "${RED}✗ Bookings endpoint failed (HTTP $http_code)${NC}"
        echo "Response: $body"
    fi
    echo
else
    echo -e "${YELLOW}Test 4: Skipped (no auth token)${NC}"
    echo
fi

# Summary
echo "================================"
echo "Test Summary"
echo "================================"
echo "Check the results above to verify all endpoints are working correctly."
echo
echo "If any tests failed, check:"
echo "1. Render deployment is running"
echo "2. Environment variables are set (MONGO_URL, DB_NAME, etc.)"
echo "3. MongoDB is accessible from Render"
echo "4. Recent code changes have been deployed"
echo
