import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, FileWarning, Orbit, ShieldCheck } from 'lucide-react'

export default function LandingBlueprint() {
  return (
    <section id="blueprint" className="py-28 relative z-10">
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#B5A1C2]/50 mb-4">Blueprint du changement</p>
          <h2 className="text-3xl md:text-[2.75rem] font-light tracking-tight text-white mb-5">
            De l’éparpillement à la{' '}
            <span className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-[#c4b5fd] to-[#816A9E]">traçabilité maîtrisée</span>
          </h2>
          <p className="text-[#B5A1C2]/55 text-sm md:text-base font-light leading-relaxed">
            ChangeHub transforme les allers-retours informels en flux documentés : chaque décision laisse une empreinte vérifiable.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-stretch">
          {/* Before */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-[2rem] border border-rose-500/20 bg-gradient-to-br from-rose-950/30 to-[#1a0b2e]/80 p-10 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center gap-3 mb-8 relative">
              <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/25 text-rose-300">
                <FileWarning size={20} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-rose-300/80">Avant</span>
            </div>
            <h3 className="text-xl font-medium text-white mb-6">Le chaos silencieux</h3>
            <ul className="space-y-4 text-sm text-[#B5A1C2]/65 font-light mb-10">
              <li className="flex gap-3"><span className="text-rose-400/80">—</span> Fils d’e-mails et captures d’écran comme seule preuve.</li>
              <li className="flex gap-3"><span className="text-rose-400/80">—</span> Personne ne sait qui a validé quoi, ni quand.</li>
              <li className="flex gap-3"><span className="text-rose-400/80">—</span> Post-mortem improvisé après incident, toujours trop tard.</li>
            </ul>
            <div className="rounded-2xl border border-white/5 bg-black/20 p-4 font-mono text-[10px] text-rose-200/50 leading-relaxed">
              <span className="text-rose-400/60">WARN</span> change_final_v7_LAST.xlsx introuvable sur le partage…
            </div>
          </motion.div>

          {/* After */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-[2rem] border border-emerald-500/25 bg-gradient-to-br from-emerald-950/25 to-[#1a0b2e]/90 p-10 relative overflow-hidden"
          >
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center gap-3 mb-8 relative">
              <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-300">
                <ShieldCheck size={20} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300/80">Avec ChangeHub</span>
            </div>
            <h3 className="text-xl font-medium text-white mb-6">Un cockpit partagé</h3>
            <ul className="space-y-4 text-sm text-[#B5A1C2]/70 font-light mb-10">
              <li className="flex gap-3"><span className="text-emerald-400/90">✓</span> Rôles dédiés : demandeur, approbateur, implémenteur.</li>
              <li className="flex gap-3"><span className="text-emerald-400/90">✓</span> Journal des statuts + rapports post-changement exportables.</li>
              <li className="flex gap-3"><span className="text-emerald-400/90">✓</span> Notifications ciblées quand votre expertise est requise.</li>
            </ul>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 flex items-center gap-3">
              <Orbit className="text-emerald-300/80 shrink-0" size={22} />
              <div className="text-[10px] font-mono text-[#B5A1C2]/50 leading-relaxed">
                <span className="text-emerald-400/90">DONE</span> CR-2042 · rapport PDF livré au demandeur · 14:32 UTC
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-14 flex justify-center"
        >
          <Link
            to="/login"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white/[0.06] border border-white/10 text-sm font-semibold text-white hover:bg-white/[0.1] hover:border-[#D5CBE5]/30 transition-all duration-500"
          >
            Voir la console en action
            <ArrowRight size={18} className="text-[#D5CBE5]" />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
