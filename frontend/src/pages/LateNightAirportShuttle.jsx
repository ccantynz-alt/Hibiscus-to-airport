import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Moon, Clock, Shield, Phone, Star, Plane } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';

const LateNightAirportShuttle = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 bg-gradient-to-br from-indigo-900 via-purple-900 to-black">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-gold/20 text-gold px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Moon className="w-4 h-4" /> Available 24/7
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
            Late Night <span className="text-gold">Airport Shuttle</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Flight landing after midnight? We're here for you. Reliable late-night airport pickups 
            from Auckland Airport to the Hibiscus Coast and beyond.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate('/book-now')}
              className="bg-gold hover:bg-amber-500 text-black font-bold px-8 py-6 text-lg"
            >
              Book Late Night Pickup
            </Button>
            <Button 
              variant="outline"
              className="border-white text-white hover:bg-white/10 px-8 py-6 text-lg"
              onClick={() => window.location.href = 'tel:021743321'}
            >
              <Phone className="w-5 h-5 mr-2" /> Call 021 743 321
            </Button>
          </div>
        </div>
      </section>

      {/* Late Night Promise */}
      <section className="py-12 bg-gold">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center">
              <Moon className="w-10 h-10 text-black mb-2" />
              <span className="text-black font-bold">Midnight Pickups</span>
              <span className="text-black/70 text-sm">No extra charge</span>
            </div>
            <div className="flex flex-col items-center">
              <Plane className="w-10 h-10 text-black mb-2" />
              <span className="text-black font-bold">Flight Tracking</span>
              <span className="text-black/70 text-sm">We monitor delays</span>
            </div>
            <div className="flex flex-col items-center">
              <Clock className="w-10 h-10 text-black mb-2" />
              <span className="text-black font-bold">Free Waiting</span>
              <span className="text-black/70 text-sm">Up to 60 minutes</span>
            </div>
            <div className="flex flex-col items-center">
              <Shield className="w-10 h-10 text-black mb-2" />
              <span className="text-black font-bold">Safe & Reliable</span>
              <span className="text-black/70 text-sm">Professional drivers</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Late Night Airport Transfers - We Never Sleep</h2>
          <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
            <p>
              International flights don't follow a 9-to-5 schedule, and neither do we. Whether your flight 
              lands at midnight, 2 AM, or any time in between, Hibiscus to Airport is ready to pick you up 
              and get you home safely.
            </p>
            <p>
              We understand the exhaustion of a long-haul flight. The last thing you want is to worry about 
              how you'll get home. With our late-night airport shuttle service, you can book in advance, 
              knowing that a professional driver will be waiting for you - no matter what time you land.
            </p>
            <p>
              Our flight tracking technology means we monitor your flight in real-time. If your flight is 
              delayed, we automatically adjust your pickup time. No frantic phone calls needed, no stress 
              about missing your ride.
            </p>
          </div>

          {/* Late Night Benefits */}
          <div className="mt-12 bg-indigo-50 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Why Choose Us for Late Night Transfers?</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="bg-gold rounded-full p-2">
                  <Clock className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">No Late Night Surcharge</h4>
                  <p className="text-gray-600 text-sm">Same rates at 2 AM as 2 PM. No hidden fees.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-gold rounded-full p-2">
                  <Plane className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Real-Time Flight Monitoring</h4>
                  <p className="text-gray-600 text-sm">We track your flight and adjust for delays automatically.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-gold rounded-full p-2">
                  <Shield className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Experienced Night Drivers</h4>
                  <p className="text-gray-600 text-sm">Professional drivers experienced in late-night driving.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="bg-gold rounded-full p-2">
                  <Star className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Meet & Greet Available</h4>
                  <p className="text-gray-600 text-sm">Driver waiting in arrivals with your name sign.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Common Late Night Routes */}
          <div className="mt-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Popular Late Night Destinations</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { area: 'Orewa & Millwater', time: '35-40 min' },
                { area: 'Silverdale & Dairy Flat', time: '25-30 min' },
                { area: 'Whangaparaoa Peninsula', time: '40-45 min' },
                { area: 'Warkworth & Matakana', time: '50-60 min' },
                { area: 'Red Beach & Stanmore Bay', time: '35-40 min' },
                { area: 'Gulf Harbour & Manly', time: '45-50 min' },
              ].map((route) => (
                <div key={route.area} className="bg-gray-50 rounded-lg p-4">
                  <div className="font-bold text-gray-900">{route.area}</div>
                  <div className="text-gray-500 text-sm">~{route.time} from airport</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-indigo-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Moon className="w-16 h-16 text-gold mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">Landing Late? We'll Be There.</h2>
          <p className="text-gray-300 mb-8">Book your late-night airport pickup now and travel stress-free</p>
          <Button 
            onClick={() => navigate('/book-now')}
            className="bg-gold hover:bg-amber-500 text-black font-bold px-12 py-6 text-lg"
          >
            Book Late Night Shuttle
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LateNightAirportShuttle;