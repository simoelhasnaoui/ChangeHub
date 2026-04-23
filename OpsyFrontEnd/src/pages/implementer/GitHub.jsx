import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import api from '../../api/axios'
import { Link2, Unlink, RefreshCw, Lock, Globe, History, ChevronRight } from 'lucide-react'
import ActivityPaginationBar from '../../components/implementer/ActivityPaginationBar'

function GitHubMark({ size = 18, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M12 .5C5.73.5.75 5.77.75 12.29c0 5.2 3.43 9.61 8.18 11.17.6.12.82-.27.82-.58v-2.2c-3.33.75-4.03-1.66-4.03-1.66-.54-1.43-1.33-1.81-1.33-1.81-1.09-.78.08-.77.08-.77 1.2.09 1.83 1.29 1.83 1.29 1.07 1.9 2.8 1.35 3.49 1.03.11-.8.42-1.35.76-1.66-2.66-.32-5.46-1.39-5.46-6.18 0-1.37.47-2.49 1.24-3.37-.13-.32-.54-1.63.12-3.39 0 0 1.01-.33 3.3 1.29a11.1 11.1 0 0 1 3-.42c1.02 0 2.04.14 3 .42 2.28-1.62 3.29-1.29 3.29-1.29.66 1.76.25 3.07.12 3.39.77.88 1.24 2 1.24 3.37 0 4.8-2.8 5.86-5.47 6.17.43.39.82 1.15.82 2.32v3.44c0 .32.22.71.82.58 4.75-1.56 8.18-5.97 8.18-11.17C23.25 5.77 18.27.5 12 .5z" />
    </svg>
  )
}

