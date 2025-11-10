import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';

export const Stats = () => {
  const t = useTranslations('landing.stats');

  const stats = [
    { number: '1200+', label: t('projects') },
    { number: '2354+', label: t('clients') },
    { number: '3299+', label: t('coffee') },
    { number: '101+', label: t('awards') },
  ];

  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-full">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">{stat.number}</div>
              <div className="text-gray-600 text-lg">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
