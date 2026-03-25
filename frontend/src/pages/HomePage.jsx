import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Services from '../components/Services';
import Fleet from '../components/Fleet';
import About from '../components/About';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import PageMeta from '../components/PageMeta';
import GeoContent from '../components/GeoContent';

const HomePage = () => {
  return (
    <div className="min-h-screen">
      <PageMeta
        title="Hibiscus Coast Airport Shuttle | Door-to-Door Auckland Airport Transfers 24/7"
        rawTitle
        description="Private airport shuttle from Orewa, Whangaparaoa, Silverdale & Hibiscus Coast to Auckland Airport. Book online, flat rates, 24/7 service. Call 021 743 321."
        path="/"
      />
      <Header />
      <Hero />
      <Services />
      <Fleet />
      <About />
      <GeoContent />
      <Contact />
      <Footer />
    </div>
  );
};

export default HomePage;
