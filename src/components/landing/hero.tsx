'use client';

import Image from "next/image";
import { useState } from 'react';

import CompanyModal from '../modals/CompanyModal';
import FreelanceModal from '../modals/FreelanceModal';
import { Button } from '../ui/button/Button';
const Hero = () => {
  const [showFreelanceModal, setShowFreelanceModal] = useState(false)
  const [showCompanyModal, setShowCompanyModal] = useState(false)

  return (
    <>
      <section
        id="home"
        className="min-h-screen flex items-center py-16 md:pt-20 bg-gradient-to-br from-blue-50 to-blue-100"
      >
        <div className="container mx-auto px-6 sm:px-8 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  La Voie <span className="text-[var(--primary-color)] ">Rapide</span>
                  <br />
                  vers la Société de
                  <br />
                  Portage Parfaite..
                </h1>
                <p className="text-xl text-gray-600 max-w-lg">
                  Découvrez notre plateforme innovante qui révolutionne la gestion du portage salarial avec des solutions
                  modernes et efficaces.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-full"
                  onClick={() => setShowFreelanceModal(true)}
                >
                  Demande de simulation
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 rounded-full bg-transparent"
                  onClick={() => setShowCompanyModal(true)}
                >
                  Repondre a les demandes
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="relative bg-white rounded-2xl shadow-2xl p-8">
                <Image
                  src="/images/landing/1.png"
                  alt="Team collaboration illustration"
                  width={500}
                  height={400}
                  className="w-full h-auto"
                />
                <div className="absolute -top-4 -right-4 bg-blue-600 text-white p-3 rounded-full">
                  <div className="w-6 h-6 bg-white/20 rounded-full"></div>
                </div>
                <div className="absolute -bottom-4 -left-4 bg-blue-500 text-white p-3 rounded-full">
                  <div className="w-6 h-6 bg-white/20 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {showFreelanceModal && (
        <FreelanceModal onClose={() => setShowFreelanceModal(false)} />
      )}

      {showCompanyModal && (
        <CompanyModal onClose={() => setShowCompanyModal(false)} />
      )}
    </>
  );
};

export default Hero;