import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shield, Clock, Star, CheckCircle } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative pt-32 pb-16 sm:pt-36 sm:pb-24 overflow-hidden min-h-[85vh] flex items-center"
      style={{ background: 'linear-gradient(180deg, #FDFBF7 0%, #F9F6F0 40%, #FFFFFF 100%)' }}
    >
      {/* Subtle warm decorative shapes */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-amber-50/60 via-orange-50/30 to-transparent rounded-full -translate-y-1/3 translate-x-1/4 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-amber-50/40 via-yellow-50/20 to-transparent rounded-full translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-4xl mx-auto">
          {/* Tagline */}
          <p className="text-[#D4AF37] text-xs sm:text-sm font-semibold tracking-[0.25em] uppercase mb-8">
            Premium Private Airport Shuttle
          </p>

          {/* Heading */}
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-[1.15]"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Hibiscus Coast to
            <br />
            <span className="text-[#D4AF37]">Auckland Airport</span>
          </h1>

          {/* Description */}
          <p className="text-base sm:text-lg text-gray-500 mb-10 max-w-xl mx-auto leading-relaxed">
            Door-to-door private transfers — no sharing, no waiting.
            Professional drivers, flat rates, 24/7 service.
          </p>

          {/* CTA button — warm gold, not harsh black */}
          <div className="mb-10">
            <Link
              to="/booking"
              className="inline-flex items-center bg-[#D4AF37] hover:bg-[#C4A030] text-white px-10 py-4 text-base sm:text-lg font-semibold rounded-lg shadow-md hover:shadow-lg hover:translate-y-[-1px] transition-all duration-300"
            >
              Book Your Transfer
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>

          {/* Compact trust row */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-16 sm:mb-20">
            {['Private ride — never shared', 'Flat rates 24/7', 'Fully insured', '4.9★ rated'].map((item) => (
              <div key={item} className="flex items-center gap-1.5 text-gray-400 text-xs sm:text-sm">
                <CheckCircle className="w-3.5 h-3.5 text-[#D4AF37]/70" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats — clean, warm */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5 max-w-3xl mx-auto">
          {[
            { value: '5,000+', label: 'Happy Customers' },
            { value: '60s', label: 'To Book Online' },
            { value: '100%', label: 'Fully Insured' },
            { value: '4.9★', label: 'Customer Rating' },
          ].map((stat) => (
            <div key={stat.label} className="text-center py-5 px-3 bg-white rounded-xl border border-gray-100 shadow-sm">
              <div
                className="text-2xl sm:text-3xl font-bold text-gray-800 mb-0.5"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                {stat.value}
              </div>
              <div className="text-gray-400 text-[11px] sm:text-xs font-medium tracking-wide uppercase">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
