import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { CheckCircle2, Loader2, MapPin, Calendar, Clock, Users, Phone, Mail, ExternalLink } from 'lucide-react';
import { Button } from '../components/ui/button';
import { BACKEND_URL } from '../config';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState(null);

  const sessionId = searchParams.get('session_id');
  const bookingId = searchParams.get('booking_id');
  const bookingRef = searchParams.get('booking_ref');
  const method = searchParams.get('method');
  const isCash = method === 'cash';

  useEffect(() => {
    // Poll for booking data (webhook may take a moment to process after Stripe redirect)
    const pollForBooking = async (attempts = 0) => {
      try {
        // For cash: bookingId (UUID) is in the URL. For Stripe: booking_ref is in the URL.
        const lookup = bookingId || bookingRef;
        if (!lookup) {
          setLoading(false);
          setError('Could not load booking details. Your booking was confirmed — check your email.');
          return;
        }

        const response = await fetch(`${BACKEND_URL}/api/bookings/${lookup}`);

        if (response.ok) {
          const data = await response.json();
          // Response shape: { ok: true, booking: {...} }
          setBooking(data.booking || data);
          setLoading(false);
        } else if (attempts < 4) {
          setTimeout(() => pollForBooking(attempts + 1), 1500);
        } else {
          setLoading(false);
          setError('Could not load booking details. Your booking was confirmed — check your email.');
        }
      } catch {
        if (attempts < 4) {
          setTimeout(() => pollForBooking(attempts + 1), 1500);
        } else {
          setLoading(false);
          setError('Could not load booking details. Your booking was confirmed — check your email.');
        }
      }
    };

    // Cash bookings are instant; Stripe needs a moment for the webhook
    const initialDelay = isCash ? 500 : 2000;
    const timeoutId = setTimeout(() => pollForBooking(0), initialDelay);
    return () => clearTimeout(timeoutId);
  }, [sessionId, bookingId, bookingRef, isCash]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-gold animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">{isCash ? 'Confirming your booking...' : 'Verifying your payment...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />

      <section className="py-32 bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-900/80 backdrop-blur-md border-2 border-gold/30 rounded-2xl p-8 sm:p-12">
            {/* Success Icon & Title */}
            <div className="text-center mb-8">
              <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-5" />
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-3" style={{ fontFamily: 'Playfair Display, serif' }}>
                {isCash ? 'Booking Confirmed!' : 'Payment Successful!'}
              </h1>
              <div className="w-24 h-1 bg-gold mx-auto mb-4"></div>

              {booking && (
                <div className="inline-block bg-gold/10 border border-gold/40 rounded-lg px-6 py-3 mt-2">
                  <p className="text-gold text-sm font-medium uppercase tracking-wider">Booking Reference</p>
                  <p className="text-white text-3xl font-bold tracking-widest">{booking.booking_ref}</p>
                </div>
              )}
            </div>

            {/* Booking Details Card */}
            {booking && (
              <div className="bg-black/50 border border-gold/20 rounded-xl p-6 mb-6">
                <h3 className="text-gold text-lg font-bold mb-4 border-b border-gold/20 pb-2">Your Booking Details</h3>
                <div className="space-y-3">
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
                  <div className="flex items-center justify-between pt-3 border-t border-gold/20 mt-3">
                    <span className="text-gray-300 font-medium">Total Price</span>
                    <span className="text-gold text-2xl font-bold">${Number(booking.totalPrice).toFixed(2)} NZD</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Payment</span>
                    <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                      booking.payment_status === 'paid'
                        ? 'bg-green-500/20 text-green-400'
                        : booking.payment_status === 'pay_on_day'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {booking.payment_status === 'paid' ? 'Paid' : booking.payment_status === 'pay_on_day' ? 'Pay Driver on Day' : booking.payment_status}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Confirmation Sent */}
            {booking && (
              <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-5 mb-6">
                <h3 className="text-green-400 text-sm font-bold mb-2 uppercase tracking-wider">Confirmation Sent</h3>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-green-400" />
                    <p className="text-gray-300 text-sm">Email sent to <span className="text-white font-medium">{booking.email}</span></p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-green-400" />
                    <p className="text-gray-300 text-sm">SMS sent to <span className="text-white font-medium">{booking.phone}</span></p>
                  </div>
                </div>
              </div>
            )}

            {/* What's Next */}
            <div className="bg-black/50 border border-gold/20 rounded-xl p-5 mb-8">
              <h3 className="text-gold text-sm font-bold mb-3 uppercase tracking-wider">What's Next?</h3>
              <ul className="text-gray-300 space-y-2 text-sm">
                <li className="flex items-start gap-2"><span className="text-green-400 mt-0.5">&#10003;</span> Confirmation email and SMS have been sent</li>
                <li className="flex items-start gap-2"><span className="text-green-400 mt-0.5">&#10003;</span> Our team will contact you 24 hours before pickup</li>
                <li className="flex items-start gap-2"><span className="text-green-400 mt-0.5">&#10003;</span> You can track your driver on the day of travel</li>
                <li className="flex items-start gap-2"><span className="text-green-400 mt-0.5">&#10003;</span> Save your booking reference: <span className="text-gold font-bold">{booking?.booking_ref || '—'}</span></li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              {booking?.trackingId && (
                <Button
                  onClick={() => navigate(`/tracking/${booking.booking_ref}`)}
                  className="bg-gold hover:bg-amber-500 text-black font-bold py-5 px-6"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Track Your Transfer
                </Button>
              )}
              <Button
                onClick={() => navigate('/my-booking')}
                className="bg-gold hover:bg-amber-500 text-black font-bold py-5 px-6"
              >
                View My Booking
              </Button>
              <Button
                onClick={() => navigate('/')}
                className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-5 px-6 border border-gold/30"
              >
                Back to Home
              </Button>
            </div>

            {/* Modify / Contact */}
            <div className="text-center text-gray-400 text-sm space-y-1">
              <p>Need to modify your booking? Contact us:</p>
              <p>
                <a href="mailto:info@bookaride.co.nz" className="text-gold hover:underline font-medium">info@bookaride.co.nz</a>
              </p>
            </div>
          </div>

          {/* Error fallback */}
          {error && !booking && (
            <div className="mt-6 text-center">
              <p className="text-yellow-400 text-sm mb-3">{error}</p>
              <p className="text-gray-400 text-sm">Don't worry — your booking is confirmed. Check your email and SMS for details.</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PaymentSuccess;
