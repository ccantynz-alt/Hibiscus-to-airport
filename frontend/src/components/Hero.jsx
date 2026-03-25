import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Clock, Star, Phone } from 'lucide-react';

const Hero = () => {
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

          <p className="text-lg sm:text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
            Door-to-door private shuttle — no sharing, no waiting. Professional drivers, comfortable vehicles, flat rates 24/7.
          </p>

          {/* Clean CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Link
              to="/booking"
              className="inline-flex items-center bg-gold hover:bg-amber-500 text-black px-10 py-5 text-lg sm:text-xl font-bold rounded-2xl shadow-xl shadow-gold/20 hover:shadow-gold/40 hover:scale-[1.02] transition-all duration-300"
            >
              Book Your Transfer
              <ArrowRight className="ml-3 w-6 h-6" />
            </Link>
            <a
              href="tel:021743321"
              className="inline-flex items-center border-2 border-gold/40 hover:border-gold text-white px-8 py-5 text-lg font-medium rounded-2xl hover:bg-gold/10 transition-all duration-300"
            >
              <Phone className="mr-3 w-5 h-5 text-gold" />
              021 743 321
            </a>
          </div>

          {/* Trust signals */}
          <div className="flex items-center justify-center gap-6 sm:gap-8 mb-16">
            <div className="flex items-center gap-1.5 text-gray-400 text-sm">
              <Shield className="w-4 h-4 text-gold/70" />
              <span>Flat Rates</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-400 text-sm">
              <Clock className="w-4 h-4 text-gold/70" />
              <span>24/7 Service</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-400 text-sm">
              <Star className="w-4 h-4 text-gold/70" />
              <span>4.9&#9733; Rated</span>
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
            <div className="text-3xl sm:text-5xl font-bold text-gold mb-2 group-hover:scale-110 transition-transform duration-300" style={{ fontFamily: 'Playfair Display, serif' }}>4.9&#9733;</div>
            <div className="text-gray-400 font-medium tracking-wider text-xs uppercase">Rating</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
