import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { MapPin, Clock, Phone, Star, Shield, Car } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';

const WarkworthAirportShuttle = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block bg-gold/20 text-gold px-4 py-2 rounded-full text-sm font-medium mb-6">
            Serving Warkworth & Surrounds
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
            Warkworth <span className="text-gold">Airport Shuttle</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Premium door-to-door airport transfers from Warkworth to Auckland Airport. 
            Reliable, comfortable, and always on time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate('/book-now')}
              className="bg-gold hover:bg-amber-500 text-black font-bold px-8 py-6 text-lg"
            >
              Book Warkworth Shuttle
            </Button>
            <Button 
              variant="outline"
              className="border-white text-white hover:bg-white/10 px-8 py-6 text-lg"
              onClick={() => window.location.href = 'tel:021743321'}
            >
              <Phone className="w-5 h-5 mr-2" /> Call 021 743 321
            </Button>
          </div>
        </div>
      </section>

      {/* Coverage Areas */}
      <section className="py-12 bg-gold">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-black text-center mb-8">Warkworth Area Coverage</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-center">
            {['Warkworth Town', 'Matakana', 'Snells Beach', 'Algies Bay', 'Sandspit', 'Omaha', 'Point Wells', 'Leigh', 'Pakiri', 'Wellsford', 'Dome Valley', 'Puhoi'].map((area) => (
              <div key={area} className="flex items-center justify-center gap-2 bg-black/10 rounded-lg py-3 px-2">
                <MapPin className="w-4 h-4 text-black" />
                <span className="text-black font-medium text-sm">{area}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Your Local Warkworth Airport Transfer Experts</h2>
          <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
            <p>
              Living in beautiful Warkworth means you're surrounded by stunning countryside, world-class wineries, 
              and the charming Matakana Coast. But when it comes to getting to Auckland Airport, the distance can 
              be a challenge. That's where Hibiscus to Airport comes in.
            </p>
            <p>
              We provide premium door-to-door shuttle services from Warkworth and all surrounding areas directly 
              to Auckland International and Domestic terminals. Our experienced local drivers know every road, 
              shortcut, and the best routes to get you there on time, every time.
            </p>
            <p>
              Whether you're catching an early morning international flight or returning home late at night, 
              we offer flexible pickup times to suit your schedule. No more worrying about parking fees, 
              asking friends for rides, or navigating airport traffic yourself.
            </p>
          </div>

          {/* Pricing Info */}
          <div className="mt-12 bg-gray-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Warkworth to Airport Pricing</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="text-3xl font-bold text-gold mb-2">From $180</div>
                <div className="text-gray-600">Warkworth Town Centre</div>
                <ul className="mt-4 space-y-2 text-sm text-gray-600">
                  <li>✓ Door-to-door service</li>
                  <li>✓ Flight monitoring</li>
                  <li>✓ Free waiting time</li>
                </ul>
              </div>
              <div className="bg-white rounded-xl p-6 border border-gray-200">
                <div className="text-3xl font-bold text-gold mb-2">From $200</div>
                <div className="text-gray-600">Matakana & Surrounds</div>
                <ul className="mt-4 space-y-2 text-sm text-gray-600">
                  <li>✓ All Matakana addresses</li>
                  <li>✓ Omaha, Leigh, Point Wells</li>
                  <li>✓ Early morning available</li>
                </ul>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4">* Prices may vary based on exact pickup location. Get an instant quote online.</p>
          </div>

          {/* Features */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="text-center p-6">
              <Clock className="w-12 h-12 text-gold mx-auto mb-4" />
              <h4 className="font-bold text-gray-900 mb-2">24/7 Service</h4>
              <p className="text-gray-600 text-sm">Early morning flights? Late night arrivals? We've got you covered.</p>
            </div>
            <div className="text-center p-6">
              <Car className="w-12 h-12 text-gold mx-auto mb-4" />
              <h4 className="font-bold text-gray-900 mb-2">Premium Vehicles</h4>
              <p className="text-gray-600 text-sm">Comfortable, clean vehicles with plenty of luggage space.</p>
            </div>
            <div className="text-center p-6">
              <Shield className="w-12 h-12 text-gold mx-auto mb-4" />
              <h4 className="font-bold text-gray-900 mb-2">Reliable & Safe</h4>
              <p className="text-gray-600 text-sm">Professional drivers, fully insured, and always punctual.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Book Your Warkworth Airport Shuttle?</h2>
          <p className="text-gray-400 mb-8">Get an instant quote and book online in minutes</p>
          <Button 
            onClick={() => navigate('/book-now')}
            className="bg-gold hover:bg-amber-500 text-black font-bold px-12 py-6 text-lg"
          >
            Get Instant Quote
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default WarkworthAirportShuttle;