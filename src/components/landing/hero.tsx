'use client';

import { motion } from 'motion/react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import CompanyModal from '../onboarding/CompanyModal';
import FreelanceModal from '../onboarding/FreelanceModal';
import { Button } from '../ui/button/Button';

type ModalType = 'none' | 'freelance' | 'company';

const Hero = () => {
  const [activeModal, setActiveModal] = useState<ModalType>('none');
  const t = useTranslations('landing.hero');

  const renderContent = () => {
    switch (activeModal) {
      case 'freelance':
        return (
          <div className="min-h-screen py-16 md:pt-20 bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="container mx-auto px-6 sm:px-8 lg:px-12">
              <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                  <FreelanceModal onClose={() => setActiveModal('none')} />
                </div>
              </div>
            </div>
          </div>
        );

      case 'company':
        return (
          <div className="min-h-screen py-16 md:pt-20 bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="container mx-auto px-6 sm:px-8 lg:px-12">
              <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                  <CompanyModal onClose={() => setActiveModal('none')} />
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div
            id="home"
            className="min-h-screen flex items-center py-16 pt-20 bg-gradient-to-br from-blue-50 to-blue-100"
          >
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="container mx-auto px-6 sm:px-8 lg:px-12"
            >
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.9 }}
                  className="space-y-8"
                >
                  <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                      {t('title')}{' '}
                      <span className="text-[var(--primary-color)] ">{t('subtitle')}</span>
                      <br />
                      {t('subtitle2')}
                    </h1>
                    <p className="text-xl text-gray-600 max-w-lg">{t('description')}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button
                      size="lg"
                      className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-full"
                      onClick={() => setActiveModal('freelance')}
                    >
                      {t('simulationButton')}
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-3 rounded-full bg-transparent"
                      onClick={() => setActiveModal('company')}
                    >
                      {t('respondButton')}
                    </Button>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  className="relative"
                >
                  <div className="relative bg-white rounded-2xl shadow-2xl p-8">
                    <Image
                      src="/images/landing/1.png"
                      alt="Portage salarial France - Plateforme de mise en relation freelances et sociétés de portage"
                      width={500}
                      height={400}
                      className="w-full h-auto"
                      priority
                      sizes="(max-width: 768px) 100vw, 500px"
                    />
                    <div className="absolute -top-4 -right-4 bg-blue-600 text-white p-3 rounded-full">
                      <div className="w-6 h-6 bg-white/20 rounded-full"></div>
                    </div>
                    <div className="absolute -bottom-4 -left-4 bg-blue-500 text-white p-3 rounded-full">
                      <div className="w-6 h-6 bg-white/20 rounded-full"></div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        );
    }
  };

  return renderContent();
};

export default Hero;
