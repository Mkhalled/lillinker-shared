import { Shield, Zap, Users, Award, Clock, Star } from 'lucide-react';
import { motion } from 'motion/react';

const Features = () => {
  const features = [
    {
      icon: Shield,
      title: 'Secure',
      description:
        'Sécurité maximale pour vos données avec des protocoles de chiffrement avancés et une protection complète.',
    },
    {
      icon: Users,
      title: '24/7 Support',
      description:
        'Support client disponible 24h/24 et 7j/7 pour répondre à toutes vos questions et préoccupations.',
    },
    {
      icon: Star,
      title: 'Customizable',
      description:
        'Interface entièrement personnalisable selon vos besoins spécifiques et votre identité de marque.',
    },
    {
      icon: Zap,
      title: 'Reliable',
      description:
        'Plateforme fiable avec une disponibilité de 99.9% et des performances optimales en permanence.',
    },
    {
      icon: Clock,
      title: 'Fast',
      description:
        'Traitement ultra-rapide de vos demandes avec des temps de réponse optimisés pour votre efficacité.',
    },
    {
      icon: Award,
      title: 'Easy',
      description:
        'Interface intuitive et facile à utiliser, conçue pour simplifier votre expérience utilisateur.',
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
          <p className="text-[var(--primary-color)] font-semibold text-lg mb-4">FEATURES</p>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            We have Amazing <span className="text-[var(--primary-color)]">Service.</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Découvrez nos fonctionnalités exceptionnelles conçues pour optimiser votre expérience et
            maximiser votre efficacité dans la gestion du portage salarial.
          </p>
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
