'use client';

import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';

const HowItWorks = () => {
  const t = useTranslations('landing.howItWorks');

  const freelancerSteps = [
    {
      number: '1',
      title: t('freelancers.step1Title'),
      description: t('freelancers.step1Description'),
    },
    {
      number: '2',
      title: t('freelancers.step2Title'),
      description: t('freelancers.step2Description'),
    },
    {
      number: '3',
      title: t('freelancers.step3Title'),
      description: t('freelancers.step3Description'),
    },
  ];

  const companySteps = [
    {
      number: '1',
      title: t('companies.step1Title'),
      description: t('companies.step1Description'),
    },
    {
      number: '2',
      title: t('companies.step2Title'),
      description: t('companies.step2Description'),
    },
    {
      number: '3',
      title: t('companies.step3Title'),
      description: t('companies.step3Description'),
    },
  ];

  return (
    <section className="py-20 bg-gray-50 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="space-y-6">
            <p className="text-[var(--primary-color)] font-semibold text-lg">{t('tag')}</p>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">{t('title')}</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {t('description')}
            </p>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Section Freelances */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-1">{t('freelancers.title')}</h3>
              <p className="text-sm text-gray-600">{t('freelancers.subtitle')}</p>
            </div>
            <div className="space-y-4">
              {freelancerSteps.map((step, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm">
                    {step.number}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">{step.title}</h4>
                    <p className="text-gray-600 text-sm">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Section Entreprises */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-1">{t('companies.title')}</h3>
              <p className="text-sm text-gray-600">{t('companies.subtitle')}</p>
            </div>
            <div className="space-y-4">
              {companySteps.map((step, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-semibold text-sm">
                    {step.number}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-sm mb-1">{step.title}</h4>
                    <p className="text-gray-600 text-sm">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
