import { motion } from 'framer-motion'
import {
  ArrowRight,
  FileText,
  GitBranch,
  MessageSquare,
  Sparkles,
} from 'lucide-react'

const pipeline = [
  { key: 'draft', label: 'Brouillon' },
  { key: 'review', label: 'Revue' },
  { key: 'approve', label: 'Approbation' },
  { key: 'impl', label: 'Implémentation' },
  { key: 'post', label: 'Post-MEP' },
]

const logLines = [
  { who: 'Demandeur', action: 'Pièce jointe · architecture cible', tone: 'muted' },
  { who: 'CAE', action: 'Commentaire résolu — risque résiduel accepté', tone: 'accent' },
  { who: 'Implémenteur', action: 'Branche GitHub liée au dossier', tone: 'muted' },
]

export default function LandingMettle() {
  const activeIndex = 2

  return (
    <section id="mettle" className="py-28 md:py-32 relative z-10 border-t border-white/[0.06] overflow-hidden">
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[min(140%,900px)] h-[420px] bg-[radial-gradient(ellipse_at_center,rgba(167,139,250,0.14),transparent_68%)]" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-[480px] h-[480px] bg-[#5C2D8F]/12 rounded-full blur-[120px] translate-x-1/3 translate-y-1/3" />

      <div className="max-w-[1200px] mx-auto px-6 relative">
        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] gap-14 lg:gap-16 items-center">
          {/* Copy column */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.35em] text-[#B5A1C2]/55 mb-6">
                <Sparkles className="text-[#c4b5fd]/70" size={14} strokeWidth={1.5} />
                Dossier vivant
              </p>
              <h2 className="text-[2rem] sm:text-4xl md:text-[2.65rem] font-light tracking-tight text-white leading-[1.12] mb-6">
                Un seul fil tient tout le{' '}
                <span className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-[#e9d5ff] via-[#c4b5fd] to-[#816A9E]">
                  récit du changement
                </span>
                .
              </h2>
              <p className="text-[#B5A1C2]/60 text-base md:text-lg font-light leading-relaxed mb-10 max-w-md">
                Fini les captures d’écran éparpillées : commentaires, validations, liens repo et rapports
                habitent le même écran — celui que l’audit ouvre six mois plus tard.
              </p>
            </motion.div>

            <motion.ul
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08, duration: 0.5 }}
              className="space-y-5"
            >
              {[
                'Chaque rôle voit ce qui le concerne, sans perdre le contexte global.',
                'Les statuts racontent une chronologie, pas seulement une case à cocher.',
                'Le post-déploiement reste accroché au dossier, pas dans une boîte mail oubliée.',
              ].map((line, i) => (
                <li key={i} className="flex gap-4 text-sm md:text-[15px] text-[#D5CBE5]/85 font-light leading-snug">
                  <span className="mt-1.5 h-px w-8 shrink-0 bg-gradient-to-r from-[#c4b5fd]/80 to-transparent" />
                  {line}
                </li>
              ))}
            </motion.ul>
          </div>

          {/* UI mock */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-8%' }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="absolute -inset-px rounded-[1.75rem] bg-gradient-to-br from-white/25 via-[#c4b5fd]/20 to-transparent opacity-60 blur-sm" />
            <div className="relative rounded-[1.65rem] border border-white/15 bg-[#14081f]/90 backdrop-blur-2xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.75),inset_0_1px_0_rgba(255,255,255,0.06)] overflow-hidden">
              {/* Window bar */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.07] bg-black/25">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
                  <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
                  <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
                </div>
                <span className="text-[10px] font-mono text-[#B5A1C2]/45 tracking-wide truncate max-w-[55%] text-center">
                  changehub / CR-2042
                </span>
                <div className="w-10" />
              </div>

              <div className="p-6 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#B5A1C2]/40 mb-2">
                      Changement
                    </p>
                    <h3 className="text-lg sm:text-xl font-medium text-white tracking-tight">
                      Migration API catalogue
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-400/25 bg-amber-500/10 text-[10px] font-semibold uppercase tracking-wider text-amber-200/90">
                    En validation CAE
                  </div>
                </div>

                {/* Stepper */}
                <div className="mb-10">
                  <div className="flex items-center justify-between gap-1 sm:gap-0">
                    {pipeline.map((step, i) => {
                      const done = i < activeIndex
                      const active = i === activeIndex
                      return (
                        <div key={step.key} className="flex items-center flex-1 min-w-0 last:flex-none">
                          <div className="flex flex-col items-center gap-2 w-full min-w-0">
                            <div className="relative">
                              {active ? (
                                <motion.span
                                  className="absolute inset-0 rounded-full bg-[#c4b5fd]/35"
                                  animate={{ scale: [1, 1.45, 1], opacity: [0.55, 0, 0.55] }}
                                  transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                                />
                              ) : null}
                              <div
                                className={[
                                  'relative z-[1] w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border transition-colors duration-300',
                                  done
                                    ? 'bg-emerald-400/90 border-emerald-300/50 shadow-[0_0_12px_rgba(52,211,153,0.35)]'
                                    : active
                                      ? 'bg-[#c4b5fd] border-white/30 shadow-[0_0_14px_rgba(196,181,253,0.5)]'
                                      : 'bg-white/[0.06] border-white/10',
                                ].join(' ')}
                              />
                            </div>
                            <span
                              className={[
                                'text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-center leading-tight max-w-[4.5rem] sm:max-w-none truncate',
                                active ? 'text-[#e9d5ff]' : done ? 'text-emerald-300/70' : 'text-[#B5A1C2]/35',
                              ].join(' ')}
                            >
                              {step.label}
                            </span>
                          </div>
                          {i < pipeline.length - 1 ? (
                            <div
                              className={[
                                'hidden sm:block h-px flex-1 mx-1 mb-5 min-w-[4px] rounded-full',
                                i < activeIndex
                                  ? 'bg-gradient-to-r from-emerald-400/50 to-emerald-400/20'
                                  : 'bg-white/[0.08]',
                              ].join(' ')}
                            />
                          ) : null}
                        </div>
                      )
                    })}
                  </div>
                  <div className="sm:hidden mt-4 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400/60 via-[#c4b5fd] to-[#816A9E]/50"
                      initial={{ width: '0%' }}
                      whileInView={{ width: `${((activeIndex + 0.5) / pipeline.length) * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                </div>

                {/* Activity */}
                <div className="rounded-2xl border border-white/[0.07] bg-black/30 p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-4 text-[10px] font-black uppercase tracking-[0.2em] text-[#B5A1C2]/40">
                    <MessageSquare size={12} className="text-[#B5A1C2]/50" />
                    Fil d’activité
                  </div>
                  <ul className="space-y-3.5">
                    {logLines.map((row, idx) => (
                      <li
                        key={idx}
                        className={[
                          'flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[11px] sm:text-xs leading-relaxed',
                          row.tone === 'accent' ? 'text-[#e9d5ff]/95' : 'text-[#B5A1C2]/55',
                        ].join(' ')}
                      >
                        <span className="font-semibold text-white/80">{row.who}</span>
                        <ArrowRight className="inline shrink-0 text-[#B5A1C2]/35" size={12} />
                        <span className="font-light">{row.action}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-5 pt-4 border-t border-white/[0.06] flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-[10px] text-[#B5A1C2]/70">
                      <GitBranch size={12} className="text-[#c4b5fd]/70" />
                      feature/catalog-api
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-[10px] text-[#B5A1C2]/70">
                      <FileText size={12} className="text-emerald-300/60" />
                      Rapport post-MEP.pdf
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
