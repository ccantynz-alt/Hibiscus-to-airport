import React from 'react';
import { Shield, Award, Users, Clock } from 'lucide-react';

const About = () => {
  return (
    <section id="about" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Playfair Display, serif' }}>
            About <span className="text-gold">Hibiscus to Airport</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your trusted airport shuttle service connecting the Hibiscus Coast to Auckland Airport
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h3 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h3>
            <p className="text-gray-700 mb-4 leading-relaxed">
              Hibiscus to Airport was founded with a simple mission: to provide reliable, comfortable, and affordable airport transportation for residents and visitors of the beautiful Hibiscus Coast region.
            </p>
            <p className="text-gray-700 mb-4 leading-relaxed">
              We understand the importance of punctuality when it comes to catching flights, which is why we've built our reputation on being consistently on time, every time. Our professional drivers know the area intimately and monitor your flight status to ensure seamless service.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Whether you're a local heading to the airport or a visitor arriving in Auckland, we're here to make your journey comfortable and stress-free.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gold/20">
              <Shield className="w-12 h-12 text-gold mb-4" />
              <h4 className="font-bold text-xl mb-2">Fully Licensed</h4>
              <p className="text-gray-600 text-sm">All drivers are licensed and insured for your safety</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gold/20">
              <Award className="w-12 h-12 text-gold mb-4" />
              <h4 className="font-bold text-xl mb-2">5+ Years</h4>
              <p className="text-gray-600 text-sm">Experience serving the Hibiscus Coast community</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gold/20">
              <Users className="w-12 h-12 text-gold mb-4" />
              <h4 className="font-bold text-xl mb-2">1000+ Customers</h4>
              <p className="text-gray-600 text-sm">Trusted by thousands of satisfied passengers</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gold/20">
              <Clock className="w-12 h-12 text-gold mb-4" />
              <h4 className="font-bold text-xl mb-2">24/7 Available</h4>
              <p className="text-gray-600 text-sm">Ready to serve you any time of day or night</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl p-12 text-center text-white">
          <h3 className="text-3xl font-bold mb-6">Our Commitment to You</h3>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div>
              <h4 className="text-gold font-bold text-lg mb-3">Reliability</h4>
              <p className="text-gray-300">On-time pickups and drop-offs, guaranteed</p>
            </div>
            <div>
              <h4 className="text-gold font-bold text-lg mb-3">Comfort</h4>
              <p className="text-gray-300">Clean, modern vehicles with plenty of space</p>
            </div>
            <div>
              <h4 className="text-gold font-bold text-lg mb-3">Value</h4>
              <p className="text-gray-300">Competitive pricing with no hidden fees</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
