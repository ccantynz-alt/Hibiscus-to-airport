import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Services from '../components/Services';
import Fleet from '../components/Fleet';
import About from '../components/About';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import PageMeta from '../components/PageMeta';

const HomePage = () => {
  return (
    <div className="min-h-screen">
      <PageMeta
        title={null}
        description="Premium airport shuttle service from Hibiscus Coast to Auckland Airport. Professional drivers, luxury vehicles, 24/7 service. Book online instantly with guaranteed pickup times."
        path="/"
      />
      <Header />
      <Hero />
      <Services />
      <Fleet />
      <About />
      <Contact />
      <Footer />
    </div>
  );
};

export default HomePage;
