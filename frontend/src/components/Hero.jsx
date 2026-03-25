import React, { useState } from 'react';
import { Button } from './ui/button';
import { ArrowRight, MapPin, Plane, Shield, Clock, Star } from 'lucide-react';

const Hero = () => {
  const [pickup, setPickup] = useState('');

  const handleGetQuote = () => {
    const params = new URLSearchParams();
    if (pickup) params.set('from', pickup);
    params.set('to', 'Auckland Airport');
    window.location.href = `/booking?${params.toString()}`;
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleGetQuote();
  };

  return (
    <section className="relative pt-28 pb-20 bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden min-h-[90vh] flex items-center">
      {/* Elegant gold glow effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gold rounded-full blur-3xl opacity-10"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-500 rounded-full blur-3xl opacity-10"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold rounded-full blur-3xl opacity-5"></div>
      </div>

      {/* Gold dot pattern overlay */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage: 'radial-gradient(circle at 2px 2px, #D4AF37 1px, transparent 0)',
        backgroundSize: '50px 50px'
      }}></div>

      {/* Elegant top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-5xl mx-auto">
          <p className="text-gold/80 text-sm font-medium tracking-widest uppercase mb-6">
            24/7 Premium Service &bull; Fully Insured &bull; Instant Booking
          </p>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-4 leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
            Premium Airport Transfers
            <span className="block bg-gradient-to-r from-gold via-amber-400 to-gold bg-clip-text text-transparent mt-2 sm:mt-3">
              Hibiscus Coast to Auckland Airport
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed font-light">
            Door-to-door private shuttle — no sharing, no waiting. Professional drivers, comfortable vehicles, flat rates 24/7.
          </p>

          {/* ========== QUOTE WIDGET — THE HERO CTA ========== */}
          <div className="max-w-3xl mx-auto mb-16">
            <div className="bg-gray-900/90 backdrop-blur-xl border-2 border-gold/40 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-gold/10">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Plane className="w-6 h-6 text-gold" />
                <h2 className="text-xl sm:text-2xl font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                  Where are you <span className="text-gold">travelling from?</span>
                </h2>
              </div>
              <p className="text-gray-400 text-sm mb-6">Enter your full address for an instant price</p>

              {/* Single prominent input — full width */}
              <div className="relative mb-5">
                <MapPin className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gold" />
                <input
                  type="text"
                  placeholder="e.g. 42 Hibiscus Coast Highway, Orewa"
                  value={pickup}
                  onChange={(e) => setPickup(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full pl-12 sm:pl-14 pr-5 py-5 sm:py-6 bg-gray-800/80 border-2 border-gold/30 rounded-2xl text-white text-base sm:text-lg placeholder-gray-500 focus:outline-none focus:border-gold focus:shadow-lg focus:shadow-gold/10 transition-all duration-300"
                  aria-label="Pickup address"
                />
              </div>

              {/* Destination shown as context, not a dead input */}
              <div className="flex items-center gap-2 mb-6 px-2">
                <div className="w-2 h-2 rounded-full bg-gold"></div>
                <div className="h-px flex-1 bg-gold/20"></div>
                <span className="text-gray-400 text-sm font-medium px-3">to</span>
                <div className="h-px flex-1 bg-gold/20"></div>
                <div className="flex items-center gap-2 bg-gray-800/60 border border-gold/20 rounded-xl px-4 py-2">
                  <Plane className="w-4 h-4 text-gold" />
                  <span className="text-white font-medium text-sm sm:text-base">Auckland Airport</span>
                </div>
              </div>

              <Button
                onClick={handleGetQuote}
                className="w-full bg-gold hover:bg-amber-500 text-black py-5 sm:py-6 text-lg sm:text-xl font-bold rounded-2xl shadow-xl shadow-gold/20 hover:shadow-gold/40 hover:scale-[1.02] transition-all duration-300"
              >
                Get Instant Price
                <ArrowRight className="ml-3 w-6 h-6" />
              </Button>

              {/* Trust signals inside the widget */}
              <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-gold/10">
                <div className="flex items-center justify-center gap-1.5 text-gray-400 text-xs sm:text-sm">
                  <Shield className="w-4 h-4 text-gold/70" />
                  <span>Flat Rates</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 text-gray-400 text-xs sm:text-sm">
                  <Clock className="w-4 h-4 text-gold/70" />
                  <span>24/7 Service</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 text-gray-400 text-xs sm:text-sm">
                  <Star className="w-4 h-4 text-gold/70" />
                  <span>4.9★ Rated</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Elegant Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 max-w-6xl mx-auto">
          <div className="text-center p-6 sm:p-8 bg-gray-900/80 backdrop-blur-md rounded-2xl border border-gold/20 shadow-2xl hover:border-gold/50 hover:shadow-gold/10 transition-all duration-500 group">
            <div className="text-3xl sm:text-5xl font-bold text-gold mb-2 group-hover:scale-110 transition-transform duration-300" style={{ fontFamily: 'Playfair Display, serif' }}>5000+</div>
            <div className="text-gray-400 font-medium tracking-wider text-xs uppercase">Satisfied Clients</div>
          </div>
          <div className="text-center p-6 sm:p-8 bg-gray-900/80 backdrop-blur-md rounded-2xl border border-gold/20 shadow-2xl hover:border-gold/50 hover:shadow-gold/10 transition-all duration-500 group">
            <div className="text-3xl sm:text-5xl font-bold text-gold mb-2 group-hover:scale-110 transition-transform duration-300" style={{ fontFamily: 'Playfair Display, serif' }}>60s</div>
            <div className="text-gray-400 font-medium tracking-wider text-xs uppercase">Booking Time</div>
          </div>
          <div className="text-center p-6 sm:p-8 bg-gray-900/80 backdrop-blur-md rounded-2xl border border-gold/20 shadow-2xl hover:border-gold/50 hover:shadow-gold/10 transition-all duration-500 group">
            <div className="text-3xl sm:text-5xl font-bold text-gold mb-2 group-hover:scale-110 transition-transform duration-300" style={{ fontFamily: 'Playfair Display, serif' }}>100%</div>
            <div className="text-gray-400 font-medium tracking-wider text-xs uppercase">Fully Insured</div>
          </div>
          <div className="text-center p-6 sm:p-8 bg-gray-900/80 backdrop-blur-md rounded-2xl border border-gold/20 shadow-2xl hover:border-gold/50 hover:shadow-gold/10 transition-all duration-500 group">
            <div className="text-3xl sm:text-5xl font-bold text-gold mb-2 group-hover:scale-110 transition-transform duration-300" style={{ fontFamily: 'Playfair Display, serif' }}>4.9★</div>
            <div className="text-gray-400 font-medium tracking-wider text-xs uppercase">Rating</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
