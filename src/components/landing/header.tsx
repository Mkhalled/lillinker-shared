'use client';

import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { useLoading } from '@/app/context/LoadingContext';

import { Button } from '../ui/button/Button';

interface HeaderProps {
  onHomeClick?: () => void;
  onAboutClick?: () => void;
  onHowItWorksClick?: () => void;
  onServicesClick?: () => void;
  onContactClick?: () => void;
}

const Header = ({
  onHomeClick,
  onAboutClick,
  onHowItWorksClick,
  onServicesClick,
  onContactClick,
}: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const { setLoading } = useLoading();
  const router = useRouter();
  const t = useTranslations('landing.header');

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const getDashboardHref = async () => {
    setLoading(true);
    let targetRoute = '';
    switch (session?.user.role) {
      case 'ADMIN':
        targetRoute = '/admin/dashboard';
        break;
      case 'MANAGER':
        targetRoute = '/company/manager/dashboard';
        break;
      case 'FREELANCE':
        targetRoute = '/consultant/dashboard';
        break;
      case 'COMPANY':
        targetRoute = '/company/admin/dashboard';
        break;
    }
    router.push(targetRoute);
  };
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-full">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center min-w-0">
            <Link href="/" className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
              LILLINKER
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
            <button
              onClick={onHomeClick}
              className="text-gray-700 hover:text-[var(--primary-color)] transition-colors cursor-pointer whitespace-nowrap"
            >
              {t('home')}
            </button>
            <button
              onClick={onHowItWorksClick}
              className="text-gray-700 hover:text-[var(--primary-color)] transition-colors cursor-pointer whitespace-nowrap"
            >
              {t('howItWorks')}
            </button>
            <button
              onClick={onAboutClick}
              className="text-gray-700 hover:text-[var(--primary-color)] transition-colors cursor-pointer whitespace-nowrap"
            >
              {t('about')}
            </button>
            <button
              onClick={onServicesClick}
              className="text-gray-700 hover:text-[var(--primary-color)] transition-colors cursor-pointer whitespace-nowrap"
            >
              {t('services')}
            </button>
            <button
              onClick={onContactClick}
              className="text-gray-700 hover:text-[var(--primary-color)] transition-colors cursor-pointer whitespace-nowrap"
            >
              {t('contact')}
            </button>
          </nav>

          <div className="hidden md:flex items-center space-x-3 lg:space-x-4 flex-shrink-0">
            {status === 'authenticated' ? (
              <Button
                onClick={getDashboardHref}
                className="bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] text-white"
              >
                {t('dashboard')}
              </Button>
            ) : (
              <Link href="/auth/login">
                <Button className="bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] text-white">
                  {t('login')}
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex-shrink-0">
            <Button variant="ghost" size="sm" onClick={toggleMenu} className="p-2">
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 bg-white/95 backdrop-blur-sm">
            <nav className="flex flex-col space-y-4">
              <button
                onClick={() => {
                  onHomeClick?.();
                  closeMenu();
                }}
                className="text-gray-700 hover:text-[var(--primary-color)] transition-colors py-2 text-left"
              >
                {t('home')}
              </button>
              <button
                onClick={() => {
                  onAboutClick?.();
                  closeMenu();
                }}
                className="text-gray-700 hover:text-[var(--primary-color)] transition-colors py-2 text-left"
              >
                {t('about')}
              </button>
              <button
                onClick={() => {
                  onHowItWorksClick?.();
                  closeMenu();
                }}
                className="text-gray-700 hover:text-[var(--primary-color)] transition-colors py-2 text-left"
              >
                {t('howItWorks')}
              </button>
              <button
                onClick={() => {
                  onServicesClick?.();
                  closeMenu();
                }}
                className="text-gray-700 hover:text-[var(--primary-color)] transition-colors py-2 text-left"
              >
                {t('services')}
              </button>
              <button
                onClick={() => {
                  onContactClick?.();
                  closeMenu();
                }}
                className="text-gray-700 hover:text-[var(--primary-color)] transition-colors py-2 text-left"
              >
                {t('contact')}
              </button>
              <div className="flex flex-col space-y-3 pt-4 border-t border-gray-100">
                {status === 'authenticated' ? (
                  <Button
                    onClick={() => {
                      getDashboardHref();
                      closeMenu();
                    }}
                    className="bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] text-white"
                  >
                    {t('dashboard')}
                  </Button>
                ) : (
                  <>
                    <Link href="/auth/login" onClick={closeMenu}>
                      <Button
                        variant="outline"
                        className="w-full border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--primary-light)] bg-transparent"
                      >
                        {t('login')}
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
