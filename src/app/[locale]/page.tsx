import ClientLayout from '@/app/CientLayout';
import { About } from '@/components/landing/about';
import { BrandLogos } from '@/components/landing/brand-logos';
import { FAQ } from '@/components/landing/faq';
import Features from '@/components/landing/features';
import Footer from '@/components/landing/footer';
import HeaderWithNavigation from '@/components/landing/HeaderWithNavigation';
import Hero from '@/components/landing/hero';
import HowItWorks from '@/components/landing/HowItWorks';
import { Services } from '@/components/landing/services';
import { Stats } from '@/components/landing/stats';

// Server Component for better SEO
export default function Home() {
  return (
    <ClientLayout>
      <main className="min-h-screen bg-white overflow-x-hidden">
        <HeaderWithNavigation />
        <div id="home">
          <Hero />
        </div>
        <BrandLogos />
        <div id="how-it-works" className="scroll-mt-20">
          <HowItWorks />
        </div>
        <Features />
        <div id="about" className="scroll-mt-20">
          <About />
        </div>
        <div id="services" className="scroll-mt-20">
          <Services />
        </div>
        <Stats />
        <FAQ />
        <div id="contact" className="scroll-mt-20">
          <Footer />
        </div>
      </main>
    </ClientLayout>
  );
}
