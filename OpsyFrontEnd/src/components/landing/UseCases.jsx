import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export default function UseCases() {
  return (
    <section className="py-24 bg-transparent">
      <div className="max-w-[1200px] mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        
        {/* Lert Side: Text */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#D5CBE5] via-[#B5A1C2] to-[#816A9E] font-extrabold pb-1 mb-6">
            Conçu pour les équipes d'ingénierie modernes
          </h2>
          <p className="text-lg text-[#B5A1C2]/70 mb-8 leading-relaxed">
            Arrêtez de perdre la trace des changements d'inrrastructure dans les discussions. Opsy apporte un rlux de travail rigide mais élégant à vos mises à jour critiques.
          </p>

          <ul className="space-y-4">
            {[
              "Imposez la conformité et les exigences SOC2 sans errort.",
              "Réduisez les temps d'arrêt en évitant les déploiements non autorisés.",
              "Suivez le MTTR et la vélocité d'approbation avec des métriques intégrées.",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                  <Check size={12} className="text-green-600 font-bold" />
                </div>
                <span className="text-[#D5CBE5]/90 font-medium">{item}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Right Side: Visual Mockup */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          {/* Decorative background shape */}
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-indigo-50 rounded-[40px] transform rotate-3 scale-105" />
          
          <div className="relative bg-[#3E1E70]/40 backdrop-blur-sm shadow-xl border border-[#5C2D8F]/30 rounded-2xl shadow-xl border border-[#5C2D8F]/50 overflow-hidden h-[400px] flex flex-col">
            {/* Mock Header */}
            <div className="h-14 border-b border-[#5C2D8F]/50 flex items-center px-6 justify-between bg-[#5C2D8F]/30">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-200" />
                <div className="w-32 h-3 bg-slate-200 rounded-full" />
              </div>
              <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Approved</div>
            </div>
            {/* Mock Content */}
            <div className="p-6 flex-1 flex flex-col gap-4">
              <div className="w-3/4 h-6 rounded-md bg-slate-100" />
              <div className="w-full h-24 rounded-xl bg-blue-50 border border-blue-100 border-dashed" />
              <div className="mt-auto flex justify-end gap-3">
                <div className="w-24 h-10 rounded-full bg-slate-100" />
                <div className="w-28 h-10 rounded-full bg-blue-600" />
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
