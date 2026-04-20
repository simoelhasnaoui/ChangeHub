import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import OpsyLogo from '../components/OpsyLogo'

export default function Login() {
  const { login } = useAuth()
  const navigate   = useNavigate()
  const [form, setForm]     = useState({ email: '', password: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const roleHome = {
    admin:       '/admin',
    approver:    '/approver',
    implementer: '/implementer',
    requester:   '/requester',
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
    <div className="min-h-screen bg-[#2B1042] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-inter selection:bg-[#5C2D8F]/30 selection:text-[#D5CBE5] relative overflow-hidden">
      
      {/* Decorative Blur Orbs */}
      <div className="absolute top-0 right-0 -mr-40 -mt-40 w-[800px] h-[800px] bg-[#816A9E]/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-40 -mb-40 w-[600px] h-[600px] bg-[#5C2D8F]/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <OpsyLogo size={48} className="mx-auto mb-6" />
        <h2 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#5C2D8F] to-[#d3c7e5] pb-1">
          Bienvenue sur Opsy
        </h2>
        <p className="mt-2 text-sm text-[#B5A1C2]/70">
          Plateforme de gestion des changements technologiques
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-[#3E1E70]/40 backdrop-blur-[24px] border border-white/10 py-8 px-4 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] rounded-3xl sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-semibold text-[#D5CBE5]/90 mb-1.5" htmlFor="email">
                Adresse e-mail
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="block w-full appearance-none rounded-xl bg-[#2B1042]/50 border border-[#5C2D8F]/50 px-4 py-3 placeholder-[#816A9E]/30 shadow-sm focus:border-[#816A9E] focus:outline-none focus:ring-2 focus:ring-[#816A9E]/50 transition-all text-sm font-medium text-[#E8E0F0]"
                  placeholder="vous@exemple.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#D5CBE5]/90 mb-1.5" htmlFor="password">
                Mot de passe
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  type="password"
                  required
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="block w-full appearance-none rounded-xl bg-[#2B1042]/50 border border-[#5C2D8F]/50 px-4 py-3 placeholder-[#816A9E]/30 shadow-sm focus:border-[#816A9E] focus:outline-none focus:ring-2 focus:ring-[#816A9E]/50 transition-all text-sm font-medium text-[#E8E0F0]"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-red-950/50 p-4 border border-red-500/50 backdrop-blur-md">
                <div className="flex">
                  <div className="text-sm text-red-400 font-medium">{error}</div>
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-full bg-gradient-to-r from-[#D5CBE5] to-[#816A9E] px-4 py-3.5 text-sm font-bold text-[#2B1042] shadow-lg shadow-[#5C2D8F]/30 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:transform-none"
              >
                {loading ? 'Connexion en cours...' : 'Se connecter'}
              </button>
            </div>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#5C2D8F]/50" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-[#3E1E70] px-3 text-[#B5A1C2]/50 font-medium rounded-full border border-[#5C2D8F]/50">Comptes de test</span>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              {[
                ['Admin',        'admin@app.com'],
                ['Approbateur',  'approver@app.com'],
                ['Implémenteur', 'implementer@app.com'],
                ['Demandeur',    'requester@app.com'],
              ].map(([role, email]) => (
                <button
                  key={email}
                  type="button"
                  onClick={() => setForm({ email, password: 'password' })}
                  className="flex flex-col items-center justify-center rounded-xl bg-[#5C2D8F]/20 px-4 py-3 text-xs font-semibold text-[#D5CBE5]/90 shadow-sm border border-[#5C2D8F]/50 hover:bg-white/10 transition-colors"
                >
                  <span>{role}</span>
                  <span className="text-[#B5A1C2]/50 font-normal text-[10px] mt-0.5">{email}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}