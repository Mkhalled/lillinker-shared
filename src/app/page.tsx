"use client"

import About from "@/components/landing/about"
import BrandLogos from "@/components/landing/brand-logos"
import Features from "@/components/landing/features"
import Footer from "@/components/landing/footer"
import Header from "@/components/landing/header"
import Hero from "@/components/landing/hero"
import Services from "@/components/landing/services"
import Stats from "@/components/landing/stats"


export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <Hero />
      <BrandLogos />
      <Features />
      <About />
      <Services />
      <Stats />
      <Footer />
    </main>
  )
}
