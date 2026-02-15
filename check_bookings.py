#!/usr/bin/env python3
"""
Quick script to check bookings in the database
"""
import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

async def check_bookings():
    mongo_url = os.getenv('MONGO_URL')
    db_name = os.getenv('DB_NAME', 'hibiscus_shuttle')
    
    if not mongo_url:
        print("ERROR: MONGO_URL not set in environment")
        return
    
    print(f"Connecting to database: {db_name}")
    print(f"MongoDB URL: {mongo_url[:20]}...{mongo_url[-10:]}")
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    # Check bookings collection
    bookings_count = await db.bookings.count_documents({})
    print(f"\n✓ Bookings collection: {bookings_count} documents")
    
    if bookings_count > 0:
        print("\nFirst 5 bookings:")
        bookings = await db.bookings.find({}, {"_id": 0}).sort("createdAt", -1).limit(5).to_list(5)
        for i, booking in enumerate(bookings, 1):
            print(f"\n{i}. Ref: {booking.get('booking_ref', 'N/A')}")
            print(f"   Name: {booking.get('name', 'N/A')}")
            print(f"   Date: {booking.get('date', 'N/A')} {booking.get('time', 'N/A')}")
            print(f"   Status: {booking.get('status', 'N/A')}")
            print(f"   Payment: {booking.get('payment_status', 'N/A')}")
    else:
        print("\n⚠ No bookings found in database")
        print("This could mean:")
        print("  - The database is new/empty")
        print("  - Bookings are in a different collection")
        print("  - Wrong database name is configured")
    
    # List all collections
    collections = await db.list_collection_names()
    print(f"\n✓ Available collections in '{db_name}':")
    for coll in collections:
        count = await db[coll].count_documents({})
        print(f"   - {coll}: {count} documents")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(check_bookings())
