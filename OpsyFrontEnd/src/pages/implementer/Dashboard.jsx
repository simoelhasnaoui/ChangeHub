import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import { motion } from 'framer-motion'
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  useDroppable,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Clock,
  GitBranch,
  Link2,
  Maximize2,
  ShieldAlert,
  Timer,
  Workflow,
} from 'lucide-react'
import { useSearch } from '../../context/SearchContext'
import { useAuth } from '../../context/AuthContext'
import { displayUserName } from '../../utils/displayUserName'
import ConfirmModal from '../../components/ConfirmModal'
import ChangeHubSelect from '../../components/ui/ChangeHubSelect'
import ActivityPaginationBar from '../../components/implementer/ActivityPaginationBar'

const DASHBOARD_ACTIVITY_PER_PAGE = 5

const STATUS_MAP = {
  approved: { label: 'To Do', color: '#3b82f6', bg: 'bg-blue-500/10' },
  in_progress: { label: 'In Progress', color: '#D18CFF', bg: 'bg-[#D18CFF]/10' },
  done: { label: 'Done', color: '#10b981', bg: 'bg-emerald-500/10' },
}

const RISK_MAP = {
  low: { label: 'Low', color: '#10b981' },
  medium: { label: 'Medium', color: '#f59e0b' },
  high: { label: 'High', color: '#f43f5e' },
}

const COLUMNS = [
  { id: 'approved', title: 'To Do', subtitle: 'Ready for execution', color: '#3b82f6', icon: <Timer size={14} /> },
  { id: 'in_progress', title: 'In Progress', subtitle: 'Execution active', color: '#D18CFF', icon: <Activity size={14} /> },
  { id: 'done', title: 'Done', subtitle: 'Waiting validation', color: '#10b981', icon: <CheckCircle2 size={14} /> },
]

function pipelineTone(p) {
  if (!p) return { label: '—', color: 'text-[#B5A1C2]/60', bg: 'bg-white/5 border-white/10' }
  if (p.status === 'in_progress' || p.status === 'queued') return { label: 'RUNNING', color: 'text-amber-300', bg: 'bg-amber-500/10 border-amber-500/20' }
  if (p.conclusion === 'success') return { label: 'SUCCESS', color: 'text-emerald-300', bg: 'bg-emerald-500/10 border-emerald-500/20' }
  if (p.conclusion === 'failure' || p.conclusion === 'cancelled' || p.conclusion === 'timed_out') return { label: 'FAILED', color: 'text-rose-300', bg: 'bg-rose-500/10 border-rose-500/20' }
  return { label: (p.conclusion || p.status || 'UNKNOWN').toUpperCase(), color: 'text-[#B5A1C2]/60', bg: 'bg-white/5 border-white/10' }
}

