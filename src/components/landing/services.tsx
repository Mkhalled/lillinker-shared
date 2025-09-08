import { Compass, Eye, Users } from 'lucide-react';
import { motion } from 'motion/react';
import Image from 'next/image';

export const Services = () => {
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
              <p className="text-[var(--primary-color)] font-semibold text-lg">SERVICES</p>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                Explorez les vrais <span className="text-[var(--primary-color)]">Obstacles</span>{' '}
                des indépendants, <span className="text-[var(--primary-color)]">pas seulement</span>{' '}
                notre discours.
              </h2>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-[var(--primary-light)] rounded-xl flex items-center justify-center flex-shrink-0">
                  <Compass className="w-6 h-6 text-[var(--primary-color)]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Un Canal Unique Et Unifié
                  </h3>
                  <p className="text-gray-600">
                    Centralisez toutes vos communications et gérez vos projets de portage en toute
                    simplicité grâce à notre plateforme unifiée.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Eye className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Transparence Totale</h3>
                  <p className="text-gray-600">
                    Bénéficiez d&apos;une transparence complète sur les tarifs, les services et les
                    conditions de chaque société de portage.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Best Service</h3>
                  <p className="text-gray-600">
                    Profitez d&apos;un service client exceptionnel avec des conseillers experts
                    disponibles pour vous accompagner.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <p className="text-gray-600 mb-4">
                Bienvenue à tous, Je cherche une boite pour faire une mission en freelance.
                Avez-vous des pistes svp ? Merci
              </p>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[var(--primary-color)] rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">JL</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">John Lead</p>
                  <p className="text-sm text-gray-600">CEO Lead</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
