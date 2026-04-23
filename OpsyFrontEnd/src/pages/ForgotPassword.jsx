import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import ChangeHubLogo from '../components/ChangeHubLogo'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/forgot-password', { email })
      setDone(true)
    } catch (err) {
      setError(err.response?.data?.message || 'Une erreur est survenue.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0F051E] flex items-center justify-center p-6 font-inter relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -mr-48 -mt-48 pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#150522]/60 backdrop-blur-3xl rounded-[2.5rem] border border-white/5 shadow-2xl p-10 lg:p-12 relative z-10"
      >
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#B5A1C2]/50 hover:text-primary mb-10 transition-colors"
        >
          <ArrowLeft size={14} />
          Retour connexion
        </Link>

        <div className="text-center mb-10">
          <ChangeHubLogo size={48} className="mx-auto mb-4" />
          <h1 className="text-xl font-light text-white tracking-tight">Mot de passe oublié</h1>
          <p className="text-xs text-[#B5A1C2]/50 mt-2 leading-relaxed">
            Saisissez votre e-mail : si un compte ChangeHub existe, vous recevrez un lien pour choisir un nouveau mot de passe.
          </p>
        </div>

        {done ? (
          <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-6 flex gap-3 text-sm text-emerald-300">
            <CheckCircle2 className="shrink-0 mt-0.5" size={18} />
            <p>Si un compte existe pour cette adresse, un message vient d’y être envoyé. Vérifiez votre boîte de réception (et les indésirables).</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2 group">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#B5A1C2]/40 ml-1">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-primary opacity-30 group-focus-within:opacity-100" size={16} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-sm text-white placeholder:text-[#816A9E]/30 focus:outline-none focus:ring-1 focus:ring-primary/50"
                  placeholder="vous@entreprise.com"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-xs font-bold text-rose-400">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-[#0F051E] font-black uppercase tracking-widest text-[11px] py-4 rounded-2xl hover:scale-[1.01] transition-transform disabled:opacity-50"
            >
              {loading ? 'Envoi…' : 'Envoyer le lien'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  )
}
