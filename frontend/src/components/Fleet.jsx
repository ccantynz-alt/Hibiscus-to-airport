import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Users, Luggage, Shield, Clock } from 'lucide-react';
import { Button } from './ui/button';

// Fleet vehicle image — host your own or use a CDN you control
const TOYOTA_HIACE_IMAGE = '/images/toyota-hiace.jpg';

const fleet = [
  {
    id: 1,
    name: 'Toyota Hiace - Day Service',
    badge: 'MOST POPULAR',
    badgeColor: 'bg-gold text-black',
    description: 'Premium daytime transfers',
    passengers: '11',
    luggage: '12+',
    image: TOYOTA_HIACE_IMAGE
  },
  {
    id: 2,
    name: 'Toyota Hiace - Night Service',
    badge: '24/7 AVAILABLE',
    badgeColor: 'bg-blue-600 text-white',
    description: 'Late night & early morning pickups',
    passengers: '11',
    luggage: '12+',
    image: TOYOTA_HIACE_IMAGE
  },
  {
    id: 3,
    name: 'Toyota Hiace - Airport Express',
    badge: 'AIRPORT SPECIAL',
    badgeColor: 'bg-green-600 text-white',
    description: 'Flight-tracked service',
    passengers: '11',
    luggage: '12+',
    image: TOYOTA_HIACE_IMAGE
  }
];

const Fleet = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % fleet.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + fleet.length) % fleet.length);
  };

  return (
    <section id="fleet" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Our <span className="text-gold">Fleet</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Clean, comfortable, and reliable vehicles for every group size
          </p>
        </div>

        <div className="relative">
          {/* Big Group Banner - Like Bookaride */}
          <div className="flex justify-center mb-8">
            <div className="bg-gradient-to-r from-gold via-amber-400 to-gold text-black px-8 py-3 rounded-full font-bold text-lg shadow-lg">
              BIG GROUP? Book Multiple Vans! <span className="ml-2 bg-black text-gold px-3 py-1 rounded-full text-sm">22+ PASSENGERS</span>
            </div>
          </div>

          {/* Desktop View */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {fleet.map((vehicle) => (
              <Card key={vehicle.id} className="overflow-hidden border border-gray-200 hover:border-gold hover:shadow-xl transition-all duration-300 bg-white relative rounded-xl">
                {vehicle.badge && (
                  <div className={`absolute top-4 right-4 ${vehicle.badgeColor || 'bg-gold text-black'} px-3 py-1 rounded-full text-xs font-bold z-10`}>
                    {vehicle.badge}
                  </div>
                )}
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={vehicle.image}
                    alt={vehicle.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{vehicle.name}</h3>
                  <p className="text-gray-600 mb-6">{vehicle.description}</p>
                  <div className="flex items-center justify-around text-sm text-gray-700 border-t border-gray-200 pt-4">
                    <div className="flex items-center">
                      <Users className="w-5 h-5 mr-2 text-gold" />
                      <div>
                        <div className="font-bold text-lg text-gray-900">{vehicle.passengers}</div>
                        <div className="text-xs text-gray-500">passengers</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Luggage className="w-5 h-5 mr-2 text-gold" />
                      <div>
                        <div className="font-bold text-lg text-gray-900">{vehicle.luggage}</div>
                        <div className="text-xs text-gray-500">bags</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Additional Capacity Info - Exact from screenshot */}
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl p-12 text-center text-white mb-12">
            <h3 className="text-3xl font-bold mb-3">Need More Than 11 Passengers? We've Got You Covered!</h3>
            <p className="text-gray-300 mb-8 text-lg">Perfect for corporate events, weddings, concerts, and large group outings.</p>
            <div className="grid grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <div className="text-5xl font-bold text-gold mb-2">22</div>
                <div className="text-white font-semibold mb-1">2 Vans Available</div>
                <div className="text-sm text-gray-400">For medium groups</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <div className="text-5xl font-bold text-gold mb-2">33</div>
                <div className="text-white font-semibold mb-1">3 Vans Available</div>
                <div className="text-sm text-gray-400">For large events</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
                <div className="text-5xl font-bold text-gold mb-2">44+</div>
                <div className="text-white font-semibold mb-1">4+ Vans Available</div>
                <div className="text-sm text-gray-400">For major events</div>
              </div>
            </div>
          </div>
          
          {/* Features */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="flex items-center bg-white border-2 border-gray-200 rounded-lg p-6">
              <Shield className="w-10 h-10 text-gold mr-4 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-gray-900 mb-1">Fully Licensed & Insured</h4>
                <p className="text-sm text-gray-600">All vehicles meet safety standards</p>
              </div>
            </div>
            <div className="flex items-center bg-white border-2 border-gray-200 rounded-lg p-6">
              <Clock className="w-10 h-10 text-gold mr-4 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-gray-900 mb-1">24/7 Service Available</h4>
                <p className="text-sm text-gray-600">Day and night airport transfers</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Fleet;