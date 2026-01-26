import React from 'react';
import { Button } from './ui/button';
import { ArrowRight, Clock } from 'lucide-react';

const Hero = () => {
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
        {/* Top badges */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <div className="bg-gray-800/80 backdrop-blur-sm px-5 py-2.5 rounded-full border border-gold/30 text-sm font-medium text-gold tracking-wide hover:bg-gray-800 transition-colors duration-300">
            International Bookings Welcome
          </div>
          <div className="bg-gray-800/80 backdrop-blur-sm px-5 py-2.5 rounded-full border border-gold/30 text-sm font-medium text-gold tracking-wide hover:bg-gray-800 transition-colors duration-300">
            24/7 Premium Service
          </div>
          <div className="bg-gray-800/80 backdrop-blur-sm px-5 py-2.5 rounded-full border border-gold/30 text-sm font-medium text-gold tracking-wide hover:bg-gray-800 transition-colors duration-300">
            Secure Payment
          </div>
        </div>

        <div className="text-center max-w-5xl mx-auto">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight" style={{ fontFamily: 'Playfair Display, serif' }}>
            Premium Airport Transfers
            <span className="block bg-gradient-to-r from-gold via-amber-400 to-gold bg-clip-text text-transparent mt-3">
              Serving Hibiscus Coast & Orewa
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
            Your trusted local airport shuttle service from Hibiscus Coast to Auckland Airport. Professional drivers, comfortable vehicles, and reliable service for all surrounding suburbs.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-5 justify-center mb-14">
            <a href="/book-now">
              <Button className="bg-gold hover:bg-amber-500 text-black px-10 py-7 text-lg font-bold shadow-2xl shadow-gold/20 hover:shadow-gold/40 transition-all duration-300 tracking-wide hover:scale-105">
                Reserve Your Transfer
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </a>
            <a href="#services">
              <Button variant="outline" className="border-2 border-gold/50 hover:border-gold hover:bg-gold/10 text-gold bg-transparent backdrop-blur-sm px-10 py-7 text-lg font-semibold transition-all duration-300 tracking-wide">
                View Our Services
              </Button>
            </a>
          </div>

          {/* Quick booking badge */}
          <div className="inline-flex items-center bg-gray-800/60 backdrop-blur-md border-2 border-gold/30 px-6 py-3 rounded-full shadow-lg">
            <Clock className="w-5 h-5 text-gold mr-2" />
            <span className="text-gray-200 font-semibold tracking-wide">Instant Online Booking in 60 Seconds</span>
          </div>
        </div>

        {/* Elegant Stats Section */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
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