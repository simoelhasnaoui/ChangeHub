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
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
  };

  const features = [
    { icon: <Workflow strokeWidth={1.5} />, title: "Workflows Automatisés", desc: "Fini les relances sur Slack. Les changements sont directement envoyés aux bons approbateurs." },
    { icon: <Shield strokeWidth={1.5} />, title: "Gouvernance d'Entreprise", desc: "Une piste d'audit inaltérable pour chaque demande, validation et déploiement." },
    { icon: <Clock strokeWidth={1.5} />, title: "Traçabilité Temps Réel", desc: "Identifiez instantanément où votre demande est bloquée et éliminez la friction." },
    { icon: <CheckCircle strokeWidth={1.5} />, title: "Approbations Express", desc: "Examinez les spécifications techniques et approuvez d'un simple clic." },
    { icon: <Layers strokeWidth={1.5} />, title: "Accès Basé sur le Rôle", desc: "Des interfaces dédiées sur mesure pour les demandeurs, les approbateurs et les implémenteurs." },
    { icon: <BellRing strokeWidth={1.5} />, title: "Alertes Intelligentes", desc: "Ne soyez notifié que lorsque votre expertise est strictement requise." }
  ];

  return (
    <section id="features" className="pt-10 pb-32 bg-transparent relative z-10">
      <div className="max-w-[1200px] mx-auto px-6 relative">
        
        {/* Glow behind grid */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[#5C2D8F]/10 rounded-full blur-[150px] pointer-events-none -z-10" />

        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-[3.25rem] font-light tracking-tighter text-white leading-[1.1] mb-6"
          >
            L'orchestration du <span className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-[#D5CBE5] to-[#816A9E]">changement.</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-[#B5A1C2]/60 font-light"
          >
            Une suite d'outils de haute précision conçue pour remplacer les feuilles de calcul chaotiques par une source de vérité unique et indéniable.
          </motion.p>
        </div>

        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          variants={container}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, i) => (
            <motion.div 
              key={i} 
              variants={item}
              className="bg-white/[0.02] backdrop-blur-xl border border-white/5 p-10 rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.4)] hover:bg-white/[0.04] hover:border-white/10 hover:shadow-[0_30px_60px_rgba(0,0,0,0.8)] hover:-translate-y-2 transition-all duration-500 ease-out group relative overflow-hidden"
            >
              {/* Internal subtle light sweep */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

              <div className="w-14 h-14 rounded-2xl bg-white/[0.05] border border-white/10 text-[#D5CBE5] flex items-center justify-center mb-8 relative transition-all duration-500 group-hover:scale-110 group-hover:bg-[#816A9E]/20 group-hover:border-[#D5CBE5]/50 group-hover:shadow-[0_0_20px_rgba(129,106,158,0.5)]">
                {feature.icon}
              </div>
              <h3 className="text-xl font-medium text-[#E8E0F0] tracking-wide mb-3 group-hover:text-white transition-colors">{feature.title}</h3>
              <p className="text-[#B5A1C2]/50 leading-relaxed text-sm font-light group-hover:text-[#B5A1C2]/80 transition-colors duration-500">
                {feature.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

