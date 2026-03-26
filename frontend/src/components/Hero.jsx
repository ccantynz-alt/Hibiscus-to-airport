import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative pt-32 pb-16 sm:pt-40 sm:pb-24 overflow-hidden min-h-[85vh] flex items-center bg-white">
      {/* Subtle warm texture */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, #1B2B4B 0.5px, transparent 0)',
        backgroundSize: '24px 24px'
      }}></div>

      {/* Decorative accent line at top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-4xl mx-auto">
          {/* Tagline */}
          <div className="inline-flex items-center gap-2 bg-[#1B2B4B]/5 border border-[#1B2B4B]/10 rounded-full px-5 py-2 mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></div>
            <span className="text-[#1B2B4B] text-xs sm:text-sm font-medium tracking-wider uppercase">
              Premium Private Airport Shuttle
            </span>
          </div>

          {/* Heading — deep navy, not gray */}
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-[#1B2B4B] mb-6 leading-[1.1]"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Hibiscus Coast to
            <br />
            Auckland Airport
          </h1>

          {/* Gold accent divider */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-px bg-[#D4AF37]"></div>
            <div className="w-2 h-2 rotate-45 border border-[#D4AF37]"></div>
            <div className="w-12 h-px bg-[#D4AF37]"></div>
          </div>

          {/* Description — warm, readable */}
          <p className="text-base sm:text-lg lg:text-xl text-[#4A5568] mb-10 max-w-2xl mx-auto leading-relaxed">
            Door-to-door private transfers with professional drivers.
            No sharing, no waiting — just reliable flat-rate service, 24/7.
          </p>

          {/* CTA — rich gradient button */}
          <div className="mb-10">
            <Link
              to="/booking"
              className="inline-flex items-center text-white px-10 sm:px-12 py-4 sm:py-5 text-base sm:text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl hover:translate-y-[-2px] transition-all duration-300"
              style={{ background: 'linear-gradient(135deg, #1B2B4B 0%, #2D4A7A 100%)' }}
            >
              Book Your Transfer
              <ArrowRight className="ml-3 w-5 h-5" />
            </Link>
          </div>

          {/* Trust row */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 sm:gap-x-8 gap-y-3 mb-16 sm:mb-20">
            {['Private ride — never shared', 'Flat rates 24/7', 'Fully insured', '4.9★ rated'].map((item) => (
              <div key={item} className="flex items-center gap-2 text-[#4A5568] text-sm">
                <CheckCircle className="w-4 h-4 text-[#D4AF37]" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto">
          {[
            { value: '5,000+', label: 'Happy Customers' },
            { value: '60s', label: 'To Book Online' },
            { value: '100%', label: 'Fully Insured' },
            { value: '4.9★', label: 'Customer Rating' },
          ].map((stat) => (
            <div key={stat.label} className="text-center py-6 px-4 bg-[#FAFBFC] rounded-xl border border-gray-100 hover:border-[#D4AF37]/30 hover:shadow-sm transition-all duration-300">
              <div
                className="text-2xl sm:text-3xl font-bold text-[#1B2B4B] mb-1"
                style={{ fontFamily: 'Playfair Display, serif' }}
              >
                {stat.value}
              </div>
              <div className="text-[#8896A6] text-[11px] sm:text-xs font-medium tracking-wider uppercase">
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
