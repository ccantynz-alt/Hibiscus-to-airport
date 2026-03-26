import React from 'react';
import { Card, CardContent } from './ui/card';
import { Users, Luggage, Shield, Clock, Car, Bus, Crown } from 'lucide-react';

const fleet = [
  {
    id: 1,
    name: 'Standard Transfer',
    badge: 'MOST POPULAR',
    badgeColor: 'bg-[#1B2B4B]/5 text-[#1B2B4B] border border-[#1B2B4B]/10',
    description: 'Comfortable daytime airport shuttle for individuals and small groups',
    passengers: '1-4',
    luggage: '4-6',
    icon: Car,
    iconBg: 'bg-gray-50',
  },
  {
    id: 2,
    name: 'Premium Van',
    badge: '24/7 AVAILABLE',
    badgeColor: 'bg-gray-100 text-gray-700 border border-gray-200',
    description: 'Spacious van for families and medium groups with extra luggage room',
    passengers: '5-8',
    luggage: '8-10',
    icon: Bus,
    iconBg: 'bg-gray-50',
  },
  {
    id: 3,
    name: 'Executive Group',
    badge: 'AIRPORT SPECIAL',
    badgeColor: 'bg-gray-900/5 text-gray-900 border border-gray-200',
    description: 'Full-size Toyota Hiace for large groups, events, and corporate travel',
    passengers: '9-11',
    luggage: '12+',
    icon: Crown,
    iconBg: 'bg-gray-50',
  }
];

const Fleet = () => {
  return (
    <section id="fleet" className="py-20 bg-[#F8FAFB] reveal-on-scroll">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-[#1B2B4B] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Our Fleet
          </h2>
          <div className="w-16 h-px bg-[#D4AF37] mx-auto mt-4 mb-6"></div>
          <p className="text-xl text-[#4A5568] max-w-2xl mx-auto">
            Clean, comfortable, and reliable vehicles for every group size
          </p>
        </div>

        <div className="relative">
          {/* Big Group Banner */}
          <div className="flex justify-center mb-8">
            <div className="bg-white text-[#1B2B4B] px-8 py-3 rounded-full font-semibold text-lg shadow-sm border border-[#E8ECF0]">
              BIG GROUP? Book Multiple Vans! <span className="ml-2 bg-[#1B2B4B]/5 text-[#1B2B4B] px-3 py-1 rounded-full text-sm font-bold">22+ PASSENGERS</span>
            </div>
          </div>

          {/* Vehicle Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {fleet.map((vehicle) => {
              const IconComponent = vehicle.icon;
              return (
                <Card key={vehicle.id} className="overflow-hidden bg-[#FAFBFC] border border-[#E8ECF0] shadow-sm hover:shadow-md transition-all duration-300 relative rounded-xl group">
                  {vehicle.badge && (
                    <div className={`absolute top-4 right-4 ${vehicle.badgeColor} px-3 py-1 rounded-full text-xs font-bold z-10`}>
                      {vehicle.badge}
                    </div>
                  )}
                  {/* Icon visual area */}
                  <div className={`aspect-[4/3] ${vehicle.iconBg} flex items-center justify-center relative overflow-hidden border-b border-[#E8ECF0]`}>
                    <IconComponent className="w-24 h-24 text-[#8896A6] group-hover:text-[#1B2B4B] group-hover:scale-110 transition-all duration-500 relative z-10" strokeWidth={1.5} />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-[#1B2B4B] mb-2">{vehicle.name}</h3>
                    <p className="text-[#4A5568] mb-6">{vehicle.description}</p>
                    <div className="flex items-center justify-around text-sm text-[#4A5568] border-t border-[#E8ECF0] pt-4">
                      <div className="flex items-center">
                        <Users className="w-5 h-5 mr-2 text-[#1B2B4B]" />
                        <div>
                          <div className="font-bold text-lg text-[#1B2B4B]">{vehicle.passengers}</div>
                          <div className="text-xs text-[#8896A6]">passengers</div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Luggage className="w-5 h-5 mr-2 text-[#1B2B4B]" />
                        <div>
                          <div className="font-bold text-lg text-[#1B2B4B]">{vehicle.luggage}</div>
                          <div className="text-xs text-[#8896A6]">bags</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Additional Capacity Info */}
          <div className="bg-white rounded-2xl p-8 sm:p-12 text-center border border-[#E8ECF0] shadow-sm mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-[#1B2B4B] mb-3">Need More Than 11 Passengers? We've Got You Covered!</h3>
            <p className="text-[#4A5568] mb-8 text-lg">Perfect for corporate events, weddings, concerts, and large group outings.</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
              <div className="bg-[#F8FAFB] rounded-xl p-6 border border-[#E8ECF0]">
                <div className="text-5xl font-bold text-[#1B2B4B] mb-2">22</div>
                <div className="text-[#1B2B4B] font-semibold mb-1">2 Vans Available</div>
                <div className="text-sm text-[#8896A6]">For medium groups</div>
              </div>
              <div className="bg-[#F8FAFB] rounded-xl p-6 border border-[#E8ECF0]">
                <div className="text-5xl font-bold text-[#1B2B4B] mb-2">33</div>
                <div className="text-[#1B2B4B] font-semibold mb-1">3 Vans Available</div>
                <div className="text-sm text-[#8896A6]">For large events</div>
              </div>
              <div className="bg-[#F8FAFB] rounded-xl p-6 border border-[#E8ECF0]">
                <div className="text-5xl font-bold text-[#1B2B4B] mb-2">44+</div>
                <div className="text-[#1B2B4B] font-semibold mb-1">4+ Vans Available</div>
                <div className="text-sm text-[#8896A6]">For major events</div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="flex items-center bg-white border border-[#E8ECF0] shadow-sm hover:shadow-md transition-all duration-300 rounded-lg p-6">
              <Shield className="w-10 h-10 text-[#1B2B4B] mr-4 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-[#1B2B4B] mb-1">Fully Licensed & Insured</h4>
                <p className="text-sm text-[#4A5568]">All vehicles meet safety standards</p>
              </div>
            </div>
            <div className="flex items-center bg-white border border-[#E8ECF0] shadow-sm hover:shadow-md transition-all duration-300 rounded-lg p-6">
              <Clock className="w-10 h-10 text-[#1B2B4B] mr-4 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-[#1B2B4B] mb-1">24/7 Service Available</h4>
                <p className="text-sm text-[#4A5568]">Day and night airport transfers</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Fleet;
