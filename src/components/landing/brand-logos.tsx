'use client';

import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';

export const BrandLogos = () => {
  const t = useTranslations('landing.brandLogos');

  const brands = [
    { name: 'Brand One', color: 'bg-blue-500' },
    { name: 'Brand Two', color: 'bg-[var(--primary-color)]' },
    { name: 'Brand Three', color: 'bg-purple-500' },
    { name: 'Brand Four', color: 'bg-orange-500' },
  ];

  return (
    <section className="py-16 bg-white overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-full"
      >
        <div className="text-center mb-12">
          <p className="text-gray-600 text-lg">{t('trustedBy')}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
          {brands.map((brand, index) => (
            <div key={index} className="flex items-center justify-center">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-10 h-10 ${brand.color} rounded-lg flex items-center justify-center`}
                >
                  <div className="w-6 h-6 bg-white/30 rounded"></div>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Brand</div>
                  <div className="text-sm text-gray-600">name</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};
