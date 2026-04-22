import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ChangeHubLogo from '../components/ChangeHubLogo'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, AlertCircle, ArrowRight, ShieldCheck, ArrowLeft } from 'lucide-react'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const roleHome = {
    admin: '/admin',
    approver: '/approver',
    implementer: '/implementer',
    requester: '/requester',
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      navigate(roleHome[user.role] || '/')
    } catch (err) {
      setError(err.response?.data?.message || 'Identifiants incorrects.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0F051E] flex items-center justify-center p-6 font-inter selection:bg-primary/30 relative overflow-hidden">
      
      {/* ── BACKGROUND ELEMENTS ── */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px] -mr-96 -mt-96 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#5C2D8F]/10 rounded-full blur-[120px] -ml-48 -mb-48 pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[1100px] grid grid-cols-1 lg:grid-cols-2 bg-[#150522]/40 backdrop-blur-3xl rounded-[3rem] border border-white/5 shadow-[0_50px_100px_rgba(0,0,0,0.6)] overflow-hidden relative z-10"
      >
        {/* ── LEFT SIDE: VISUAL ── */}
        <div className="hidden lg:flex flex-col justify-between p-16 bg-gradient-to-br from-primary/10 via-transparent to-transparent border-r border-white/5">
          <div className="space-y-6">
            <ChangeHubLogo size={64} />
            <div className="space-y-4">
              <p className="text-[11px] font-black uppercase tracking-[0.4em] text-primary">SYSTEM_COMMAND_SECURED</p>
              <h1 className="text-5xl font-light tracking-tighter text-white leading-[1.1]">
                Contrôlez vos <br />
                <span className="font-medium text-primary">Infrastructures</span>
              </h1>
              <p className="text-sm text-[#B5A1C2]/40 leading-relaxed max-w-sm">
                Une interface haute performance conçue pour les ingénieurs et architectes DevOps. Gérez vos changements avec une précision chirurgicale.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-[#B5A1C2]/20">
            <ShieldCheck size={14} />
            Espace sécurisé v4.2.0
          </div>
        </div>

        {/* ── RIGHT SIDE: FORM ── */}
        <div className="p-10 lg:p-16 flex flex-col justify-center relative">
          {/* ── RETURN BUTTON ── */}
          <button 
            type="button"
            onClick={() => navigate('/')}
            className="absolute top-6 right-6 lg:top-8 lg:right-8 flex items-center gap-2 z-50 px-4 py-2 rounded-full bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 text-[10px] font-black uppercase tracking-widest text-[#B5A1C2]/60 hover:text-primary transition-all group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Retour
          </button>
          <div className="lg:hidden mb-10 text-center">
             <ChangeHubLogo size={48} className="mx-auto mb-6" />
             <h2 className="text-2xl font-light text-white tracking-tight">ChangeHub <span className="font-medium">Command</span></h2>
          </div>

          <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2 group">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#B5A1C2]/40 ml-1">Identifiant</label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-primary opacity-30 group-focus-within:opacity-100 transition-opacity" size={16} />
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-sm text-white placeholder:text-[#816A9E]/30 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:bg-white/[0.06] transition-all"
                    placeholder="ingenieur@ChangeHub.io"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2 group">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#B5A1C2]/40 ml-1">Code d'accès</label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-primary opacity-30 group-focus-within:opacity-100 transition-opacity" size={16} />
                  <input
                    type="password"
                    required
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl pl-14 pr-6 py-4 text-sm text-white placeholder:text-[#816A9E]/30 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:bg-white/[0.06] transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-xs font-bold text-rose-400"
                >
                  <AlertCircle size={14} />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="w-full group relative flex items-center justify-center gap-3 bg-primary text-[#0F051E] font-black uppercase tracking-widest text-[11px] py-5 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all overflow-hidden disabled:opacity-50"
            >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                <span className="relative z-10">{loading ? 'Initialisation...' : 'Lancer la session'}</span>
                {!loading && <ArrowRight className="relative z-10 group-hover:translate-x-1 transition-transform" size={14} />}
            </button>
          </form>

          {/* ── TEST ACCOUNTS ── */}
          <div className="mt-12 space-y-6">
            <div className="flex items-center gap-4">
                <div className="h-[1px] flex-1 bg-white/5" />
                <span className="text-[9px] font-black uppercase tracking-widest text-[#B5A1C2]/20">Console d'accès rapide</span>
                <div className="h-[1px] flex-1 bg-white/5" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { r: 'Admin', e: 'admin@app.com', icon: '⚡' },
                { r: 'Approver', e: 'approver@app.com', icon: '✓' },
                { r: 'Implementer', e: 'implementer@app.com', icon: '⚙' },
                { r: 'Requester', e: 'requester@app.com', icon: '⊕' },
              ].map((acc) => (
                <button
                  key={acc.e}
                  type="button"
                  onClick={() => setForm({ email: acc.e, password: 'password' })}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all text-left"
                >
                  <span className="text-lg grayscale group-hover:grayscale-0">{acc.icon}</span>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-tight text-white">{acc.r}</span>
                    <span className="text-[8px] font-medium text-[#B5A1C2]/30">{acc.e}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}