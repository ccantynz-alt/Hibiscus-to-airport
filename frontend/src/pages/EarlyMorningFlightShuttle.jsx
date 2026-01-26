import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { MapPin, Clock, Phone, Sun, Sunrise } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';

const EarlyMorningFlightShuttle = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 bg-gradient-to-br from-orange-600 via-amber-500 to-yellow-400">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-black/20 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Sunrise className="w-4 h-4" /> Early Bird Service
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
            Early Morning <span className="text-black">Airport Shuttle</span>
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Catching a 6 AM flight? We'll get you there. Reliable early morning airport 
            transfers from the Hibiscus Coast - we're ready when you are.
          </p>
          <Button 
            onClick={() => navigate('/book-now')}
            className="bg-black hover:bg-gray-800 text-white font-bold px-8 py-6 text-lg"
          >
            Book Early Morning Shuttle
          </Button>
        </div>
      </section>

      {/* Early Morning Promise */}
      <section className="py-12 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center">
              <Sunrise className="w-10 h-10 text-gold mb-2" />
              <span className="text-white font-bold">4 AM Pickups</span>
              <span className="text-gray-400 text-sm">No problem</span>
            </div>
            <div className="flex flex-col items-center">
              <Clock className="w-10 h-10 text-gold mb-2" />
              <span className="text-white font-bold">Always On Time</span>
              <span className="text-gray-400 text-sm">Never miss a flight</span>
            </div>
            <div className="flex flex-col items-center">
              <Sun className="w-10 h-10 text-gold mb-2" />
              <span className="text-white font-bold">Fresh & Alert</span>
              <span className="text-gray-400 text-sm">Well-rested drivers</span>
            </div>
            <div className="flex flex-col items-center">
              <Phone className="w-10 h-10 text-gold mb-2" />
              <span className="text-white font-bold">Confirmation Call</span>
              <span className="text-gray-400 text-sm">Night before</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Early Morning Flights? No Problem!</h2>
          <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
            <p>
              We know the struggle of early morning flights. The alarm goes off at 3:30 AM, you're 
              half asleep, and the last thing you want to worry about is driving to the airport in 
              the dark. Let us take that stress away.
            </p>
            <p>
              Our early morning shuttle service is designed for those crack-of-dawn departures. We 
              pick you up from your home on the Hibiscus Coast and deliver you to Auckland Airport 
              with plenty of time to spare. Our drivers are well-rested and ready to go, no matter 
              how early your flight.
            </p>
            <p>
              The night before your trip, we'll send you a confirmation with your exact pickup time 
              and driver details. You can rest easy knowing everything is arranged.
            </p>
          </div>

          {/* Pickup Schedule */}
          <div className="mt-12 bg-amber-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Sample Pickup Times</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { flight: '6:00 AM Flight', orewa: '4:00 AM', silverdale: '4:15 AM', whangaparaoa: '3:45 AM' },
                { flight: '7:00 AM Flight', orewa: '5:00 AM', silverdale: '5:15 AM', whangaparaoa: '4:45 AM' },
              ].map((time) => (
                <div key={time.flight} className="bg-white rounded-lg p-4 border border-amber-200">
                  <div className="font-bold text-gray-900 mb-2">{time.flight}</div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Orewa: {time.orewa}</div>
                    <div>Silverdale: {time.silverdale}</div>
                    <div>Whangaparaoa: {time.whangaparaoa}</div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-4">*Times are approximate and adjusted based on your exact address</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-orange-500 to-amber-500">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Sunrise className="w-16 h-16 text-white mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">Rise & Fly With Confidence</h2>
          <p className="text-white/90 mb-8">Book your early morning airport transfer today</p>
          <Button 
            onClick={() => navigate('/book-now')}
            className="bg-black hover:bg-gray-800 text-white font-bold px-12 py-6 text-lg"
          >
            Book Now
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default EarlyMorningFlightShuttle;