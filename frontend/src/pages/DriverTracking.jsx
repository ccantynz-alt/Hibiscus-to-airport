import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { 
  MapPin, Clock, User, Navigation, Loader2, CheckCircle, 
  AlertCircle, Car, Phone
} from 'lucide-react';
import { Button } from '../components/ui/button';
import axios from 'axios';

import { BACKEND_URL } from '../config';


const DriverTracking = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trackingActive, setTrackingActive] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [etaMinutes, setEtaMinutes] = useState(null);
  const [smsSent, setSmsSent] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const watchIdRef = useRef(null);
  const updateIntervalRef = useRef(null);

  useEffect(() => {
    fetchBookingDetails();
    return () => {
      stopTracking();
    };
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      // First try using the public tracking endpoint
      try {
        const trackingRes = await axios.get(`${BACKEND_URL}/api/tracking/${bookingId}`);
        const trackingData = trackingRes.data;
        
        setBooking({
          id: bookingId,
          booking_ref: trackingData.booking_ref,
          name: trackingData.customer_name,
          phone: trackingData.customer_phone || '',
          pickupAddress: trackingData.pickup_address,
          dropoffAddress: trackingData.dropoff_address,
          time: trackingData.pickup_time,
          date: trackingData.pickup_date,
          assigned_driver_id: trackingData.driver?.id,
          assigned_driver_name: trackingData.driver?.name,
          tracking_status: trackingData.tracking_status
        });
        
        if (trackingData.driver) {
          setDriver(trackingData.driver);
        }
        return;
      } catch (trackingError) {
        // If tracking not found, try with auth token
        console.log('Tracking endpoint not available, trying authenticated endpoint');
      }
      
      // Fallback to authenticated endpoint
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No authentication token');
      }
      
      const response = await axios.get(`${BACKEND_URL}/api/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBooking(response.data);
      
      // Get driver info
      if (response.data.assigned_driver_id) {
        const driverRes = await axios.get(`${BACKEND_URL}/api/drivers/${response.data.assigned_driver_id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDriver(driverRes.data);
      }
    } catch (error) {
      console.error('Error fetching booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const requestLocationPermission = async () => {
    if (!navigator.geolocation) {
      setLocationError('GPS not supported on this device');
      return;
    }

    try {
      // Request permission
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000
        });
      });
      
      setPermissionGranted(true);
      setCurrentLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
      
      // Start continuous tracking
      startContinuousTracking();
      
    } catch (error) {
      console.error('Location permission error:', error);
      if (error.code === 1) {
        setLocationError('Location permission denied. Please enable GPS.');
      } else {
        setLocationError('Unable to get location. Please try again.');
      }
    }
  };

  const startContinuousTracking = () => {
    setTrackingActive(true);
    
    // Watch position continuously
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });
        setLocationError(null);
      },
      (error) => {
        console.error('Location watch error:', error);
        setLocationError('GPS signal lost. Please ensure GPS is enabled.');
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000
      }
    );

    // Send location updates every 30 seconds
    updateIntervalRef.current = setInterval(() => {
      sendLocationUpdate();
    }, 30000);

    // Send first update immediately
    setTimeout(sendLocationUpdate, 1000);
  };

  const sendLocationUpdate = async () => {
    if (!currentLocation || !driver || !booking) return;
    
    try {
      const response = await axios.post(`${BACKEND_URL}/api/tracking/update-location`, {
        driver_id: driver.id,
        booking_id: bookingId,
        latitude: currentLocation.lat,
        longitude: currentLocation.lng
      });
      
      setEtaMinutes(response.data.eta_minutes);
      
      if (response.data.sms_sent && !smsSent) {
        setSmsSent(true);
      }
    } catch (error) {
      console.error('Error sending location update:', error);
    }
  };

  // Send update whenever location changes
  useEffect(() => {
    if (trackingActive && currentLocation && driver) {
      sendLocationUpdate();
    }
  }, [currentLocation]);

  const stopTracking = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
      updateIntervalRef.current = null;
    }
    setTrackingActive(false);
  };

  const handleArrived = async () => {
    try {
      await axios.post(`${BACKEND_URL}/api/tracking/stop/${bookingId}`);
      stopTracking();
      alert('✅ Trip marked as arrived!');
    } catch (error) {
      console.error('Error stopping tracking:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-gold" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-bold mb-2">Booking Not Found</h2>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-black p-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gold rounded-full flex items-center justify-center">
            <Car className="w-6 h-6 text-black" />
          </div>
          <div>
            <h1 className="font-bold">Driver Tracking</h1>
            <p className="text-sm text-gray-400">#{booking.booking_ref}</p>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-lg mx-auto">
        {/* Tracking Status */}
        {trackingActive ? (
          <Card className="mb-4 bg-green-900 border-green-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="font-bold text-green-400">GPS ACTIVE - TRACKING CUSTOMER</span>
              </div>
              
              {etaMinutes !== null && (
                <div className="bg-black/30 p-4 rounded-lg text-center mb-3">
                  <p className="text-sm text-gray-400">ETA to Pickup</p>
                  <p className="text-4xl font-bold text-white">{etaMinutes} min</p>
                </div>
              )}
              
              {smsSent && (
                <div className="flex items-center gap-2 text-green-400 bg-green-900/50 p-2 rounded mb-3">
                  <CheckCircle className="w-5 h-5" />
                  <span>Customer notified (10 min SMS sent)</span>
                </div>
              )}
              
              {currentLocation && (
                <p className="text-xs text-gray-500 mb-3">
                  📍 {currentLocation.lat.toFixed(5)}, {currentLocation.lng.toFixed(5)}
                </p>
              )}
              
              <Button 
                onClick={handleArrived}
                className="w-full bg-green-600 hover:bg-green-700 text-white text-lg py-6"
              >
                <CheckCircle className="w-6 h-6 mr-2" />
                I'VE ARRIVED
              </Button>
            </CardContent>
          </Card>
        ) : !permissionGranted ? (
          <Card className="mb-4 bg-blue-900 border-blue-700">
            <CardContent className="p-6 text-center">
              <Navigation className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Enable GPS Tracking</h2>
              <p className="text-gray-400 mb-6">
                Tap the button below to start sharing your location. 
                The customer will be notified when you're 10 minutes away.
              </p>
              
              {locationError && (
                <div className="flex items-center gap-2 text-red-400 bg-red-900/50 p-3 rounded mb-4">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm">{locationError}</span>
                </div>
              )}
              
              <Button 
                onClick={requestLocationPermission}
                className="w-full bg-gold hover:bg-amber-500 text-black text-lg py-6"
              >
                <Navigation className="w-6 h-6 mr-2" />
                START TRACKING
              </Button>
              
              <p className="text-xs text-gray-500 mt-4">
                Once started, you can put your phone down. GPS runs automatically.
              </p>
            </CardContent>
          </Card>
        ) : null}

        {/* Job Details */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <h3 className="text-sm font-medium text-gray-400 mb-3">JOB DETAILS</h3>
            
            <div className="space-y-4">
              {/* Customer */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{booking.name}</p>
                  <p className="text-sm text-gray-400">{booking.phone}</p>
                </div>
                <a 
                  href={`tel:${booking.phone}`}
                  className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center"
                >
                  <Phone className="w-5 h-5" />
                </a>
              </div>
              
              {/* Pickup */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">PICKUP</p>
                  <p className="text-sm">{booking.pickupAddress}</p>
                </div>
              </div>
              
              {/* Dropoff */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-red-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">DROP-OFF</p>
                  <p className="text-sm">{booking.dropoffAddress}</p>
                </div>
              </div>
              
              {/* Time */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-900 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">PICKUP TIME</p>
                  <p className="text-lg font-bold">{booking.time}</p>
                  <p className="text-sm text-gray-400">{booking.date}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DriverTracking;
