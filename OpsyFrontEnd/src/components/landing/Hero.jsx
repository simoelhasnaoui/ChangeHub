import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import WorkflowRecording from './WorkflowRecording';

export default function Hero() {
  return (
    <section className="pt-36 pb-20 px-6 relative overflow-hidden bg-[#3E1E70]/40 backdrop-blur-sm shadow-xl border border-[#5C2D8F]/30">
      {/* Background glowing blob */}
      <div className="absolute top-0 right-0 -mr-40 -mt-40 w-[800px] h-[800px] bg-blue-400/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-[600px] h-[600px] bg-indigo-400/5 rounded-full blur-[80px] pointer-events-none" />

      <div className="max-w-[1200px] mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">

        {/* Lert Content */}
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold mb-6"
          >
            <Zap size={14} className="text-blue-500" />
            <span>Opsy est maintenant disponible</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#D5CBE5] via-[#B5A1C2] to-[#816A9E] font-extrabold pb-1 tracking-tight leading-[1.1] mb-6"
          >
            Maîtrisez vos <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">demandes de changement.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-[#B5A1C2]/70 leading-relaxed mb-10 max-w-lg"
          >
            La plateforme premium qui connecte demandeurs, approbateurs et implémenteurs dans un rlux de travail unique et sans raille. Conçue pour l'agilité des entreprises modernes.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap items-center gap-4"
          >
            <Link to="/login" className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-full text-base font-semibold hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 hover:-translate-y-0.5">
              Se connecter
            </Link>
            <Link to="/login" className="flex items-center justify-center gap-2 bg-[#3E1E70]/40 backdrop-blur-sm shadow-xl border border-[#5C2D8F]/30 border border-[#5C2D8F]/50 text-[#B5A1C2] px-8 py-4 rounded-full text-base font-semibold hover:bg-[#5C2D8F]/30 transition-colors">
              S'inscrire
            </Link>
          </motion.div>
        </div>

        {/* Right Graphic / Abstract UI */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative lg:h-[600px] flex items-center justify-center w-full"
        >
          <div className="w-[480px] relative z-20 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] shadow-[#5C2D8F]/10 hover:shadow-[#5C2D8F]/20 transition-all duration-700 ml-8">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-[#816A9E] opacity-20 blur-lg rounded-xl" />
            <WorkflowRecording />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
