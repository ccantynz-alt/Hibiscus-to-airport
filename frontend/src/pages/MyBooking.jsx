import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageMeta from '../components/PageMeta';
import { Search, MapPin, Calendar, Clock, Users, Phone, Mail, ExternalLink, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { BACKEND_URL } from '../config';

const StatusBadge = ({ status }) => {
  const styles = {
    confirmed: 'bg-green-500/20 text-green-400 border-green-500/30',
    pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
    completed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };
  const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';
  return (
    <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${styles[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
      {label}
    </span>
  );
};

const PaymentBadge = ({ status }) => {
  const map = {
    paid: { label: 'Paid', style: 'bg-green-500/20 text-green-400 border-green-500/30' },
    pay_on_day: { label: 'Pay Driver on Day', style: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    unpaid: { label: 'Unpaid', style: 'bg-red-500/20 text-red-400 border-red-500/30' },
    pending: { label: 'Pending', style: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  };
  const info = map[status] || { label: status || 'Unknown', style: 'bg-gray-500/20 text-gray-400 border-gray-500/30' };
  return (
    <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${info.style}`}>
      {info.label}
    </span>
  );
};

const MyBooking = () => {
  const [searchParams] = useSearchParams();
  const initialRef = searchParams.get('ref') || '';
  const [refInput, setRefInput] = useState(initialRef);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleLookup = async (e) => {
    e && e.preventDefault();
    const ref = refInput.trim().toUpperCase();
    if (!ref) return;
    setLoading(true);
    setError(null);
    setBooking(null);
    setSearched(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/bookings/lookup/${ref}`);
      if (response.ok) {
        const data = await response.json();
        setBooking(data);
      } else if (response.status === 404) {
        setError('No booking found with that reference. Please check and try again.');
      } else {
        setError('Something went wrong. Please try again later.');
      }
    } catch (err) {
      setError('Could not connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Auto-search if ref was passed via URL
  React.useEffect(() => {
    if (initialRef) {
      setRefInput(initialRef);
      const doLookup = async () => {
        setLoading(true);
        setError(null);
        setSearched(true);
        try {
          const response = await fetch(`${BACKEND_URL}/api/bookings/lookup/${initialRef.trim().toUpperCase()}`);
          if (response.ok) {
            const data = await response.json();
            setBooking(data);
          } else if (response.status === 404) {
            setError('Booking not found. Please check your reference.');
          } else {
            setError('Unable to look up booking. Please try again.');
          }
        } catch {
          setError('Could not connect to the server. Please try again.');
        } finally {
          setLoading(false);
        }
      };
      doLookup();
    }
  }, [initialRef]);

  return (
    <div className="min-h-screen bg-black">
      <PageMeta
        title="My Booking | Hibiscus to Airport"
        description="Look up your Hibiscus to Airport booking details, check status, and track your transfer."
        url="https://hibiscustoairport.co.nz/my-booking"
      />
      <Header />

      <section className="py-32 bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Title */}
          <div className="text-center mb-10">
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
              My Booking
            </h1>
            <div className="w-24 h-1 bg-gold mx-auto mb-4"></div>
            <p className="text-gray-400">Enter your booking reference to view your transfer details.</p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleLookup} className="mb-8">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  value={refInput}
                  onChange={(e) => setRefInput(e.target.value)}
                  placeholder="e.g. H123"
                  className="w-full bg-gray-900/80 border border-gold/30 text-white rounded-lg pl-12 pr-4 py-4 text-lg focus:outline-none focus:border-gold placeholder-gray-500 uppercase tracking-wider"
                  autoFocus
                />
              </div>
              <Button
                type="submit"
                disabled={loading || !refInput.trim()}
                className="bg-gold hover:bg-amber-500 text-black font-bold px-8 py-4 text-lg disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Look Up'}
              </Button>
            </div>
          </form>

          {/* Error State */}
          {error && (
            <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-5 mb-6 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-400 font-medium">{error}</p>
                <p className="text-gray-400 text-sm mt-1">If you need help, email us at <a href="mailto:info@bookaride.co.nz" className="text-gold hover:underline">info@bookaride.co.nz</a></p>
              </div>
            </div>
          )}

          {/* Booking Details Card */}
          {booking && (
            <div className="bg-gray-900/80 backdrop-blur-md border-2 border-gold/30 rounded-2xl p-8">
              {/* Reference & Status */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-gold/20">
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wider">Booking Reference</p>
                  <p className="text-gold text-3xl font-bold tracking-widest">{booking.booking_ref}</p>
                </div>
                <div className="flex gap-2">
                  <StatusBadge status={booking.status} />
                  <PaymentBadge status={booking.payment_status} />
                </div>
              </div>

              {/* Trip Details */}
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wider">Pickup</p>
                    <p className="text-white">{booking.pickupAddress}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-400 text-xs uppercase tracking-wider">Drop-off</p>
                    <p className="text-white">{booking.dropoffAddress}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gold flex-shrink-0" />
                    <div>
                      <p className="text-gray-400 text-xs">Date</p>
                      <p className="text-white text-sm font-medium">{booking.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gold flex-shrink-0" />
                    <div>
                      <p className="text-gray-400 text-xs">Time</p>
                      <p className="text-white text-sm font-medium">{booking.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gold flex-shrink-0" />
                    <div>
                      <p className="text-gray-400 text-xs">Passengers</p>
                      <p className="text-white text-sm font-medium">{booking.passengers}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center justify-between py-4 border-t border-b border-gold/20 mb-6">
                <span className="text-gray-300 font-medium">Total Price</span>
                <span className="text-gold text-2xl font-bold">${Number(booking.totalPrice).toFixed(2)} NZD</span>
              </div>

              {/* Confirmation Info */}
              <div className="bg-black/40 rounded-lg p-4 mb-6">
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">Confirmation Sent To</p>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <p className="text-white text-sm">{booking.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <p className="text-white text-sm">{booking.phone}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                {booking.trackingId && (
                  <Link
                    to={`/tracking/${booking.booking_ref}`}
                    className="flex items-center justify-center gap-2 bg-gold hover:bg-amber-500 text-black font-bold py-3 px-6 rounded-md transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Track Your Transfer
                  </Link>
                )}
                <Link
                  to="/booking"
                  className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-md border border-gold/30 transition-colors"
                >
                  Book Another Transfer
                </Link>
              </div>
            </div>
          )}

          {/* Empty state after search */}
          {searched && !booking && !error && !loading && (
            <div className="text-center text-gray-400 py-8">
              <p>No results. Please check your booking reference and try again.</p>
            </div>
          )}

          {/* Contact Footer */}
          <div className="mt-8 text-center bg-gray-900/50 border border-gold/10 rounded-xl p-6">
            <p className="text-gray-300 text-sm mb-2 font-medium">Need to modify or cancel your booking?</p>
            <p className="text-gray-400 text-sm">
              Email us at{' '}
              <a href="mailto:info@bookaride.co.nz" className="text-gold hover:underline font-medium">info@bookaride.co.nz</a>
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default MyBooking;
