'use client';

import { useRef } from 'react';

import ClientLayout from '@/app/CientLayout';
import { About } from '@/components/landing/about';
import { BrandLogos } from '@/components/landing/brand-logos';
import Features from '@/components/landing/features';
import Footer from '@/components/landing/footer';
import Header from '@/components/landing/header';
import Hero from '@/components/landing/hero';
import HowItWorks from '@/components/landing/HowItWorks';
import { Services } from '@/components/landing/services';
import { Stats } from '@/components/landing/stats';

const Home = () => {
  // Create refs for each section
  const heroRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const howItWorksRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const contactRef = useRef<HTMLDivElement>(null);

  // Scroll handler function with offset for fixed header
  const scrollToSection = (sectionRef: React.RefObject<HTMLDivElement>) => {
    if (sectionRef.current) {
      const headerOffset = 80; // Account for fixed header height
      const elementPosition = sectionRef.current.offsetTop;
      const offsetPosition = elementPosition - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <ClientLayout>
      <main className="min-h-screen bg-white overflow-x-hidden">
        <Header
          onHomeClick={() => scrollToSection(heroRef)}
          onAboutClick={() => scrollToSection(aboutRef)}
          onHowItWorksClick={() => scrollToSection(howItWorksRef)}
          onServicesClick={() => scrollToSection(servicesRef)}
          onContactClick={() => scrollToSection(contactRef)}
        />
        <div ref={heroRef} id="home">
          <Hero />
        </div>
        <BrandLogos />
        <div ref={howItWorksRef} id="how-it-works" className="scroll-mt-20">
          <HowItWorks />
        </div>
        <Features />
        <div ref={aboutRef} id="about" className="scroll-mt-20">
          <About />
        </div>
        <div ref={servicesRef} id="services" className="scroll-mt-20">
          <Services />
        </div>
        <Stats />
        <div ref={contactRef} id="contact" className="scroll-mt-20">
          <Footer />
        </div>
      </main>
    </ClientLayout>
  );
};

export default Home;
