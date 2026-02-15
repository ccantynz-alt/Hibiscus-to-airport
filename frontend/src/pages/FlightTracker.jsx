import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AIChatbot from '../components/AIChatbot';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { Plane, Search, Clock, MapPin, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

import { BACKEND_URL } from '../config';


const FlightTracker = () => {
  const [flightNumber, setFlightNumber] = useState('');
  const [flightData, setFlightData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchFlight = async (e) => {
    e.preventDefault();
    if (!flightNumber.trim()) return;

    setLoading(true);
    setError('');
    setFlightData(null);

    try {
      const response = await axios.get(`${BACKEND_URL}/api/flight/track`, {
        params: { flight_number: flightNumber.trim() }
      });
      setFlightData(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Unable to find flight. Please check the flight number.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'landed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'active':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'delayed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'scheduled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'landed':
        return <CheckCircle className="w-5 h-5" />;
      case 'active':
        return <Plane className="w-5 h-5" />;
      case 'delayed':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString('en-NZ', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const weekday = date.toLocaleDateString('en-NZ', { weekday: 'short' });
      return `${weekday}, ${day}/${month}/${year}`;
    } catch {
      return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center bg-amber-500/20 text-amber-400 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Plane className="w-4 h-4 mr-2" />
            Real-Time Flight Status
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Flight <span className="text-amber-500">Tracker</span>
          </h1>
          <p className="text-gray-400 text-lg mb-8">
            Track your flight status in real-time. We monitor your arrival so we're always on time for your pickup.
          </p>
          
          {/* Search Form */}
          <form onSubmit={searchFlight} className="max-w-md mx-auto">
            <div className="flex gap-2">
              <Input
                type="text"
                value={flightNumber}
                onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                placeholder="Enter flight number (e.g., NZ123)"
                className="flex-1 h-12 text-lg bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:bg-white focus:text-gray-900"
              />
              <Button 
                type="submit" 
                disabled={loading}
                className="h-12 px-6 bg-amber-500 hover:bg-amber-600 text-black font-semibold"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Search className="w-5 h-5 mr-2" />
                    Track
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4">
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-6 text-center">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-red-800 mb-2">Flight Not Found</h3>
                <p className="text-red-600">{error}</p>
              </CardContent>
            </Card>
          )}

          {flightData && (
            <Card className="shadow-xl border-0 overflow-hidden">
              {/* Flight Header */}
              <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 text-white">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold">{flightData.flight_number}</h2>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 border ${getStatusColor(flightData.status)}`}>
                        {getStatusIcon(flightData.status)}
                        {flightData.status?.charAt(0).toUpperCase() + flightData.status?.slice(1)}
                      </span>
                    </div>
                    <p className="text-gray-400">{flightData.airline}</p>
                  </div>
                  {flightData.demo_mode && (
                    <div className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-xs">
                      Demo Mode
                    </div>
                  )}
                </div>
              </div>

              <CardContent className="p-6">
                {/* Flight Route */}
                <div className="grid md:grid-cols-3 gap-6 items-center">
                  {/* Departure */}
                  <div className="text-center md:text-left">
                    <div className="text-4xl font-bold text-gray-900 mb-1">
                      {flightData.departure?.iata || 'DEP'}
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{flightData.departure?.airport}</p>
                    <div className="space-y-1">
                      <div className="flex items-center justify-center md:justify-start gap-2 text-sm">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Scheduled:</span>
                        <span className="font-semibold">{formatTime(flightData.departure?.scheduled)}</span>
                      </div>
                      {flightData.departure?.estimated && flightData.departure.estimated !== flightData.departure.scheduled && (
                        <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-amber-600">
                          <AlertCircle className="w-4 h-4" />
                          <span>Estimated:</span>
                          <span className="font-semibold">{formatTime(flightData.departure?.estimated)}</span>
                        </div>
                      )}
                      {flightData.departure?.actual && (
                        <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span>Departed:</span>
                          <span className="font-semibold">{formatTime(flightData.departure?.actual)}</span>
                        </div>
                      )}
                      {flightData.departure?.terminal && (
                        <div className="text-xs text-gray-500 mt-2">
                          Terminal {flightData.departure.terminal} • Gate {flightData.departure.gate || 'TBA'}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Flight Path Visualization */}
                  <div className="hidden md:flex flex-col items-center justify-center py-4">
                    <div className="relative w-full">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t-2 border-dashed border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center">
                        <div className="bg-white px-4">
                          <Plane className={`w-8 h-8 ${flightData.status === 'active' ? 'text-amber-500 animate-pulse' : 'text-gray-400'}`} />
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      {formatDate(flightData.departure?.scheduled)}
                    </div>
                  </div>

                  {/* Arrival */}
                  <div className="text-center md:text-right">
                    <div className="text-4xl font-bold text-gray-900 mb-1">
                      {flightData.arrival?.iata || 'ARR'}
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{flightData.arrival?.airport}</p>
                    <div className="space-y-1">
                      <div className="flex items-center justify-center md:justify-end gap-2 text-sm">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Scheduled:</span>
                        <span className="font-semibold">{formatTime(flightData.arrival?.scheduled)}</span>
                      </div>
                      {flightData.arrival?.estimated && flightData.arrival.estimated !== flightData.arrival.scheduled && (
                        <div className="flex items-center justify-center md:justify-end gap-2 text-sm text-amber-600">
                          <AlertCircle className="w-4 h-4" />
                          <span>Estimated:</span>
                          <span className="font-semibold">{formatTime(flightData.arrival?.estimated)}</span>
                        </div>
                      )}
                      {flightData.arrival?.actual && (
                        <div className="flex items-center justify-center md:justify-end gap-2 text-sm text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span>Landed:</span>
                          <span className="font-semibold">{formatTime(flightData.arrival?.actual)}</span>
                        </div>
                      )}
                      {flightData.arrival?.terminal && (
                        <div className="text-xs text-gray-500 mt-2">
                          Terminal {flightData.arrival.terminal} • Gate {flightData.arrival.gate || 'TBA'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Info Banner */}
                <div className="mt-8 bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Plane className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-amber-800 mb-1">We Track Your Flight</h4>
                      <p className="text-amber-700 text-sm">
                        When you book with Hibiscus to Airport, we automatically monitor your flight for delays. 
                        If your flight is late, we adjust your pickup time accordingly - no stress!
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* No Search Yet */}
          {!flightData && !error && !loading && (
            <Card className="shadow-lg">
              <CardContent className="p-12 text-center">
                <Plane className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Track Your Flight</h3>
                <p className="text-gray-500 mb-6">
                  Enter your flight number above to check real-time status, delays, and arrival information.
                </p>
                <div className="flex flex-wrap justify-center gap-2 text-sm text-gray-400">
                  <span className="bg-gray-100 px-3 py-1 rounded-full">NZ123</span>
                  <span className="bg-gray-100 px-3 py-1 rounded-full">QF145</span>
                  <span className="bg-gray-100 px-3 py-1 rounded-full">VA100</span>
                  <span className="bg-gray-100 px-3 py-1 rounded-full">JQ225</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <Footer />
      <AIChatbot />
    </div>
  );
};

export default FlightTracker;
