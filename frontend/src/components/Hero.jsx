import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Clock, Star, Phone } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 sm:pt-36 sm:pb-28 bg-white overflow-hidden min-h-[90vh] flex items-center">
      {/* Subtle decorative shape — top right */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-gray-50 via-gray-100/50 to-transparent rounded-full -translate-y-1/3 translate-x-1/4 pointer-events-none"></div>
      {/* Subtle decorative shape — bottom left */}
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-gray-50 via-gray-100/30 to-transparent rounded-full translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-4xl mx-auto">
          {/* Tagline */}
          <p className="text-gray-400 text-sm font-medium tracking-[0.2em] uppercase mb-8">
            24/7 Premium Service &bull; Fully Insured &bull; Instant Booking
          </p>

          {/* Heading */}
          <h1
            className="text-4xl sm:text-5xl lg:text-7xl font-bold text-gray-900 mb-5 leading-[1.1]"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Premium Airport{' '}
            <span className="text-[#D4AF37]">Transfers</span>
            <span className="block text-2xl sm:text-3xl lg:text-4xl font-normal text-gray-500 mt-3 sm:mt-4" style={{ fontFamily: 'inherit' }}>
              Hibiscus Coast to Auckland Airport
            </span>
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed font-light">
            Door-to-door private shuttle — no sharing, no waiting.
            Professional drivers, comfortable vehicles, flat rates 24/7.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link
              to="/booking"
              className="inline-flex items-center bg-gray-900 hover:bg-gray-800 text-white px-10 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl hover:translate-y-[-1px] transition-all duration-200"
            >
              Book Your Transfer
              <ArrowRight className="ml-3 w-5 h-5" />
            </Link>
            <a
              href="tel:021743321"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 px-6 py-4 text-lg font-medium transition-colors duration-200"
            >
              <Phone className="mr-2 w-5 h-5 text-gray-400" />
              021 743 321
            </a>
          </div>

          {/* Trust signals */}
          <div className="flex items-center justify-center gap-8 sm:gap-10 mb-20">
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Shield className="w-4 h-4 text-[#D4AF37]" />
              <span>Flat Rates</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Clock className="w-4 h-4 text-[#D4AF37]" />
              <span>24/7 Service</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Star className="w-4 h-4 text-[#D4AF37]" />
              <span>4.9&#9733; Rated</span>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto">
          <div className="text-center p-6 sm:p-8 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300">
            <div
              className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              5000+
            </div>
            <div className="text-gray-400 font-medium tracking-wider text-xs uppercase">
              Satisfied Clients
            </div>
          </div>
          <div className="text-center p-6 sm:p-8 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300">
            <div
              className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              60s
            </div>
            <div className="text-gray-400 font-medium tracking-wider text-xs uppercase">
              Booking Time
            </div>
          </div>
          <div className="text-center p-6 sm:p-8 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300">
            <div
              className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              100%
            </div>
            <div className="text-gray-400 font-medium tracking-wider text-xs uppercase">
              Fully Insured
            </div>
          </div>
          <div className="text-center p-6 sm:p-8 bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300">
            <div
              className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              4.9&#9733;
            </div>
            <div className="text-gray-400 font-medium tracking-wider text-xs uppercase">
              Rating
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
