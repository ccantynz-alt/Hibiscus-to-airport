import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { MapPin, Clock, Phone, Briefcase, Shield, Star } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';

const ExecutiveAirportTransfers = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-gold/20 text-gold px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Briefcase className="w-4 h-4" /> Executive Service
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
            Executive <span className="text-gold">Airport Transfers</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Premium executive transport for business professionals. Discreet, reliable, 
            and impeccably presented service to Auckland Airport.
          </p>
          <Button 
            onClick={() => navigate('/book-now')}
            className="bg-gold hover:bg-amber-500 text-black font-bold px-8 py-6 text-lg"
          >
            Book Executive Transfer
          </Button>
        </div>
      </section>

      {/* Executive Features */}
      <section className="py-12 bg-gold">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center">
              <Briefcase className="w-10 h-10 text-black mb-2" />
              <span className="text-black font-bold">Professional Drivers</span>
              <span className="text-black/70 text-sm">Suited & discreet</span>
            </div>
            <div className="flex flex-col items-center">
              <Shield className="w-10 h-10 text-black mb-2" />
              <span className="text-black font-bold">Confidential</span>
              <span className="text-black/70 text-sm">Business privacy</span>
            </div>
            <div className="flex flex-col items-center">
              <Star className="w-10 h-10 text-black mb-2" />
              <span className="text-black font-bold">Premium Vehicles</span>
              <span className="text-black/70 text-sm">Luxury comfort</span>
            </div>
            <div className="flex flex-col items-center">
              <Clock className="w-10 h-10 text-black mb-2" />
              <span className="text-black font-bold">Punctual</span>
              <span className="text-black/70 text-sm">Time is money</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Executive Airport Transfer Service</h2>
          <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
            <p>
              For business executives and professionals who demand the highest standards, our 
              executive airport transfer service delivers premium transport with impeccable attention 
              to detail. From the North Shore and Hibiscus Coast to Auckland Airport.
            </p>
            <p>
              Our executive service features professionally dressed drivers, pristine vehicles, 
              and a commitment to your schedule. Whether you're heading to an important meeting 
              or catching an international business flight, arrive composed and on time.
            </p>
            <p>
              We understand the value of your time and the importance of confidentiality. Our drivers 
              are trained to provide a professional, quiet journey - perfect for last-minute preparation 
              or simply relaxing before your flight.
            </p>
          </div>

          {/* Executive Benefits */}
          <div className="mt-12 bg-gray-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Executive Service Includes</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                'Meet & Greet at arrivals',
                'Flight monitoring & delay adjustment',
                'Complimentary water',
                'Phone charging available',
                'Luggage assistance',
                'Corporate account options',
                'Priority booking',
                'Invoice/receipt provided',
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-gold rounded-full"></div>
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Briefcase className="w-16 h-16 text-gold mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">Travel Like an Executive</h2>
          <p className="text-gray-400 mb-8">Book your premium airport transfer today</p>
          <Button 
            onClick={() => navigate('/book-now')}
            className="bg-gold hover:bg-amber-500 text-black font-bold px-12 py-6 text-lg"
          >
            Book Executive Transfer
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ExecutiveAirportTransfers;