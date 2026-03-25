import React, { useState } from 'react';
import { Button } from './ui/button';
import { ArrowRight, MapPin } from 'lucide-react';

const Hero = () => {
  const [pickup, setPickup] = useState('');

  const handleGetQuote = () => {
    const params = new URLSearchParams();
    if (pickup) params.set('from', pickup);
    params.set('to', 'Auckland Airport');
    window.location.href = `/booking?${params.toString()}`;
  };

  return (
    <section className="relative pt-32 pb-24 bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden">
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

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-5xl mx-auto">
          <p className="text-gold/80 text-sm font-medium tracking-widest uppercase mb-6">
            24/7 Premium Service &bull; Fully Insured &bull; Instant Booking
          </p>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
            Premium Airport Transfers
            <span className="block bg-gradient-to-r from-gold via-amber-400 to-gold bg-clip-text text-transparent mt-3">
              Serving Hibiscus Coast & Orewa
            </span>
          </h1>

          <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed font-light">
            Your trusted local airport shuttle service from Hibiscus Coast to Auckland Airport. Professional drivers, comfortable vehicles, and reliable service for all surrounding suburbs.
          </p>

          {/* Quick Quote Widget - Hero CTA */}
          <div className="max-w-2xl mx-auto mb-16">
            <div className="bg-gray-900/80 backdrop-blur-md border-2 border-gold/30 rounded-2xl p-8 shadow-2xl shadow-gold/10">
              <h2 className="text-2xl font-bold text-white mb-6 text-center" style={{ fontFamily: 'Playfair Display, serif' }}>
                Get Your <span className="text-gold">Instant Quote</span>
              </h2>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gold" />
                  <input
                    type="text"
                    placeholder="Enter pickup suburb"
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    className="w-full pl-10 pr-4 py-4 bg-gray-800 border border-gold/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-gold transition-colors"
                  />
                </div>
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gold" />
                  <input
                    type="text"
                    placeholder="Auckland Airport"
                    value="Auckland Airport"
                    readOnly
                    className="w-full pl-10 pr-4 py-4 bg-gray-800 border border-gold/30 rounded-xl text-gray-300 cursor-default"
                  />
                </div>
                <Button
                  onClick={handleGetQuote}
                  className="bg-gold hover:bg-amber-500 text-black px-8 py-4 text-lg font-bold shadow-xl shadow-gold/20 hover:shadow-gold/40 hover:scale-105 transition-all duration-300 whitespace-nowrap"
                >
                  Book Your Transfer
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Elegant Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
          <div className="text-center p-8 bg-gray-900/80 backdrop-blur-md rounded-2xl border-2 border-gold/20 shadow-2xl hover:border-gold/50 hover:shadow-gold/10 transition-all duration-500 group">
            <div className="text-5xl font-bold text-gold mb-2 group-hover:scale-110 transition-transform duration-300" style={{ fontFamily: 'Playfair Display, serif' }}>5000+</div>
            <div className="text-gray-400 font-medium tracking-wider text-xs uppercase">Satisfied Clients</div>
          </div>
          <div className="text-center p-8 bg-gray-900/80 backdrop-blur-md rounded-2xl border-2 border-gold/20 shadow-2xl hover:border-gold/50 hover:shadow-gold/10 transition-all duration-500 group">
            <div className="text-5xl font-bold text-gold mb-2 group-hover:scale-110 transition-transform duration-300" style={{ fontFamily: 'Playfair Display, serif' }}>60s</div>
            <div className="text-gray-400 font-medium tracking-wider text-xs uppercase">Booking Time</div>
          </div>
          <div className="text-center p-8 bg-gray-900/80 backdrop-blur-md rounded-2xl border-2 border-gold/20 shadow-2xl hover:border-gold/50 hover:shadow-gold/10 transition-all duration-500 group">
            <div className="text-5xl font-bold text-gold mb-2 group-hover:scale-110 transition-transform duration-300" style={{ fontFamily: 'Playfair Display, serif' }}>100%</div>
            <div className="text-gray-400 font-medium tracking-wider text-xs uppercase">Fully Insured</div>
          </div>
          <div className="text-center p-8 bg-gray-900/80 backdrop-blur-md rounded-2xl border-2 border-gold/20 shadow-2xl hover:border-gold/50 hover:shadow-gold/10 transition-all duration-500 group">
            <div className="text-5xl font-bold text-gold mb-2 group-hover:scale-110 transition-transform duration-300" style={{ fontFamily: 'Playfair Display, serif' }}>4.9★</div>
            <div className="text-gray-400 font-medium tracking-wider text-xs uppercase">Rating</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
