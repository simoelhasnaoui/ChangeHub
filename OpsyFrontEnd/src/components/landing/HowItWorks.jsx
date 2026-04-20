import { motion } from 'framer-motion';

export default function HowItWorks() {
  const steps = [
    { num: "01", title: "Soumettre une demande", desc: "Les demandeurs décrivent le changement, la sévérité et le délai requis dans un formulaire clair." },
    { num: "02", title: "Examiner et approuver", desc: "Les approbateurs sont informés instantanément, examinent l'impact technique et valident en toute sécurité." },
    { num: "03", title: "Exécuter le changement", desc: "Les implémenteurs reprennent le ticket approuvé, exécutent le code et le marquent comme résolu." }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-[#3E1E70]/40 backdrop-blur-sm shadow-xl border border-[#5C2D8F]/30 border-t border-[#5C2D8F]/50">
      <div className="max-w-[1200px] mx-auto px-6">
        
        <div className="text-center mb-20">
          <div className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 font-semibold rounded-full text-xs uppercase tracking-wider mb-4">
            Flux de travail
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#D5CBE5] via-[#B5A1C2] to-[#816A9E] font-extrabold pb-1">
            La simplicité à grande échelle
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-12 relative">
          {/* Connector Line (Desktop only) */}
          <div className="hidden md:block absolute top-[45px] left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-blue-100 via-indigo-200 to-blue-100 z-0" />

          {steps.map((step, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2, duration: 0.5 }}
              className="relative z-10 flex flex-col items-center text-center"
            >
              <div className="w-24 h-24 rounded-full bg-[#3E1E70]/40 backdrop-blur-sm shadow-xl border border-[#5C2D8F]/30 border-4 border-slate-50 shadow-xl flex items-center justify-center text-2xl font-bold text-blue-600 mb-6 relative">
                {step.num}
                {/* Ping animation effect */}
                <div className="absolute inset-2 rounded-full border border-blue-200 animate-ping opacity-20" />
              </div>
              <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#D5CBE5] via-[#B5A1C2] to-[#816A9E] font-extrabold pb-1 mb-3">{step.title}</h3>
              <p className="text-[#B5A1C2]/70 text-sm leading-relaxed max-w-xs">{step.desc}</p>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
