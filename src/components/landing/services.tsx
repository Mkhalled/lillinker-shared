import { Compass, Eye, Users } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

export const Services = () => {
  const t = useTranslations('landing.services');

  return (
    <section className="py-20 bg-gradient-to-br from-[var(--primary-light)] to-blue-50 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <Image
                src="/images/landing/3.png"
                alt="Communication platform interface"
                width={500}
                height={400}
                className="w-full h-auto rounded-xl"
              />
            </div>
          </motion.div>

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
                <span className="text-[var(--primary-color)]">{t('titleHighlight')}</span>{' '}
                {t('title2')}{' '}
                <span className="text-[var(--primary-color)]">{t('titleHighlight2')}</span>{' '}
                {t('title3')}
              </h2>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-[var(--primary-light)] rounded-xl flex items-center justify-center flex-shrink-0">
                  <Compass className="w-6 h-6 text-[var(--primary-color)]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {t('unifiedChannel.title')}
                  </h3>
                  <p className="text-gray-600">{t('unifiedChannel.description')}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Eye className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {t('transparency.title')}
                  </h3>
                  <p className="text-gray-600">{t('transparency.description')}</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{t('bestService.title')}</h3>
                  <p className="text-gray-600">{t('bestService.description')}</p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <p className="text-gray-600 mb-4">{t('testimonial')}</p>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[var(--primary-color)] rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">JL</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{t('testimonialAuthor')}</p>
                  <p className="text-sm text-gray-600">{t('testimonialRole')}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
