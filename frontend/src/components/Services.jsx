import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Plane, MapPin, Navigation, Car, Briefcase, Calendar, Check } from 'lucide-react';
import { services } from '../mock';

const iconMap = {
  plane: Plane,
  'map-pin': MapPin,
  navigation: Navigation,
  car: Car,
  briefcase: Briefcase,
  calendar: Calendar
};

const Services = () => {
  return (
    <section id="services" className="py-20 bg-white reveal-on-scroll">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-[#1B2B4B] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Our Services
          </h2>
          <div className="w-16 h-px bg-[#D4AF37] mx-auto mt-4 mb-6"></div>
          <p className="text-xl text-[#4A5568] max-w-3xl mx-auto leading-relaxed">
            Professional airport transportation solutions for every need
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => {
            const IconComponent = iconMap[service.icon];
            return (
              <Card key={service.id} className="bg-[#FAFBFC] border border-[#E8ECF0] border-t-2 border-t-[#D4AF37] shadow-sm hover:shadow-md transition-all duration-300 group">
                <CardHeader className="p-8">
                  <div className="w-14 h-14 bg-[#1B2B4B]/5 rounded-full flex items-center justify-center mb-4">
                    <IconComponent className="w-7 h-7 text-[#1B2B4B]" />
                  </div>
                  <CardTitle className="text-lg font-bold text-[#1B2B4B] mb-2">
                    {service.title}
                  </CardTitle>
                  <CardDescription className="text-[#4A5568] text-sm">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-8 pb-8">
                  <ul className="space-y-3">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <Check className="w-5 h-5 text-[#1B2B4B] mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-[#4A5568] text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;