function SortableItem({ req, repoOptions, onLinkRepo, insightsByRepo, ghConnected }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: req.id.toString(),
    data: req,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 100 : 1,
  }

  const deadline = req.planned_date ? new Date(req.planned_date) : null
  const repoFullName = req.repo_link?.repo_full_name || null
  const repoInsight = repoFullName ? insightsByRepo[repoFullName] : null
  const pipe = repoInsight?.pipeline || null
  const pipeTone = pipelineTone(pipe)

  const blockedByRequester = req.requester_validation_status === 'rejected'
  const blockedByPipeline = pipeTone.label === 'FAILED'

  return (
    <div ref={setNodeRef} style={style} className="group relative">
      <div className="bg-[#150522]/60 backdrop-blur-md border border-white/5 p-5 rounded-2xl shadow-xl hover:border-primary/30 transition-all mb-4 relative">
        <div className="flex justify-between items-start mb-3 gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black tracking-widest text-primary opacity-40">TASK_{req.id}</span>
              <span
                className="text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border"
                style={{ color: RISK_MAP[req.risk_level]?.color }}
              >
                {RISK_MAP[req.risk_level]?.label || '—'}
              </span>
              {(blockedByRequester || blockedByPipeline) && (
                <span className="text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300">
                  BLOCKED
                </span>
              )}
            </div>
            <h3 className="mt-2 font-bold text-white text-sm leading-tight group-hover:text-primary transition-colors line-clamp-2">
              {req.title}
            </h3>
            <p className="mt-2 text-[9px] font-bold uppercase tracking-widest text-[#B5A1C2]/30 line-clamp-1">
              Change request: #{req.id}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 hover:bg-white/5 rounded-md text-[#B5A1C2]/20 hover:text-white transition-colors">
              <div className="w-2 h-2 rounded-full bg-white/10" />
            </div>
            <Link
              to={`/implementer/changes/${req.id}`}
              className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-[#0F051E] transition-all shadow-lg shadow-primary/5"
            >
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-[8px] font-black uppercase tracking-widest bg-white/5 px-2 py-1 rounded-lg text-[#B5A1C2]/60 border border-white/5">
            {req.affected_system}
          </span>
          {repoFullName && (
            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${pipeTone.bg} ${pipeTone.color}`}>
              <Workflow size={10} className="inline mr-1 -translate-y-[1px]" />
              {pipeTone.label}
            </span>
          )}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[9px] font-medium text-[#B5A1C2]/30">
              <Clock size={10} />
              {deadline ? deadline.toLocaleDateString('fr-FR') : '—'}
            </div>

            {repoFullName && repoInsight?.html_url && (
              <a
                href={repoInsight.html_url}
                target="_blank"
                rel="noreferrer"
                className="text-[9px] font-black uppercase tracking-widest text-primary/70 hover:text-primary transition-colors flex items-center gap-2"
              >
                <GitBranch size={12} />
                Open repo
              </a>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1">
              <div className="text-[8px] font-black uppercase tracking-widest text-[#B5A1C2]/30 mb-2 flex items-center gap-2">
                <Link2 size={12} className="text-primary/60" />
                Link task ↔ repo
              </div>
              {req.__repo_link_locked ? (
                <div className="flex items-center justify-between gap-3 bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4">
                  <span className="text-xs text-white truncate">{repoFullName || '—'}</span>
                  <button
                    type="button"
                    onClick={() => req.__onUnlockRepoLink?.(req.id)}
                    className="text-[10px] font-black uppercase tracking-widest text-primary/70 hover:text-primary transition-colors"
                  >
                    Change
                  </button>
                </div>
              ) : (
                <ChangeHubSelect
                  value={repoFullName || ''}
                  onChange={(val) => onLinkRepo(req.id, val || null)}
                  disabled={!ghConnected || (ghConnected && repoOptions.length === 0)}
                  placeholder={!ghConnected ? 'Connect GitHub to link repos' : '— No repo linked —'}
                  icon={Link2}
                  usePortal={true}
                  options={[
                    { value: '', label: '— No repo linked —' },
                    ...repoOptions.map((r) => ({ value: r.full_name, label: r.full_name })),
                  ]}
                />
              )}
              {!ghConnected ? (
                <div className="mt-2 text-[9px] text-[#B5A1C2]/30">
                  Go to <span className="text-primary/70">/implementer/changes</span> to connect GitHub.
                </div>
              ) : repoOptions.length === 0 ? (
                <div className="mt-2 text-[9px] text-[#B5A1C2]/30">Loading repos…</div>
              ) : null}
            </div>
          </div>

          {repoFullName && repoInsight?.commit?.message && (
            <div className="pt-3 border-t border-white/5">
              <div className="text-[8px] font-black uppercase tracking-widest text-[#B5A1C2]/30">Last commit</div>
              <div className="mt-2 text-[11px] text-white/90 line-clamp-2">{repoInsight.commit.message}</div>
              <div className="mt-2 text-[9px] text-[#B5A1C2]/40">
                {repoInsight.commit.author || '—'} • {repoInsight.commit.date ? new Date(repoInsight.commit.date).toLocaleString('fr-FR') : '—'}
              </div>
              {pipe?.html_url && (
                <a
                  href={pipe.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className={`mt-2 inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-widest ${pipeTone.color} hover:text-white transition-colors`}
                >
                  View logs →
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function KanbanColumn({ col, items, pulse, children }) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id })

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col bg-[#150522]/40 backdrop-blur-3xl border transition-all duration-500 rounded-[2.5rem] min-h-[min(70vh,720px)] max-h-[min(78vh,820px)] shadow-2xl relative ${
        isOver ? 'border-primary/40 scale-[1.02] bg-primary/5' : 'border-white/5'
      } ${pulse ? 'animate-pulse-magnetic' : ''}`}
    >
      {pulse && <div className="absolute inset-0 bg-primary/20 animate-ripple pointer-events-none z-0 rounded-[2.5rem]" />}

      <div className="p-6 xl:p-8 flex justify-between items-center border-b border-white/10 bg-white/[0.04] relative z-10 rounded-t-[2.4rem] shrink-0">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-white/5 rounded-xl transition-colors" style={{ color: col.color }}>
            {col.icon}
          </div>
          <div>
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white">{col.title}</h2>
            <p className="text-[9px] font-medium uppercase tracking-widest text-[#B5A1C2]/20 mt-0.5">{col.subtitle}</p>
          </div>
        </div>
        <span className="bg-white/5 border border-white/10 text-[10px] font-black px-3 py-1 rounded-full text-[#B5A1C2]">{items.length}</span>
      </div>

      <div className="flex-1 min-h-0 p-6 overflow-y-auto custom-scrollbar flex flex-col relative z-10">
        {items.length === 0 && !isOver ? (
          <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-3xl p-10 space-y-4 opacity-30 select-none">
            <div className="p-4 bg-white/5 rounded-full">
              <Maximize2 size={24} className="text-[#B5A1C2]" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-center">Drop here</p>
          </div>
        ) : null}
        {isOver && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-2 border-dashed border-primary/30 rounded-2xl p-10 flex items-center justify-center bg-primary/5 mb-4"
          >
            <div className="flex flex-col items-center gap-2">
              <Activity size={24} className="text-primary/20 animate-pulse" />
              <span className="text-[8px] font-black uppercase tracking-widest text-primary/40">SNAP_HERE</span>
            </div>
          </motion.div>
        )}
        {children}
      </div>
    </div>
  )
}

export default function ImplementerDashboard() {
  const { user } = useAuth()
  const { searchQuery } = useSearch()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeItem, setActiveItem] = useState(null)
  const [pulseColumn, setPulseColumn] = useState(null)

  const [ghConnected, setGhConnected] = useState(false)
  const [repoOptions, setRepoOptions] = useState([])
  const [repoInsights, setRepoInsights] = useState([])
  const [activity, setActivity] = useState([])
  const [activityPage, setActivityPage] = useState(1)
  const [activityMeta, setActivityMeta] = useState(null)
  const [activityLoading, setActivityLoading] = useState(false)
  const [repoLinkError, setRepoLinkError] = useState('')
  const [repoLinkEditingTaskId, setRepoLinkEditingTaskId] = useState(null)
  const [repoLinkConfirm, setRepoLinkConfirm] = useState({ open: false, taskId: null, repo: null, prevRepo: null })

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(KeyboardSensor))

  const fetchActivity = useCallback(async (page) => {
    setActivityLoading(true)
    try {
      const res = await api.get('/change-requests/activity', {
        params: { page, per_page: DASHBOARD_ACTIVITY_PER_PAGE },
      })
      setActivity(res.data?.items || [])
      setActivityMeta(res.data?.meta ?? null)
    } catch {
      setActivity([])
      setActivityMeta(null)
    } finally {
      setActivityLoading(false)
    }
  }, [])

  const load = async (silent = false) => {
    if (!silent) {
      setLoading(true)
      setActivityPage(1)
    }
    try {
      const [crRes, statusRes] = await Promise.all([
        api.get('/change-requests'),
        api.get('/github/status').catch(() => ({ data: { connected: false } })),
      ])
      setRequests(crRes.data || [])
      setGhConnected(Boolean(statusRes.data?.connected))
    } finally {
      if (!silent) setLoading(false)
    }
    if (silent) {
      await fetchActivity(activityPage)
    }
  }

  useEffect(() => {
    if (loading) return
    fetchActivity(activityPage)
  }, [loading, activityPage, fetchActivity])

  const loadRepos = async () => {
    if (!ghConnected) return
    const r = await api.get('/github/repos')
    setRepoOptions(r.data?.repos || [])
  }

  const loadInsights = async (reposToQuery) => {
    if (!ghConnected) return
    if (!reposToQuery?.length) {
      setRepoInsights([])
      return
    }
    const r = await api.post('/github/repo-insights', { repos: reposToQuery })
    setRepoInsights(r.data?.repos || [])
  }

  useEffect(() => {
    load()
  }, [])

  useEffect(() => {
    if (ghConnected) loadRepos()
  }, [ghConnected])

  useEffect(() => {
    if (!ghConnected) return
    const linked = Array.from(
      new Set(
        (requests || [])
          .map((x) => x.repo_link?.repo_full_name)
          .filter(Boolean)
      )
    )

    const fallback = (repoOptions || []).slice(0, 8).map((r) => r.full_name).filter(Boolean)
    const reposToQuery = linked.length ? linked : fallback
    loadInsights(reposToQuery)
  }, [ghConnected, requests, repoOptions])

  const filteredRequests = useMemo(() => {
    if (!searchQuery) return requests
    const q = searchQuery.toLowerCase()
    return (requests || []).filter((r) => (r.title && r.title.toLowerCase().includes(q)) || (r.affected_system && r.affected_system.toLowerCase().includes(q)) || r.id.toString().includes(q))
  }, [requests, searchQuery])

  /** Requester signed off: keep in API data & activity history, hide from active Kanban */
  const kanbanRequests = useMemo(
    () =>
      (filteredRequests || []).filter(
        (r) => !(r.status === 'done' && r.requester_validation_status === 'validated')
      ),
    [filteredRequests]
  )

  const insightsByRepo = useMemo(() => {
    const m = {}
    for (const r of repoInsights || []) {
      if (r?.full_name) m[r.full_name] = r
    }
    return m
  }, [repoInsights])

  const alerts = useMemo(() => {
    const linkedRepoNames = Array.from(
      new Set((requests || []).map((x) => x.repo_link?.repo_full_name).filter(Boolean))
    )
    const failedPipelines = linkedRepoNames.filter((name) => {
      const p = insightsByRepo[name]?.pipeline
      return p && p.status === 'completed' && p.conclusion === 'failure'
    })

    const waitingApprovals = (requests || []).filter((r) => r.status === 'done' && r.requester_validation_status === 'pending')
    const blockedTasks = (requests || []).filter((r) => {
      const repoName = r.repo_link?.repo_full_name
      const p = repoName ? insightsByRepo[repoName]?.pipeline : null
      const blockedByRequester = r.requester_validation_status === 'rejected'
      const blockedByPipeline = p && p.status === 'completed' && ['failure', 'timed_out', 'cancelled'].includes(p.conclusion)
      return blockedByRequester || blockedByPipeline
    })

    return { failedPipelines, waitingApprovals, blockedTasks }
  }, [requests, insightsByRepo])

  const onLinkRepo = async (changeRequestId, repoFullNameOrNull) => {
    const task = (requests || []).find((r) => r.id === changeRequestId)
    const prevRepo = task?.repo_link?.repo_full_name || null

    // No-op
    if ((prevRepo || null) === (repoFullNameOrNull || null)) {
      setRepoLinkEditingTaskId(null)
      return
    }

    setRepoLinkConfirm({
      open: true,
      taskId: changeRequestId,
      repo: repoFullNameOrNull || null,
      prevRepo,
    })
  }

  const confirmRepoLink = async () => {
    const { taskId, repo } = repoLinkConfirm
    if (!taskId) return

    setRepoLinkError('')
    const previous = requests

    // Optimistic UI: update local state only after user confirms
    setRequests((cur) =>
      (cur || []).map((r) =>
        r.id === taskId
          ? {
              ...r,
              repo_link: repo ? { repo_full_name: repo } : null,
            }
          : r
      )
    )

    setRepoLinkConfirm({ open: false, taskId: null, repo: null, prevRepo: null })
    setRepoLinkEditingTaskId(null)

    try {
      await api.post(`/change-requests/${taskId}/repo-link`, { repo_full_name: repo })
      await load(true)
    } catch (e) {
      setRequests(previous)
      setRepoLinkError(e.response?.data?.message || 'Failed to link repo to task.')
    }
  }

  const cancelRepoLink = () => {
    setRepoLinkConfirm({ open: false, taskId: null, repo: null, prevRepo: null })
  }

  const handleDragStart = (e) => {
    const { active } = e
    const req = (requests || []).find((r) => r.id.toString() === active.id)
    setActiveItem(req)
  }

  const handleDragEnd = async (e) => {
    const { active, over } = e
    setActiveItem(null)
    if (!over) return

    const activeId = active.id
    const overContainer = over.id

    let targetStatus = null
    if (COLUMNS.map((c) => c.id).includes(overContainer)) {
      targetStatus = overContainer
    }

    const activeReq = (requests || []).find((r) => r.id.toString() === activeId)
    const statuses = ['approved', 'in_progress', 'done']
    if (!activeReq || !statuses.includes(targetStatus) || !statuses.includes(activeReq.status)) return

    const previousRequests = [...requests]
    setRequests(requests.map((r) => (r.id.toString() === activeId ? { ...r, status: targetStatus } : r)))
    setPulseColumn(targetStatus)
    setTimeout(() => setPulseColumn(null), 1000)

    try {
      await api.post(`/change-requests/${activeId}/update-status`, { status: targetStatus })
      load(true)
    } catch (err) {
      setRequests(previousRequests)
      alert(err.response?.data?.message || 'Erreur lors de la mise à jour du statut.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
        <div className="w-20 h-20 border-2 border-white/5 border-t-primary rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary animate-pulse">Loading implementer console...</p>
      </div>
    )
  }

  return (
    <div className="space-y-10 pb-20 font-inter max-w-[1600px] mx-auto flex flex-col h-full px-4">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-8 border-b border-white/5 shrink-0">
        <div className="space-y-4">
          <p className="text-[11px] font-black uppercase tracking-[0.6em] text-primary">EXECUTION_CONTROL_PANEL</p>
          <h1 className="text-5xl font-light tracking-tight text-white leading-none">
            Bonjour,{' '}
            <span className="font-medium text-white normal-case">{displayUserName(user)}</span>
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#B5A1C2]/40 mt-1">
            Console implémenteur · Tasks · Code · Pipelines
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!ghConnected && (
            <div className="text-[10px] font-black uppercase tracking-widest text-amber-300 bg-amber-500/10 border border-amber-500/20 px-4 py-3 rounded-2xl flex items-center gap-2">
              <ShieldAlert size={14} />
              GitHub not connected
            </div>
          )}
        </div>
      </div>

      {/* Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#150522]/40 backdrop-blur-3xl border border-white/5 p-7 rounded-[2.5rem] shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-rose-400" size={18} />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#B5A1C2]/30">Failed pipelines</p>
                <p className="text-2xl font-black text-white">{alerts.failedPipelines.length}</p>
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {(alerts.failedPipelines.slice(0, 3) || []).map((n) => (
              <div key={n} className="text-[10px] font-bold text-white/80 truncate">
                {n}
              </div>
            ))}
            {alerts.failedPipelines.length === 0 && <div className="text-[10px] text-[#B5A1C2]/30">No failures detected.</div>}
          </div>
        </div>

        <div className="bg-[#150522]/40 backdrop-blur-3xl border border-white/5 p-7 rounded-[2.5rem] shadow-2xl">
          <div className="flex items-center gap-3">
            <Clock className="text-amber-300" size={18} />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#B5A1C2]/30">Waiting approvals</p>
              <p className="text-2xl font-black text-white">{alerts.waitingApprovals.length}</p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {(alerts.waitingApprovals.slice(0, 3) || []).map((t) => (
              <div key={t.id} className="text-[10px] font-bold text-white/80 truncate">
                #{t.id} {t.title}
              </div>
            ))}
            {alerts.waitingApprovals.length === 0 && <div className="text-[10px] text-[#B5A1C2]/30">Nothing waiting.</div>}
          </div>
        </div>

        <div className="bg-[#150522]/40 backdrop-blur-3xl border border-white/5 p-7 rounded-[2.5rem] shadow-2xl">
          <div className="flex items-center gap-3">
            <ShieldAlert className="text-rose-300" size={18} />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#B5A1C2]/30">Blocked tasks</p>
              <p className="text-2xl font-black text-white">{alerts.blockedTasks.length}</p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {(alerts.blockedTasks.slice(0, 3) || []).map((t) => (
              <div key={t.id} className="text-[10px] font-bold text-white/80 truncate">
                #{t.id} {t.title}
              </div>
            ))}
            {alerts.blockedTasks.length === 0 && <div className="text-[10px] text-[#B5A1C2]/30">No blockers.</div>}
          </div>
        </div>
      </div>

      {repoLinkError && (
        <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-[10px] font-bold text-rose-300">
          {repoLinkError}
        </div>
      )}

      <ConfirmModal
        isOpen={repoLinkConfirm.open}
        danger={false}
        title="Confirmer le lien GitHub"
        message={
          repoLinkConfirm.repo
            ? `Lier ce task à "${repoLinkConfirm.repo}" ?`
            : `Retirer le repo lié à ce task ?`
        }
        confirmText="Confirmer"
        cancelText="Annuler"
        onConfirm={confirmRepoLink}
        onCancel={cancelRepoLink}
      />

      {/* My Tasks */}
      <div className="space-y-4 pt-2 mb-12">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.5em] text-primary">MY_TASKS</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#B5A1C2]/40">Kanban</p>
          </div>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1 min-h-0 items-stretch">
            {COLUMNS.map((col) => {
              const items = kanbanRequests.filter((r) => r.status === col.id)
              return (
                <KanbanColumn key={col.id} col={col} items={items} pulse={pulseColumn === col.id}>
                  <SortableContext id={col.id} items={items.map((i) => i.id.toString())} strategy={verticalListSortingStrategy}>
                    {items.map((req) => (
                      <SortableItem
                        key={req.id}
                        req={{
                          ...req,
                          __repo_link_locked: repoLinkEditingTaskId !== req.id,
                          __onUnlockRepoLink: setRepoLinkEditingTaskId,
                        }}
                        repoOptions={repoOptions}
                        onLinkRepo={onLinkRepo}
                        insightsByRepo={insightsByRepo}
                        ghConnected={ghConnected}
                      />
                    ))}
                  </SortableContext>
                </KanbanColumn>
              )
            })}
          </div>

          <DragOverlay
            dropAnimation={{
              duration: 500,
              easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
            }}
          >
            {activeItem ? (
              <div className="bg-[#150522]/90 backdrop-blur-3xl border-2 border-primary/50 p-5 rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.8)] opacity-90 scale-105 rotate-2 cursor-grabbing ring-4 ring-primary/10">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[9px] font-black tracking-widest text-primary">TASK_{activeItem.id}</span>
                  <div className="p-1 px-2 rounded-md bg-primary/20 text-[8px] text-primary font-bold">MAGNETIC_LOCK</div>
                </div>
                <h3 className="font-bold text-white text-sm leading-tight mb-2">{activeItem.title}</h3>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* My Repositories + Pipeline Status */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 pt-6 isolate">
        <div className="lg:col-span-7 min-w-0 bg-[#150522]/40 backdrop-blur-3xl border border-white/5 p-8 rounded-[3rem] shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.5em] text-primary">MY_REPOSITORIES</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#B5A1C2]/40">Quick access</p>
            </div>
          </div>

          {!ghConnected ? (
            <div className="py-10 text-center bg-white/[0.02] border-2 border-dashed border-white/5 rounded-[2.5rem] space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#B5A1C2]/30">Connect GitHub to list repositories.</p>
              <Link to="/implementer/github" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">
                Ouvrir la page GitHub →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {(repoInsights || []).slice(0, 8).map((r) => {
                const p = r.pipeline
                const tone = pipelineTone(p)
                return (
                  <a
                    key={r.full_name}
                    href={r.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="block bg-white/[0.02] hover:bg-white/[0.05] transition-all border border-white/10 rounded-2xl px-6 py-5"
                  >
                    <div className="flex items-center justify-between gap-6">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">{r.full_name}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border ${tone.bg} ${tone.color}`}>
                            <Workflow size={10} className="inline mr-1 -translate-y-[1px]" />
                            {tone.label}
                          </span>
                          {r.default_branch && (
                            <span className="text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[#B5A1C2]/70">
                              <GitBranch size={10} className="inline mr-1 -translate-y-[1px]" />
                              {r.default_branch}
                            </span>
                          )}
                        </div>
                        {r.commit?.message && <div className="mt-3 text-[11px] text-white/80 line-clamp-2">{r.commit.message}</div>}
                      </div>
                      <div className="shrink-0 text-right">
                        <div className="text-[10px] font-black uppercase tracking-widest text-[#B5A1C2]/40">Last run</div>
                        <div className="mt-1 text-[10px] font-bold text-white/70">
                          {p?.updated_at ? new Date(p.updated_at).toLocaleString('fr-FR') : '—'}
                        </div>
                      </div>
                    </div>
                  </a>
                )
              })}
              {repoInsights.length === 0 && (
                <div className="py-10 text-center bg-white/[0.02] border-2 border-dashed border-white/5 rounded-[2.5rem] space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#B5A1C2]/30">No repositories loaded yet.</p>
                  <p className="text-[10px] text-[#B5A1C2]/30">Link a task to a repo to surface it here.</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-5 min-w-0 bg-[#150522]/40 backdrop-blur-3xl border border-white/5 p-8 rounded-[3rem] shadow-2xl">
          <div className="mb-6">
            <p className="text-[11px] font-black uppercase tracking-[0.5em] text-primary">ACTIVITY_FEED</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#B5A1C2]/40">Recent changes</p>
          </div>

          <div className="space-y-3">
            {activityLoading && activity.length === 0 && (
              <div className="py-8 flex justify-center">
                <div className="w-8 h-8 border-2 border-white/10 border-t-primary rounded-full animate-spin" />
              </div>
            )}
            {(activity || []).map((a) => (
              <div key={a.id} className="bg-white/[0.02] border border-white/10 rounded-2xl px-6 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary/60 truncate">
                      #{a.change_request_id} {a.title}
                    </p>
                    <p className="mt-2 text-[11px] text-white/90">
                      {a.old_status ? `${a.old_status} → ` : ''}
                      {a.new_status}
                    </p>
                    {a.comment && <p className="mt-2 text-[10px] text-[#B5A1C2]/40 line-clamp-2">{a.comment}</p>}
                    <p className="mt-3 text-[9px] text-[#B5A1C2]/30">
                      {a.by?.name || '—'} • {a.created_at ? new Date(a.created_at).toLocaleString('fr-FR') : '—'}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {(activity || []).length === 0 && !activityLoading && (
              <div className="py-10 text-center bg-white/[0.02] border-2 border-dashed border-white/5 rounded-[2.5rem]">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#B5A1C2]/30">No recent activity.</p>
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
        </div>
      </div>

      <style>{`
        @keyframes ripple {
          0% { transform: scale(0.8); opacity: 0; }
          50% { opacity: 0.5; }
          100% { transform: scale(1.2); opacity: 0; }
        }
        .animate-ripple { animation: ripple 0.8s ease-out forwards; }
        @keyframes pulse-magnetic {
          0% { box-shadow: 0 0 0 0 rgba(209, 140, 255, 0); }
          50% { box-shadow: 0 0 20px 5px rgba(209, 140, 255, 0.2); }
          100% { box-shadow: 0 0 0 0 rgba(209, 140, 255, 0); }
        }
        .animate-pulse-magnetic { animation: pulse-magnetic 1s ease-in-out infinite; }
      `}</style>
    </div>
  )
}