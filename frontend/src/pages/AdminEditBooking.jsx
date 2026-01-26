import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, User, MapPin, Calendar, DollarSign, Save, Loader2, Plus, X } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

const AdminEditBooking = () => {
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [calculatingPrice, setCalculatingPrice] = useState(false);
  
  const pickupInputRef = useRef(null);
  const dropoffInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    pickupAddress: '',
    additionalPickups: [],
    dropoffAddress: '',
    date: '',
    time: '',
    passengers: '1',
    notes: '',
    totalPrice: 0,
    status: 'pending',
    payment_status: 'unpaid'
  });

  const [pricing, setPricing] = useState(null);
  const [priceOverride, setPriceOverride] = useState('');
  const additionalPickupRefs = useRef({});

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchBooking();
    loadGoogleMaps();
  }, [navigate, bookingId]);

  const loadGoogleMaps = () => {
    if (window.google?.maps?.places) {
      initAutocomplete();
      return;
    }

    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      const checkLoaded = setInterval(() => {
        if (window.google?.maps?.places) {
          clearInterval(checkLoaded);
          initAutocomplete();
        }
      }, 100);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => initAutocomplete();
    document.head.appendChild(script);
  };

  const initAutocomplete = () => {
    setTimeout(() => {
      if (pickupInputRef.current) {
        const pickupAutocomplete = new window.google.maps.places.Autocomplete(pickupInputRef.current, {
          componentRestrictions: { country: 'nz' },
          types: ['address']
        });
        pickupAutocomplete.addListener('place_changed', () => {
          const place = pickupAutocomplete.getPlace();
          if (place.formatted_address) {
            setFormData(prev => ({ ...prev, pickupAddress: place.formatted_address }));
          }
        });
      }
      
      if (dropoffInputRef.current) {
        const dropoffAutocomplete = new window.google.maps.places.Autocomplete(dropoffInputRef.current, {
          componentRestrictions: { country: 'nz' },
          types: ['address']
        });
        dropoffAutocomplete.addListener('place_changed', () => {
          const place = dropoffAutocomplete.getPlace();
          if (place.formatted_address) {
            setFormData(prev => ({ ...prev, dropoffAddress: place.formatted_address }));
          }
        });
      }
      
      // Initialize autocomplete for existing additional pickups
      initAdditionalAutocomplete();
    }, 500);
  };

  const initAdditionalAutocomplete = () => {
    Object.keys(additionalPickupRefs.current).forEach(index => {
      const input = additionalPickupRefs.current[index];
      if (input && !input._autocomplete) {
        const autocomplete = new window.google.maps.places.Autocomplete(input, {
          componentRestrictions: { country: 'nz' },
          types: ['address']
        });
        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          if (place.formatted_address) {
            updateAdditionalPickup(parseInt(index), place.formatted_address);
          }
        });
        input._autocomplete = autocomplete;
      }
    });
  };

  const addPickupLocation = () => {
    setFormData(prev => ({
      ...prev,
      additionalPickups: [...prev.additionalPickups, '']
    }));
    // Initialize autocomplete for new field after render
    setTimeout(() => initAdditionalAutocomplete(), 100);
  };

  const removePickupLocation = (index) => {
    const newPickups = formData.additionalPickups.filter((_, i) => i !== index);
    delete additionalPickupRefs.current[index];
    setFormData(prev => ({
      ...prev,
      additionalPickups: newPickups
    }));
  };

  const updateAdditionalPickup = (index, value) => {
    setFormData(prev => {
      const newPickups = [...prev.additionalPickups];
      newPickups[index] = value;
      return { ...prev, additionalPickups: newPickups };
    });
  };

  const fetchBooking = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await axios.get(`${BACKEND_URL}/api/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const booking = response.data;
      setFormData({
        name: booking.name || '',
        email: booking.email || '',
        phone: booking.phone || '',
        pickupAddress: booking.pickupAddress || '',
        additionalPickups: booking.additionalPickups || [],
        dropoffAddress: booking.dropoffAddress || '',
        date: booking.date || '',
        time: booking.time || '',
        passengers: booking.passengers || '1',
        notes: booking.notes || '',
        totalPrice: booking.totalPrice || 0,
        status: booking.status || 'pending',
        payment_status: booking.payment_status || 'unpaid'
      });
      
      // Initialize autocomplete for additional pickups after data loads
      setTimeout(() => initAdditionalAutocomplete(), 600);
      
      if (booking.pricing) {
        setPricing(booking.pricing);
      }
      
      setLoading(false);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('admin_token');
        navigate('/admin/login');
      } else if (error.response?.status === 404) {
        toast({ title: 'Error', description: 'Booking not found', variant: 'destructive' });
        navigate('/admin/dashboard');
      } else {
        toast({ title: 'Error', description: 'Failed to fetch booking', variant: 'destructive' });
      }
    }
  };

  const calculatePrice = async () => {
    if (!formData.pickupAddress || !formData.dropoffAddress) {
      toast({ title: 'Missing Information', description: 'Please enter both pickup and dropoff addresses', variant: 'destructive' });
      return;
    }

    setCalculatingPrice(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/calculate-price`, {
        pickupAddress: formData.pickupAddress,
        additionalPickups: formData.additionalPickups.filter(p => p.trim() !== ''),
        dropoffAddress: formData.dropoffAddress,
        passengers: parseInt(formData.passengers) || 1
      });
      
      setPricing(response.data);
      setFormData(prev => ({ ...prev, totalPrice: response.data.totalPrice }));
      toast({ title: 'Success', description: 'Price calculated successfully' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to calculate price', variant: 'destructive' });
    } finally {
      setCalculatingPrice(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = localStorage.getItem('admin_token');
      
      const finalPrice = priceOverride ? parseFloat(priceOverride) : formData.totalPrice;
      
      const updateData = {
        ...formData,
        totalPrice: finalPrice,
        pricing: pricing || { totalPrice: finalPrice }
      };

      await axios.put(`${BACKEND_URL}/api/bookings/${bookingId}`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast({ title: 'Success', description: 'Booking updated successfully' });
      
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 1500);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update booking', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    // Handle both ISO and DD/MM/YYYY formats
    if (dateStr.includes('/')) {
      const [day, month, year] = dateStr.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return dateStr.split('T')[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => navigate('/admin/dashboard')}
            variant="ghost"
            className="mb-4 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Booking</h1>
          <p className="text-gray-600 mt-1">Update booking details below</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Information */}
          <Card className="border border-gray-200">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="w-5 h-5 text-gold" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="h-12"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="h-12"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  className="h-12"
                />
              </div>
            </CardContent>
          </Card>

          {/* Trip Details */}
          <Card className="border border-gray-200">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MapPin className="w-5 h-5 text-gold" />
                Trip Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Address</label>
                <Input
                  ref={pickupInputRef}
                  value={formData.pickupAddress}
                  onChange={(e) => setFormData({ ...formData, pickupAddress: e.target.value })}
                  placeholder="Enter pickup address"
                  required
                  className="h-12"
                />
              </div>
              
              {/* Additional Pickup Locations */}
              {formData.additionalPickups.map((pickup, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pickup Stop {index + 2}
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-5 w-5 text-purple-500 z-10" />
                      <Input
                        ref={(el) => { additionalPickupRefs.current[index] = el; }}
                        value={pickup}
                        onChange={(e) => updateAdditionalPickup(index, e.target.value)}
                        placeholder="Search for address..."
                        className="pl-10 h-12"
                      />
                    </div>
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      onClick={() => removePickupLocation(index)}
                      variant="ghost"
                      className="h-12 px-3 text-red-600 hover:bg-red-50"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              ))}
              
              <Button
                type="button"
                onClick={addPickupLocation}
                variant="outline"
                className="border-dashed border-purple-300 text-purple-600 hover:bg-purple-50"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Pickup Stop
              </Button>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Drop-off Address</label>
                <Input
                  ref={dropoffInputRef}
                  value={formData.dropoffAddress}
                  onChange={(e) => setFormData({ ...formData, dropoffAddress: e.target.value })}
                  placeholder="Enter drop-off address"
                  required
                  className="h-12"
                />
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <Input
                    type="date"
                    value={formatDate(formData.date)}
                    onChange={(e) => {
                      const date = new Date(e.target.value);
                      const formatted = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
                      setFormData({ ...formData, date: formatted });
                    }}
                    required
                    className="h-12"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                  <Input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    required
                    className="h-12"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Passengers</label>
                  <select
                    value={formData.passengers}
                    onChange={(e) => setFormData({ ...formData, passengers: e.target.value })}
                    className="w-full h-12 px-3 border border-gray-300 rounded-md"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any special requests or notes..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Status & Payment */}
          <Card className="border border-gray-200">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="w-5 h-5 text-gold" />
                Status & Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Booking Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full h-12 px-3 border border-gray-300 rounded-md"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
                  <select
                    value={formData.payment_status}
                    onChange={(e) => setFormData({ ...formData, payment_status: e.target.value })}
                    className="w-full h-12 px-3 border border-gray-300 rounded-md"
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card className="border border-gray-200">
            <CardHeader className="bg-gray-50 border-b">
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="w-5 h-5 text-gold" />
                Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex gap-4 mb-4">
                <Button
                  type="button"
                  onClick={calculatePrice}
                  disabled={calculatingPrice}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {calculatingPrice ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    'Recalculate Price'
                  )}
                </Button>
              </div>

              {pricing && (
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Distance</span>
                    <span className="font-medium">{pricing.distance?.toFixed(1) || 0} km</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Base Price</span>
                    <span className="font-medium">${pricing.basePrice?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Airport Fee</span>
                    <span className="font-medium">${pricing.airportFee?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Passenger Fee</span>
                    <span className="font-medium">${pricing.passengerFee?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">Calculated Total</span>
                      <span className="font-bold text-gold text-lg">${pricing.totalPrice?.toFixed(2) || '0.00'} NZD</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Price (${formData.totalPrice?.toFixed(2) || '0.00'})
                </label>
                <div className="flex gap-4 items-center">
                  <Input
                    type="number"
                    step="0.01"
                    value={priceOverride}
                    onChange={(e) => setPriceOverride(e.target.value)}
                    placeholder="Override price (leave blank to keep current)"
                    className="h-12 flex-1"
                  />
                  <span className="text-sm text-gray-500">🔒 Manual Override</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Enter a new price to override, or leave blank to keep the current price
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={saving}
              className="bg-gold hover:bg-amber-500 text-black font-semibold px-8 py-3 h-12"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/dashboard')}
              className="h-12"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminEditBooking;
