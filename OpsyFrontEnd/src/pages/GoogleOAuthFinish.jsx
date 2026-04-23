import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Landing route after Google OAuth (must stay public). Refreshes session then sends user to profile.
 */
export default function GoogleOAuthFinish() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { refreshUser } = useAuth()

  useEffect(() => {
    const run = async () => {
      const ok = params.get('google_connected') === '1'
      const reason = params.get('reason') || ''
      try {
        await refreshUser?.()
      } catch {
        /* ignore */
      }
      const raw = localStorage.getItem('user')
      let role = null
      try {
        role = raw ? JSON.parse(raw).role : null
      } catch {
        role = null
      }
      if (!role) {
        navigate('/login', { replace: true })
        return
      }
      if (!ok) {
        navigate(`/${role}/profile?google_error=${encodeURIComponent(reason)}`, { replace: true })
        return
      }
      navigate(`/${role}/profile?google_success=1`, { replace: true })
    }
    run()
  }, [navigate, params, refreshUser])

  return (
    <div className="min-h-screen bg-[#0F051E] flex flex-col items-center justify-center gap-4 text-primary">
      <div className="w-10 h-10 border-2 border-white/10 border-t-primary rounded-full animate-spin" />
      <p className="text-[10px] font-black uppercase tracking-[0.4em]">Finalisation Gmail…</p>
    </div>
  )
}
