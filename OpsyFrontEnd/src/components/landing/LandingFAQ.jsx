import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, HelpCircle } from 'lucide-react'

const items = [
  {
    q: 'ChangeHub remplace-t-il notre ITSM (ServiceNow, Jira…) ?',
    a: 'Non : il complète votre stack. ChangeHub se concentre sur le cycle de demande → approbation → implémentation → rapport post-changement, avec des vues métier lisibles pour tous les rôles.',
  },
  {
    q: 'Comment les équipes sont-elles notifiées ?',
    a: 'Des notifications in-app et, si vous le configurez, des e-mails (Gmail lié au profil + SMTP côté serveur). Chaque rôle ne reçoit que ce qui le concerne.',
  },
  {
    q: 'Peut-on tracer les incidents après mise en production ?',
    a: 'Oui : l’implémenteur saisit une analyse post-changement, les incidents associés, et un rapport d’intervention peut être partagé avec le demandeur (PDF).',
  },
  {
    q: 'Est-ce adapté aux environnements réglementés ?',
    a: 'Le produit est pensé autour de l’historisation et des rôles. La profondeur de conformité (ISO, SOC2…) dépend aussi de vos processus et de l’hébergement que vous choisissez.',
  },
]

export default function LandingFAQ() {
  const [open, setOpen] = useState(0)

  return (
    <section id="faq" className="py-24 pb-32 relative z-10">
      <div className="max-w-[720px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/10 mb-5">
            <HelpCircle size={14} className="text-[#D5CBE5]/70" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#B5A1C2]/60">FAQ express</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-light tracking-tight text-white">
            Les questions qu’on nous pose <span className="font-medium text-[#D5CBE5]">avant</span> le pilote
          </h2>
        </motion.div>

        <div className="space-y-3">
          {items.map((item, i) => {
            const isOpen = open === i
            return (
              <motion.div
                key={item.q}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className={`rounded-2xl border transition-colors duration-300 ${
                  isOpen ? 'border-[#D5CBE5]/25 bg-white/[0.06]' : 'border-white/10 bg-white/[0.02] hover:border-white/15'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="w-full flex items-center justify-between gap-4 text-left px-6 py-5"
                >
                  <span className="text-sm md:text-base font-medium text-[#E8E0F0] pr-4">{item.q}</span>
                  <ChevronDown
                    size={20}
                    className={`shrink-0 text-[#B5A1C2]/50 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#D5CBE5]' : ''}`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-5 text-sm text-[#B5A1C2]/65 leading-relaxed font-light border-t border-white/5 pt-4">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
