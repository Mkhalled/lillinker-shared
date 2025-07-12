import Image from "next/image"
import { Button } from "../ui/button/Button"

export default function About() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="space-y-6">
              <p className="text-[var(--primary-color)] font-semibold text-lg">À PROPOS DE NOUS</p>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                Votre Boussole <span className="text-[var(--primary-color)]">pour</span>
                <br />
                le Portage Parfait.
              </h2>
              <div className="space-y-4">
                <p className="text-gray-600 text-lg leading-relaxed">
                  <span className="font-semibold text-gray-900">Depuis 2023</span>
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Lillinker, votre partenaire dévoué pour simplifier le processus de sélection d'une société de portage
                  en tant que freelance. En tant qu'agrégateur de plateformes de portage, nous identifions et nous vous
                  proposons les meilleures sociétés qui correspondent à vos besoins spécifiques.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Rejoignez-nous, rejoignez l'avenir du portage salarial ensemble !
                </p>
              </div>
            </div>
            <Button size="lg" className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-full">
              En Savoir Plus
            </Button>
          </div>

          <div className="relative">
            <div className="relative">
              <Image
                src="/images/landing/2.png"
                alt="Growth and success illustration"
                width={600}
                height={500}
                className="w-full h-auto rounded-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--primary-color)]/20 to-transparent rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
