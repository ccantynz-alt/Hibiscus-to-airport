import React from 'react';
import { Button } from './ui/button';
import { ArrowRight, MapPin, Clock, DollarSign } from 'lucide-react';

const SpecialOffer = () => {
  return (
    <section className="py-20 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <div className="absolute top-20 right-0 w-96 h-96 bg-emerald-200 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-200 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-teal-100">
          <div className="grid lg:grid-cols-2 gap-0">
            {/* Content Side */}
            <div className="p-12 flex flex-col justify-center">
              <div className="inline-block mb-4">
                <span className="bg-emerald-100 text-emerald-800 text-sm font-bold px-4 py-2 rounded-full">
                  Popular Destination
                </span>
              </div>
              
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Hobbiton Movie Set Transfers
              </h2>
              
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Experience the magic of Middle-earth with our premium transfer service from Hibiscus Coast to Hobbiton Movie Set in Matamata. Comfortable, direct, and hassle-free.
              </p>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <MapPin className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">175km Scenic Journey</h4>
                    <p className="text-gray-600 text-sm">Beautiful drive through Waikato region</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <Clock className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Perfect Timing</h4>
                    <p className="text-gray-600 text-sm">Coordinated with your Hobbiton tour schedule</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <DollarSign className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">From $612.50</h4>
                    <p className="text-gray-600 text-sm">Competitive pricing based on distance</p>
                  </div>
                </li>
              </ul>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-6 text-lg font-semibold">
                  Book Now
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button variant="outline" className="border-2 border-teal-600 text-teal-600 hover:bg-teal-50 px-8 py-6 text-lg font-semibold">
                  Learn More
                </Button>
              </div>
            </div>

            {/* Image Side */}
            <div className="relative h-full min-h-[400px] lg:min-h-[600px]">
              <img
                src="https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800&q=80"
                alt="Hobbiton Movie Set"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SpecialOffer;
