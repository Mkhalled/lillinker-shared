'use client';

import Header from './header';

const HeaderWithNavigation = () => {
  // Create refs for smooth scrolling to sections
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 80; // Account for fixed header height
      const elementPosition = element.offsetTop;
      const offsetPosition = elementPosition - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  return (
    <Header
      onHomeClick={() => scrollToSection('home')}
      onAboutClick={() => scrollToSection('about')}
      onHowItWorksClick={() => scrollToSection('how-it-works')}
      onServicesClick={() => scrollToSection('services')}
      onContactClick={() => scrollToSection('contact')}
    />
  );
};

export default HeaderWithNavigation;
