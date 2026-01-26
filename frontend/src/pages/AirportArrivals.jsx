import React from 'react';
import { MapPin, Clock, Users, Phone, Coffee, Plane, ArrowRight, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import Header from '../components/Header';
import Footer from '../components/Footer';

const AirportArrivals = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-gray-50 to-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-gold/10 text-gold px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Plane className="w-4 h-4" />
            Auckland Airport Pickup Guide
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Welcome to Auckland!
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Here's everything you need to know about meeting your driver at Auckland Airport
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        
        {/* Quick Tips */}
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          <div className="bg-blue-50 rounded-2xl p-6 text-center">
            <Clock className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Allow Time</h3>
            <p className="text-sm text-gray-600">Collect your bags and clear customs before heading to pickup</p>
          </div>
          <div className="bg-green-50 rounded-2xl p-6 text-center">
            <Phone className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Keep Phone Handy</h3>
            <p className="text-sm text-gray-600">Your driver may call or text when they arrive</p>
          </div>
          <div className="bg-amber-50 rounded-2xl p-6 text-center">
            <Users className="w-8 h-8 text-amber-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Look for Your Name</h3>
            <p className="text-sm text-gray-600">Driver will hold a sign with your name</p>
          </div>
        </div>

        {/* International Terminal */}
        <Card className="mb-8 overflow-hidden border-2 border-blue-100">
          <div className="bg-blue-600 text-white p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Plane className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">International Terminal</h2>
                <p className="text-blue-100">Arriving from overseas flights</p>
              </div>
            </div>
          </div>
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Meeting Point */}
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Coffee className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Meeting Point: Allpress Café</h3>
                    <p className="text-gray-600 mb-4">
                      After you exit arrivals, turn <strong>LEFT</strong> and walk straight. You'll see the 
                      <strong> Allpress Café</strong> on your left side.
                    </p>
                    <div className="bg-white border-2 border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold text-gray-900">Look for the bench</span>
                      </div>
                      <p className="text-gray-600 text-sm">
                        There's a bench in front of Allpress Café where drivers stand and hold their signs 
                        with passenger names. Your driver will be waiting here with a sign showing your name.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step by Step */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Step-by-Step Instructions:</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">1</div>
                    <div>
                      <p className="text-gray-700">Collect your luggage from the carousel</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">2</div>
                    <div>
                      <p className="text-gray-700">Clear customs and biosecurity</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">3</div>
                    <div>
                      <p className="text-gray-700">Exit through the arrivals door into the main hall</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">4</div>
                    <div>
                      <p className="text-gray-700"><strong>Turn LEFT</strong> and walk straight</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gold text-black rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">5</div>
                    <div>
                      <p className="text-gray-700"><strong>Look for Allpress Café</strong> on your left - your driver will be at the bench with your name sign</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Domestic Terminal */}
        <Card className="mb-8 overflow-hidden border-2 border-green-100">
          <div className="bg-green-600 text-white p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Plane className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Domestic Terminal</h2>
                <p className="text-green-100">Arriving from flights within New Zealand</p>
              </div>
            </div>
          </div>
          <CardContent className="p-6">
            <div className="space-y-6">
              <p className="text-gray-600">
                The Domestic Terminal has <strong>three separate pickup areas</strong> depending on which airline you flew with:
              </p>

              {/* Three Pickup Points */}
              <div className="grid gap-4">
                {/* Regionals */}
                <div className="bg-gray-50 rounded-xl p-5 border-l-4 border-purple-500">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-purple-600 font-bold">1</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">Regional Airlines Pickup</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Airlines:</strong> Air Chathams, Barrier Air, Sounds Air, and other regional carriers
                      </p>
                      <div className="flex items-center gap-2 text-purple-600 text-sm">
                        <MapPin className="w-4 h-4" />
                        <span>Exit and look for your driver at the Regional Arrivals area</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Air NZ / Cities */}
                <div className="bg-gray-50 rounded-xl p-5 border-l-4 border-blue-500">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-bold">2</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">Air New Zealand Pickup</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Airlines:</strong> Air New Zealand domestic flights
                      </p>
                      <div className="flex items-center gap-2 text-blue-600 text-sm">
                        <MapPin className="w-4 h-4" />
                        <span>Exit through Air NZ arrivals and look for your driver</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Jetstar */}
                <div className="bg-gray-50 rounded-xl p-5 border-l-4 border-orange-500">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-orange-600 font-bold">3</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">Jetstar Pickup</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Airlines:</strong> Jetstar domestic flights
                      </p>
                      <div className="flex items-center gap-2 text-orange-600 text-sm">
                        <MapPin className="w-4 h-4" />
                        <span>Exit through Jetstar arrivals - driver will meet you outside</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Important Note */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-amber-800 font-medium">Important</p>
                    <p className="text-sm text-amber-700">
                      Please let us know which airline you're flying with when you book, so your driver 
                      knows exactly where to meet you.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card className="bg-gray-900 text-white overflow-hidden">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-3">Can't Find Your Driver?</h3>
            <p className="text-gray-400 mb-6">
              Don't worry! Simply call or text us and we'll help you connect with your driver.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="tel:+6421234567" 
                className="inline-flex items-center justify-center gap-2 bg-gold text-black px-6 py-3 rounded-full font-semibold hover:bg-amber-400 transition-colors"
              >
                <Phone className="w-5 h-5" />
                Call Us Now
              </a>
              <a 
                href="sms:+6421234567" 
                className="inline-flex items-center justify-center gap-2 bg-white/10 text-white px-6 py-3 rounded-full font-semibold hover:bg-white/20 transition-colors"
              >
                Send a Text
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <div className="mt-12 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Helpful Tips</h3>
          <div className="grid md:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <p className="text-gray-600 text-sm">Turn on your mobile phone as soon as you land</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <p className="text-gray-600 text-sm">Check for text messages from your driver</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <p className="text-gray-600 text-sm">International: Look for Allpress Café on the left</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
              <p className="text-gray-600 text-sm">Driver will have a sign with your name</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AirportArrivals;
