/**
 * Footer Component for ReForest.AI
 * Displays credits, links, and attribution
 */
import React from 'react';
import { Heart, Leaf, ExternalLink, Github, Mail, Twitter } from 'lucide-react';
import COLORS from '../../constants/colors';
import CONFIG from '../../constants/config';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer 
      className="mt-auto"
      style={{ backgroundColor: COLORS.primary, color: COLORS.white }}
    >
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Leaf className="w-6 h-6" style={{ color: COLORS.accent }} />
              <h3 className="text-lg font-bold">{CONFIG.APP_NAME}</h3>
            </div>
            <p className="text-sm opacity-90 leading-relaxed">
              AI-powered tree planting recommendations to help restore our planet. 
              Upload a photo, get climate insights, and plant the right trees for your location.
            </p>
            <div className="flex items-center space-x-2 text-sm">
              <span>Made with</span>
              <Heart className="w-4 h-4" style={{ color: COLORS.accent }} fill="currentColor" />
              <span>for the planet</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Resources</h3>
            <ul className="space-y-2 text-sm">
              <FooterLink 
                href="https://www.fao.org/forestry/en/"
                text="FAO Forestry"
              />
              <FooterLink 
                href="https://www.plant-for-the-planet.org/"
                text="Plant for the Planet"
              />
              <FooterLink 
                href="https://trees.org/"
                text="Trees for the Future"
              />
              <FooterLink 
                href="https://www.trilliontrees.org/"
                text="Trillion Trees"
              />
              <FooterLink 
                href="https://www.worldagroforestry.org/"
                text="World Agroforestry"
              />
            </ul>
          </div>

          {/* Data Sources & Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold">Powered By</h3>
            <ul className="space-y-2 text-sm opacity-90">
              <li> Open-Meteo API</li>
              <li> OpenStreetMap</li>
              <li> GBIF Database</li>
              <li> OpenAI GPT-4</li>
              <li> Trefle Plant API</li>
            </ul>
            
            {/* Social Links */}
            <div className="pt-4">
              <h4 className="text-sm font-semibold mb-3">Connect</h4>
              <div className="flex space-x-4">
                <SocialLink 
                  href="https://github.com/Gunther5kevo/reforestration-ai"
                  icon={Github}
                  label="GitHub"
                />
                <SocialLink 
                  href="mailto:kipyegokevin82@gmail.com"
                  icon={Mail}
                  label="Email"
                />
                <SocialLink 
                  href="https://twitter.com/kevodaktari"
                  icon={Twitter}
                  label="Twitter"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div 
        className="border-t py-6"
        style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <p className="text-sm opacity-75">
              © {currentYear} {CONFIG.APP_NAME}. Built for {CONFIG.HACKATHON_NAME}.
            </p>

            {/* Legal Links */}
            <div className="flex space-x-6 text-sm">
              <button 
                className="opacity-75 hover:opacity-100 transition-opacity"
                onClick={() => alert('Privacy policy coming soon!')}
              >
                Privacy
              </button>
              <button 
                className="opacity-75 hover:opacity-100 transition-opacity"
                onClick={() => alert('Terms coming soon!')}
              >
                Terms
              </button>
              <a
                href="https://github.com/Gunther5kevo/reforestration-ai"
                target="_blank"
                rel="noopener noreferrer"
                className="opacity-75 hover:opacity-100 transition-opacity"
              >
                License
              </a>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="mt-6 pt-6 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
            <p className="text-xs opacity-60 text-center max-w-3xl mx-auto">
              <strong>Disclaimer:</strong> ReForest.AI provides recommendations based on climate data and AI analysis. 
              Always consult with local forestry experts and consider local regulations before planting. 
              Tree survival depends on proper care, maintenance, and local conditions.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Footer Link Component
const FooterLink = ({ href, text }) => {
  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center space-x-2 opacity-90 hover:opacity-100 transition-opacity group"
      >
        <span>{text}</span>
        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
      </a>
    </li>
  );
};

// Social Link Component
const SocialLink = ({ href, icon: Icon, label }) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="p-2 rounded-lg hover:bg-white/10 transition-colors"
    >
      <Icon className="w-5 h-5" />
    </a>
  );
};

export default Footer;