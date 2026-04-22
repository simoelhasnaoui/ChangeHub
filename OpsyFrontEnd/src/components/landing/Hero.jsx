import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Zap, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import WorkflowRecording from './WorkflowRecording';

export default function Hero() {
  return (
    <section className="min-h-screen pt-36 pb-20 px-6 relative overflow-hidden bg-transparent flex items-center">
      {/* Bottom transition blend */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#2B1042] to-transparent pointer-events-none" />

      {/* Background glowing blobs */}
      <div className="absolute top-0 right-0 -mr-40 -mt-40 w-[800px] h-[800px] bg-[#816A9E]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 -ml-40 -mt-40 w-[500px] h-[500px] bg-[#5C2D8F]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-[1200px] mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10 w-full">

        {/* Left Content */}
        <div className="max-w-xl">

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.02] border border-white/5 backdrop-blur-md mb-8 shadow-sm"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D5CBE5] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D5CBE5]"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#B5A1C2]">ChangeHub Command Center</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-6xl lg:text-[5.5rem] font-light tracking-tighter text-white leading-[1.05] mb-6"
          >
            Maîtrisez vos <br />
            <span className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-[#D5CBE5] to-[#816A9E]">changements.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-[#B5A1C2]/60 leading-relaxed mb-10 max-w-md font-light"
          >
            Une ingénierie de précision pour vos workflows DevOps. Connectez vos équipes dans un espace sécurisé de haute performance.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap items-center gap-6"
          >
            <Link
              to="/login"
              className="group relative flex items-center gap-3 px-8 py-4 bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 rounded-2xl backdrop-blur-xl transition-all duration-500 overflow-hidden shadow-[0_0_20px_rgba(213,203,229,0.05)] hover:shadow-[0_0_30px_rgba(213,203,229,0.1)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#D5CBE5]/0 via-[#D5CBE5]/10 to-[#D5CBE5]/0 opacity-0 group-hover:opacity-100 translate-x-[-100%] group-hover:translate-x-[100%] transition-all duration-1000 ease-in-out" />
              <span className="relative z-10 text-[11px] text-white font-black uppercase tracking-widest">Se Connecter</span>
              <ArrowRight size={14} className="relative z-10 text-[#B5A1C2] group-hover:text-white group-hover:translate-x-1 transition-all" />
            </Link>

            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-[#816A9E]/60">
              <ShieldCheck size={16} />
              <span>Chiffré de bout-en-bout</span>
            </div>
          </motion.div>
        </div>

        {/* Right Graphic / Abstract UI */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative lg:h-[600px] flex items-center justify-center w-full mt-10 lg:mt-0"
        >
          <div className="w-[480px] relative z-20 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] shadow-[#5C2D8F]/10 hover:shadow-[#5C2D8F]/20 transition-all duration-700 lg:ml-8">
            <div className="absolute -inset-1 bg-gradient-to-r from-[#5C2D8F] to-[#816A9E] opacity-20 blur-xl rounded-[2.5rem]" />
            <WorkflowRecording />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
