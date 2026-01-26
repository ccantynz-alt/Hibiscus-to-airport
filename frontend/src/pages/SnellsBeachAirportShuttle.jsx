import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { MapPin, Clock, Phone, Star, Waves } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';

const SnellsBeachAirportShuttle = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 bg-gradient-to-br from-cyan-800 via-teal-700 to-gray-900">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-gold/20 text-gold px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Waves className="w-4 h-4" /> Coastal Community Specialists
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
            Snells Beach <span className="text-gold">Airport Shuttle</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Door-to-door airport transfers from Snells Beach to Auckland Airport. 
            Your local coastal shuttle service.
          </p>
          <Button 
            onClick={() => navigate('/book-now')}
            className="bg-gold hover:bg-amber-500 text-black font-bold px-8 py-6 text-lg"
          >
            Book Snells Beach Shuttle
          </Button>
        </div>
      </section>

      {/* Coverage */}
      <section className="py-12 bg-gold">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-black text-center mb-6">Snells Beach & Surrounds</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {['Snells Beach', 'Algies Bay', 'Sandspit', 'Mahurangi'].map((area) => (
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
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Snells Beach Airport Transfer Service</h2>
          <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
            <p>
              Snells Beach is one of the Hibiscus Coast's hidden gems - a peaceful coastal community 
              that offers the best of New Zealand beach living. When it's time to fly, let us handle 
              your transport to Auckland Airport.
            </p>
            <p>
              Our drivers know the Snells Beach area intimately, from the main township to Algies Bay, 
              Sandspit, and the surrounding Mahurangi district. We'll pick you up right from your 
              doorstep and deliver you to the terminal with time to spare.
            </p>
          </div>

          <div className="mt-12 bg-cyan-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Snells Beach to Airport</h3>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="text-3xl font-bold text-gold">From $185</div>
                <div className="text-gray-600">One-way transfer</div>
              </div>
              <div className="text-right">
                <div className="text-gray-900 font-medium">~55-65 minutes</div>
                <div className="text-gray-500 text-sm">Depending on traffic</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Book Your Snells Beach Airport Transfer</h2>
          <p className="text-gray-400 mb-8">Reliable service from your coastal paradise to the airport</p>
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

export default SnellsBeachAirportShuttle;