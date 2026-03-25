import React from 'react';
import { Card, CardContent } from './ui/card';
import { Users, Luggage, Shield, Clock, Car, Bus, Crown } from 'lucide-react';

const fleet = [
  {
    id: 1,
    name: 'Standard Transfer',
    badge: 'MOST POPULAR',
    badgeColor: 'bg-gold text-black',
    description: 'Comfortable daytime airport shuttle for individuals and small groups',
    passengers: '1-4',
    luggage: '4-6',
    icon: Car,
    gradient: 'from-amber-500 to-yellow-600',
    iconBg: 'bg-amber-500/20',
    borderHover: 'hover:border-amber-500',
  },
  {
    id: 2,
    name: 'Premium Van',
    badge: '24/7 AVAILABLE',
    badgeColor: 'bg-blue-600 text-white',
    description: 'Spacious van for families and medium groups with extra luggage room',
    passengers: '5-8',
    luggage: '8-10',
    icon: Bus,
    gradient: 'from-yellow-600 to-amber-600',
    iconBg: 'bg-yellow-600/20',
    borderHover: 'hover:border-yellow-600',
  },
  {
    id: 3,
    name: 'Executive Group',
    badge: 'AIRPORT SPECIAL',
    badgeColor: 'bg-green-600 text-white',
    description: 'Full-size Toyota Hiace for large groups, events, and corporate travel',
    passengers: '9-11',
    luggage: '12+',
    icon: Crown,
    gradient: 'from-amber-600 to-amber-800',
    iconBg: 'bg-amber-700/20',
    borderHover: 'hover:border-amber-700',
  }
];

const Fleet = () => {
  return (
    <section id="fleet" className="py-20 bg-gray-50 reveal-on-scroll">
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
          {/* Big Group Banner */}
          <div className="flex justify-center mb-8">
            <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white px-8 py-3 rounded-full font-bold text-lg shadow-lg border border-gold/30">
              BIG GROUP? Book Multiple Vans! <span className="ml-2 bg-gold text-black px-3 py-1 rounded-full text-sm">22+ PASSENGERS</span>
            </div>
          </div>

          {/* Vehicle Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {fleet.map((vehicle) => {
              const IconComponent = vehicle.icon;
              return (
                <Card key={vehicle.id} className="overflow-hidden border border-gray-200 hover:border-gold/60 hover:shadow-lg hover:shadow-gold/5 transition-all duration-300 bg-white relative rounded-xl group">
                  {vehicle.badge && (
                    <div className={`absolute top-4 right-4 ${vehicle.badgeColor} px-3 py-1 rounded-full text-xs font-bold z-10`}>
                      {vehicle.badge}
                    </div>
                  )}
                  {/* Icon visual area */}
                  <div className={`aspect-[4/3] bg-gradient-to-br ${vehicle.gradient} flex items-center justify-center relative overflow-hidden`}>
                    {/* Decorative background circles */}
                    <div className="absolute top-4 left-4 w-24 h-24 bg-white/10 rounded-full"></div>
                    <div className="absolute bottom-4 right-4 w-32 h-32 bg-white/10 rounded-full"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/5 rounded-full"></div>
                    <IconComponent className="w-24 h-24 text-white drop-shadow-lg group-hover:scale-110 transition-transform duration-500 relative z-10" strokeWidth={1.5} />
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
              );
            })}
          </div>

          {/* Additional Capacity Info - Responsive */}
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl p-8 sm:p-12 text-center text-white mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold mb-3">Need More Than 11 Passengers? We've Got You Covered!</h3>
            <p className="text-gray-300 mb-8 text-lg">Perfect for corporate events, weddings, concerts, and large group outings.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
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
            <div className="flex items-center bg-white border border-gray-200 hover:border-gold/60 hover:shadow-lg hover:shadow-gold/5 transition-all duration-300 rounded-lg p-6">
              <Shield className="w-10 h-10 text-gold mr-4 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-gray-900 mb-1">Fully Licensed & Insured</h4>
                <p className="text-sm text-gray-600">All vehicles meet safety standards</p>
              </div>
            </div>
            <div className="flex items-center bg-white border border-gray-200 hover:border-gold/60 hover:shadow-lg hover:shadow-gold/5 transition-all duration-300 rounded-lg p-6">
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
