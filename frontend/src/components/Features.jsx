import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { 
  Zap, 
  CheckCircle, 
  Award, 
  Shield, 
  Repeat, 
  Star, 
  Package, 
  DollarSign 
} from 'lucide-react';
import { features } from '../mock';
import { Button } from './ui/button';

const iconMap = {
  'zap': Zap,
  'check-circle': CheckCircle,
  'award': Award,
  'shield': Shield,
  'repeat': Repeat,
  'star': Star,
  'package': Package,
  'dollar-sign': DollarSign
};

const Features = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            Why Choose <span className="text-gold">Hibiscus to Airport</span>?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Experience the perfect blend of luxury, reliability, and modern convenience
          </p>
          
          {/* Competitive Advantage Banner */}
          <div className="bg-gradient-to-r from-gold to-amber-500 rounded-2xl p-6 max-w-4xl mx-auto mb-12">
            <h3 className="text-2xl font-bold text-black mb-4">
              🏆 The Premium Alternative to Basic Shuttle Services
            </h3>
            <p className="text-black/80 text-lg">
              While others offer basic transportation, we deliver a luxury experience with modern technology, 
              professional service, and guaranteed reliability. Book online instantly with our advanced system.
            </p>
          </div>
        </div>

        {/* Competitive Comparison Section */}
        <div className="bg-white rounded-2xl border-2 border-gold p-8 mb-12">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Hibiscus to Airport vs Traditional Shuttles
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="text-center">
              <h4 className="text-xl font-bold text-gold mb-4">✨ Hibiscus to Airport</h4>
              <ul className="text-left space-y-3">
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" /> Luxury Toyota Hiace vehicles</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" /> Professional uniformed drivers</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" /> Advanced online booking system</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" /> Flight monitoring & real-time updates</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" /> Complimentary Wi-Fi & charging</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" /> 24/7 premium customer service</li>
                <li className="flex items-center"><CheckCircle className="w-5 h-5 text-green-500 mr-2" /> Guaranteed pickup times</li>
              </ul>
            </div>
            <div className="text-center">
              <h4 className="text-xl font-bold text-gray-500 mb-4">📞 Traditional Shuttles</h4>
              <ul className="text-left space-y-3 text-gray-600">
                <li className="flex items-center"><span className="w-5 h-5 text-gray-400 mr-2">×</span> Basic vehicle options</li>
                <li className="flex items-center"><span className="w-5 h-5 text-gray-400 mr-2">×</span> Casual driver presentation</li>
                <li className="flex items-center"><span className="w-5 h-5 text-gray-400 mr-2">×</span> Phone-only booking</li>
                <li className="flex items-center"><span className="w-5 h-5 text-gray-400 mr-2">×</span> Manual scheduling systems</li>
                <li className="flex items-center"><span className="w-5 h-5 text-gray-400 mr-2">×</span> Limited amenities</li>
                <li className="flex items-center"><span className="w-5 h-5 text-gray-400 mr-2">×</span> Business hours only</li>
                <li className="flex items-center"><span className="w-5 h-5 text-gray-400 mr-2">×</span> Estimated arrival times</li>
              </ul>
            </div>
          </div>
          <div className="text-center mt-8">
            <Button 
              size="lg" 
              className="bg-gold hover:bg-amber-500 text-black px-8 py-4 text-lg font-bold"
            >
              Experience Premium Service Today
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature) => {
            const IconComponent = iconMap[feature.icon];
            return (
              <Card key={feature.id} className="border-2 border-gray-200 hover:border-gold hover:shadow-xl transition-all duration-300 bg-white group">
                <CardHeader className="p-6">
                  <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-gold transition-all duration-300">
                    <IconComponent className="w-6 h-6 text-gold group-hover:text-black transition-colors duration-300" />
                  </div>
                  <CardTitle className="text-lg font-bold text-gray-900 mb-2">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-gray-600 text-sm">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        <div className="text-center bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl p-12 shadow-xl">
          <div className="relative">
            <h3 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
              Ready to Book Your Transfer?
            </h3>
            <p className="text-gray-200 mb-8 text-lg max-w-2xl mx-auto">
              Experience reliable, professional airport transportation
            </p>
            <Button 
              onClick={() => window.location.href = '/booking'}
              className="bg-gold hover:bg-amber-500 text-black px-10 py-6 text-lg font-bold shadow-xl">
              Book Now
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;