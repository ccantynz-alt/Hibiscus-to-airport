import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { MapPin, Users, Phone, Heart, Car } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';

const FamilyAirportShuttle = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 bg-gradient-to-br from-pink-600 via-purple-500 to-indigo-600">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Heart className="w-4 h-4" /> Family Friendly
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
            Family <span className="text-gold">Airport Shuttle</span>
          </h1>
          <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
            Spacious vehicles for families with children. Room for everyone, 
            all the luggage, and even the car seats.
          </p>
          <Button 
            onClick={() => navigate('/book-now')}
            className="bg-gold hover:bg-amber-500 text-black font-bold px-8 py-6 text-lg"
          >
            Book Family Shuttle
          </Button>
        </div>
      </section>

      {/* Family Features */}
      <section className="py-12 bg-gold">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center">
              <Users className="w-10 h-10 text-black mb-2" />
              <span className="text-black font-bold">Up to 7 Passengers</span>
              <span className="text-black/70 text-sm">Room for all</span>
            </div>
            <div className="flex flex-col items-center">
              <Car className="w-10 h-10 text-black mb-2" />
              <span className="text-black font-bold">Spacious Vehicles</span>
              <span className="text-black/70 text-sm">SUVs & vans</span>
            </div>
            <div className="flex flex-col items-center">
              <Heart className="w-10 h-10 text-black mb-2" />
              <span className="text-black font-bold">Child Seats</span>
              <span className="text-black/70 text-sm">BYO or we provide</span>
            </div>
            <div className="flex flex-col items-center">
              <MapPin className="w-10 h-10 text-black mb-2" />
              <span className="text-black font-bold">Door-to-Door</span>
              <span className="text-black/70 text-sm">No transfers</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Family-Friendly Airport Transfers</h2>
          <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
            <p>
              Travelling with a family can be challenging enough without worrying about how 
              you'll all fit in a car with luggage, prams, and car seats. Our family airport 
              shuttle service is designed with your needs in mind.
            </p>
            <p>
              We have spacious vehicles that can accommodate large families, multiple suitcases, 
              and all the gear that comes with travelling with children. Need child seats? 
              Bring your own or let us know in advance and we can provide them.
            </p>
            <p>
              Our friendly drivers are experienced with families and will help with luggage, 
              make sure everyone is safely buckled in, and get you to the airport stress-free.
            </p>
          </div>

          {/* Family Pricing */}
          <div className="mt-12 bg-pink-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Family Shuttle Options</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl p-6 border border-pink-200">
                <div className="text-2xl font-bold text-gray-900 mb-2">Standard Vehicle</div>
                <div className="text-gray-600 mb-4">Up to 4 passengers</div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✓ 4 large suitcases</li>
                  <li>✓ 1 car seat (BYO)</li>
                  <li>✓ Standard pricing</li>
                </ul>
              </div>
              <div className="bg-white rounded-xl p-6 border border-pink-200">
                <div className="text-2xl font-bold text-gray-900 mb-2">Large Vehicle</div>
                <div className="text-gray-600 mb-4">Up to 7 passengers</div>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✓ 6+ large suitcases</li>
                  <li>✓ Multiple car seats</li>
                  <li>✓ +$5 per extra passenger</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-pink-500 to-purple-500">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Users className="w-16 h-16 text-white mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">The Whole Family Travels Together</h2>
          <p className="text-white/90 mb-8">Book your family airport shuttle today</p>
          <Button 
            onClick={() => navigate('/book-now')}
            className="bg-black hover:bg-gray-800 text-white font-bold px-12 py-6 text-lg"
          >
            Get Quote for Family
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default FamilyAirportShuttle;