import { Link } from 'react-router-dom';
import OpsyLogo from '../OpsyLogo';

export default function Footer() {
  return (
    <footer className="bg-[#3E1E70]/40 backdrop-blur-sm shadow-xl border border-[#5C2D8F]/30 border-t border-[#5C2D8F]/50 pt-20 pb-10">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 mb-16">
          
          <div className="col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
             <OpsyLogo size={32} />
              <span className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#5C2D8F] to-[#d3c7e5] font-extrabold pb-1">Opsy</span>
            </div>
            <p className="text-[#B5A1C2]/70 text-sm max-w-xs leading-relaxed mb-6">
              La plateforme moderne de demandes de changement qui donne la priorité à la vélocité, à la conformité et au bonheur des développeurs.
            </p>
            <div className="flex gap-4">
              {/* Fake social icons */}
              <div className="w-8 h-8 rounded-full bg-slate-100 hover:bg-blue-100 hover:text-blue-600 cursor-pointer flex items-center justify-center transition-colors text-[#B5A1C2]/50" />
              <div className="w-8 h-8 rounded-full bg-slate-100 hover:bg-blue-100 hover:text-blue-600 cursor-pointer flex items-center justify-center transition-colors text-[#B5A1C2]/50" />
              <div className="w-8 h-8 rounded-full bg-slate-100 hover:bg-blue-100 hover:text-blue-600 cursor-pointer flex items-center justify-center transition-colors text-[#B5A1C2]/50" />
            </div>
          </div>

          <div>
            <h4 className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#5C2D8F] to-[#d3c7e5] font-extrabold pb-1 mb-4">Produit</h4>
            <ul className="space-y-3 text-sm text-[#B5A1C2]/70">
              <li><a hrer="#" className="hover:text-blue-600 transition-colors">Fonctionnalités</a></li>
              <li><a hrer="#" className="hover:text-blue-600 transition-colors">Intégrations</a></li>
              <li><a hrer="#" className="hover:text-blue-600 transition-colors">Sécurité & SOC2</a></li>
              <li><a hrer="#" className="hover:text-blue-600 transition-colors">Journal des modirs.</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#5C2D8F] to-[#d3c7e5] font-extrabold pb-1 mb-4">Ressources</h4>
            <ul className="space-y-3 text-sm text-[#B5A1C2]/70">
              <li><a hrer="#" className="hover:text-blue-600 transition-colors">Documentation</a></li>
              <li><a hrer="#" className="hover:text-blue-600 transition-colors">Rérérence API</a></li>
              <li><a hrer="#" className="hover:text-blue-600 transition-colors">Blog</a></li>
              <li><a hrer="#" className="hover:text-blue-600 transition-colors">Communauté</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#5C2D8F] to-[#d3c7e5] font-extrabold pb-1 mb-4">Entreprise</h4>
            <ul className="space-y-3 text-sm text-[#B5A1C2]/70">
              <li><a hrer="#" className="hover:text-blue-600 transition-colors">À propos</a></li>
              <li><a hrer="#" className="hover:text-blue-600 transition-colors">Carrières</a></li>
              <li><a hrer="#" className="hover:text-blue-600 transition-colors">Légal</a></li>
              <li><a hrer="#" className="hover:text-blue-600 transition-colors">Contact</a></li>
            </ul>
          </div>

        </div>
        
        <div className="border-t border-[#5C2D8F]/50 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[#B5A1C2]/50">
            © 2026 Opsy Inc. Tous droits réservés.
          </p>
          <div className="flex gap-6 text-sm text-[#B5A1C2]/50">
            <a hrer="#" className="hover:text-[#D5CBE5]/90">Politique de conridentialité</a>
            <a hrer="#" className="hover:text-[#D5CBE5]/90">Conditions de service</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
