import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import ChangeHubLogo from '../components/ChangeHubLogo'
import { motion } from 'framer-motion'
import { Lock, ArrowLeft, AlertCircle, Eye, EyeOff } from 'lucide-react'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [showPw2, setShowPw2] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setEmail(searchParams.get('email') || '')
    setToken(searchParams.get('token') || '')
  }, [searchParams])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/reset-password', {
        email,
        token,
        password,
        password_confirmation: passwordConfirmation,
      })
      navigate('/login', { replace: true, state: { resetOk: true } })
    } catch (err) {
      const msg = err.response?.data?.message
      const errs = err.response?.data?.errors
      if (errs) {
        setError(Object.values(errs).flat().join(' '))
      } else {
        setError(msg || 'Impossible de réinitialiser le mot de passe.')
      }
    } finally {
      setLoading(false)
    }
  }

  const invalidLink = !email || !token

  return (
    <div className="min-h-screen bg-[#0F051E] flex items-center justify-center p-6 font-inter relative overflow-hidden">
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#5C2D8F]/10 rounded-full blur-[100px] -ml-32 -mb-32 pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#150522]/60 backdrop-blur-3xl rounded-[2.5rem] border border-white/5 shadow-2xl p-10 lg:p-12 relative z-10"
      >
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#B5A1C2]/50 hover:text-primary mb-8 transition-colors"
        >
          <ArrowLeft size={14} />
          Connexion
        </Link>

        <div className="text-center mb-8">
          <ChangeHubLogo size={48} className="mx-auto mb-4" />
          <h1 className="text-xl font-light text-white tracking-tight">Nouveau mot de passe</h1>
          <p className="text-xs text-[#B5A1C2]/50 mt-2">8 caractères minimum, une majuscule et un chiffre.</p>
        </div>

        {invalidLink ? (
          <div className="rounded-2xl bg-rose-500/10 border border-rose-500/20 p-5 text-sm text-rose-300">
            Lien incomplet ou expiré. Ouvrez le lien reçu par e-mail ou{' '}
            <Link to="/forgot-password" className="text-primary underline">demandez un nouveau lien</Link>.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#B5A1C2]/40 ml-1">E-mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50"
              />
            </div>

            <div className="space-y-2 group">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#B5A1C2]/40 ml-1">Nouveau mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-primary opacity-30 group-focus-within:opacity-100" size={16} />
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-14 pr-14 py-3.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg text-[#B5A1C2]/50 hover:text-white hover:bg-white/5"
                  aria-label={showPw ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-2 group">
              <label className="text-[10px] font-black uppercase tracking-widest text-[#B5A1C2]/40 ml-1">Confirmation</label>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-primary opacity-30 group-focus-within:opacity-100" size={16} />
                <input
                  type={showPw2 ? 'text' : 'password'}
                  required
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-14 pr-14 py-3.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPw2((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg text-[#B5A1C2]/50 hover:text-white hover:bg-white/5"
                  aria-label={showPw2 ? 'Masquer la confirmation' : 'Afficher la confirmation'}
                >
                  {showPw2 ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
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
              {loading ? 'Enregistrement…' : 'Enregistrer le mot de passe'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  )
}
