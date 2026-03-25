import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { ArrowRight, Check, X, Plane, Shield, Wifi, BatteryCharging, Users, Clock } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageMeta from '../components/PageMeta';

const Pricing = () => {
  const suburbPrices = [
    { suburb: 'Orewa', distance: '~55 km', price: '$143', from: 'from' },
    { suburb: 'Whangaparaoa', distance: '~58 km', price: '$151', from: 'from' },
    { suburb: 'Silverdale', distance: '~50 km', price: '$200', from: 'from' },
    { suburb: 'Red Beach', distance: '~56 km', price: '$146', from: 'from' },
    { suburb: 'Gulf Harbour', distance: '~63 km', price: '$164', from: 'from' },
    { suburb: 'Stanmore Bay', distance: '~60 km', price: '$156', from: 'from' },
    { suburb: 'Albany', distance: '~38 km', price: '$152', from: 'from' },
    { suburb: 'Browns Bay', distance: '~42 km', price: '$168', from: 'from' },
    { suburb: 'Millwater', distance: '~53 km', price: '$212', from: 'from' },
    { suburb: 'Warkworth', distance: '~85 km', price: '$230', from: 'from' },
  ];

  const included = [
    { icon: <Users className="w-6 h-6" />, title: 'Private Ride', desc: 'Not a shared shuttle — your vehicle, your schedule' },
    { icon: <Shield className="w-6 h-6" />, title: 'Door-to-Door Service', desc: 'Picked up from your front door, dropped at the terminal' },
    { icon: <Plane className="w-6 h-6" />, title: 'Flight Monitoring', desc: 'We track your flight so we are there when you land' },
    { icon: <Wifi className="w-6 h-6" />, title: 'Complimentary Wi-Fi', desc: 'Stay connected throughout your journey' },
    { icon: <BatteryCharging className="w-6 h-6" />, title: 'Phone Charging', desc: 'USB charging ports in every vehicle' },
    { icon: <Clock className="w-6 h-6" />, title: 'Professional Driver', desc: 'Experienced, local drivers who know the fastest routes' },
  ];

  const additionalFees = [
    { item: 'Extra passengers', fee: '$5.00 each', note: 'Per additional passenger beyond the first' },
    { item: 'VIP airport pickup', fee: '$15.00', note: 'Meet & greet inside the terminal' },
    { item: 'Oversized luggage', fee: '$25.00', note: 'Surfboards, golf bags, extra-large items' },
  ];

  const comparison = [
    { feature: 'Fixed pricing (no surge)', us: true, taxi: false, uber: false },
    { feature: 'Private ride (not shared)', us: true, taxi: true, uber: true },
    { feature: 'Flight monitoring', us: true, taxi: false, uber: false },
    { feature: 'Door-to-door service', us: true, taxi: true, uber: true },
    { feature: 'Complimentary Wi-Fi', us: true, taxi: false, uber: false },
    { feature: 'Phone charging', us: true, taxi: false, uber: false },
    { feature: 'Pre-booked guaranteed', us: true, taxi: false, uber: false },
    { feature: '24/7 availability', us: true, taxi: true, uber: true },
    { feature: 'No early morning surcharge', us: true, taxi: false, uber: false },
    { feature: 'Professional uniformed driver', us: true, taxi: false, uber: false },
  ];

  const pricingFaqs = [
    {
      question: 'How much does a shuttle from Orewa to Auckland Airport cost?',
      answer: 'An airport shuttle from Orewa to Auckland Airport costs from $143 for one passenger. This is a fixed price with no surge pricing, regardless of time of day or traffic conditions.'
    },
    {
      question: 'Are your prices fixed or do they change with demand?',
      answer: 'Our prices are completely fixed. Unlike rideshare apps, we never apply surge pricing. Your quoted price is what you pay — whether it is 3 AM or peak hour.'
    },
    {
      question: 'Is there a minimum fare?',
      answer: 'Yes, our minimum fare is $100. This applies to shorter distances within the Hibiscus Coast area.'
    },
    {
      question: 'Do I pay extra for early morning or late night pickups?',
      answer: 'No. We operate 24/7 at the same flat rates. There is no surcharge for early morning, late night, weekends, or public holidays.'
    },
    {
      question: 'How are prices calculated?',
      answer: 'Prices are based on the driving distance from your pickup address to Auckland Airport. We use tiered per-kilometre rates that decrease for longer distances, making our service great value for Hibiscus Coast residents.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit and debit cards via our secure online booking system powered by Stripe. Payment is taken at the time of booking.'
    }
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": pricingFaqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  const [openFaq, setOpenFaq] = React.useState(null);

  return (
    <div className="min-h-screen bg-black">
      <PageMeta
        title="Airport Shuttle Pricing | Hibiscus to Airport"
        description="Fixed-price airport shuttle from Orewa, Silverdale, Whangaparaoa to Auckland Airport. No surge pricing, 24/7 service. See our transparent pricing for Hibiscus Coast airport transfers."
        path="/pricing"
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>
      <Header />

      {/* Hero */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-black via-gray-900 to-black overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-gold rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
            Transparent Airport Shuttle Pricing
            <span className="block text-gold mt-3">No Surge. No Surprises.</span>
          </h1>

          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Fixed-rate airport transfers from Hibiscus Coast to Auckland Airport.
            The same price at 3 AM as it is at 3 PM — including public holidays.
          </p>

          <Link to="/booking">
            <Button className="bg-gold hover:bg-amber-500 text-black px-10 py-7 text-lg font-bold shadow-2xl shadow-gold/20 hover:scale-105 transition-all duration-300">
              Get Your Exact Quote
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Price Table by Suburb */}
      <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-4 text-center" style={{ fontFamily: 'Playfair Display, serif' }}>
            Prices by <span className="text-gold">Suburb</span>
          </h2>
          <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
            Fixed fares from popular suburbs to Auckland Airport. Prices shown are for one passenger with standard luggage.
          </p>

          <div className="bg-gray-900/80 border-2 border-gold/20 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-3 bg-gold/10 border-b border-gold/20 px-6 py-4">
              <span className="text-gold font-bold text-sm uppercase tracking-wider">Suburb</span>
              <span className="text-gold font-bold text-sm uppercase tracking-wider text-center">Distance</span>
              <span className="text-gold font-bold text-sm uppercase tracking-wider text-right">Price (1 pax)</span>
            </div>
            {suburbPrices.map((row, idx) => (
              <div
                key={idx}
                className={`grid grid-cols-3 px-6 py-4 items-center transition-colors duration-200 hover:bg-gold/5 ${
                  idx !== suburbPrices.length - 1 ? 'border-b border-gray-800' : ''
                }`}
              >
                <span className="text-white font-semibold">{row.suburb}</span>
                <span className="text-gray-400 text-center">{row.distance}</span>
                <span className="text-gold font-bold text-xl text-right">{row.price}</span>
              </div>
            ))}
          </div>

          <p className="text-center text-gray-500 mt-6 text-sm">
            Prices are estimates based on typical driving distances. Your exact fare is calculated at booking using your specific pickup address. Minimum fare: $100.
          </p>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-4 text-center" style={{ fontFamily: 'Playfair Display, serif' }}>
            What's <span className="text-gold">Included</span>
          </h2>
          <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
            Every booking includes premium features at no extra cost
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {included.map((item, idx) => (
              <div key={idx} className="bg-gray-900/80 border border-gold/20 rounded-2xl p-8 hover:border-gold hover:shadow-2xl hover:shadow-gold/10 transition-all duration-300">
                <div className="text-gold mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Fees */}
      <section className="py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-4 text-center" style={{ fontFamily: 'Playfair Display, serif' }}>
            Additional <span className="text-gold">Fees</span>
          </h2>
          <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
            Optional extras — only pay for what you need
          </p>

          <div className="space-y-4">
            {additionalFees.map((fee, idx) => (
              <div key={idx} className="bg-gray-900/80 border border-gold/20 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-white font-bold text-lg">{fee.item}</h3>
                  <p className="text-gray-400 text-sm">{fee.note}</p>
                </div>
                <span className="text-gold font-bold text-2xl whitespace-nowrap">{fee.fee}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* No Surge Pricing */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gold rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
            No Surge Pricing. <span className="text-gold">Ever.</span>
          </h2>
          <p className="text-xl text-gray-300 mb-4">
            Unlike rideshare apps that multiply fares during peak times, our rates are flat 24/7.
          </p>
          <div className="grid sm:grid-cols-3 gap-6 mt-10">
            {[
              { label: 'Early Morning', detail: '3 AM — 6 AM', note: 'Same price' },
              { label: 'Peak Hour', detail: '7 AM — 9 AM', note: 'Same price' },
              { label: 'Late Night', detail: '10 PM — 2 AM', note: 'Same price' },
            ].map((slot, idx) => (
              <div key={idx} className="bg-gray-900/80 border border-gold/20 rounded-xl p-6">
                <p className="text-gold font-bold text-lg mb-1">{slot.label}</p>
                <p className="text-gray-400 text-sm mb-2">{slot.detail}</p>
                <p className="text-white font-bold text-xl">{slot.note}</p>
              </div>
            ))}
          </div>
          <p className="text-gray-400 mt-8">
            Public holidays, weekends, school holidays — your fare never changes.
          </p>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 bg-black">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-4 text-center" style={{ fontFamily: 'Playfair Display, serif' }}>
            How We <span className="text-gold">Compare</span>
          </h2>
          <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
            See why Hibiscus Coast residents choose us over taxis and rideshare apps
          </p>

          <div className="bg-gray-900/80 border-2 border-gold/20 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-4 bg-gold/10 border-b border-gold/20 px-4 sm:px-6 py-4">
              <span className="text-gold font-bold text-xs sm:text-sm uppercase tracking-wider">Feature</span>
              <span className="text-gold font-bold text-xs sm:text-sm uppercase tracking-wider text-center">Us</span>
              <span className="text-gray-400 font-bold text-xs sm:text-sm uppercase tracking-wider text-center">Taxi</span>
              <span className="text-gray-400 font-bold text-xs sm:text-sm uppercase tracking-wider text-center">Uber</span>
            </div>
            {comparison.map((row, idx) => (
              <div
                key={idx}
                className={`grid grid-cols-4 px-4 sm:px-6 py-4 items-center ${
                  idx !== comparison.length - 1 ? 'border-b border-gray-800' : ''
                }`}
              >
                <span className="text-gray-300 text-sm">{row.feature}</span>
                <span className="flex justify-center">
                  {row.us ? <Check className="w-5 h-5 text-green-400" /> : <X className="w-5 h-5 text-red-400" />}
                </span>
                <span className="flex justify-center">
                  {row.taxi ? <Check className="w-5 h-5 text-green-400" /> : <X className="w-5 h-5 text-red-400" />}
                </span>
                <span className="flex justify-center">
                  {row.uber ? <Check className="w-5 h-5 text-green-400" /> : <X className="w-5 h-5 text-red-400" />}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing FAQs */}
      <section className="py-20 bg-gradient-to-b from-black to-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-12 text-center" style={{ fontFamily: 'Playfair Display, serif' }}>
            Pricing <span className="text-gold">FAQs</span>
          </h2>

          <div className="space-y-4">
            {pricingFaqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-gray-900/80 border border-gold/20 rounded-xl overflow-hidden"
              >
                <button
                  className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-gold/5 transition-colors duration-200"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                >
                  <h3 className="text-white font-semibold pr-4">{faq.question}</h3>
                  <span className={`text-gold text-2xl transition-transform duration-200 ${openFaq === idx ? 'rotate-45' : ''}`}>+</span>
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-5 text-gray-400 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gold rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-6" style={{ fontFamily: 'Playfair Display, serif' }}>
            Ready to <span className="text-gold">Book?</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Enter your pickup address for an instant, exact quote. No obligation — see your price in seconds.
          </p>
          <Link to="/booking">
            <Button className="bg-gold hover:bg-amber-500 text-black px-10 py-7 text-lg font-bold shadow-2xl shadow-gold/20 hover:scale-105 transition-all duration-300">
              Get Exact Quote
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <p className="text-gray-500 mt-6">
            Or email us at <a href="mailto:info@bookaride.co.nz" className="text-gold hover:underline">info@bookaride.co.nz</a> for enquiries
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Pricing;
