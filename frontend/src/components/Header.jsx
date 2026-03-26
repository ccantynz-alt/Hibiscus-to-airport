import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    } else {
      window.location.href = `/#${sectionId}`;
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-md'
          : 'bg-white shadow-sm'
      } border-b border-gray-200`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="flex flex-col leading-none py-4">
              <div className="flex items-center gap-2.5">
                <span className="text-lg sm:text-xl font-light text-gray-900 tracking-widest uppercase">
                  Hibiscus
                </span>
                <div className="w-6 h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"></div>
                <span className="text-lg sm:text-xl font-light text-gray-900 tracking-widest uppercase">
                  Airport
                </span>
              </div>
              <div className="mt-0.5 text-center">
                <span className="text-[10px] font-medium text-[#D4AF37] tracking-[0.25em] uppercase">
                  Premium Transport
                </span>
              </div>
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8" aria-label="Main navigation">
            <button
              onClick={() => scrollToSection('services')}
              className="text-gray-600 hover:text-gray-900 transition-colors font-medium tracking-wide text-sm"
            >
              Services
            </button>
            <button
              onClick={() => scrollToSection('fleet')}
              className="text-gray-600 hover:text-gray-900 transition-colors font-medium tracking-wide text-sm"
            >
              Fleet
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="text-gray-600 hover:text-gray-900 transition-colors font-medium tracking-wide text-sm"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="text-gray-600 hover:text-gray-900 transition-colors font-medium tracking-wide text-sm"
            >
              Contact
            </button>
            <a
              href="/booking"
              className="inline-flex items-center bg-[#D4AF37] hover:bg-[#C4A030] text-white px-6 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Book Now
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-3 md:hidden">
            <button
              className="text-gray-700 hover:text-gray-900 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-4 py-4 space-y-1">
            <button
              onClick={() => scrollToSection('services')}
              className="block w-full text-left text-gray-700 hover:text-gray-900 hover:bg-gray-50 py-3 px-3 rounded-lg font-medium transition-colors"
            >
              Services
            </button>
            <button
              onClick={() => scrollToSection('fleet')}
              className="block w-full text-left text-gray-700 hover:text-gray-900 hover:bg-gray-50 py-3 px-3 rounded-lg font-medium transition-colors"
            >
              Fleet
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="block w-full text-left text-gray-700 hover:text-gray-900 hover:bg-gray-50 py-3 px-3 rounded-lg font-medium transition-colors"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="block w-full text-left text-gray-700 hover:text-gray-900 hover:bg-gray-50 py-3 px-3 rounded-lg font-medium transition-colors"
            >
              Contact
            </button>
            <div className="pt-3 border-t border-gray-100">
              <a
                href="/booking"
                className="block w-full text-center bg-[#D4AF37] hover:bg-[#C4A030] text-white py-3 px-6 rounded-lg font-semibold transition-colors"
              >
                Book Now
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
