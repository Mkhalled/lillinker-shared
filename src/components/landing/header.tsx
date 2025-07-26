'use client';

import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Button } from '../ui/button/Button';

interface HeaderProps {
  onHomeClick?: () => void;
  onAboutClick?: () => void;
  onServicesClick?: () => void;
  onContactClick?: () => void;
}

const Header = ({ onHomeClick, onAboutClick, onServicesClick, onContactClick }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="container mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              LILLINKER
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={onHomeClick}
              className="text-gray-700 hover:text-[var(--primary-color)] transition-colors cursor-pointer"
            >
              Home
            </button>
            <button
              onClick={onAboutClick}
              className="text-gray-700 hover:text-[var(--primary-color)] transition-colors cursor-pointer"
            >
              About
            </button>
            <button
              onClick={onServicesClick}
              className="text-gray-700 hover:text-[var(--primary-color)] transition-colors cursor-pointer"
            >
              Services
            </button>
            <button
              onClick={onContactClick}
              className="text-gray-700 hover:text-[var(--primary-color)] transition-colors cursor-pointer"
            >
              Contact
            </button>
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <Link href="/auth/login">
              <Button className="bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] text-white">
                Login
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={toggleMenu}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
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
                Home
              </button>
              <button
                onClick={() => {
                  onAboutClick?.();
                  closeMenu();
                }}
                className="text-gray-700 hover:text-[var(--primary-color)] transition-colors py-2 text-left"
              >
                About
              </button>
              <button
                onClick={() => {
                  onServicesClick?.();
                  closeMenu();
                }}
                className="text-gray-700 hover:text-[var(--primary-color)] transition-colors py-2 text-left"
              >
                Services
              </button>
              <button
                onClick={() => {
                  onContactClick?.();
                  closeMenu();
                }}
                className="text-gray-700 hover:text-[var(--primary-color)] transition-colors py-2 text-left"
              >
                Contact
              </button>
              <div className="flex flex-col space-y-3 pt-4 border-t border-gray-100">
                <Button
                  variant="outline"
                  className="border-[var(--primary-color)] text-[var(--primary-color)] hover:bg-[var(--primary-light)] bg-transparent"
                >
                  Login
                </Button>
                <Button className="bg-[var(--primary-color)] hover:bg-[var(--primary-hover)] text-white">
                  Get Started
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
