import React, { useState, useEffect } from 'react';
import { MapPin, Clock } from 'lucide-react';

// Hibiscus Coast suburbs for realistic data
const SUBURBS = [
  'Orewa', 'Silverdale', 'Whangaparaoa', 'Red Beach', 'Stanmore Bay',
  'Gulf Harbour', 'Army Bay', 'Millwater', 'Hatfields Beach', 'Waiwera',
  'Puhoi', 'Warkworth', 'Snells Beach', 'Algies Bay', 'Matakana',
  'Leigh', 'Omaha', 'Point Wells', 'Mangawhai', 'Kaiwaka'
];

const FIRST_NAMES = [
  'Sarah', 'Michael', 'Emma', 'James', 'Sophie', 'David', 'Olivia', 'Daniel',
  'Charlotte', 'William', 'Grace', 'Thomas', 'Emily', 'Benjamin', 'Hannah',
  'Jack', 'Mia', 'Samuel', 'Chloe', 'Oliver', 'Ella', 'Joshua', 'Amelia',
  'Ethan', 'Jessica', 'Lucas', 'Lily', 'Mason', 'Zoe', 'Noah'
];

const generateBooking = () => {
  const name = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const suburb = SUBURBS[Math.floor(Math.random() * SUBURBS.length)];
  const minutesAgo = Math.floor(Math.random() * 30) + 1; // 1-30 mins ago
  
  return {
    name,
    suburb,
    minutesAgo,
    type: Math.random() > 0.3 ? 'airport transfer' : 'return trip'
  };
};

const LiveBookingsTicker = () => {
  const [currentBooking, setCurrentBooking] = useState(generateBooking());
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Initial delay before first show
    const initialDelay = setTimeout(() => {
      setIsVisible(true);
    }, 5000); // Show first notification after 5 seconds

    return () => clearTimeout(initialDelay);
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    // Hide after 6 seconds
    const hideTimer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        setIsVisible(false);
        setIsExiting(false);
        setCurrentBooking(generateBooking());
        
        // Show next notification after random interval (15-45 seconds)
        setTimeout(() => {
          setIsVisible(true);
        }, Math.random() * 30000 + 15000);
      }, 500);
    }, 6000);

    return () => clearTimeout(hideTimer);
  }, [isVisible, currentBooking]);

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed bottom-4 left-4 z-50 max-w-sm transition-all duration-500 ${
        isExiting 
          ? 'opacity-0 translate-x-[-100%]' 
          : 'opacity-100 translate-x-0'
      }`}
    >
      <div className="bg-white rounded-lg shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2">
          <div className="flex items-center">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <span className="text-white text-xs font-semibold uppercase tracking-wide">Live Booking</span>
          </div>
        </div>
        
        {/* Content */}
        <div className="px-4 py-3">
          <div className="flex items-start space-x-3">
            {/* Avatar */}
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {currentBooking.name.charAt(0)}
            </div>
            
            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">
                <span className="font-semibold">{currentBooking.name}</span>
                <span className="text-gray-600"> from </span>
                <span className="font-semibold text-amber-600">{currentBooking.suburb}</span>
              </p>
              <p className="text-sm text-gray-600 mt-0.5">
                just booked an {currentBooking.type}
              </p>
              <div className="flex items-center mt-1 text-xs text-gray-400">
                <Clock className="w-3 h-3 mr-1" />
                {currentBooking.minutesAgo} {currentBooking.minutesAgo === 1 ? 'minute' : 'minutes'} ago
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="bg-gray-50 px-4 py-2 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-xs text-gray-500">
              <MapPin className="w-3 h-3 mr-1" />
              <span>Hibiscus Coast → Airport</span>
            </div>
            <span className="text-xs font-medium text-emerald-600">✓ Verified</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveBookingsTicker;
