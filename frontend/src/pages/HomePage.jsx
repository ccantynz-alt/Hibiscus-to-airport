import React from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Services from '../components/Services';
import Fleet from '../components/Fleet';
import About from '../components/About';
import Contact from '../components/Contact';
import Footer from '../components/Footer';

const HomePage = () => {
  return (
    <div className="min-h-screen">
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
