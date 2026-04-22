import { motion } from 'framer-motion';

export default function HowItWorks() {
  const steps = [
    { num: "01", title: "Soumettre", desc: "Les demandeurs décrivent le changement, la sévérité et le délai requis dans un formulaire de précision." },
    { num: "02", title: "Vérifier", desc: "Les approbateurs analysent instantanément l'impact technique et valident l'exécution en toute sécurité." },
    { num: "03", title: "Déployer", desc: "Les implémenteurs exécutent la feuille de route approuvée et confirment la résolution du ticket." }
  ];

  return (
    <section id="how-it-works" className="py-32 relative overflow-hidden bg-transparent">
      {/* Background ambient light */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#5C2D8F]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-[1000px] mx-auto px-6 relative z-10">

        <div className="text-center mb-24">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-light tracking-tighter text-white mb-6"
          >
            La simplicité à <span className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-[#D5CBE5] to-[#816A9E]">grande échelle.</span>
          </motion.h2>
        </div>

        <div className="grid md:grid-cols-3 gap-12 relative">
          {/* Connector Line (Desktop only) */}
          <div className="hidden md:block absolute top-[40px] left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-transparent via-[#816A9E]/30 to-transparent z-0" />

          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 flex flex-col items-center text-center group"
            >
              {/* Glass Number Bubble */}
              <div className="w-20 h-20 rounded-[2rem] bg-white/[0.02] border border-white/5 shadow-[0_0_30px_rgba(0,0,0,0.5)] backdrop-blur-xl flex items-center justify-center text-2xl font-light text-[#D5CBE5] mb-8 relative transition-all duration-700 ease-out group-hover:-translate-y-2 group-hover:border-white/10 group-hover:bg-white/[0.04]">
                {step.num}
                {/* Ping animation effect restricted to hover */}
                <div className="absolute inset-0 rounded-[2rem] border border-[#D5CBE5]/0 group-hover:border-[#D5CBE5]/20 group-hover:animate-ping opacity-20" />
                
                {/* Ambient glow underneath */}
                <div className="absolute inset-0 bg-[#816A9E] rounded-[2rem] blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-700 -z-10" />
              </div>
              
              <h3 className="text-xl font-medium text-[#E8E0F0] mb-4 tracking-wide group-hover:text-white transition-colors">{step.title}</h3>
              <p className="text-[#B5A1C2]/50 text-sm leading-relaxed max-w-[260px] font-light group-hover:text-[#B5A1C2]/80 transition-colors duration-500">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
