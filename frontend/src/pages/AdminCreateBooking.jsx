import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent } from '../components/ui/card';
import { ArrowLeft, Calendar, Clock, Users, MapPin, DollarSign, Loader2 } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import axios from 'axios';
import { useLoadScript, Autocomplete } from '@react-google-maps/api';

import { BACKEND_URL, GOOGLE_MAPS_API_KEY } from '../config';

const libraries = ['places'];

const AdminCreateBooking = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [calculating, setCalculating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pricing, setPricing] = useState(null);
  const [priceOverride, setPriceOverride] = useState('');
  const [pickupAutocomplete, setPickupAutocomplete] = useState(null);
  const [dropoffAutocomplete, setDropoffAutocomplete] = useState(null);
  const additionalAutocompleteRefs = useRef({});

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
  });
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    serviceType: 'Airport Shuttle',
    paymentMethod: 'Cash',
    pickupAddress: '',
    additionalPickups: [],
    dropoffAddress: '',
    date: '',
    time: '',
    passengers: '1',
    flightArrivalNumber: '',
    flightArrivalTime: '',
    flightDepartureNumber: '',
    flightDepartureTime: '',
    notes: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const addPickupLocation = () => {
    setFormData({
      ...formData,
      additionalPickups: [...formData.additionalPickups, '']
    });
  };

  const removePickupLocation = (index) => {
    const newPickups = formData.additionalPickups.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      additionalPickups: newPickups
    });
  };

  const updateAdditionalPickup = (index, value) => {
    const newPickups = [...formData.additionalPickups];
    newPickups[index] = value;
    setFormData({
      ...formData,
      additionalPickups: newPickups
    });
  };

  const onAdditionalPickupLoad = (autocomplete, index) => {
    additionalAutocompleteRefs.current[index] = autocomplete;
  };

  const onAdditionalPickupPlaceChanged = (index) => {
    const autocomplete = additionalAutocompleteRefs.current[index];
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place && (place.formatted_address || place.name)) {
        const newPickups = [...formData.additionalPickups];
        newPickups[index] = place.formatted_address || place.name;
        setFormData({
          ...formData,
          additionalPickups: newPickups
        });
      }
    }
  };

  const onPickupLoad = (autocomplete) => {
    setPickupAutocomplete(autocomplete);
  };

  const onPickupPlaceChanged = () => {
    if (pickupAutocomplete !== null) {
      const place = pickupAutocomplete.getPlace();
      setFormData({
        ...formData,
        pickupAddress: place.formatted_address || place.name
      });
    }
  };

  const onDropoffLoad = (autocomplete) => {
    setDropoffAutocomplete(autocomplete);
  };

  const onDropoffPlaceChanged = () => {
    if (dropoffAutocomplete !== null) {
      const place = dropoffAutocomplete.getPlace();
      setFormData({
        ...formData,
        dropoffAddress: place.formatted_address || place.name
      });
    }
  };

  const calculatePrice = async () => {
    if (!formData.pickupAddress || !formData.dropoffAddress) {
      toast({
        title: "Missing Information",
        description: "Please enter both pickup and dropoff addresses",
        variant: "destructive"
      });
      return;
    }

    setCalculating(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/calculate-price`, {
        pickupAddress: formData.pickupAddress,
        dropoffAddress: formData.dropoffAddress,
        passengers: parseInt(formData.passengers)
      });
      
      setPricing(response.data);
      toast({ title: "Price Calculated", description: `Total: $${response.data.totalPrice.toFixed(2)} NZD` });
    } catch (error) {
      toast({
        title: "Calculation Error",
        description: error.response?.data?.detail || "Could not calculate distance",
        variant: "destructive"
      });
    } finally {
      setCalculating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const finalPrice = priceOverride ? parseFloat(priceOverride) : pricing?.totalPrice;
    
    if (!finalPrice) {
      toast({
        title: "Missing Price",
        description: "Please calculate price or enter a manual price",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('admin_token');
      
      // Create booking with overridden or calculated price
      const bookingData = {
        ...formData,
        pricing: pricing || {},
        totalPrice: finalPrice,
        status: 'confirmed',
        payment_status: 'paid'
      };

      const response = await axios.post(`${BACKEND_URL}/api/bookings`, bookingData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast({ 
        title: "Booking Created!", 
        description: `Booking #${response.data.booking_id.slice(0, 8)} created successfully` 
      });
      
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 2000);
      
    } catch (error) {
      toast({
        title: "Creation Failed",
        description: error.response?.data?.detail || "Failed to create booking",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-gold animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8 flex items-center gap-4">
          <Button
            onClick={() => navigate('/admin/dashboard')}
            variant="outline"
            className="border-gold text-gold"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create Booking</h1>
            <p className="text-gray-600">Manually create a booking for a customer</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Information */}
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Customer Information</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Customer name"
                    required
                    className="h-12"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="customer@example.com"
                    required
                    className="h-12"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone *</label>
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+64 21 XXX XXXX"
                    required
                    className="h-12"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Service Type *</label>
                  <select
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleChange}
                    className="w-full h-12 rounded-md border border-gray-300 focus:border-gold focus:ring-gold bg-white px-3"
                  >
                    <option value="Airport Shuttle">Airport Shuttle</option>
                    <option value="Corporate Transfer">Corporate Transfer</option>
                    <option value="Cruise Transfer">Cruise Transfer</option>
                    <option value="Local Transfer">Local Transfer</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Method *</label>
                  <select
                    name="paymentMethod"
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    className="w-full h-12 rounded-md border border-gray-300 focus:border-gold focus:ring-gold bg-white px-3"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Eftpos">Eftpos</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Invoice">Invoice</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trip Information */}
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Trip Information</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Pickup Address 1 *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Autocomplete
                      onLoad={onPickupLoad}
                      onPlaceChanged={onPickupPlaceChanged}
                      options={{
                        componentRestrictions: { country: 'nz' },
                        fields: ['formatted_address', 'name']
                      }}
                    >
                      <Input
                        type="text"
                        name="pickupAddress"
                        value={formData.pickupAddress}
                        onChange={handleChange}
                        placeholder="Start typing address..."
                        required
                        className="pl-10 h-12"
                      />
                    </Autocomplete>
                  </div>
                </div>

                {/* Additional Pickup Locations */}
                {formData.additionalPickups.map((pickup, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Pickup Stop {index + 2}
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-5 w-5 text-purple-500 z-10" />
                        <Autocomplete
                          onLoad={(autocomplete) => onAdditionalPickupLoad(autocomplete, index)}
                          onPlaceChanged={() => onAdditionalPickupPlaceChanged(index)}
                          options={{
                            componentRestrictions: { country: 'nz' },
                            fields: ['formatted_address', 'name']
                          }}
                        >
                          <Input
                            type="text"
                            value={pickup}
                            onChange={(e) => updateAdditionalPickup(index, e.target.value)}
                            placeholder="Search for address..."
                            className="pl-10 h-12"
                          />
                        </Autocomplete>
                      </div>
                    </div>
                    <div className="flex items-end">
                      <Button
                        type="button"
                        onClick={() => removePickupLocation(index)}
                        variant="outline"
                        className="h-12 px-4 border-red-300 text-red-600 hover:bg-red-50"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}

                <div className="flex justify-center">
                  <Button
                    type="button"
                    onClick={addPickupLocation}
                    variant="outline"
                    className="border-gold text-gold hover:bg-gold hover:text-black"
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Add Another Pickup Location
                  </Button>
                </div>
                <p className="text-sm text-gray-500 text-center">Add multiple pickup locations for shared rides or multi-stop trips</p>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Drop-off Address *</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Autocomplete
                      onLoad={onDropoffLoad}
                      onPlaceChanged={onDropoffPlaceChanged}
                      options={{
                        componentRestrictions: { country: 'nz' },
                        fields: ['formatted_address', 'name']
                      }}
                    >
                      <Input
                        type="text"
                        name="dropoffAddress"
                        value={formData.dropoffAddress}
                        onChange={handleChange}
                        placeholder="Start typing address..."
                        required
                        className="pl-10 h-12"
                      />
                    </Autocomplete>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Date *</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                        className="pl-10 h-12"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Time *</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        type="time"
                        name="time"
                        value={formData.time}
                        onChange={handleChange}
                        required
                        className="pl-10 h-12"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Passengers *</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <select
                        name="passengers"
                        value={formData.passengers}
                        onChange={handleChange}
                        className="w-full pl-10 h-12 rounded-md border border-gray-300 focus:border-gold focus:ring-gold bg-white"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(num => (
                          <option key={num} value={num}>{num}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Flight Details */}
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                ✈️ Flight Details (Optional)
              </h2>
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Flight Arrival Number</label>
                    <Input
                      type="text"
                      name="flightArrivalNumber"
                      value={formData.flightArrivalNumber}
                      onChange={handleChange}
                      placeholder="e.g., NZ123"
                      className="h-12"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Flight Arrival Time</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        type="time"
                        name="flightArrivalTime"
                        value={formData.flightArrivalTime}
                        onChange={handleChange}
                        className="pl-10 h-12"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Flight Departure Number</label>
                    <Input
                      type="text"
                      name="flightDepartureNumber"
                      value={formData.flightDepartureNumber}
                      onChange={handleChange}
                      placeholder="e.g., NZ456"
                      className="h-12"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Flight Departure Time</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <Input
                        type="time"
                        name="flightDepartureTime"
                        value={formData.flightDepartureTime}
                        onChange={handleChange}
                        className="pl-10 h-12"
                      />
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-500">Add flight details for airport pickups/drop-offs to better track and coordinate transfers</p>
              </div>
            </CardContent>
          </Card>

          {/* Special Notes */}
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Special Notes</h2>
              <Textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Any special requests or notes..."
                rows={4}
                className="resize-none"
              />
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Pricing</h2>
              
              <div className="text-center mb-6">
                <p className="text-gray-600 mb-4">Click Calculate Price to get pricing details</p>
                <Button
                  type="button"
                  onClick={calculatePrice}
                  disabled={calculating}
                  variant="outline"
                  className="w-full md:w-auto border-blue-500 text-blue-600 hover:bg-blue-50 h-12 px-8"
                >
                  {calculating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    'Calculate Price'
                  )}
                </Button>
              </div>
              
              {pricing && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Calculated Price:</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Distance:</span>
                      <span className="font-semibold">{pricing.distance} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Base Price:</span>
                      <span className="font-semibold">${pricing.basePrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Airport Fee:</span>
                      <span className="font-semibold">${pricing.airportFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Passenger Fee:</span>
                      <span className="font-semibold">${pricing.passengerFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-300">
                      <span className="font-bold text-gray-900">Total:</span>
                      <span className="font-bold text-gold text-lg">${pricing.totalPrice.toFixed(2)} NZD</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  🔒 Manual Price Override (Optional)
                </label>
                <p className="text-sm text-gray-600 mb-3">Enter a custom price to override the calculated amount. Leave empty to use calculated price.</p>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    type="number"
                    step="0.01"
                    value={priceOverride}
                    onChange={(e) => setPriceOverride(e.target.value)}
                    placeholder={pricing ? pricing.totalPrice.toFixed(2) : "0.00"}
                    className="pl-10 h-12"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={submitting || (!pricing && !priceOverride)}
              className="flex-1 bg-gold hover:bg-amber-500 text-black font-bold h-14 text-lg"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating Booking...
                </>
              ) : (
                'Create Booking & Send Confirmations'
              )}
            </Button>
            <Button
              type="button"
              onClick={() => navigate('/admin/dashboard')}
              variant="outline"
              className="h-14 px-6"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminCreateBooking;
