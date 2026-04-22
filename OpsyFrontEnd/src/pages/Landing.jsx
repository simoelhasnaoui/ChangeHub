import React from 'react';
import Navbar from '../components/landing/Navbar';
import Hero from '../components/landing/Hero';
import IntegrationsCarousel from '../components/landing/IntegrationsCarousel';
import Features from '../components/landing/Features';
import HowItWorks from '../components/landing/HowItWorks';
import UseCases from '../components/landing/UseCases';
import Footer from '../components/landing/Footer';
import ScrollToTop from '../components/landing/ScrollToTop';

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#2B1042] font-inter text-[#E8E0F0] overflow-x-hidden selection:bg-[#5C2D8F]/30 selection:text-[#D5CBE5] relative">
      <Navbar />
      <Hero />
      <IntegrationsCarousel />
      <Features />
      <HowItWorks />
      <UseCases />
      <Footer />
      <ScrollToTop />
    </div>
  );
}
