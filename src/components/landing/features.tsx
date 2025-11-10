import { Shield, Zap, Users, Award, Clock, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';

const Features = () => {
  const t = useTranslations('landing.features');

  const features = [
    {
      icon: Shield,
      title: t('secure.title'),
      description: t('secure.description'),
    },
    {
      icon: Users,
      title: t('support.title'),
      description: t('support.description'),
    },
    {
      icon: Star,
      title: t('customizable.title'),
      description: t('customizable.description'),
    },
    {
      icon: Zap,
      title: t('reliable.title'),
      description: t('reliable.description'),
    },
    {
      icon: Clock,
      title: t('fast.title'),
      description: t('fast.description'),
    },
    {
      icon: Award,
      title: t('easy.title'),
      description: t('easy.description'),
    },
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-6 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-[var(--primary-color)] font-semibold text-lg mb-4">{t('tag')}</p>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {t('title')} <span className="text-[var(--primary-color)]">{t('titleHighlight')}</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">{t('description')}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-[var(--primary-light)] rounded-xl flex items-center justify-center mr-4">
                  <feature.icon className="w-6 h-6 text-[var(--primary-color)]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
              </div>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Features;
