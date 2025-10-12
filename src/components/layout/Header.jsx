/**
 * Header Component for ReForest.AI
 * Displays app branding, navigation, and user actions
 * FIXED: Mobile menu now works properly with smooth scrolling
 */
import React, { useState } from 'react';
import { Leaf, Menu, X, Info, Heart } from 'lucide-react';
import { COLORS } from '../../constants/colors';
import CONFIG from '../../constants/config';

const Header = () => {
  // Internal state for mobile menu
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const toggleMobileMenu = () => {
    setShowMobileMenu(prev => !prev);
  };

  const closeMobileMenu = () => {
    setShowMobileMenu(false);
  };

  const handleAboutClick = () => {
    closeMobileMenu();
    // Scroll to top to see hero section
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleHelpClick = () => {
    closeMobileMenu();
    // Scroll to "How It Works" section
    const howItWorksSection = document.getElementById('how-it-works');
    if (howItWorksSection) {
      howItWorksSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      // If not found, scroll to a reasonable position
      window.scrollTo({ top: window.innerHeight * 0.6, behavior: 'smooth' });
    }
  };

  return (
    <header 
      className="sticky top-0 z-50 shadow-md"
      style={{ backgroundColor: COLORS.primary }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div 
              className="p-2 rounded-lg"
              style={{ backgroundColor: COLORS.accent }}
            >
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-white">
                {CONFIG.APP_NAME}
              </h1>
              <p className="text-xs hidden sm:block" style={{ color: COLORS.light }}>
                {CONFIG.APP_TAGLINE}
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <NavLink onClick={handleAboutClick} icon={Info}>
              About
            </NavLink>
            <NavLink onClick={handleHelpClick} icon={Heart}>
              How It Works
            </NavLink>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
            aria-label="Toggle menu"
            aria-expanded={showMobileMenu}
          >
            {showMobileMenu ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden py-4 border-t border-white/10">
            <nav className="flex flex-col space-y-3">
              <MobileNavLink onClick={handleAboutClick} icon={Info}>
                About ReForest.AI
              </MobileNavLink>
              <MobileNavLink onClick={handleHelpClick} icon={Heart}>
                How It Works
              </MobileNavLink>
            </nav>
          </div>
        )}
      </div>

      {/* Hackathon Badge */}
      <div 
        className="py-2 text-center text-xs font-medium"
        style={{ backgroundColor: COLORS.accent, color: COLORS.white }}
      >
        🌱 Built for {CONFIG.HACKATHON_NAME}
      </div>
    </header>
  );
};

// Desktop Navigation Link Component
const NavLink = ({ children, icon: Icon, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center space-x-2 text-white hover:opacity-80 transition-opacity"
    >
      <Icon className="w-5 h-5" />
      <span className="text-sm font-medium">{children}</span>
    </button>
  );
};

// Mobile Navigation Link Component
const MobileNavLink = ({ children, icon: Icon, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-center space-x-3 px-3 py-2 rounded-lg text-white hover:bg-white/10 transition-colors w-full text-left"
    >
      <Icon className="w-5 h-5" />
      <span className="text-sm font-medium">{children}</span>
    </button>
  );
};

export default Header;