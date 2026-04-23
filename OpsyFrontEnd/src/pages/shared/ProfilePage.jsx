import React, { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Key,
  Shield,
  Check,
  User,
  GitBranch,
  Bell,
  BarChart3,
  Users,
  ClipboardList,
  Sparkles,
  Zap,
  History,
  Activity,
  Clock,
  ChevronRight,
  Cpu,
  Gavel,
  LineChart,
  Mail,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'

const ROLE_LABELS = {
  admin: 'Administrateur',
  approver: 'Approbateur',
  implementer: 'Implémenteur',
  requester: 'Demandeur',
}

const ROLE_ACCENT = {
  requester: { line: 'from-amber-500/30 via-transparent to-violet-500/10', chip: 'text-amber-300 border-amber-500/25 bg-amber-500/5' },
  implementer: { line: 'from-violet-500/35 via-transparent to-emerald-500/10', chip: 'text-violet-300 border-violet-500/25 bg-violet-500/5' },
  approver: { line: 'from-sky-500/30 via-transparent to-rose-500/10', chip: 'text-sky-300 border-sky-500/25 bg-sky-500/5' },
  admin: { line: 'from-rose-500/30 via-transparent to-primary/10', chip: 'text-rose-300 border-rose-500/25 bg-rose-500/5' },
}

const UA_BRAND_SKIP = new Set(['Chromium', 'Not;A=Brand', 'Not)A;Brand', 'Not A;Brand'])

function formatSessionClock() {
  return new Date().toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })
}

function detectSessionBrowser() {
  if (typeof navigator === 'undefined') return 'Navigateur'
  const brands = navigator.userAgentData?.brands
  if (brands?.length) {
    const hit = brands.find((b) => b.brand && !UA_BRAND_SKIP.has(b.brand))
    if (hit?.brand) return hit.brand.replace(/^Google\s+/i, '')
  }
  const ua = navigator.userAgent || ''
  if (ua.includes('Edg/')) return 'Edge'
  if (ua.includes('OPR/') || ua.includes('Opera')) return 'Opera'
  if (ua.includes('CriOS/')) return 'Chrome (iOS)'
  if (ua.includes('FxiOS/')) return 'Firefox (iOS)'
  if (ua.includes('Firefox/')) return 'Firefox'
  if (ua.includes('Chrome/')) return 'Chrome'
  if (ua.includes('Safari/') && !ua.includes('Chrome')) return 'Safari'
  return 'Navigateur'
}

function countBy(list, pred) {
  return (list || []).filter(pred).length
}

function StatChip({ label, value, tone = 'default' }) {
  const tones = {
    default: 'border-white/10 bg-white/[0.03] text-white',
    warn: 'border-amber-500/25 bg-amber-500/5 text-amber-200',
    ok: 'border-emerald-500/25 bg-emerald-500/5 text-emerald-200',
    danger: 'border-rose-500/25 bg-rose-500/5 text-rose-200',
  }
  return (
    <div className={`rounded-2xl border px-4 py-3 ${tones[tone] || tones.default}`}>
      <p className="text-[9px] font-black uppercase tracking-widest text-[#B5A1C2]/40">{label}</p>
      <p className="mt-1 text-2xl font-light tabular-nums">{value}</p>
    </div>
  )
}

function SectionShell({ children, delay = 0, overflow = 'hidden' }) {
  const overflowClass = overflow === 'visible' ? 'overflow-visible' : 'overflow-hidden'
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`bg-[#150522]/55 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative ${overflowClass}`}
    >
      <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-primary/5 blur-[80px] pointer-events-none" />
      <div className="relative z-10 min-w-0">{children}</div>
    </motion.div>
  )
}

