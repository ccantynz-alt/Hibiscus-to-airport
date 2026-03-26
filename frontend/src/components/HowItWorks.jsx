import React from 'react';
import { Card, CardContent } from './ui/card';
import { howItWorks } from '../mock';

const HowItWorks = () => {
  return (
    <section className="py-20 bg-white reveal-on-scroll">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-[#1B2B4B] mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            How It Works
          </h2>
          <div className="w-16 h-px bg-[#D4AF37] mx-auto mt-4 mb-6"></div>
          <p className="text-xl text-[#4A5568] max-w-2xl mx-auto leading-relaxed">
            Booking a ride is quick and easy
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {howItWorks.map((step, index) => (
            <div key={step.step} className="relative">
              <Card className="bg-[#FAFBFC] border border-[#E8ECF0] border-t-2 border-t-[#D4AF37] shadow-sm hover:shadow-md transition-all duration-300 h-full">
                <CardContent className="p-8">
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mb-6 text-[#1B2B4B] text-2xl border border-[#1B2B4B]/20" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {step.step}
                  </div>
                  <h3 className="text-xl font-bold text-[#1B2B4B] mb-3">{step.title}</h3>
                  <p className="text-[#4A5568] leading-relaxed">{step.description}</p>
                </CardContent>
              </Card>
              {index < howItWorks.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                  <div className="w-8 h-0.5 bg-[#E8ECF0]"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
