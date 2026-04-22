import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import ChangeHubLogo from '../ChangeHubLogo';

const GithubIcon = ({ size = 24, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3-.3 6-1.5 6-6.5a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 5 3 6.2 6 6.5a4.8 4.8 0 0 0-1 3.2v4"></path>
  </svg>
);

const LinkedinIcon = ({ size = 24, className = '' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

export default function Footer() {
  return (
    <footer className="relative bg-transparent border-t border-white/5 pt-20 pb-10 overflow-hidden">
      {/* Subtle ambient light from bottom edge */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#5C2D8F]/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 mb-16">
          
          <div className="col-span-2 lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
             <ChangeHubLogo size={32} />
              <span className="text-xl font-medium tracking-tight text-white">ChangeHub</span>
            </div>
            <p className="text-[#B5A1C2]/60 text-sm font-light max-w-xs leading-relaxed mb-8">
              La plateforme moderne de gestion du changement qui allie sécurité absolue, vélocité d'ingénierie et design premium.
            </p>
            <div className="flex gap-4">
              {/* Social icons styled as glass buttons */}
              {[
                { Icon: GithubIcon, href: '#' },
                { Icon: Mail, href: '#' },
                { Icon: LinkedinIcon, href: '#' }
              ].map(({ Icon, href }, i) => (
                <a key={i} href={href} className="w-10 h-10 rounded-full bg-white/[0.02] border border-white/5 hover:bg-white/[0.06] hover:border-[#D5CBE5]/20 hover:-translate-y-1 cursor-pointer flex items-center justify-center transition-all duration-500 shadow-[0_0_15px_rgba(0,0,0,0.2)] group text-[#B5A1C2]/40 hover:text-[#D5CBE5]">
                   <Icon size={16} className="transition-colors duration-500" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[#E8E0F0] font-medium tracking-wide mb-6">Produit</h4>
            <ul className="space-y-4 text-sm text-[#B5A1C2]/50 font-light">
              <li><a href="#" className="hover:text-white transition-colors duration-300">Fonctionnalités</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-300">Intégrations</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-300">Sécurité & SOC2</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-300">Journal des modifications</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[#E8E0F0] font-medium tracking-wide mb-6">Ressources</h4>
            <ul className="space-y-4 text-sm text-[#B5A1C2]/50 font-light">
              <li><a href="#" className="hover:text-white transition-colors duration-300">Documentation</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-300">Référence API</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-300">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-300">Communauté</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[#E8E0F0] font-medium tracking-wide mb-6">Entreprise</h4>
            <ul className="space-y-4 text-sm text-[#B5A1C2]/50 font-light">
              <li><a href="#" className="hover:text-white transition-colors duration-300">À propos</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-300">Carrières</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-300">Légal</a></li>
              <li><a href="#" className="hover:text-white transition-colors duration-300">Contact</a></li>
            </ul>
          </div>

        </div>
        
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#B5A1C2]/40 font-light tracking-wide uppercase">
            © 2026 ChangeHub Inc. Tous droits réservés.
          </p>
          <div className="flex gap-6 text-xs text-[#B5A1C2]/40 font-light tracking-wide uppercase">
            <a href="#" className="hover:text-white transition-colors duration-300">Politique de confidentialité</a>
            <a href="#" className="hover:text-white transition-colors duration-300">Conditions de service</a>
          </div>
        </div>

      </div>
    </footer>
  );
}

