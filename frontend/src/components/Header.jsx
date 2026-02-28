import React, { useState } from 'react';
import { Button } from './ui/button';
import { Menu, X } from 'lucide-react';
import Logo from './Logo';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    } else {
      // Not on the homepage — navigate there with the hash
      window.location.href = `/#${sectionId}`;
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-lg border-b border-gold/20 shadow-lg shadow-gold/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/">
              <Logo />
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8" aria-label="Main navigation">
            <button
              onClick={() => scrollToSection('services')}
              className="text-gray-300 hover:text-gold transition-colors font-medium tracking-wide text-sm"
            >
              Services
            </button>
            <button
              onClick={() => scrollToSection('fleet')}
              className="text-gray-300 hover:text-gold transition-colors font-medium tracking-wide text-sm"
            >
              Fleet
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="text-gray-300 hover:text-gold transition-colors font-medium tracking-wide text-sm"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="text-gray-300 hover:text-gold transition-colors font-medium tracking-wide text-sm"
            >
              Contact
            </button>
            <a href="/booking">
              <Button className="bg-gold hover:bg-amber-500 text-black font-bold tracking-wide shadow-lg shadow-gold/20 hover:shadow-gold/40 transition-all duration-300">
                Book Now
              </Button>
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gold"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-900 border-t border-gold/20">
          <div className="px-4 py-4 space-y-3">
            <button
              onClick={() => scrollToSection('services')}
              className="block w-full text-left text-gray-300 hover:text-gold py-2 font-medium"
            >
              Services
            </button>
            <button
              onClick={() => scrollToSection('fleet')}
              className="block w-full text-left text-gray-300 hover:text-gold py-2 font-medium"
            >
              Fleet
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="block w-full text-left text-gray-300 hover:text-gold py-2 font-medium"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="block w-full text-left text-gray-300 hover:text-gold py-2 font-medium"
            >
              Contact
            </button>
            <a href="/booking" className="block">
              <Button className="w-full bg-gold hover:bg-amber-500 text-black font-bold tracking-wide">
                Book Now
              </Button>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;