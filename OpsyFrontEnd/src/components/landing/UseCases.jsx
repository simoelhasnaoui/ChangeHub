import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export default function UseCases() {
  return (
    <section id="use-cases" className="py-32 bg-transparent relative z-10 scroll-mt-28">
      <div className="max-w-[1200px] mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
        
        {/* Left Side: Text */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <h2 className="text-4xl md:text-[3.25rem] font-light tracking-tighter text-white leading-[1.1] mb-6">
            Conçu pour les équipes d'ingénierie <span className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-[#D5CBE5] to-[#816A9E]">modernes.</span>
          </h2>
          <p className="text-[#B5A1C2]/60 font-light leading-relaxed mb-10 text-lg">
            Arrêtez de perdre la trace des changements d'infrastructure dans les discussions. ChangeHub apporte un flux de travail rigoureux mais élégant à vos mises à jour critiques.
          </p>

          <ul className="space-y-6">
            {[
              "Imposez la conformité et les exigences SOC2 sans effort.",
              "Réduisez les temps d'arrêt en évitant les déploiements non autorisés.",
              "Suivez le MTTR et la vélocité d'approbation avec des métriques intégrées.",
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-4 group">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#816A9E]/10 border border-[#D5CBE5]/20 flex items-center justify-center group-hover:bg-[#816A9E]/30 group-hover:border-[#D5CBE5]/40 transition-all duration-300 shadow-[inset_0_0_10px_rgba(213,203,229,0.05)]">
                  <Check size={14} className="text-[#D5CBE5]" strokeWidth={2.5} />
                </div>
                <span className="text-[#E8E0F0] font-light text-sm tracking-wide">{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Right Side: Visual Mockup */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="relative lg:ml-10"
        >
          {/* Decorative background ambient glow */}
          <div className="absolute inset-0 bg-[#5C2D8F]/20 rounded-[40px] blur-[80px] -z-10" />
          
          {/* Mockup Window */}
          <div className="relative bg-white/[0.02] backdrop-blur-xl border border-white/5 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden h-[450px] flex flex-col group hover:-translate-y-2 hover:border-white/10 hover:shadow-[0_30px_70px_rgba(0,0,0,0.8)] transition-all duration-700 ease-out">
            
            {/* Ambient hover light inside mockup */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            {/* Mock Header */}
            <div className="h-16 border-b border-white/5 flex items-center px-8 justify-between bg-white/[0.01]">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-white/[0.05] border border-white/10" />
                <div className="w-32 h-2.5 bg-white/[0.05] rounded-full" />
              </div>
              <div className="px-4 py-1.5 bg-[#816A9E]/20 border border-[#D5CBE5]/30 text-[#D5CBE5] text-[10px] font-black uppercase tracking-widest rounded-full shadow-[0_0_15px_rgba(129,106,158,0.3)]">Approuvé</div>
            </div>
            
            {/* Mock Content */}
            <div className="p-8 flex-1 flex flex-col gap-6">
              <div className="w-3/4 h-5 rounded-md bg-white/[0.05]" />
              
              {/* Fake UI component */}
              <div className="w-full h-32 rounded-2xl bg-white/[0.02] border border-white/10 border-dashed flex items-center justify-center relative overflow-hidden group-hover:border-[#D5CBE5]/20 transition-colors duration-500">
                 <div className="w-full px-6 space-y-3">
                    <div className="w-1/2 h-2 bg-white/[0.04] rounded-full" />
                    <div className="w-3/4 h-2 bg-white/[0.04] rounded-full" />
                    <div className="w-2/3 h-2 bg-white/[0.04] rounded-full" />
                 </div>
              </div>
              
              {/* Mock Buttons */}
              <div className="mt-auto flex justify-end gap-4">
                <div className="w-24 h-10 rounded-full bg-white/[0.03] border border-white/5" />
                <div className="w-32 h-10 rounded-full bg-white/[0.08] border border-white/20 shadow-[0_0_15px_rgba(213,203,229,0.1)] group-hover:shadow-[0_0_20px_rgba(213,203,229,0.2)] transition-shadow duration-500" />
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
