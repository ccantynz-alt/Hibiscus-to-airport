import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AIChatbot from '../components/AIChatbot';
import { Loader2, MapPin, Calendar, Clock, Users, Mail, Phone, User, FileText, Globe, DollarSign, Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import axios from 'axios';

// Safety: prevent hung requests (no UI change)
axios.defaults.timeout = 15000;

import { useLoadScript, Autocomplete } from '@react-google-maps/api';

import { BACKEND_URL } from '../config';

const libraries = ['places'];

// Compact Date Picker Modal - Clean iOS-style
const DatePickerModal = ({ isOpen, onClose, onSelect, selectedDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  if (!isOpen) return null;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  
  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  
  // Format date as YYYY-MM-DD in LOCAL timezone (not UTC)
  const formatDateLocal = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const selectDate = (day) => {
    const selected = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (selected >= today) {
      // Use local date format instead of toISOString() to avoid timezone issues
      onSelect(formatDateLocal(selected));
      onClose();
    }
  };
  
  const isSelected = (day) => {
    if (!selectedDate) return false;
    const checkDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return formatDateLocal(checkDate) === selectedDate;
  };
  
  const isPast = (day) => {
    const checkDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return checkDate < today;
  };
  
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-72 overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b">
          <button onClick={prevMonth} className="p-1.5 hover:bg-gray-100 rounded-full">
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <span className="text-sm font-semibold text-gray-800">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </span>
          <button onClick={nextMonth} className="p-1.5 hover:bg-gray-100 rounded-full">
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
        
        {/* Day Names */}
        <div className="grid grid-cols-7 px-2 pt-2">
          {dayNames.map((day, i) => (
            <div key={i} className="text-center text-xs font-medium text-gray-400 py-1">{day}</div>
          ))}
        </div>
        
        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-0.5 p-2">
          {Array.from({ length: firstDayOfMonth }, (_, i) => <div key={`e-${i}`} />)}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const past = isPast(day);
            const selected = isSelected(day);
            return (
              <button
                key={day}
                onClick={() => !past && selectDate(day)}
                disabled={past}
                className={`w-8 h-8 rounded-full text-xs font-medium mx-auto flex items-center justify-center transition-all
                  ${past ? 'text-gray-300' : 'hover:bg-gold/20'}
                  ${selected ? 'bg-gold text-black font-bold' : ''}`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Compact Time Picker - Rolling Wheel Style
const TimePickerModal = ({ isOpen, onClose, onSelect, selectedTime, label }) => {
  const scrollRef = React.useRef(null);
  
  const times = React.useMemo(() => {
    const t = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 15) {
        const time24 = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
        const ampm = h < 12 ? 'AM' : 'PM';
        t.push({ value: time24, display: `${hour12}:${m.toString().padStart(2, '0')} ${ampm}` });
      }
    }
    return t;
  }, []);

  // Scroll to selected time on open
  React.useEffect(() => {
    if (isOpen && scrollRef.current && selectedTime) {
      const index = times.findIndex(t => t.value === selectedTime);
      if (index > -1) {
        setTimeout(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollTop = index * 40 - 80;
          }
        }, 50);
      }
    }
  }, [isOpen, selectedTime, times]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-44 overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="px-3 py-2 border-b bg-gray-50">
          <span className="text-xs font-semibold text-gray-600 uppercase">{label || 'Select Time'}</span>
        </div>
        
        {/* Scrolling Time List */}
        <div 
          ref={scrollRef}
          className="h-48 overflow-y-auto"
        >
          {times.map(({ value, display }) => (
            <button
              key={value}
              onClick={() => { onSelect(value); onClose(); }}
              className={`w-full py-2.5 text-center text-sm font-medium transition-all
                ${selectedTime === value 
                  ? 'bg-gold text-black' 
                  : 'text-gray-600 hover:bg-gray-50'}`}
            >
              {display}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const BookingPage = () => {
  const { toast } = useToast();
  const [calculating, setCalculating] = useState(false);
  const [pricing, setPricing] = useState(null);
  const [pickupAutocomplete, setPickupAutocomplete] = useState(null);
  const [dropoffAutocomplete, setDropoffAutocomplete] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Date/Time picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDepartureTimePicker, setShowDepartureTimePicker] = useState(false);
  const [showArrivalTimePicker, setShowArrivalTimePicker] = useState(false);
  
  // Promo code state
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(null);
  const [applyingPromo, setApplyingPromo] = useState(false);
  
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });
  
  const [formData, setFormData] = useState({
    serviceType: '',
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
    departureFlightNumber: '',
    departureTime: '',
    arrivalFlightNumber: '',
    arrivalTime: '',
    vipPickup: false,
    oversizedLuggage: false,
    returnTrip: false
  });

  // Format date for display in NZ format (e.g., "Saturday, 27/12/2025")
  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const weekday = date.toLocaleDateString('en-NZ', { weekday: 'long' });
    return `${weekday}, ${day}/${month}/${year}`;
  };

  // Format time for display (e.g., "10:30 AM")
  const formatTimeDisplay = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour < 12 ? 'AM' : 'PM';
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    if ((name === 'pickupAddress' || name === 'dropoffAddress' || name === 'passengers') && 
        formData.pickupAddress && formData.dropoffAddress) {
      setTimeout(() => {
        calculatePrice();
      }, 500);
    }
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

  // Apply promo code
  const applyPromoCode = async () => {
    if (!promoCode.trim()) {
      toast({ title: 'Error', description: 'Please enter a promo code', variant: 'destructive' });
      return;
    }
    
    if (!pricing) {
      toast({ title: 'Error', description: 'Please calculate price first', variant: 'destructive' });
      return;
    }
    
    setApplyingPromo(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/promo-codes/validate`, {
        code: promoCode,
        booking_amount: pricing.totalPrice
      });
      
      setPromoDiscount(response.data);
      toast({ 
        title: 'ðŸŽ‰ Promo Code Applied!', 
        description: `You saved $${response.data.discount_amount.toFixed(2)}!` 
      });
    } catch (error) {
      setPromoDiscount(null);
      toast({ 
        title: 'Invalid Code', 
        description: error.response?.data?.detail || 'Promo code is invalid or expired', 
        variant: 'destructive' 
      });
    } finally {
      setApplyingPromo(false);
    }
  };

  const removePromoCode = () => {
    setPromoCode('');
    setPromoDiscount(null);
  };

  const onPickupLoad = (autocomplete) => {
    setPickupAutocomplete(autocomplete);
  };

  const onPickupPlaceChanged = () => {
    if (pickupAutocomplete !== null) {
      const place = pickupAutocomplete.getPlace();
      const address = place.formatted_address || place.name;
      setFormData({
        ...formData,
        pickupAddress: address
      });
      
      if (formData.dropoffAddress) {
        setTimeout(() => calculatePriceWithAddresses(address, formData.dropoffAddress), 300);
      }
    }
  };

  const onDropoffLoad = (autocomplete) => {
    setDropoffAutocomplete(autocomplete);
  };

  const onDropoffPlaceChanged = () => {
    if (dropoffAutocomplete !== null) {
      const place = dropoffAutocomplete.getPlace();
      const address = place.formatted_address || place.name;
      setFormData({
        ...formData,
        dropoffAddress: address
      });
      
      if (formData.pickupAddress) {
        setTimeout(() => calculatePriceWithAddresses(formData.pickupAddress, address), 300);
      }
    }
  };

  const calculatePriceWithAddresses = async (pickup, dropoff) => {
    if (!pickup || !dropoff) return;
    
    setCalculating(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/calculate-price`, {
        pickupAddress: pickup,
        dropoffAddress: dropoff,
        passengers: parseInt(formData.passengers)
      });
      
      let additionalFees = 0;
      if (formData.vipPickup) additionalFees += 15;
      if (formData.oversizedLuggage) additionalFees += 25;
      
      let totalPrice = response.data.totalPrice + additionalFees;
      if (formData.returnTrip) totalPrice *= 2;
      
      setPricing({
        ...response.data,
        additionalServices: additionalFees,
        returnTrip: formData.returnTrip,
        totalPrice: totalPrice
      });
    } catch (error) {
      console.error('Price calculation error:', error);
    } finally {
      setCalculating(false);
    }
  };

  const calculatePrice = async () => {
    if (!formData.pickupAddress || !formData.dropoffAddress) {
      return;
    }

    setCalculating(true);
    try {
      const response = await axios.post(`${BACKEND_URL}/api/calculate-price`, {
        pickupAddress: formData.pickupAddress,
        dropoffAddress: formData.dropoffAddress,
        passengers: parseInt(formData.passengers)
      });
      
      let additionalFees = 0;
      if (formData.vipPickup) additionalFees += 15;
      if (formData.oversizedLuggage) additionalFees += 25;
      
      let totalPrice = response.data.totalPrice + additionalFees;
      if (formData.returnTrip) totalPrice *= 2;
      
      setPricing({
        ...response.data,
        additionalServices: additionalFees,
        returnTrip: formData.returnTrip,
        totalPrice: totalPrice
      });
    } catch (error) {
      toast({
        title: "Calculation Error",
        description: error.response?.data?.detail || "Could not calculate distance. Please check addresses.",
        variant: "destructive"
      });
    } finally {
      setCalculating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!pricing) {
      toast({
        title: "Calculate Price First",
        description: "Please wait for price calculation to complete",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);

    try {
      // Create booking first
      const bookingResponse = await axios.post(`${BACKEND_URL}/api/bookings`, {
        ...formData,
          passengers: String(formData.passengers),
        pricing: pricing,
        payment_method: 'stripe',
        payment_status: 'pending'
      });
      
      const newBookingId = bookingResponse.data.booking_id;
      
      // Redirect to Stripe checkout
      const checkoutResponse = await axios.post(`${BACKEND_URL}/api/payment/create-checkout`, {
        booking_id: newBookingId
      });
      window.location.href = checkoutResponse.data.url;
      
    } catch (error) {
      toast({
        title: "Booking Error",
        description: error.response?.data?.detail || "Failed to create booking",
        variant: "destructive"
      });
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
    <div className="min-h-screen bg-white">
      {/* Top Banner - International Bookings */}
      <div className="bg-gray-900 text-white py-2">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-gold" />
            <span className="font-medium">International Bookings Welcome</span>
          </div>
          <div className="flex items-center gap-1 text-gray-300">
            <span className="text-gold">âœ“</span> 6 Languages
          </div>
          <div className="flex items-center gap-1 text-gray-300">
            <span className="text-gold">âœ“</span> 7 Currencies
          </div>
          <div className="flex items-center gap-1 text-gray-300">
            <span className="text-gold">âœ“</span> Worldwide Payment
          </div>
        </div>
      </div>

      <Header />
      
      {/* Simplified Hero Section */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Book Your Transfer
          </h1>
          <p className="text-gray-600">
            Get instant pricing â€¢ Secure payment â€¢ Confirmation in seconds
          </p>
        </div>
      </section>
      
      {/* Booking Form */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Trip Details Card */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-6 pb-3 border-b">Trip Details</h2>
                  
                  <div className="space-y-5">
                    {/* Service Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Service Type
                      </label>
                      <select
                        name="serviceType"
                        value={formData.serviceType}
                        onChange={handleChange}
                        required
                        className="w-full h-11 rounded-md border border-gray-300 focus:border-gold focus:ring-1 focus:ring-gold bg-white px-3 text-gray-700"
                      >
                        <option value="">Select service</option>
                        <option value="airport-shuttle">Airport Shuttle</option>
                        <option value="private-shuttle">Private Shuttle Transfer</option>
                      </select>
                    </div>
                    
                    {/* Pickup Location */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Pickup Address
                      </label>
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
                          placeholder="Enter pickup address..."
                          required
                          className="h-11 border-gray-300 focus:border-gold focus:ring-1 focus:ring-gold rounded-md"
                        />
                      </Autocomplete>
                    </div>
                    
                    {/* Add Another Pickup */}
                    <button
                      type="button"
                      onClick={addPickupLocation}
                      className="flex items-center gap-2 text-sm text-gold hover:text-amber-600 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add another pickup location
                    </button>
                    
                    {/* Additional Pickups */}
                    {formData.additionalPickups.map((pickup, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          type="text"
                          value={pickup}
                          onChange={(e) => updateAdditionalPickup(index, e.target.value)}
                          placeholder={`Additional pickup #${index + 2}`}
                          className="flex-1 h-11 rounded-md"
                        />
                        <Button
                          type="button"
                          onClick={() => removePickupLocation(index)}
                          variant="outline"
                          size="sm"
                          className="h-11 px-3 border-red-300 text-red-600 hover:bg-red-50"
                        >
                          âœ•
                        </Button>
                      </div>
                    ))}
                    
                    {/* Drop-off Address */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Drop-off Address
                      </label>
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
                          placeholder="Enter drop-off address..."
                          required
                          className="h-11 border-gray-300 focus:border-gold focus:ring-1 focus:ring-gold rounded-md"
                        />
                      </Autocomplete>
                    </div>
                    
                    {/* Date and Time */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Pickup Date
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowDatePicker(true)}
                          className={`w-full h-11 px-3 rounded-md border text-left flex items-center justify-between transition-all text-sm
                            ${formData.date 
                              ? 'border-gold bg-white text-gray-900' 
                              : 'border-gray-300 bg-white text-gray-400 hover:border-gold'
                            }`}
                        >
                          <span>
                            {formData.date ? formatDateDisplay(formData.date) : 'Select date'}
                          </span>
                          <Calendar className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Pickup Time
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowTimePicker(true)}
                          className={`w-full h-11 px-3 rounded-md border text-left flex items-center justify-between transition-all text-sm
                            ${formData.time 
                              ? 'border-gold bg-white text-gray-900' 
                              : 'border-gray-300 bg-white text-gray-400 hover:border-gold'
                            }`}
                        >
                          <span>
                            {formData.time ? formatTimeDisplay(formData.time) : 'Select time'}
                          </span>
                          <Clock className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Passengers */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Number of Passengers
                      </label>
                      <select
                        name="passengers"
                        value={formData.passengers}
                        onChange={handleChange}
                        className="w-full h-11 rounded-md border border-gray-300 focus:border-gold focus:ring-1 focus:ring-gold bg-white px-3 text-gray-700"
                      >
                        {[1,2,3,4,5,6,7,8,9,10,11].map(n => (
                          <option key={n} value={n}>{n} {n === 1 ? 'passenger' : 'passengers'}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                
                {/* Flight Information Card */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b">Flight Information <span className="text-sm font-normal text-gray-500">(Optional)</span></h2>
                  <p className="text-sm text-gray-500 mb-4">Providing flight details helps us track delays and adjust pickup times.</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Departure Flight #
                      </label>
                      <Input
                        type="text"
                        name="departureFlightNumber"
                        value={formData.departureFlightNumber}
                        onChange={handleChange}
                        placeholder="e.g., NZ123"
                        className="h-11 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Departure Time
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowDepartureTimePicker(true)}
                        className={`w-full h-11 px-3 rounded-md border text-left flex items-center justify-between transition-all text-sm
                          ${formData.departureTime 
                            ? 'border-gray-300 bg-white text-gray-900' 
                            : 'border-gray-300 bg-white text-gray-400 hover:border-gold'
                          }`}
                      >
                        <span>{formData.departureTime ? formatTimeDisplay(formData.departureTime) : 'Select'}</span>
                        <Clock className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Arrival Flight #
                      </label>
                      <Input
                        type="text"
                        name="arrivalFlightNumber"
                        value={formData.arrivalFlightNumber}
                        onChange={handleChange}
                        placeholder="e.g., QF45"
                        className="h-11 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Arrival Time
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowArrivalTimePicker(true)}
                        className={`w-full h-11 px-3 rounded-md border text-left flex items-center justify-between transition-all text-sm
                          ${formData.arrivalTime 
                            ? 'border-gray-300 bg-white text-gray-900' 
                            : 'border-gray-300 bg-white text-gray-400 hover:border-gold'
                          }`}
                      >
                        <span>{formData.arrivalTime ? formatTimeDisplay(formData.arrivalTime) : 'Select'}</span>
                        <Clock className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Add-ons Card */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b">Add-ons</h2>
                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-3 rounded-md border border-gray-200 hover:border-gold cursor-pointer transition-colors">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          name="vipPickup"
                          checked={formData.vipPickup}
                          onChange={handleChange}
                          className="w-5 h-5 rounded border-gray-300 text-gold focus:ring-gold"
                        />
                        <div>
                          <span className="font-medium text-gray-900">VIP Airport Pickup</span>
                          <p className="text-xs text-gray-500">Driver meets you inside the terminal with a name sign</p>
                        </div>
                      </div>
                      <span className="font-semibold text-gold">+$15</span>
                    </label>
                    
                    <label className="flex items-center justify-between p-3 rounded-md border border-gray-200 hover:border-gold cursor-pointer transition-colors">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          name="oversizedLuggage"
                          checked={formData.oversizedLuggage}
                          onChange={handleChange}
                          className="w-5 h-5 rounded border-gray-300 text-gold focus:ring-gold"
                        />
                        <div>
                          <span className="font-medium text-gray-900">Oversized Luggage</span>
                          <p className="text-xs text-gray-500">Golf clubs, surfboards, bikes, etc.</p>
                        </div>
                      </div>
                      <span className="font-semibold text-gold">+$25</span>
                    </label>
                    
                    <label className="flex items-center justify-between p-3 rounded-md border border-gray-200 hover:border-gold cursor-pointer transition-colors">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          name="returnTrip"
                          checked={formData.returnTrip}
                          onChange={handleChange}
                          className="w-5 h-5 rounded border-gray-300 text-gold focus:ring-gold"
                        />
                        <div>
                          <span className="font-medium text-gray-900">Book a Return Trip</span>
                          <p className="text-xs text-gray-500">We&apos;ll contact you to arrange return details</p>
                        </div>
                      </div>
                      <span className="font-semibold text-gold">Ã—2</span>
                    </label>
                  </div>
                </div>
                
                {/* Contact Details Card */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-3 border-b">Contact Details</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                      <Input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Smith"
                        required
                        className="h-11 rounded-md"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                        <Input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="john@example.com"
                          required
                          className="h-11 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                        <Input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+64 21 123 4567"
                          required
                          className="h-11 rounded-md"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Special Requests <span className="text-gray-400">(Optional)</span></label>
                      <Textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder="Child seats, wheelchair access, extra stops, etc."
                        rows={3}
                        className="rounded-md"
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>
            
            {/* Price Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-24">
                <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900 mb-6">
                  <DollarSign className="w-6 h-6 text-gold" />
                  Price Estimate
                </h2>
                
                {calculating && (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Loader2 className="w-12 h-12 text-gold animate-spin mb-4" />
                    <p className="text-gray-600">Calculating price...</p>
                  </div>
                )}
                
                {!calculating && !pricing && (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <MapPin className="w-16 h-16 text-gray-300 mb-4" />
                    <p className="text-gray-600 font-medium">Enter addresses to see price estimate</p>
                  </div>
                )}
                
                {!calculating && pricing && (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Distance:</span>
                        <span className="font-semibold text-gray-900">{pricing.distance?.toFixed(1)} km</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Base Price:</span>
                        <span className="font-semibold text-gray-900">${pricing.basePrice?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Airport Fee:</span>
                        <span className="font-semibold text-gray-900">${pricing.airportFee?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-600">Passenger Fee:</span>
                        <span className="font-semibold text-gray-900">${pricing.passengerFee?.toFixed(2)}</span>
                      </div>
                      {pricing.additionalServices > 0 && (
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Additional Services:</span>
                          <span className="font-semibold text-gray-900">${pricing.additionalServices?.toFixed(2)}</span>
                        </div>
                      )}
                      {pricing.returnTrip && (
                        <div className="flex justify-between py-2 border-b border-gray-100">
                          <span className="text-gray-600">Return Trip:</span>
                          <span className="font-semibold text-green-600">Ã—2</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-gold/10 rounded-xl p-4 mt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-900">Subtotal:</span>
                        <span className={`text-2xl font-bold ${promoDiscount ? 'text-gray-400 line-through' : 'text-gold'}`}>
                          ${pricing.totalPrice?.toFixed(2)}
                        </span>
                      </div>
                      
                      {/* Promo Code Section */}
                      <div className="mt-4 pt-4 border-t border-gold/20">
                        {promoDiscount ? (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center text-green-600">
                              <span className="text-sm font-medium">ðŸŽ‰ {promoDiscount.code}</span>
                              <span>-${promoDiscount.discount_amount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-lg font-bold text-gray-900">Total:</span>
                              <span className="text-3xl font-bold text-green-600">${promoDiscount.final_amount.toFixed(2)}</span>
                            </div>
                            <button
                              onClick={removePromoCode}
                              className="text-xs text-red-500 hover:text-red-700"
                            >
                              Remove promo code
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-lg font-bold text-gray-900">Total:</span>
                              <span className="text-3xl font-bold text-gold">${pricing.totalPrice?.toFixed(2)}</span>
                            </div>
                            <div className="flex gap-2 mt-3">
                              <input
                                type="text"
                                placeholder="Promo code"
                                value={promoCode}
                                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm uppercase"
                              />
                              <button
                                onClick={applyPromoCode}
                                disabled={applyingPromo}
                                className="px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded-lg hover:bg-gray-700 disabled:opacity-50"
                              >
                                {applyingPromo ? '...' : 'Apply'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-2">NZD â€¢ Price includes GST</p>
                    </div>

                    {/* Payment Info - Stripe Only */}
                    <div className="mt-6">
                      <div className="flex items-center p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl">
                        <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center mr-4">
                          <span className="text-white text-lg">ðŸ’³</span>
                        </div>
                        <div>
                          <span className="font-semibold text-gray-900">Secure Card Payment</span>
                          <p className="text-sm text-gray-600">Pay securely with Credit or Debit Card via Stripe</p>
                        </div>
                        <div className="ml-auto flex items-center gap-1">
                          <span className="text-xs text-gray-500">Powered by</span>
                          <span className="font-bold text-indigo-600">Stripe</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Book Now Button */}
                <Button
                  onClick={handleSubmit}
                  disabled={!pricing || calculating || submitting}
                  className="w-full h-14 mt-6 bg-gold hover:bg-amber-500 text-black text-lg font-bold rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>ðŸ’³ Pay with Card</>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Footer />
      <AIChatbot />
      
      {/* Date Picker Modal */}
      <DatePickerModal
        isOpen={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onSelect={(date) => setFormData({...formData, date})}
        selectedDate={formData.date}
      />
      
      {/* Pickup Time Picker Modal */}
      <TimePickerModal
        isOpen={showTimePicker}
        onClose={() => setShowTimePicker(false)}
        onSelect={(time) => setFormData({...formData, time})}
        selectedTime={formData.time}
        label="Select Pickup Time"
      />
      
      {/* Departure Time Picker Modal */}
      <TimePickerModal
        isOpen={showDepartureTimePicker}
        onClose={() => setShowDepartureTimePicker(false)}
        onSelect={(time) => setFormData({...formData, departureTime: time})}
        selectedTime={formData.departureTime}
        label="Select Departure Time"
      />
      
      {/* Arrival Time Picker Modal */}
      <TimePickerModal
        isOpen={showArrivalTimePicker}
        onClose={() => setShowArrivalTimePicker(false)}
        onSelect={(time) => setFormData({...formData, arrivalTime: time})}
        selectedTime={formData.arrivalTime}
        label="Select Arrival Time"
      />
    </div>
  );
};

export default BookingPage;

