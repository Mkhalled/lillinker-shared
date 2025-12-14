'use client';

import { ChevronDown } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

export const FAQ = () => {
  const t = useTranslations('landing.faq');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      question: t('question1'),
      answer: t('answer1'),
    },
    {
      question: t('question2'),
      answer: t('answer2'),
    },
    {
      question: t('question3'),
      answer: t('answer3'),
    },
    {
      question: t('question4'),
      answer: t('answer4'),
    },
    {
      question: t('question5'),
      answer: t('answer5'),
    },
    {
      question: t('question6'),
      answer: t('answer6'),
    },
  ];

  // Generate FAQ Schema for SEO
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <section className="py-20 bg-white overflow-hidden">
      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-[var(--primary-color)] font-semibold text-lg mb-4">{t('tag')}</p>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('title')} <span className="text-[var(--primary-color)]">{t('titleHighlight')}</span>
          </h2>
          <p className="text-xl text-gray-600">{t('subtitle')}</p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-gray-50 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-100 transition-colors"
              >
                <span className="text-lg font-semibold text-gray-900 pr-4">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-[var(--primary-color)] flex-shrink-0 transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="px-6 pb-5 text-gray-600 leading-relaxed">{faq.answer}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-600">
            {t('moreQuestions')}{' '}
            <a
              href="#contact"
              className="text-[var(--primary-color)] font-semibold hover:underline"
            >
              {t('contactUs')}
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
};
