import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';
import { trustBadges } from '../mock';
import Logo from './Logo';

const Footer = () => {
  return (
    <footer className="bg-elegant-darker text-white">
      {/* Trust Badges Section */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {trustBadges.map((badge, index) => (
              <div key={index} className="text-center group">
                <div className="font-bold text-gold mb-2 text-lg tracking-wide group-hover:text-amber-400 transition-colors duration-300" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {badge.title}
                </div>
                <div className="text-sm text-gray-400 font-light">{badge.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="mb-6">
              <Logo size="small" className="text-white" />
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed font-light">
              Premium airport shuttle and private transfer service connecting Hibiscus Coast to Auckland Airport with unmatched elegance and reliability.
            </p>
            <a href="tel:021743321" className="inline-flex items-center text-gold hover:text-amber-400 transition-colors duration-300 font-medium text-lg">
              <Phone className="w-5 h-5 mr-2" />
              021 743 321
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-gold tracking-wide" style={{ fontFamily: 'Montserrat, sans-serif' }}>Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <a href="/" className="text-gray-400 hover:text-gold transition-colors duration-300 font-light">Home</a>
              </li>
              <li>
                <a href="/student-airport-transfers" className="text-gray-400 hover:text-gold transition-colors duration-300 font-light">Student Services</a>
              </li>
              <li>
                <a href="#services" className="text-gray-400 hover:text-gold transition-colors duration-300 font-light">Services</a>
              </li>
              <li>
                <a href="#fleet" className="text-gray-400 hover:text-gold transition-colors duration-300 font-light">Fleet</a>
              </li>
              <li>
                <a href="#contact" className="text-gray-400 hover:text-gold transition-colors duration-300 font-light">Contact</a>
              </li>
            </ul>
          </div>

          {/* Service Areas */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-gold tracking-wide" style={{ fontFamily: 'Montserrat, sans-serif' }}>Service Areas</h4>
            <ul className="space-y-3">
              <li>
                <a href="/orewa-airport-shuttle" className="text-gray-400 hover:text-gold transition-colors duration-300 font-light">Orewa Airport Shuttle</a>
              </li>
              <li>
                <a href="/silverdale-airport-shuttle" className="text-gray-400 hover:text-gold transition-colors duration-300 font-light">Silverdale Transfers</a>
              </li>
              <li>
                <a href="/whangaparaoa-airport-shuttle" className="text-gray-400 hover:text-gold transition-colors duration-300 font-light">Whangaparaoa Shuttle</a>
              </li>
              <li>
                <a href="/red-beach-airport-shuttle" className="text-gray-400 hover:text-gold transition-colors duration-300 font-light">Red Beach Service</a>
              </li>
              <li>
                <a href="/service-areas" className="text-gray-400 hover:text-gold transition-colors duration-300 font-light">View All Areas</a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold mb-6 text-gold tracking-wide" style={{ fontFamily: 'Montserrat, sans-serif' }}>Contact Us</h4>
            <ul className="space-y-4">
              <li className="flex items-start">
                <Phone className="w-5 h-5 mr-3 text-gold flex-shrink-0 mt-0.5" />
                <a href="tel:021743321" className="text-gray-400 hover:text-gold transition-colors duration-300 font-light">
                  021 743 321
                </a>
              </li>
              <li className="flex items-start">
                <Mail className="w-5 h-5 mr-3 text-gold flex-shrink-0 mt-0.5" />
                <a href="mailto:info@bookaride.co.nz" className="text-gray-400 hover:text-gold transition-colors duration-300 font-light">
                  info@bookaride.co.nz
                </a>
              </li>
              <li className="flex items-start">
                <MapPin className="w-5 h-5 mr-3 text-gold flex-shrink-0 mt-0.5" />
                <span className="text-gray-400 font-light">
                  Hibiscus Coast<br />Auckland, New Zealand
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Service Areas & Pages SEO Links */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Suburb Shuttle Links */}
            <div>
              <h4 className="text-sm font-bold mb-4 text-gold tracking-wide uppercase" style={{ fontFamily: 'Montserrat, sans-serif' }}>Service Areas</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2">
                <Link to="/orewa-airport-shuttle" className="text-gray-400 hover:text-gold transition-colors duration-300 text-sm font-light">Orewa</Link>
                <Link to="/whangaparaoa-airport-shuttle" className="text-gray-400 hover:text-gold transition-colors duration-300 text-sm font-light">Whangaparaoa</Link>
                <Link to="/silverdale-airport-shuttle" className="text-gray-400 hover:text-gold transition-colors duration-300 text-sm font-light">Silverdale</Link>
                <Link to="/red-beach-airport-shuttle" className="text-gray-400 hover:text-gold transition-colors duration-300 text-sm font-light">Red Beach</Link>
                <Link to="/gulf-harbour-airport-shuttle" className="text-gray-400 hover:text-gold transition-colors duration-300 text-sm font-light">Gulf Harbour</Link>
                <Link to="/stanmore-bay-airport-shuttle" className="text-gray-400 hover:text-gold transition-colors duration-300 text-sm font-light">Stanmore Bay</Link>
                <Link to="/albany-airport-shuttle" className="text-gray-400 hover:text-gold transition-colors duration-300 text-sm font-light">Albany</Link>
                <Link to="/browns-bay-airport-shuttle" className="text-gray-400 hover:text-gold transition-colors duration-300 text-sm font-light">Browns Bay</Link>
                <Link to="/takapuna-airport-shuttle" className="text-gray-400 hover:text-gold transition-colors duration-300 text-sm font-light">Takapuna</Link>
                <Link to="/devonport-airport-shuttle" className="text-gray-400 hover:text-gold transition-colors duration-300 text-sm font-light">Devonport</Link>
                <Link to="/millwater-airport-shuttle" className="text-gray-400 hover:text-gold transition-colors duration-300 text-sm font-light">Millwater</Link>
                <Link to="/warkworth-airport-shuttle" className="text-gray-400 hover:text-gold transition-colors duration-300 text-sm font-light">Warkworth</Link>
              </div>
            </div>

            {/* Service Page Links */}
            <div>
              <h4 className="text-sm font-bold mb-4 text-gold tracking-wide uppercase" style={{ fontFamily: 'Montserrat, sans-serif' }}>Our Services</h4>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                <Link to="/corporate-airport-transfers" className="text-gray-400 hover:text-gold transition-colors duration-300 text-sm font-light">Corporate Transfers</Link>
                <Link to="/early-morning-airport-shuttle" className="text-gray-400 hover:text-gold transition-colors duration-300 text-sm font-light">Early Morning Shuttle</Link>
                <Link to="/family-airport-shuttle" className="text-gray-400 hover:text-gold transition-colors duration-300 text-sm font-light">Family Shuttle</Link>
                <Link to="/pricing" className="text-gray-400 hover:text-gold transition-colors duration-300 text-sm font-light">Pricing</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm font-light">
              © {new Date().getFullYear()} Hibiscus to Airport. All rights reserved.
            </p>
            <div className="flex space-x-8 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-gold text-sm transition-colors duration-300 font-light">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-gold text-sm transition-colors duration-300 font-light">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-gold text-sm transition-colors duration-300 font-light">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;