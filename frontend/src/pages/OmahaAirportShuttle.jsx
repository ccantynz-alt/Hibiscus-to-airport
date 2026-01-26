import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { MapPin, Clock, Phone, Star, Umbrella } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';

const OmahaAirportShuttle = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 bg-gradient-to-br from-amber-700 via-orange-600 to-gray-900">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-gold/20 text-gold px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Umbrella className="w-4 h-4" /> Premium Beach Community
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
            Omaha Beach <span className="text-gold">Airport Shuttle</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Premium airport transfers from Omaha Beach to Auckland Airport. 
            Servicing Omaha, Point Wells, and Matakana Coast.
          </p>
          <Button 
            onClick={() => navigate('/book-now')}
            className="bg-gold hover:bg-amber-500 text-black font-bold px-8 py-6 text-lg"
          >
            Book Omaha Shuttle
          </Button>
        </div>
      </section>

      {/* Coverage */}
      <section className="py-12 bg-gold">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-black text-center mb-6">Omaha & Matakana Coast</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            {['Omaha Beach', 'Omaha Flats', 'Point Wells', 'Matakana', 'Leigh'].map((area) => (
              <div key={area} className="flex items-center justify-center gap-2 bg-black/10 rounded-lg py-3">
                <MapPin className="w-4 h-4 text-black" />
                <span className="text-black font-medium">{area}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Omaha Beach Airport Transfer Service</h2>
          <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
            <p>
              Omaha Beach is one of Auckland's most sought-after coastal destinations. Whether you're 
              a permanent resident or visiting your holiday bach, getting to the airport shouldn't 
              be a hassle. Our premium shuttle service connects Omaha Beach directly to Auckland Airport.
            </p>
            <p>
              We cover all of Omaha Beach, Omaha Flats, and the surrounding areas including Point Wells. 
              Our drivers are familiar with every street and can navigate the area efficiently, 
              ensuring you reach your flight on time.
            </p>
          </div>

          <div className="mt-12 bg-amber-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Omaha to Airport Pricing</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 border border-amber-200">
                <div className="text-3xl font-bold text-gold mb-2">From $195</div>
                <div className="text-gray-600">Omaha Beach</div>
              </div>
              <div className="bg-white rounded-xl p-6 border border-amber-200">
                <div className="text-3xl font-bold text-gold mb-2">From $210</div>
                <div className="text-gray-600">Point Wells / Leigh</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Book Your Omaha Airport Transfer</h2>
          <p className="text-gray-400 mb-8">Premium service from beach to boarding gate</p>
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

export default OmahaAirportShuttle;