export default function ImplementerGitHub() {
  const location = useLocation()
  const qs = useMemo(() => new URLSearchParams(location.search), [location.search])
  const isArchives = qs.get('archived') === 'true'

  const [status, setStatus] = useState({ connected: false, login: null, connected_at: null })
  const [repos, setRepos] = useState([])
  const [repoPage, setRepoPage] = useState(1)
  const [repoMeta, setRepoMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [reposLoading, setReposLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const [activity, setActivity] = useState([])
  const [activityLoading, setActivityLoading] = useState(false)
  const [activityPage, setActivityPage] = useState(1)
  const [activityMeta, setActivityMeta] = useState(null)
  const [connecting, setConnecting] = useState(false)

  useLayoutEffect(() => {
    if (isArchives) setActivityLoading(true)
  }, [isArchives])

  const loadStatus = async () => {
    const res = await api.get('/github/status')
    setStatus(res.data)
  }

  const REPOS_PER_PAGE = 10

  const loadRepos = useCallback(async (page) => {
    setReposLoading(true)
    setError('')
    try {
      const res = await api.get('/github/repos', {
        params: { page, per_page: REPOS_PER_PAGE },
      })
      setRepos(res.data?.repos || [])
      setRepoMeta(res.data?.meta ?? null)
    } catch (e) {
      setError(e.response?.data?.message || 'Impossible de charger les dépôts GitHub.')
    } finally {
      setReposLoading(false)
    }
  }, [])

  useEffect(() => {
    const connected = qs.get('connected')
    if (connected === '1') setNotice('GitHub connecté avec succès.')
    if (connected === '0') setNotice('Connexion GitHub échouée. Réessayez.')
  }, [qs])

  const ARCHIVES_PER_PAGE = 10

  const fetchArchivesActivity = useCallback(async (page) => {
    setActivityLoading(true)
    setError('')
    try {
      const res = await api.get('/change-requests/activity', {
        params: { page, per_page: ARCHIVES_PER_PAGE },
      })
      setActivity(res.data?.items || [])
      setActivityMeta(
        res.data?.meta ?? {
          current_page: page,
          last_page: 1,
          per_page: ARCHIVES_PER_PAGE,
          total: (res.data?.items || []).length,
        }
      )
    } catch (e) {
      setError(e.response?.data?.message || 'Impossible de charger le journal des changements.')
    } finally {
      setActivityLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isArchives) return

    const run = async () => {
      setLoading(true)
      setError('')
      try {
        await loadStatus()
      } catch (e) {
        setError(e.response?.data?.message || 'Erreur de chargement du statut GitHub.')
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [isArchives])

  useEffect(() => {
    if (!isArchives) return
    setLoading(false)
    fetchArchivesActivity(activityPage)
  }, [isArchives, activityPage, fetchArchivesActivity])

  useEffect(() => {
    if (isArchives || !status?.connected) return
    loadRepos(repoPage)
  }, [isArchives, status?.connected, repoPage, loadRepos])

  const handleConnect = async () => {
    setError('')
    setConnecting(true)
    try {
      const res = await api.post('/github/link/start')
      const url = res.data?.authorize_url
      if (!url || typeof url !== 'string') {
        setError('URL de connexion GitHub indisponible. Vérifiez la configuration serveur (GITHUB_CLIENT_ID, GITHUB_REDIRECT_URI).')
        return
      }
      window.location.assign(url)
    } catch (e) {
      const msg =
        e.response?.data?.message ||
        e.response?.data?.error ||
        (e.message === 'Network Error'
          ? 'Impossible de joindre le serveur. Vérifiez que l’API est démarrée et accessible.'
          : 'Impossible de démarrer la connexion GitHub.')
      setError(typeof msg === 'string' ? msg : 'Impossible de démarrer la connexion GitHub.')
    } finally {
      setConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    setError('')
    await api.post('/github/disconnect')
    setRepos([])
    setRepoMeta(null)
    setRepoPage(1)
    await loadStatus()
    setNotice('GitHub déconnecté.')
  }

  if (loading && !isArchives) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
        <div className="w-20 h-20 border-2 border-white/5 border-t-primary rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary animate-pulse">Initialisation GitHub...</p>
      </div>
    )
  }

  if (isArchives) {
    return (
      <div className="space-y-10 pb-20 font-inter max-w-[1400px] mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-10 border-b border-white/5">
          <div className="space-y-4">
            <p className="text-[11px] font-black uppercase tracking-[0.6em] text-primary">CHANGE_LOG_ARCHIVE</p>
            <h1 className="text-5xl font-light tracking-tight text-white leading-none">
              Archives <span className="font-medium text-white/40">Journal</span>
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#B5A1C2]/40">
              Historique des statuts et commentaires sur les demandes auxquelles vous êtes assigné.
            </p>
          </div>
          <button
            type="button"
            onClick={() => fetchArchivesActivity(activityPage)}
            disabled={activityLoading}
            className="group flex items-center gap-3 bg-white/5 text-white font-black uppercase tracking-widest text-[11px] px-6 py-4 rounded-2xl hover:bg-white/10 border border-white/10 transition-all disabled:opacity-60"
          >
            <RefreshCw size={16} className={activityLoading ? 'animate-spin' : ''} />
            Actualiser
          </button>
        </div>

        {error && (
          <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-[10px] font-bold text-rose-300">
            {error}
          </div>
        )}

        <div className="bg-[#150522]/40 backdrop-blur-3xl border border-white/5 p-8 md:p-10 rounded-[3rem] shadow-2xl">
          <div className="flex items-center gap-3 mb-8">
            <History size={20} className="text-primary" />
            <div>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-white">Journal des changements</p>
              <p className="text-[10px] text-[#B5A1C2]/40 mt-1">Dernières entrées (tâches assignées)</p>
            </div>
          </div>

          {activityLoading && activity.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 border-2 border-white/10 border-t-primary rounded-full animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary animate-pulse">Chargement du journal…</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {(activity || []).map((a) => (
                  <div
                    key={a.id}
                    className="bg-white/[0.02] border border-white/10 rounded-2xl px-6 py-5 hover:border-primary/20 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary/60 truncate">
                          #{a.change_request_id} {a.title}
                        </p>
                        <p className="mt-2 text-[11px] text-white/90 font-mono">
                          {a.old_status ? `${a.old_status} → ` : ''}
                          {a.new_status}
                        </p>
                        {a.comment ? (
                          <p className="mt-2 text-[10px] text-[#B5A1C2]/50 leading-relaxed line-clamp-4">{a.comment}</p>
                        ) : null}
                        <p className="mt-3 text-[9px] text-[#B5A1C2]/30">
                          {a.by?.name || '—'}
                          {a.by?.role ? ` · ${a.by.role}` : ''} •{' '}
                          {a.created_at ? new Date(a.created_at).toLocaleString('fr-FR') : '—'}
                        </p>
                      </div>
                      <Link
                        to={`/implementer/changes/${a.change_request_id}`}
                        className="shrink-0 p-3 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-[#0F051E] transition-all"
                        title="Ouvrir la demande"
                      >
                        <ChevronRight size={16} />
                      </Link>
                    </div>
                  </div>
                ))}

                {activity.length === 0 && !activityLoading && (
                  <div className="py-16 text-center bg-white/[0.02] border-2 border-dashed border-white/5 rounded-[2.5rem]">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#B5A1C2]/30">Aucune entrée dans le journal pour le moment.</p>
                  </div>
                )}
              </div>

              <ActivityPaginationBar
                meta={activityMeta}
                loading={activityLoading}
                onPrev={() => setActivityPage((p) => Math.max(1, p - 1))}
                onNext={() =>
                  setActivityPage((p) =>
                    activityMeta?.last_page ? Math.min(activityMeta.last_page, p + 1) : p + 1
                  )
                }
              />
            </>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-10 pb-20 font-inter max-w-[1400px] mx-auto">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-10 border-b border-white/5">
        <div className="space-y-4">
          <p className="text-[11px] font-black uppercase tracking-[0.6em] text-primary">INTEGRATION_NODE</p>
          <h1 className="text-5xl font-light tracking-tight text-white leading-none">
            GitHub <span className="font-medium text-white/40">Link</span>
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#B5A1C2]/40">
            Connectez votre compte GitHub pour consulter vos dépôts directement dans la plateforme.
          </p>
        </div>

        <div className="flex gap-3">
          {!status.connected ? (
            <button
              type="button"
              onClick={() => handleConnect()}
              disabled={connecting}
              className="group flex items-center gap-3 bg-primary text-[#0F051E] font-black uppercase tracking-widest text-[11px] px-8 py-4 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-primary/20 disabled:opacity-50 disabled:pointer-events-none disabled:hover:scale-100"
            >
              <Link2 size={16} className={connecting ? 'animate-pulse' : ''} />
              {connecting ? 'Connexion…' : 'Connecter GitHub'}
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => loadRepos(repoPage)}
                disabled={reposLoading}
                className="group flex items-center gap-3 bg-white/5 text-white font-black uppercase tracking-widest text-[11px] px-6 py-4 rounded-2xl hover:bg-white/10 border border-white/10 transition-all disabled:opacity-60"
              >
                <RefreshCw size={16} className={reposLoading ? 'animate-spin' : ''} />
                Rafraîchir
              </button>
              <button
                onClick={handleDisconnect}
                className="group flex items-center gap-3 bg-rose-500/10 text-rose-300 font-black uppercase tracking-widest text-[11px] px-6 py-4 rounded-2xl hover:bg-rose-500/20 border border-rose-500/20 transition-all"
              >
                <Unlink size={16} />
                Déconnecter
              </button>
            </>
          )}
        </div>
      </div>

      {notice && (
        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-300">
          {notice}
        </div>
      )}

      {error && (
        <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-[10px] font-bold text-rose-300">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#150522]/40 backdrop-blur-3xl border border-white/5 p-8 rounded-[3rem] space-y-6">
            <div className="flex items-center gap-3 text-[#B5A1C2]/60">
              <GitHubMark size={18} className="text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest">Compte</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between bg-white/[0.02] border border-white/10 rounded-2xl px-5 py-4">
                <span className="text-[9px] font-black uppercase tracking-widest text-[#B5A1C2]/20">Status</span>
                <span className={`text-[10px] font-black uppercase tracking-widest ${status.connected ? 'text-emerald-300' : 'text-[#B5A1C2]/60'}`}>
                  {status.connected ? 'CONNECTED' : 'NOT_LINKED'}
                </span>
              </div>

              <div className="flex items-center justify-between bg-white/[0.02] border border-white/10 rounded-2xl px-5 py-4">
                <span className="text-[9px] font-black uppercase tracking-widest text-[#B5A1C2]/20">Login</span>
                <span className="text-[10px] font-bold text-white">{status.login || '—'}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 text-[10px] font-black uppercase tracking-widest text-[#B5A1C2]/30 flex items-center gap-2">
              <Lock size={12} className="text-primary/60" />
              Token stocké côté serveur
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="bg-[#150522]/40 backdrop-blur-3xl border border-white/5 p-8 rounded-[3rem] shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Globe size={18} className="text-primary" />
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.3em] text-white">Repositories</p>
                  <p className="text-[10px] text-[#B5A1C2]/40 mt-1">
                    {status.connected
                      ? repoMeta
                        ? `${repos.length} dépôt(s) affiché(s) · page ${repoMeta.current_page}/${repoMeta.last_page}`
                        : `${repos.length} dépôts`
                      : 'Connectez GitHub pour afficher vos dépôts.'}
                  </p>
                </div>
              </div>
            </div>

            {!status.connected ? (
              <div className="py-16 text-center bg-white/[0.02] border-2 border-dashed border-white/5 rounded-[2.5rem] space-y-4">
                <GitHubMark size={32} className="mx-auto text-[#B5A1C2]/10" />
                <p className="text-[10px] font-black uppercase tracking-widest text-[#B5A1C2]/30">Aucun compte GitHub lié</p>
                <button
                  type="button"
                  onClick={() => handleConnect()}
                  disabled={connecting}
                  className="inline-flex items-center gap-2 mt-2 px-6 py-3 rounded-2xl bg-primary text-[#0F051E] text-[10px] font-black uppercase tracking-widest hover:opacity-95 disabled:opacity-50 disabled:pointer-events-none transition-opacity"
                >
                  <Link2 size={14} className={connecting ? 'animate-pulse' : ''} />
                  {connecting ? 'Connexion…' : 'Connecter'}
                </button>
              </div>
            ) : reposLoading ? (
              <div className="py-16 flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-2 border-white/10 border-t-primary rounded-full animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary animate-pulse">Chargement des dépôts...</p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {repos.map((r) => (
                    <a
                      key={r.id || r.full_name}
                      href={r.html_url}
                      target="_blank"
                      rel="noreferrer"
                      className="block bg-white/[0.02] hover:bg-white/[0.05] transition-all border border-white/10 rounded-2xl px-6 py-5"
                    >
                      <div className="flex items-center justify-between gap-6">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white truncate">{r.full_name || r.name}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            {r.private ? (
                              <span className="text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300">PRIVATE</span>
                            ) : (
                              <span className="text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">PUBLIC</span>
                            )}
                            {r.archived && (
                              <span className="text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[#B5A1C2]/70">ARCHIVED</span>
                            )}
                            {r.language && (
                              <span className="text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[#B5A1C2]/70">{r.language}</span>
                            )}
                          </div>
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-[#B5A1C2]/40 shrink-0">
                          {r.updated_at ? new Date(r.updated_at).toLocaleDateString('fr-FR') : '—'}
                        </div>
                      </div>
                    </a>
                  ))}

                  {repos.length === 0 && (
                    <div className="py-14 text-center bg-white/[0.02] border-2 border-dashed border-white/5 rounded-[2.5rem] space-y-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#B5A1C2]/30">Aucun dépôt trouvé</p>
                      <button
                        type="button"
                        onClick={() => loadRepos(repoPage)}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest"
                      >
                        <RefreshCw size={14} />
                        Rafraîchir
                      </button>
                    </div>
                  )}
                </div>

                <ActivityPaginationBar
                  meta={repoMeta}
                  loading={reposLoading}
                  onPrev={() => setRepoPage((p) => Math.max(1, p - 1))}
                  onNext={() =>
                    setRepoPage((p) =>
                      repoMeta?.last_page ? Math.min(repoMeta.last_page, p + 1) : p + 1
                    )
                  }
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

