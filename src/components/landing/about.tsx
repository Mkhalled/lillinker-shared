import { motion } from 'motion/react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { Button } from '../ui/button/Button';

export const About = () => {
  const t = useTranslations('landing.about');

  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-6">
              <p className="text-[var(--primary-color)] font-semibold text-lg">{t('tag')}</p>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                {t('title')}{' '}
                <span className="text-[var(--primary-color)]">{t('titleHighlight')}</span>
                <br />
                {t('title2')}
              </h2>
              <div className="space-y-4">
                <p className="text-gray-600 text-lg leading-relaxed">
                  <span className="font-semibold text-gray-900">{t('since')}</span>
                </p>
                <p className="text-gray-600 leading-relaxed">{t('description1')}</p>
                <p className="text-gray-600 leading-relaxed">{t('description2')}</p>
              </div>
            </div>
            <Button
              size="lg"
              className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-full"
            >
              {t('learnMoreButton')}
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative">
              <Image
                src="/images/landing/2.png"
                alt="Simulation portage salarial - Calculez votre TJM et revenus freelance"
                width={600}
                height={500}
                className="w-full h-auto rounded-2xl"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--primary-color)]/20 to-transparent rounded-2xl"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
