import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Mail } from 'lucide-react'
import ChangeHubLogo from '../ChangeHubLogo'

const GithubIcon = ({ size = 24, className = '' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3-.3 6-1.5 6-6.5a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 5 3 6.2 6 6.5a4.8 4.8 0 0 0-1 3.2v4" />
  </svg>
)

const footerNav = [
  { label: 'Fonctionnalités', href: '#features' },
  { label: 'Dossier', href: '#mettle' },
  { label: 'Vision', href: '#blueprint' },
  { label: 'Intégrations', href: '#integrations' },
  { label: 'Parcours', href: '#how-it-works' },
  { label: 'Cas d’usage', href: '#use-cases' },
  { label: 'FAQ', href: '#faq' },
]

function FooterColumn({ kicker, children }) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#B5A1C2]/45 mb-5">{kicker}</p>
      {children}
    </div>
  )
}

export default function Footer() {
  return (
    <footer className="relative border-t border-white/[0.06] pt-24 pb-12 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_100%,rgba(92,45,143,0.18),transparent_55%)]" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[min(100%,720px)] h-[200px] bg-[#5C2D8F]/12 rounded-full blur-[100px] pointer-events-none opacity-80" />

      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-14 lg:gap-10 mb-20">
          <motion.div
            className="lg:col-span-5"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-3 mb-6">
              <ChangeHubLogo size={40} />
              <span className="text-lg font-medium tracking-tight text-white">ChangeHub</span>
            </div>
            <p className="text-[#B5A1C2]/60 text-sm font-light max-w-sm leading-relaxed mb-8">
              Du premier brouillon au rapport post-MEP : une traçabilité lisible pour les métiers, les implémenteurs et
              l’audit — sans remplacer votre ITSM.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#D5CBE5] to-[#816A9E] text-[#2B1042] shadow-lg shadow-[#5C2D8F]/25 px-6 py-3 rounded-full text-sm font-semibold hover:shadow-2xl hover:shadow-[#5C2D8F]/40 transition-all duration-500 hover:-translate-y-0.5"
              >
                Se connecter
                <ArrowRight size={16} />
              </Link>
              <a
                href="mailto:contact@changehub.io"
                className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-white/[0.03] border border-white/10 text-[#B5A1C2]/50 hover:text-[#D5CBE5] hover:bg-white/[0.06] hover:border-[#D5CBE5]/25 hover:-translate-y-0.5 transition-all duration-500"
                aria-label="Contact par e-mail"
              >
                <Mail size={18} strokeWidth={1.5} />
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-white/[0.03] border border-white/10 text-[#B5A1C2]/50 hover:text-[#D5CBE5] hover:bg-white/[0.06] hover:border-[#D5CBE5]/25 hover:-translate-y-0.5 transition-all duration-500"
                aria-label="GitHub"
              >
                <GithubIcon size={18} />
              </a>
            </div>
          </motion.div>

          <motion.div
            className="lg:col-span-4"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          >
            <FooterColumn kicker="Sur cette page">
              <ul className="space-y-3.5 text-sm text-[#B5A1C2]/55 font-light">
                {footerNav.map(({ label, href }) => (
                  <li key={href}>
                    <a
                      href={href}
                      className="hover:text-white transition-colors duration-300 inline-flex items-center gap-2 group"
                    >
                      <span className="w-0 group-hover:w-3 overflow-hidden transition-all duration-300 h-px bg-gradient-to-r from-[#c4b5fd] to-transparent shrink-0" />
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </FooterColumn>
          </motion.div>

          <motion.div
            className="lg:col-span-3 flex flex-col justify-between gap-10"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <FooterColumn kicker="Accès">
              <p className="text-sm text-[#B5A1C2]/55 font-light leading-relaxed mb-6">
                Espace sécurisé pour demandeurs, approbateurs et implémenteurs — rôles séparés, même dossier.
              </p>
              <Link
                to="/login"
                className="text-sm text-[#c4b5fd]/90 font-medium hover:text-white transition-colors inline-flex items-center gap-2"
              >
                Ouvrir une session
                <ArrowRight size={14} className="opacity-70" />
              </Link>
            </FooterColumn>
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] backdrop-blur-sm px-5 py-4">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#B5A1C2]/40 mb-2">Changement</p>
              <p className="text-xs text-[#B5A1C2]/50 font-mono leading-relaxed">
                changehub · traçabilité · post-MEP
              </p>
            </div>
          </motion.div>
        </div>

        <div className="border-t border-white/[0.06] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-[#B5A1C2]/40 font-light tracking-wide text-center sm:text-left">
            © {new Date().getFullYear()} ChangeHub. Tous droits réservés.
          </p>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-[11px] text-[#B5A1C2]/40 font-light tracking-wide">
            <span className="text-[#B5A1C2]/35">Politique de confidentialité</span>
            <span className="text-[#B5A1C2]/35">Conditions d’utilisation</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
