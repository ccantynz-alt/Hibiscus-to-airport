import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { MapPin, Clock, Phone, Building } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';

const DairyFlatAirportShuttle = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 bg-gradient-to-br from-slate-800 via-gray-700 to-gray-900">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-gold/20 text-gold px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Building className="w-4 h-4" /> Business & Lifestyle Hub
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
            Dairy Flat <span className="text-gold">Airport Shuttle</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Premium airport transfers from Dairy Flat, Albany Heights, and surrounds 
            to Auckland Airport. Quick motorway access.
          </p>
          <Button 
            onClick={() => navigate('/book-now')}
            className="bg-gold hover:bg-amber-500 text-black font-bold px-8 py-6 text-lg"
          >
            Book Dairy Flat Shuttle
          </Button>
        </div>
      </section>

      {/* Coverage */}
      <section className="py-12 bg-gold">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-black text-center mb-6">Dairy Flat Area Coverage</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {['Dairy Flat', 'Albany Heights', 'Coatesville', 'Riverhead'].map((area) => (
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
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Dairy Flat Airport Transfer Service</h2>
          <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
            <p>
              Dairy Flat has evolved from a rural area into a thriving business and lifestyle hub 
              north of Auckland. With the Northern Motorway Extension providing excellent access, 
              getting to Auckland Airport is faster than ever - especially with our professional shuttle service.
            </p>
            <p>
              We serve all of Dairy Flat including the business parks, rural properties, and the 
              surrounding areas of Albany Heights, Coatesville, and Riverhead. Our drivers know 
              the local roads and the best routes to the airport.
            </p>
          </div>

          <div className="mt-12 bg-slate-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Dairy Flat to Airport</h3>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="text-3xl font-bold text-gold">From $120</div>
                <div className="text-gray-600">One-way transfer</div>
              </div>
              <div className="text-right">
                <div className="text-gray-900 font-medium">~25-35 minutes</div>
                <div className="text-gray-500 text-sm">Via Northern Motorway</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Book Your Dairy Flat Airport Transfer</h2>
          <p className="text-gray-400 mb-8">Fast motorway access to Auckland Airport</p>
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

export default DairyFlatAirportShuttle;