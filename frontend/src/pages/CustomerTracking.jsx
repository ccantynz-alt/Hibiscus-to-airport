import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { 
  MapPin, Clock, User, Phone, Car, Navigation, 
  Loader2, AlertCircle, CheckCircle
} from 'lucide-react';
import axios from 'axios';

import { BACKEND_URL } from '../config';

const GOOGLE_MAPS_API_KEY = 'AIzaSyCPYWgE0UL9VXaT9GxZTWiQb2kTXJpWvco';

// Format date in NZ format (DD/MM/YYYY)
const formatDateNZ = (dateStr) => {
  if (!dateStr) return 'N/A';
  try {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
};

const CustomerTracking = () => {
  const { trackingRef } = useParams();
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const driverMarkerRef = useRef(null);
  const pickupMarkerRef = useRef(null);

  useEffect(() => {
    fetchTrackingData();
    
    // Poll for updates every 10 seconds
    const interval = setInterval(fetchTrackingData, 10000);
    
    return () => clearInterval(interval);
  }, [trackingRef]);

  useEffect(() => {
    if (trackingData && trackingData.location) {
      initOrUpdateMap();
    }
  }, [trackingData]);

  const fetchTrackingData = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/tracking/${trackingRef}`);
      setTrackingData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching tracking data:', err);
      if (err.response?.status === 404) {
        setError('Tracking not found. The driver may not have started yet.');
      } else {
        setError('Unable to load tracking data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const initOrUpdateMap = () => {
    if (!trackingData?.location || !window.google) return;

    const { lat, lng } = trackingData.location;

    if (!mapInstanceRef.current && mapRef.current) {
      // Initialize map
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
        center: { lat, lng },
        zoom: 14,
        disableDefaultUI: true,
        zoomControl: true,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      // Driver marker (car icon)
      driverMarkerRef.current = new window.google.maps.Marker({
        position: { lat, lng },
        map: mapInstanceRef.current,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40">
              <circle cx="12" cy="12" r="12" fill="#FFD700"/>
              <text x="12" y="17" text-anchor="middle" font-size="14">🚗</text>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(40, 40),
          anchor: new window.google.maps.Point(20, 20)
        },
        title: 'Driver Location'
      });

      // Pickup marker
      if (trackingData.pickup_address) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode({ address: trackingData.pickup_address }, (results, status) => {
          if (status === 'OK' && results[0]) {
            pickupMarkerRef.current = new window.google.maps.Marker({
              position: results[0].geometry.location,
              map: mapInstanceRef.current,
              icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="36" height="36">
                    <circle cx="12" cy="12" r="10" fill="#22C55E"/>
                    <text x="12" y="16" text-anchor="middle" font-size="12" fill="white">📍</text>
                  </svg>
                `),
                scaledSize: new window.google.maps.Size(36, 36),
                anchor: new window.google.maps.Point(18, 18)
              },
              title: 'Pickup Location'
            });

            // Fit bounds to show both markers
            const bounds = new window.google.maps.LatLngBounds();
            bounds.extend({ lat, lng });
            bounds.extend(results[0].geometry.location);
            mapInstanceRef.current.fitBounds(bounds, { padding: 50 });
          }
        });
      }
    } else if (driverMarkerRef.current) {
      // Update driver marker position
      driverMarkerRef.current.setPosition({ lat, lng });
      mapInstanceRef.current.panTo({ lat, lng });
    }
  };

  // Load Google Maps script
  useEffect(() => {
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}`;
      script.async = true;
      script.onload = () => {
        if (trackingData?.location) {
          initOrUpdateMap();
        }
      };
      document.head.appendChild(script);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-gold mx-auto mb-3" />
          <p className="text-gray-600">Loading tracking info...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h2 className="text-lg font-bold mb-2">Tracking Not Available</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <p className="text-sm text-gray-500">
              You'll receive an SMS when your driver is on the way.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-black text-white p-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gold rounded-full flex items-center justify-center">
              <Car className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="font-bold">Track Your Driver</h1>
              <p className="text-sm text-gray-400">Booking #{trackingData?.booking_ref}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto p-4">
        {/* Status Card */}
        <Card className="mb-4">
          <CardContent className="p-4">
            {trackingData?.tracking_status === 'driver_on_way' ? (
              <div className="flex items-center gap-3 mb-4">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-bold text-green-700">Driver On The Way</span>
              </div>
            ) : trackingData?.tracking_status === 'arrived' ? (
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="font-bold text-green-700">Driver Has Arrived!</span>
              </div>
            ) : (
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-5 h-5 text-orange-500" />
                <span className="font-medium text-orange-700">Waiting for driver to start</span>
              </div>
            )}

            {/* ETA Display */}
            {trackingData?.eta_minutes !== null && trackingData?.eta_minutes !== undefined && (
              <div className="bg-blue-50 p-4 rounded-lg text-center mb-4">
                <p className="text-sm text-blue-600 mb-1">Estimated Arrival</p>
                <p className="text-4xl font-bold text-blue-700">{trackingData.eta_minutes}</p>
                <p className="text-sm text-blue-600">minutes</p>
              </div>
            )}

            {/* Driver Info */}
            {trackingData?.driver && (
              <div className="border-t pt-4">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Your Driver</h3>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-lg">{trackingData.driver.name}</p>
                    <p className="text-sm text-gray-500">{trackingData.driver.vehicle}</p>
                  </div>
                  {trackingData.driver.phone && (
                    <a 
                      href={`tel:${trackingData.driver.phone}`}
                      className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white"
                    >
                      <Phone className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Map */}
        {trackingData?.location ? (
          <Card className="mb-4 overflow-hidden">
            <div 
              ref={mapRef} 
              className="w-full h-64 bg-gray-200"
            />
          </Card>
        ) : (
          <Card className="mb-4">
            <CardContent className="p-8 text-center text-gray-500">
              <Navigation className="w-10 h-10 mx-auto mb-3 text-gray-300" />
              <p>Map will appear when driver starts the trip</p>
            </CardContent>
          </Card>
        )}

        {/* Trip Details */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Trip Details</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Pickup</p>
                  <p className="font-medium">{trackingData?.pickup_address}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Drop-off</p>
                  <p className="font-medium">{trackingData?.dropoff_address}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Scheduled Pickup</p>
                  <p className="font-medium">{formatDateNZ(trackingData?.pickup_date)} at {trackingData?.pickup_time}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">Hibiscus to Airport</p>
          <p className="text-xs text-gray-400">Premium Airport Shuttle Service</p>
        </div>
      </div>
    </div>
  );
};

export default CustomerTracking;