export default function ProfilePage() {
  const { user, refreshUser } = useAuth()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const role = user?.role || 'requester'
  const accent = ROLE_ACCENT[role] || ROLE_ACCENT.requester
  const isForcedPwdChange = user?.force_password_change === true

  const [pwdForm, setPwdForm] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  })
  const [pwdLoading, setPwdLoading] = useState(false)
  const [pwdError, setPwdError] = useState('')
  const [pwdSuccess, setPwdSuccess] = useState('')

  const [gmailConnecting, setGmailConnecting] = useState(false)
  const [gmailMsg, setGmailMsg] = useState('')
  const [gmailErr, setGmailErr] = useState('')

  const [hubLoading, setHubLoading] = useState(true)
  const [changeRequests, setChangeRequests] = useState([])
  const [notifications, setNotifications] = useState([])
  const [githubStatus, setGithubStatus] = useState(null)
  const [activityPreview, setActivityPreview] = useState([])
  const [adminStats, setAdminStats] = useState(null)
  const [adminUserCount, setAdminUserCount] = useState(0)

  const homePath = `/${role}`

  const browserLabel = useMemo(() => detectSessionBrowser(), [])
  const [sessionNow, setSessionNow] = useState(() => formatSessionClock())

  useEffect(() => {
    const tick = () => setSessionNow(formatSessionClock())
    tick()
    const id = setInterval(tick, 30_000)
    const onVis = () => {
      if (!document.hidden) tick()
    }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  useEffect(() => {
    refreshUser()
  }, [refreshUser])

  useEffect(() => {
    const ok = searchParams.get('google_success') === '1'
    const errCode = searchParams.get('google_error')
    if (!ok && !errCode) return

    let cancelled = false
    ;(async () => {
      if (ok) {
        setGmailMsg('Gmail connecté. Les notifications de la plateforme seront aussi envoyées sur cette adresse.')
      }
      if (errCode) {
        const decoded = decodeURIComponent(errCode)
        const labels = {
          invalid_state: 'Session OAuth invalide ou expirée.',
          missing_config: 'OAuth Google non configuré côté serveur.',
          token_exchange_failed: 'Échange du jeton Google refusé.',
          userinfo_failed: 'Impossible de lire le profil Google.',
          missing_profile: 'Profil Google incomplet.',
          user_not_found: 'Utilisateur introuvable.',
          google_already_linked: 'Ce compte Google est déjà lié à un autre utilisateur.',
        }
        setGmailErr(labels[decoded] || 'Connexion Gmail refusée.')
      }
      await refreshUser?.()
      const r = (() => {
        try {
          return JSON.parse(localStorage.getItem('user') || '{}').role || 'requester'
        } catch {
          return 'requester'
        }
      })()
      if (!cancelled) {
        navigate(`/${r}/profile`, { replace: true })
      }
    })()
    return () => {
      cancelled = true
    }
  }, [searchParams, navigate, refreshUser])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setHubLoading(true)
      try {
        const [crRes, notifRes] = await Promise.all([
          api.get('/change-requests').catch(() => ({ data: [] })),
          api.get('/notifications').catch(() => ({ data: [] })),
        ])
        if (!cancelled) {
          const raw = crRes.data
          setChangeRequests(Array.isArray(raw) ? raw : [])
          const n = notifRes.data
          setNotifications(Array.isArray(n) ? n : [])
        }

        if (role === 'implementer') {
          const [gh, act] = await Promise.all([
            api.get('/github/status').catch(() => ({ data: { connected: false } })),
            api.get('/change-requests/activity', { params: { page: 1, per_page: 4 } }).catch(() => ({ data: { items: [] } })),
          ])
          if (!cancelled) {
            setGithubStatus(gh.data || { connected: false })
            setActivityPreview(act.data?.items || [])
          }
        }

        if (role === 'admin') {
          const [st, usersRes] = await Promise.all([
            api.get('/admin/stats').catch(() => ({ data: null })),
            api.get('/users').catch(() => ({ data: [] })),
          ])
          if (!cancelled) {
            setAdminStats(st.data || null)
            const u = usersRes.data
            setAdminUserCount(Array.isArray(u) ? u.length : 0)
          }
        }
      } finally {
        if (!cancelled) setHubLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [role])

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPwdError('')
    setPwdSuccess('')
    setPwdLoading(true)
    try {
      await api.post('/password/change', pwdForm)
      setPwdSuccess('Mot de passe mis à jour.')

      if (isForcedPwdChange) {
        const updatedUser = { ...user, force_password_change: false }
        localStorage.setItem('user', JSON.stringify(updatedUser))
        window.location.reload()
      } else {
        setPwdForm({ current_password: '', new_password: '', new_password_confirmation: '' })
      }
    } catch (err) {
      const errors = err.response?.data?.errors
      let errMsg = 'Erreur lors de la mise à jour.'
      if (errors) {
        errMsg = Object.values(errors).flat()[0]
      } else if (err.response?.data?.message) {
        errMsg = err.response.data.message
      }
      setPwdError(errMsg)
    } finally {
      setPwdLoading(false)
    }
  }

  const handleGmailConnect = async () => {
    setGmailErr('')
    setGmailMsg('')
    setGmailConnecting(true)
    try {
      const res = await api.post('/google/link/start')
      const url = res.data?.authorize_url
      if (!url || typeof url !== 'string') {
        setGmailErr('Réponse serveur invalide. Vérifiez GOOGLE_CLIENT_ID et GOOGLE_REDIRECT_URI sur le serveur.')
        return
      }
      window.location.assign(url)
    } catch (e) {
      const msg =
        e.response?.data?.message ||
        (e.message === 'Network Error' ? 'Serveur injoignable.' : 'Impossible de démarrer la connexion Google.')
      setGmailErr(typeof msg === 'string' ? msg : 'Impossible de démarrer la connexion Google.')
    } finally {
      setGmailConnecting(false)
    }
  }

  const handleGmailDisconnect = async () => {
    setGmailErr('')
    setGmailMsg('')
    setGmailConnecting(true)
    try {
      await api.post('/google/disconnect')
      await refreshUser()
      setGmailMsg('Gmail déconnecté. Seules les notifications dans la plateforme continuent.')
    } catch (e) {
      setGmailErr(e.response?.data?.message || 'Déconnexion impossible.')
    } finally {
      setGmailConnecting(false)
    }
  }

  const cr = changeRequests || []
  const pendingApproval = countBy(cr, (r) => r.status === 'pending_approval')
  const awaitingRequesterValidation = countBy(cr, (r) => r.status === 'done' && r.requester_validation_status === 'pending')
  const drafts = countBy(cr, (r) => r.status === 'draft')
  const inFlight = countBy(cr, (r) => ['approved', 'in_progress'].includes(r.status))
  const assignedActive = countBy(cr, (r) => ['approved', 'in_progress', 'done'].includes(r.status))

  const cards = adminStats?.cards

  const roleDeck = () => {
    if (hubLoading) {
      return (
        <div className="flex items-center justify-center py-16 gap-4 text-[#B5A1C2]/40">
          <div className="w-10 h-10 border-2 border-white/10 border-t-primary rounded-full animate-spin" />
          <span className="text-[10px] font-black uppercase tracking-widest">Chargement du hub…</span>
        </div>
      )
    }

    if (role === 'requester') {
      const recent = [...cr].sort((a, b) => new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at)).slice(0, 4)
      return (
        <>
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-3 rounded-2xl border ${accent.chip}`}>
              <Sparkles size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-primary">Espace demandeur</p>
              <h3 className="text-lg font-light text-white">Pilotage de vos dossiers</h3>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <StatChip label="Total dossiers" value={cr.length} />
            <StatChip label="Brouillons" value={drafts} />
            <StatChip label="En chaîne" value={inFlight} tone="warn" />
            <StatChip label="À valider" value={awaitingRequesterValidation} tone={awaitingRequesterValidation ? 'danger' : 'ok'} />
          </div>
          <div className="flex flex-wrap gap-3 mb-8">
            <Link
              to="/requester/new"
              className="inline-flex items-center gap-2 rounded-2xl bg-primary/15 border border-primary/30 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/25 transition-colors"
            >
              <Zap size={14} /> Nouvelle requête
            </Link>
            <Link
              to="/requester/changes"
              className="inline-flex items-center gap-2 rounded-2xl bg-white/5 border border-white/10 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white/80 hover:bg-white/10 transition-colors"
            >
              <ClipboardList size={14} /> Mes demandes
            </Link>
          </div>
          {recent.length > 0 && (
            <div className="space-y-3">
              <p className="text-[9px] font-black uppercase tracking-widest text-[#B5A1C2]/30">Dernière activité</p>
              {recent.map((r) => (
                <Link
                  key={r.id}
                  to={`/requester/changes/${r.id}`}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3 hover:border-primary/30 transition-colors group"
                >
                  <span className="text-xs font-bold text-white truncate group-hover:text-primary transition-colors">{r.title}</span>
                  <ChevronRight size={16} className="text-[#B5A1C2]/30 group-hover:text-primary shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </>
      )
    }

    if (role === 'implementer') {
      const gh = githubStatus || { connected: false }
      const todo = countBy(cr, (r) => r.status === 'approved')
      const doing = countBy(cr, (r) => r.status === 'in_progress')
      const doneWait = countBy(cr, (r) => r.status === 'done' && r.requester_validation_status !== 'validated')
      const signedOff = countBy(cr, (r) => r.status === 'done' && r.requester_validation_status === 'validated')
      const linkedRepos = countBy(cr, (r) => r.repo_link?.repo_full_name)

      return (
        <>
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-3 rounded-2xl border ${accent.chip}`}>
              <Cpu size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-primary">Console implémenteur</p>
              <h3 className="text-lg font-light text-white">Code · tâches · GitHub</h3>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="rounded-2xl border border-white/10 bg-[#0F051E]/40 p-5 space-y-3">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#B5A1C2]/40">
                <GitBranch size={14} className="text-primary/70" /> GitHub
              </div>
              <p className={`text-sm font-bold ${gh.connected ? 'text-emerald-300' : 'text-amber-200'}`}>
                {gh.connected ? `Connecté · ${gh.login || 'compte'}` : 'Non connecté'}
              </p>
              <Link
                to="/implementer/changes"
                className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
              >
                Ouvrir Pipeline / lien repos <ChevronRight size={12} />
              </Link>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#0F051E]/40 p-5 grid grid-cols-2 gap-3">
              <StatChip label="To do" value={todo} />
              <StatChip label="En cours" value={doing} tone="warn" />
              <StatChip label="Livrés (validation)" value={doneWait} />
              <StatChip label="Signés" value={signedOff} tone="ok" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-[9px] font-black uppercase tracking-widest text-[#B5A1C2]/35 mb-6">
            <span className="px-3 py-1 rounded-full border border-white/10 bg-white/[0.02]">Tâches actives · {assignedActive}</span>
            <span className="px-3 py-1 rounded-full border border-white/10 bg-white/[0.02]">Repos liés · {linkedRepos}</span>
          </div>
          {activityPreview.length > 0 && (
            <div className="space-y-2">
              <p className="text-[9px] font-black uppercase tracking-widest text-[#B5A1C2]/30 flex items-center gap-2">
                <Activity size={12} /> Flux assigné (aperçu)
              </p>
              <div className="space-y-2">
                {activityPreview.map((a) => (
                  <div key={a.id} className="rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2 text-[11px] text-white/80">
                    <span className="text-primary/50 font-mono text-[10px]">#{a.change_request_id}</span>{' '}
                    <span className="text-[#B5A1C2]/50">{a.old_status ? `${a.old_status} → ` : ''}{a.new_status}</span>
                  </div>
                ))}
              </div>
              <Link to="/implementer/changes?archived=true" className="inline-block mt-2 text-[10px] font-black uppercase tracking-widest text-primary/70 hover:text-primary">
                Archives complètes →
              </Link>
            </div>
          )}
        </>
      )
    }

    if (role === 'approver') {
      const pipeline = countBy(cr, (r) => ['approved', 'in_progress', 'done'].includes(r.status))
      return (
        <>
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-3 rounded-2xl border ${accent.chip}`}>
              <Gavel size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-primary">Gouvernance CAB</p>
              <h3 className="text-lg font-light text-white">File &amp; historique</h3>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
            <StatChip label="En attente décision" value={pendingApproval} tone={pendingApproval ? 'warn' : 'ok'} />
            <StatChip label="Dossiers suivis" value={cr.length} />
            <StatChip label="Post-approbation" value={pipeline} />
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/approver/changes"
              className="inline-flex items-center gap-2 rounded-2xl bg-primary/15 border border-primary/30 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/25 transition-colors"
            >
              <ClipboardList size={14} /> File d&apos;attente
            </Link>
            <Link
              to="/approver/changes?history=true"
              className="inline-flex items-center gap-2 rounded-2xl bg-white/5 border border-white/10 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white/80 hover:bg-white/10 transition-colors"
            >
              <History size={14} /> Historique
            </Link>
          </div>
        </>
      )
    }

    if (role === 'admin') {
      return (
        <>
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-3 rounded-2xl border ${accent.chip}`}>
              <LineChart size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-primary">Supervision plateforme</p>
              <h3 className="text-lg font-light text-white">Métriques live</h3>
            </div>
          </div>
          {cards ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
              <StatChip label="Demandes totales" value={cards.totalRequests ?? '—'} />
              <StatChip label="En attente CAB" value={cards.pendingApproval ?? '—'} tone="warn" />
              <StatChip label="En cours" value={cards.inProgress ?? '—'} />
              <StatChip label="Utilisateurs" value={adminUserCount || cards.totalUsers || '—'} />
            </div>
          ) : (
            <p className="text-sm text-[#B5A1C2]/40 mb-8">Statistiques indisponibles pour le moment.</p>
          )}
          <div className="flex flex-wrap gap-3">
            <Link
              to="/admin/users"
              className="inline-flex items-center gap-2 rounded-2xl bg-primary/15 border border-primary/30 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/25 transition-colors"
            >
              <Users size={14} /> Utilisateurs
            </Link>
            <Link
              to="/admin/changes"
              className="inline-flex items-center gap-2 rounded-2xl bg-white/5 border border-white/10 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white/80 hover:bg-white/10 transition-colors"
            >
              <BarChart3 size={14} /> Interventions
            </Link>
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 rounded-2xl bg-white/5 border border-white/10 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white/80 hover:bg-white/10 transition-colors"
            >
              <Activity size={14} /> Dashboard
            </Link>
          </div>
        </>
      )
    }

    return null
  }

  const roleTip =
    role === 'requester'
      ? 'Astuce : gardez une trace claire dans la description — les approbateurs adorent les contextes précis.'
      : role === 'implementer'
        ? 'Astuce : liez chaque tâche à un dépôt pour suivre Actions et derniers commits depuis le tableau de bord.'
        : role === 'approver'
          ? 'Astuce : exigez un commentaire explicite lors du rejet — il alimente la traçabilité du dossier.'
          : 'Astuce : utilisez les comptes inactifs avec parcimonie et réinitialisez les mots de passe sensibles depuis Utilisateurs.'

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-16 font-inter">
      <div className={`h-px w-full bg-gradient-to-r ${accent.line} rounded-full opacity-80`} />

      <div className="flex flex-col gap-8 pb-8 border-b border-white/5">
        <Link
          to={homePath}
          className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-[#B5A1C2]/40 hover:text-primary transition-all w-fit"
        >
          <span className="p-2 rounded-lg bg-white/5 group-hover:bg-primary/20">
            <ArrowLeft size={14} />
          </span>
          Retour
        </Link>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.5em] text-primary">COMPTE &amp; HUB</p>
            <h1 className="mt-3 text-5xl md:text-6xl font-light tracking-tight text-white leading-none">
              Profil <span className="font-medium text-white/35">intelligent</span>
            </h1>
            <p className="mt-4 max-w-xl text-[11px] text-[#B5A1C2]/45 leading-relaxed font-medium">{roleTip}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#0F051E]/50 px-6 py-4 text-right shrink-0">
            <p className="text-[9px] font-black uppercase tracking-widest text-[#B5A1C2]/35 flex items-center justify-end gap-2">
              <Clock size={12} /> Session
            </p>
            <p className="text-xs font-bold text-white mt-1 tabular-nums">{sessionNow}</p>
            <p className="text-[10px] text-[#B5A1C2]/50 mt-1">{browserLabel}</p>
          </div>
        </div>
      </div>

      {isForcedPwdChange && (
        <div className="p-6 rounded-[2rem] bg-amber-500/10 border border-amber-500/25 text-[11px] font-bold text-amber-200 leading-relaxed">
          Vous devez définir un nouveau mot de passe avant de continuer à utiliser la plateforme.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#150522]/60 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 space-y-8 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none" />
            <div className="relative flex items-start gap-6">
              <div className="w-20 h-20 rounded-[1.75rem] bg-gradient-to-br from-primary/30 to-primary/5 border border-primary/30 flex items-center justify-center text-primary shrink-0 shadow-lg shadow-primary/10">
                <User size={36} />
              </div>
              <div className="min-w-0 space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#B5A1C2]/40">Identité</p>
                <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight break-words text-balance">
                  {user?.name || '—'}
                </h2>
                <p className="text-sm text-[#B5A1C2]/70 truncate">{user?.email || '—'}</p>
                <span className={`inline-block mt-2 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${accent.chip}`}>
                  {ROLE_LABELS[role] || role}
                </span>
              </div>
            </div>
          </motion.div>

          <SectionShell delay={0.05} overflow="visible">
            {user?.outbound_email_ready !== true && (
              <div className="mb-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-[11px] font-medium text-amber-100/95 leading-relaxed">
                <p className="font-black uppercase tracking-widest text-[9px] text-amber-200/90 mb-2">Envoi e-mail désactivé (configuration serveur)</p>
                <p>
                  Lier Gmail enregistre seulement l&apos;adresse de destination. Pour que les messages arrivent dans Gmail, le backend doit utiliser un transport réel (
                  <span className="font-semibold text-white">MAIL_MAILER=smtp</span> ou équivalent), pas la valeur par défaut{' '}
                  <span className="font-mono text-amber-200/80">log</span> (qui écrit dans les logs Laravel uniquement). Configurez SMTP sur le serveur (ex. Gmail App
                  Password ou Mailtrap), puis redémarrez PHP.
                </p>
              </div>
            )}
            <div className="flex items-start gap-3 mb-5 min-w-0">
              <div className="shrink-0 rounded-xl bg-white/[0.04] border border-white/10 p-2.5 mt-0.5">
                <Mail size={16} className="text-primary/90" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-primary">Notifications Gmail</p>
                <p className="text-[10px] text-[#B5A1C2]/45 mt-2 leading-relaxed">
                  Liez votre compte Google : chaque notification ChangeHub (demandes, statuts, etc.) sera aussi envoyée sur cette adresse Gmail. Le rapport post-changement est envoyé de la même façon après enregistrement par l&apos;implémenteur. L&apos;envoi réel dépend du SMTP configuré sur le serveur.
                </p>
              </div>
            </div>
            {gmailMsg && (
              <div className="mb-4 text-[11px] font-bold text-emerald-300/90 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 break-words">
                {gmailMsg}
              </div>
            )}
            {gmailErr && (
              <div className="mb-4 text-[11px] font-bold text-rose-300/90 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3 break-words">
                {gmailErr}
              </div>
            )}
            {user?.google_email ? (
              <div className="flex flex-col gap-4 min-w-0">
                <p className="text-xs text-white/90 break-words">
                  Compte lié :{' '}
                  <span className="font-semibold text-primary">{user.google_email}</span>
                </p>
                <button
                  type="button"
                  onClick={handleGmailDisconnect}
                  disabled={gmailConnecting}
                  className="w-full sm:w-auto sm:self-end px-6 py-3.5 rounded-2xl border border-white/15 text-[10px] font-black uppercase tracking-widest text-[#D5CBE5] bg-white/[0.04] hover:bg-white/[0.08] transition-colors disabled:opacity-50"
                >
                  {gmailConnecting ? 'Déconnexion…' : 'Déconnecter Gmail'}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleGmailConnect}
                disabled={gmailConnecting}
                className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-primary text-[#0F051E] text-[10px] font-black uppercase tracking-widest hover:opacity-95 disabled:opacity-50 disabled:pointer-events-none transition-opacity"
              >
                <Mail size={14} aria-hidden />
                {gmailConnecting ? 'Redirection…' : 'Connecter Gmail'}
              </button>
            )}
          </SectionShell>

          {notifications.length > 0 && (
            <SectionShell delay={0.08}>
              <div className="flex items-center gap-2 mb-4">
                <Bell size={16} className="text-primary/80" />
                <p className="text-[10px] font-black uppercase tracking-[0.35em] text-primary">Centre de messages</p>
                <span className="ml-auto text-[9px] font-black uppercase tracking-widest text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                  {notifications.length} non lu(s)
                </span>
              </div>
              <ul className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar pr-1">
                {notifications.slice(0, 6).map((n) => (
                  <li key={n.id} className="text-[11px] text-white/85 leading-snug border border-white/5 rounded-xl px-3 py-2 bg-white/[0.02]">
                    {n.data?.message || 'Notification'}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[9px] text-[#B5A1C2]/35 font-medium">
                Marquez les notifications comme lues depuis l&apos;icône cloche de la barre latérale.
              </p>
            </SectionShell>
          )}
        </div>

        <div className="lg:col-span-7 space-y-8">
          <SectionShell delay={0.04}>{roleDeck()}</SectionShell>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#150522]/60 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 md:p-12 space-y-10 shadow-2xl"
          >
            <div className="space-y-3">
              <div className="w-14 h-14 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center text-primary">
                <Shield size={26} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-primary">Sécurité</p>
              <h3 className="text-xl font-light text-white tracking-tight">Mot de passe</h3>
              <p className="text-[11px] text-[#B5A1C2]/50 leading-relaxed max-w-lg">
                Chiffrement des sessions, rotation des secrets, et bonnes pratiques OPS : un mot de passe long bat un mot de passe complexe court.
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#B5A1C2]/40 ml-1 flex items-center gap-2">
                  <Key size={12} /> Mot de passe actuel
                </label>
                <input
                  required
                  type="password"
                  value={pwdForm.current_password}
                  onChange={(e) => setPwdForm((f) => ({ ...f, current_password: e.target.value }))}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:ring-1 focus:ring-primary/50 focus:bg-white/10 transition-all outline-none"
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#B5A1C2]/40 ml-1 flex items-center gap-2">
                  <Shield size={12} /> Nouveau mot de passe
                </label>
                <input
                  required
                  type="password"
                  value={pwdForm.new_password}
                  onChange={(e) => setPwdForm((f) => ({ ...f, new_password: e.target.value }))}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:ring-1 focus:ring-primary/50 focus:bg-white/10 transition-all outline-none"
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#B5A1C2]/40 ml-1 flex items-center gap-2">
                  <Check size={12} /> Confirmation
                </label>
                <input
                  required
                  type="password"
                  value={pwdForm.new_password_confirmation}
                  onChange={(e) => setPwdForm((f) => ({ ...f, new_password_confirmation: e.target.value }))}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-sm text-white focus:ring-1 focus:ring-primary/50 focus:bg-white/10 transition-all outline-none"
                  placeholder="••••••••"
                />
              </div>

              {pwdError && (
                <div className="text-[11px] font-bold text-rose-400 bg-rose-500/10 p-4 rounded-2xl border border-rose-500/20">{pwdError}</div>
              )}

              {pwdSuccess && (
                <div className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20">{pwdSuccess}</div>
              )}

              <button
                type="submit"
                disabled={pwdLoading}
                className="w-full py-4 bg-primary text-[#0F051E] font-black uppercase tracking-widest text-[11px] rounded-2xl hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl shadow-primary/20 disabled:opacity-50"
              >
                {pwdLoading ? 'Enregistrement…' : 'Enregistrer le mot de passe'}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
