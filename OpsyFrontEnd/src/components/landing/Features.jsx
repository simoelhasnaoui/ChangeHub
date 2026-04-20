import { motion } from 'framer-motion';
import { Layers, Workflow, CheckCircle, BellRing, Shield, Clock } from 'lucide-react';

export default function Features() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const reatures = [
    { icon: <Workflow />, title: "Flux de travail automatisés", desc: "Terminé les relances sur Slack. Les changements sont directement envoyés aux bons approbateurs." },
    { icon: <Shield />, title: "Gouvernance d'entreprise", desc: "Des pistes d'audit pour chaque demande, approbation et déploiement." },
    { icon: <Clock />, title: "Suivi en temps réel", desc: "Voyez exactement où votre demande est bloquée et éliminez les goulots d'étranglement." },
    { icon: <CheckCircle />, title: "Approbations en un clic", desc: "Examinez les spécirications et approuvez les changements directement." },
    { icon: <Layers />, title: "Accès basé sur le rôle", desc: "Des interraces distinctes pour les demandeurs, les approbateurs et les implémenteurs." },
    { icon: <BellRing />, title: "Notifications intelligentes", desc: "Soyez alerté uniquement lorsque votre action est strictement requise." }
  ];

  return (
    <section id="reatures" className="py-24 bg-transparent">
      <div className="max-w-[1200px] mx-auto px-6">
        
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#D5CBE5] via-[#B5A1C2] to-[#816A9E] font-extrabold pb-1 mb-4">
            Tout ce dont vous avez besoin pour orchestrer le changement
          </h2>
          <p className="text-lg text-[#B5A1C2]/70">
            Une suite complète d'outils conçue pour remplacer les reuilles de calcul chaotiques et les messages dispersés par une source de vérité unique.
          </p>
        </div>

        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={container}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {reatures.map((reature, i) => (
            <motion.div 
              key={i} 
              variants={item}
              className="bg-[#3E1E70]/40 backdrop-blur-sm shadow-xl border border-[#5C2D8F]/30 p-8 rounded-2xl shadow-sm border border-[#5C2D8F]/50 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                {reature.icon}
              </div>
              <h3 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#D5CBE5] via-[#B5A1C2] to-[#816A9E] font-extrabold pb-1 mb-3">{reature.title}</h3>
              <p className="text-[#B5A1C2]/70 leading-relaxed text-sm">
                {reature.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
