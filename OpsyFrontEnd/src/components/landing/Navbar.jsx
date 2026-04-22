import { motion } from 'framer-motion';
import { ArrowRight, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ChangeHubLogo from '../ChangeHubLogo';

export default function Navbar() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <nav className={`fixed top-6 inset-x-0 mx-auto w-[calc(100%-3rem)] max-w-[1000px] z-100 bg-[#3E1E70]/20 backdrop-blur-[24px] backdrop-saturate-[180%] border border-white/10 rounded-full shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] transition-all duration-700 ease-out ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-[150%] opacity-0'}`}>
      <div className="max-w-[1200px] mx-auto px-2 sm:px-4 h-20 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 px-4 py-2 rounded-full hover:-translate-y-0.5 hover:shadow-purple-500/20 transition-all duration-500 ease-out">
          <ChangeHubLogo size={80} />
          <span className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#5C2D8F] to-[#d3c7e5] pb-1"></span>
        </Link>

        {/* Links (Desktop) */}
        <div className="hidden md:flex items-center gap-2 text-sm font-medium text-[#D5CBE5]/90">
          <a href="#features" className="px-4 py-2.5 rounded-full hover:bg-white/10 hover:backdrop-blur-md hover:text-[#D5CBE5] hover:-translate-y-0.5 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-500 ease-out">Fonctionnalités</a>
          <a href="#how-it-works" className="px-4 py-2.5 rounded-full hover:bg-white/10 hover:backdrop-blur-md hover:text-[#D5CBE5] hover:-translate-y-0.5 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-500 ease-out">Solutions</a>
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-1">
          <Link to="/login" className="flex items-center gap-2 bg-gradient-to-r from-[#D5CBE5] to-[#816A9E] text-[#2B1042] shadow-lg shadow-[#5C2D8F]/30 px-5 py-2.5 rounded-full text-sm font-semibold hover:shadow-2xl hover:shadow-[#5C2D8F]/50 transition-all duration-500 ease-out hover:-translate-y-0.5 ml-2">
            Se connecter
            <ArrowRight size={16} />
          </Link>

        </div>

        {/* Mobile menu icon */}
        <button className="md:hidden p-2 rounded-full hover:bg-white/10 hover:backdrop-blur-md text-[#B5A1C2]/70 hover:text-[#D5CBE5] hover:-translate-y-0.5 hover:shadow-xl transition-all duration-500 ease-out">
          <Menu size={24} />
        </button>
      </div>
    </nav>
  );
}
