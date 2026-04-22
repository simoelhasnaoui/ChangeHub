import { Link } from 'react-router-dom';
import ChangeHubLogo from '../ChangeHubLogo';

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
              {/* Abstract social icons styled as glass buttons */}
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full bg-white/[0.02] border border-white/5 hover:bg-white/[0.06] hover:border-[#D5CBE5]/20 hover:-translate-y-1 cursor-pointer flex items-center justify-center transition-all duration-500 shadow-[0_0_15px_rgba(0,0,0,0.2)] group">
                   <div className="w-3 h-3 rounded-full bg-[#B5A1C2]/30 group-hover:bg-[#D5CBE5] transition-colors duration-500" />
                </div>
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

