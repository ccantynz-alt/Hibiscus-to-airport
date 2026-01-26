import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { 
  MapPin, Clock, User, Phone, Navigation, CheckCircle, 
  Loader2, AlertCircle, Car, ArrowLeft
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const DriverPortal = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [driver, setDriver] = useState(null);
  const [todaysBookings, setTodaysBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTracking, setActiveTracking] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [etaMinutes, setEtaMinutes] = useState(null);
  const [smsSent, setSmsSent] = useState(false);
  const watchIdRef = useRef(null);
  const updateIntervalRef = useRef(null);

  // Craig Canty's driver info (for testing)
  const CRAIG_DRIVER_ID = 'craig-canty-driver';

  useEffect(() => {
    fetchDriverAndBookings();
    return () => {
      // Cleanup on unmount
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, []);

  const fetchDriverAndBookings = async () => {
    try {
      setLoading(true);
      
      // Get admin token (for now, driver uses admin auth)
      const token = localStorage.getItem('adminToken');
      
      // Fetch all drivers and find Craig
      const driversRes = await axios.get(`${BACKEND_URL}/api/drivers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      let craigDriver = driversRes.data.find(d => 
        d.name?.toLowerCase().includes('craig') || d.id === CRAIG_DRIVER_ID
      );
      
      // If Craig doesn't exist, create him
      if (!craigDriver) {
        const createRes = await axios.post(`${BACKEND_URL}/api/drivers`, {
          name: 'Craig Canty',
          phone: '+64211234567',
          email: 'craig@bookaride.co.nz',
          vehicle: 'Toyota Hiace - White',
          license: 'ABC123'
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        craigDriver = { id: createRes.data.id, name: 'Craig Canty', vehicle: 'Toyota Hiace - White' };
      }
      
      setDriver(craigDriver);
      
      // Fetch today's bookings
      const bookingsRes = await axios.get(`${BACKEND_URL}/api/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Filter for today and tomorrow, confirmed bookings
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const todayStr = today.toISOString().split('T')[0];
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      
      const relevantBookings = bookingsRes.data.filter(b => {
        const bookingDate = b.date;
        return (bookingDate === todayStr || bookingDate === tomorrowStr) && 
               b.status === 'confirmed' && 
               b.payment_status === 'paid';
      });
      
      // Sort by date and time
      relevantBookings.sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.time.localeCompare(b.time);
      });
      
      setTodaysBookings(relevantBookings);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load bookings',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const startTracking = async (booking) => {
    if (!driver) {
      toast({ title: 'Error', description: 'Driver not found', variant: 'destructive' });
      return;
    }

    // Check for geolocation support
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      
      // Start tracking on backend
      const response = await axios.post(`${BACKEND_URL}/api/tracking/start`, {
        booking_id: booking.id,
        driver_id: driver.id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setActiveTracking({
        ...booking,
        tracking_id: response.data.tracking_id,
        tracking_url: response.data.tracking_url
      });
      
      toast({
        title: '🚗 Tracking Started!',
        description: `Customer will receive SMS when you're 5 mins away`,
      });
      
      // Start watching location
      startLocationWatch(booking);
      
    } catch (error) {
      console.error('Error starting tracking:', error);
      toast({
        title: 'Error',
        description: 'Failed to start tracking',
        variant: 'destructive'
      });
    }
  };

  const startLocationWatch = (booking) => {
    // Watch position with high accuracy
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });
        setLocationError(null);
      },
      (error) => {
        console.error('Location error:', error);
        setLocationError('Unable to get your location. Please enable GPS.');
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 5000
      }
    );
    
    // Send location updates every 30 seconds
    updateIntervalRef.current = setInterval(() => {
      if (currentLocation && driver) {
        sendLocationUpdate(booking);
      }
    }, 30000);
    
    // Send first update immediately
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });
        sendLocationUpdateDirect(booking, latitude, longitude);
      },
      (error) => {
        setLocationError('Unable to get your location');
      },
      { enableHighAccuracy: true }
    );
  };

  const sendLocationUpdate = async (booking) => {
    if (!currentLocation || !driver) return;
    await sendLocationUpdateDirect(booking, currentLocation.lat, currentLocation.lng);
  };

  const sendLocationUpdateDirect = async (booking, lat, lng) => {
    try {
      const token = localStorage.getItem('adminToken');
      
      const response = await axios.post(`${BACKEND_URL}/api/tracking/update-location`, {
        driver_id: driver.id,
        booking_id: booking.id,
        latitude: lat,
        longitude: lng
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setEtaMinutes(response.data.eta_minutes);
      
      if (response.data.sms_sent && !smsSent) {
        setSmsSent(true);
        toast({
          title: '📱 SMS Sent!',
          description: 'Customer has been notified you are 5 minutes away',
        });
      }
      
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  const stopTracking = async () => {
    if (!activeTracking) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      
      await axios.post(`${BACKEND_URL}/api/tracking/stop/${activeTracking.id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Clear watch and interval
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
        updateIntervalRef.current = null;
      }
      
      setActiveTracking(null);
      setCurrentLocation(null);
      setEtaMinutes(null);
      setSmsSent(false);
      
      toast({
        title: '✅ Arrived!',
        description: 'Tracking stopped. Job complete!',
      });
      
    } catch (error) {
      console.error('Error stopping tracking:', error);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const weekday = date.toLocaleDateString('en-NZ', { weekday: 'short' });
    return `${weekday}, ${day}/${month}/${year}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-black text-white p-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Car className="w-6 h-6 text-gold" />
            <div>
              <h1 className="font-bold">Driver Portal</h1>
              <p className="text-sm text-gray-400">{driver?.name || 'Driver'}</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/admin/dashboard')}
            className="text-white border-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4">
        {/* Active Tracking Card */}
        {activeTracking && (
          <Card className="mb-6 border-2 border-green-500 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-bold text-green-700">TRACKING ACTIVE</span>
                </div>
                <span className="text-sm text-gray-600">#{activeTracking.booking_ref}</span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium">{activeTracking.name}</p>
                    <p className="text-sm text-gray-500">{activeTracking.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-red-500 mt-0.5" />
                  <p className="text-sm">{activeTracking.pickupAddress}</p>
                </div>
                
                {etaMinutes !== null && (
                  <div className="flex items-center gap-3 bg-white p-3 rounded-lg">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{etaMinutes} min</p>
                      <p className="text-xs text-gray-500">ETA to pickup</p>
                    </div>
                    {smsSent && (
                      <div className="ml-auto flex items-center gap-1 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm">SMS Sent</span>
                      </div>
                    )}
                  </div>
                )}
                
                {locationError && (
                  <div className="flex items-center gap-2 text-red-600 bg-red-50 p-2 rounded">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">{locationError}</span>
                  </div>
                )}
                
                {currentLocation && (
                  <p className="text-xs text-gray-400">
                    📍 {currentLocation.lat.toFixed(5)}, {currentLocation.lng.toFixed(5)}
                  </p>
                )}
                
                <Button 
                  onClick={stopTracking}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  I've Arrived - Stop Tracking
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Today's Jobs */}
        <h2 className="text-lg font-bold mb-3">
          {activeTracking ? 'Other Jobs' : "Today's Jobs"}
        </h2>
        
        {todaysBookings.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              <Car className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No jobs scheduled for today or tomorrow</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {todaysBookings.map((booking) => (
              <Card 
                key={booking.id}
                className={`transition-all ${
                  activeTracking?.id === booking.id ? 'opacity-50' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-orange-500">#{booking.booking_ref}</span>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatDate(booking.date)}</p>
                      <p className="text-lg font-bold text-blue-600">{booking.time}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-start gap-2">
                      <User className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div>
                        <p className="font-medium">{booking.name}</p>
                        <p className="text-sm text-gray-500">{booking.phone}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-green-500 mt-0.5" />
                      <p className="text-sm text-gray-700">{booking.pickupAddress}</p>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-red-500 mt-0.5" />
                      <p className="text-sm text-gray-700">{booking.dropoffAddress}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {booking.passengers} passenger{booking.passengers > 1 ? 's' : ''}
                    </span>
                    
                    {activeTracking?.id === booking.id ? (
                      <span className="text-green-600 font-medium flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        Tracking...
                      </span>
                    ) : !activeTracking ? (
                      <Button
                        onClick={() => startTracking(booking)}
                        className="bg-gold hover:bg-amber-500 text-black"
                      >
                        <Navigation className="w-4 h-4 mr-2" />
                        On My Way
                      </Button>
                    ) : (
                      <span className="text-gray-400 text-sm">Complete current job first</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverPortal;
