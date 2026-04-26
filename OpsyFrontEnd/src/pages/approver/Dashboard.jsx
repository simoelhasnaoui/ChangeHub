import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Activity, ShieldCheck, Clock, FileText,
    Filter, ChevronRight, CheckCircle, XCircle,
    TrendingUp, Search, AlertTriangle, Users
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import { displayUserName } from '../../utils/displayUserName'
import { useSearch } from '../../context/SearchContext'

// ─── Constants & Localization ───────────────────────────────────────────────
const STATUS_MAP = {
    draft: { label: 'Brouillon', color: '#B5A1C2', bg: 'bg-[#B5A1C2]/10' },
    pending_approval: { label: 'En attente', color: '#f59e0b', bg: 'bg-amber-500/10' },
    approved: { label: 'Approuvé', color: '#3b82f6', bg: 'bg-blue-500/10' },
    in_progress: { label: 'En cours', color: '#6366f1', bg: 'bg-indigo-500/10' },
    done: { label: 'Terminé', color: '#10b981', bg: 'bg-emerald-500/10' },
    rejected: { label: 'Rejeté', color: '#f43f5e', bg: 'bg-rose-500/10' },
}

const RISK_MAP = {
    low: { label: 'Faible', color: '#10b981' },
    medium: { label: 'Moyen', color: '#f59e0b' },
    high: { label: 'Élevé', color: '#f43f5e' },
}

// ─── Sub-Components ──────────────────────────────────────────────────────────
const StatCard = ({ title, value, icon, color }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="bg-[#150522]/40 backdrop-blur-3xl border border-white/5 p-6 rounded-[2rem] flex flex-col justify-between shadow-2xl group relative overflow-hidden h-full"
    >
        <div className={`absolute top-0 right-0 w-24 h-24 blur-[60px] opacity-10 group-hover:opacity-30 transition-opacity`} style={{ backgroundColor: color }} />
        <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-3 rounded-2xl bg-white/5">
                {React.cloneElement(icon, { size: 20, color: color || '#B5A1C2' })}
            </div>
        </div>
        <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#B5A1C2]/40 mb-1 whitespace-nowrap">{title}</p>
            <p className="text-3xl font-light text-white tracking-tighter">{value}</p>
        </div>
    </motion.div>
);

const UrgentCard = ({ req }) => (
    <div className="bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/20 p-6 rounded-[2rem] transition-all relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/20 blur-[60px] group-hover:opacity-100 opacity-50 transition-opacity" />
        <div className="flex justify-between items-start relative z-10 mb-4">
            <div className="flex items-center gap-3">
                <AlertTriangle className="text-rose-500" size={24} />
                <span className="text-[10px] font-black uppercase tracking-widest text-rose-500 bg-rose-500/10 px-3 py-1 rounded-full">Action Requise</span>
            </div>
            <span className="text-xs text-[#B5A1C2]/60 tabular-nums">{new Date(req.planned_date).toLocaleDateString()}</span>
        </div>
        <div className="relative z-10 mb-6">
            <h4 className="text-lg font-bold text-white mb-1 group-hover:text-primary transition-colors">{req.title}</h4>
            <p className="text-xs text-[#B5A1C2]/60">#{req.id} • {req.affected_system}</p>
        </div>
        <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-black text-primary border border-white/5">
                    {req.requester?.name.charAt(0)}
                </div>
                <span className="text-xs text-[#E8E0F0]/80">{req.requester?.name}</span>
            </div>
            <Link
                to={`/approver/changes/${req.id}`}
                className="px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-rose-500 text-white shadow-lg shadow-rose-500/20 hover:scale-105"
            >
                Priorité
            </Link>
        </div>
    </div>
);

export default function ApproverDashboard() {
    const { user } = useAuth()
    const { searchQuery } = useSearch()
    const location = useLocation()
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 8

    // Define routing states
    const isDashboard = location.pathname === '/approver' || location.pathname === '/approver/'
    const isHistory = location.pathname === '/approver/changes' && location.search.includes('history=true')
    const isQueue = location.pathname.startsWith('/approver/changes') && !isHistory

    // Maintain a filter state that adapts to the current view
    const [filter, setFilter] = useState('')

    useEffect(() => {
        if (isQueue) setFilter('pending_approval')
        else if (isHistory) setFilter('history_all')
        else setFilter('all')
        setCurrentPage(1)
    }, [isQueue, isHistory, isDashboard])

    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery, filter])

    const load = async () => {
        setLoading(true)
        try {
            const r = await api.get('/change-requests')
            setRequests(r.data)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [])

    const filteredRequests = useMemo(() => {
        let res = [...requests]

        if (isQueue) {
            if (filter === 'pending_approval') res = res.filter(r => r.status === 'pending_approval');
            else if (filter === 'high_risk') res = res.filter(r => r.status === 'pending_approval' && r.risk_level === 'high');
            else if (filter === 'standard_risk') res = res.filter(r => r.status === 'pending_approval' && (r.risk_level === 'low' || r.risk_level === 'medium'));
        } else if (isHistory) {
            if (filter === 'history_all') res = res.filter(r => ['approved', 'rejected', 'in_progress', 'done'].includes(r.status));
            else if (filter === 'approved') res = res.filter(r => ['approved', 'in_progress', 'done'].includes(r.status));
            else if (filter === 'rejected') res = res.filter(r => r.status === 'rejected');
        }

        // Search Filtering
        if (searchQuery) {
            const q = searchQuery.toLowerCase()
            res = res.filter(r =>
                (r.title && r.title.toLowerCase().includes(q)) ||
                (r.affected_system && r.affected_system.toLowerCase().includes(q)) ||
                (r.requester?.name && r.requester.name.toLowerCase().includes(q))
            )
        }
        return res
    }, [requests, searchQuery, filter, isQueue, isHistory])

    const totalPages = Math.ceil(filteredRequests.length / itemsPerPage)
    const paginatedRequests = filteredRequests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    const stats = {
        pending: requests.filter(r => r.status === 'pending_approval').length,
        approved: requests.filter(r => ['approved', 'in_progress', 'done'].includes(r.status)).length,
        rejected: requests.filter(r => r.status === 'rejected').length,
        total: requests.length
    }

    const urgentRequests = requests.filter(r => r.status === 'pending_approval' && r.risk_level === 'high').slice(0, 3)
    const pendingRequests = requests.filter(r => r.status === 'pending_approval').slice(0, 3)

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
                <div className="w-20 h-20 border-2 border-white/5 border-t-primary rounded-full animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary animate-pulse">Synchronisation du Flux Approbateur...</p>
            </div>
        )
    }

    return (
        <div className="space-y-12 pb-20 font-inter max-w-[1600px] mx-auto overflow-visible">

            {/* ── HEADER ── */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-10 border-b border-white/5">
                <div className="space-y-4">
                    {isDashboard && (
                        <>
                            <p className="text-[11px] font-black uppercase tracking-[0.6em] text-primary">DECISION_TERMINAL</p>
                            <h1 className="text-5xl font-light tracking-tight text-white leading-none">
                                Bonjour, <span className="font-medium text-white normal-case">{displayUserName(user)}</span>
                            </h1>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#B5A1C2]/40 mt-2">
                                Vue globale du flux décisionnel
                            </p>
                        </>
                    )}
                    {isQueue && (
                        <>
                            <p className="text-[11px] font-black uppercase tracking-[0.6em] text-amber-500">ACTION_REQUIRED</p>
                            <h1 className="text-5xl font-light tracking-tight text-white leading-none">
                                File <span className="font-medium text-white/40 normal-case">d'Attente</span>
                            </h1>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#B5A1C2]/40 mt-2">
                                {filteredRequests.length} demandes nécessitent votre analyse
                            </p>
                        </>
                    )}
                    {isHistory && (
                        <>
                            <p className="text-[11px] font-black uppercase tracking-[0.6em] text-blue-500">DECISION_ARCHIVE</p>
                            <h1 className="text-5xl font-light tracking-tight text-white leading-none">
                                Historique <span className="font-medium text-white/40 normal-case">Décisionnel</span>
                            </h1>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#B5A1C2]/40 mt-2">
                                Registre de vos approbations et refus
                            </p>
                        </>
                    )}
                </div>
            </div>

            {/* ── DASHBOARD VIEW ── */}
            {isDashboard && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard title="En attente" value={stats.pending} icon={<Clock />} color="#f59e0b" />
                        <StatCard title="Total Décisions" value={stats.approved + stats.rejected} icon={<ShieldCheck />} color="#D18CFF" />
                        <StatCard title="Approuvées" value={stats.approved} icon={<CheckCircle />} color="#3b82f6" />
                        <StatCard title="Refusées" value={stats.rejected} icon={<XCircle />} color="#f43f5e" />
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        {/* High Priority Actions */}
                        <div className="xl:col-span-2 space-y-6">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#E8E0F0] flex items-center gap-3">
                                <AlertTriangle className="text-rose-500" size={16} /> Attention Immédiate (Risque Élevé)
                            </h3>
                            {urgentRequests.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {urgentRequests.map(req => <UrgentCard key={req.id} req={req} />)}
                                </div>
                            ) : (
                                <div className="bg-emerald-500/5 border border-emerald-500/10 p-8 rounded-[2rem] flex flex-col items-center justify-center text-center">
                                    <ShieldCheck size={40} className="text-emerald-500/50 mb-4" />
                                    <p className="text-sm font-bold text-white mb-2">Aucun Haut Risque</p>
                                    <p className="text-[10px] text-emerald-500/50 uppercase tracking-widest font-black">L'infrastructure est stable.</p>
                                </div>
                            )}

                            {/* Show standard requests if space allows and no high risks */}
                            {urgentRequests.length === 0 && pendingRequests.length > 0 && (
                                <div className="mt-8 space-y-6">
                                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#E8E0F0] flex items-center gap-3">
                                        <Clock className="text-amber-500" size={16} /> Suivant dans la file
                                    </h3>
                                    <div className="space-y-4">
                                        {pendingRequests.map(req => (
                                            <div key={req.id} className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all">
                                                <div>
                                                    <p className="text-sm font-bold text-white">{req.title}</p>
                                                    <p className="text-[10px] text-[#B5A1C2]/60 mt-1">#{req.id} • {req.affected_system}</p>
                                                </div>
                                                <Link to={`/approver/changes/${req.id}`} className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-body transition-all rounded-xl text-[10px] font-black uppercase tracking-widest">
                                                    Action
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Recent History Mini-Feed */}
                        <div className="bg-[#150522]/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] p-8">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#E8E0F0] mb-8">Flux Récent</h3>
                            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary/20 before:to-transparent">
                                {requests.filter(r => ['approved', 'rejected', 'in_progress', 'done'].includes(r.status)).slice(0, 4).map(req => (
                                    <div key={req.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                        <div className="flex items-center justify-center w-6 h-6 rounded-full border border-primary/20 bg-body shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 ml-2 md:mx-0 z-10">
                                            {req.status === 'rejected' ? <XCircle size={10} className="text-rose-500" /> : <CheckCircle size={10} className="text-emerald-500" />}
                                        </div>
                                        <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] p-3 rounded-2xl bg-white/5 border border-white/5">
                                            <p className="text-xs font-bold text-white truncate">{req.title}</p>
                                            <p className="text-[9px] font-bold uppercase tracking-widest mt-1" style={{ color: STATUS_MAP[req.status]?.color }}>{STATUS_MAP[req.status]?.label}</p>
                                        </div>
                                    </div>
                                ))}
                                {stats.approved + stats.rejected === 0 && (
                                    <p className="text-[10px] text-[#B5A1C2]/40 uppercase tracking-widest text-center mt-6">Aucun flux récent</p>
                                )}
                            </div>
                            <div className="mt-8 text-center">
                                <Link to="/approver/changes?history=true" className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-white transition-colors">
                                    Voir tout l'historique →
                                </Link>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* ── QUEUE / HISTORY TABLE VIEW ── */}
            {(isQueue || isHistory) && (
                <div className="bg-[#150522]/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] shadow-2xl p-8 xl:p-12 transition-all">

                    {/* Tabs */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                        <div className="flex items-center gap-3 bg-white/5 p-1.5 rounded-2xl border border-white/5">
                            {isQueue && [
                                { key: 'pending_approval', label: 'Tout l\'attente' },
                                { key: 'high_risk', label: 'Risque Élevé' },
                                { key: 'standard_risk', label: 'Risque Standard' },
                            ].map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setFilter(tab.key)}
                                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === tab.key
                                        ? 'bg-amber-500 text-body shadow-xl shadow-amber-500/20'
                                        : 'text-[#B5A1C2]/40 hover:text-white'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}

                            {isHistory && [
                                { key: 'history_all', label: 'Tout l\'historique' },
                                { key: 'approved', label: 'Validés' },
                                { key: 'rejected', label: 'Refusés' },
                            ].map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setFilter(tab.key)}
                                    className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === tab.key
                                        ? 'bg-primary text-body shadow-xl shadow-primary/20'
                                        : 'text-[#B5A1C2]/40 hover:text-white'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-separate border-spacing-y-3">
                            <thead>
                                <tr className="text-[10px] font-black uppercase tracking-widest text-[#B5A1C2]/40">
                                    <th className="px-6 py-4">Sujet / Identifiant</th>
                                    <th className="px-6 py-4">Demandeur</th>
                                    <th className="px-6 py-4">Statut</th>
                                    <th className="px-6 py-4">Risque</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4 text-right">Analyse</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedRequests.map((req) => (
                                    <tr key={req.id} className="group bg-white/[0.02] hover:bg-white/[0.05] transition-all h-[100px] rounded-2xl">
                                        <td className="px-6 py-4 max-w-[350px] rounded-l-3xl">
                                            <div className="flex flex-col justify-center h-full">
                                                <span className="text-sm font-bold text-white group-hover:text-primary transition-colors line-clamp-2 leading-tight mb-1">{req.title}</span>
                                                <span className="text-[10px] font-medium text-[#B5A1C2]/40 truncate">#{req.id} • {req.affected_system}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-black text-primary border border-white/5">
                                                    {req.requester?.name.charAt(0)}
                                                </div>
                                                <span className="text-xs text-[#E8E0F0]/80 font-medium truncate max-w-[120px]">{req.requester?.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-white/5 whitespace-nowrap ${STATUS_MAP[req.status]?.bg || 'bg-white/5'}`} style={{ color: STATUS_MAP[req.status]?.color }}>
                                                {STATUS_MAP[req.status]?.label || req.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: RISK_MAP[req.risk_level]?.color }} />
                                                <span className="text-[10px] font-black uppercase tracking-tighter text-[#E8E0F0]">{RISK_MAP[req.risk_level]?.label}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs text-[#B5A1C2]/40 tabular-nums">{new Date(req.planned_date).toLocaleDateString('fr-FR')}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right rounded-r-3xl">
                                            <Link
                                                to={`/approver/changes/${req.id}`}
                                                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all inline-block ${req.status === 'pending_approval'
                                                    ? 'bg-amber-500 text-body shadow-lg shadow-amber-500/20 hover:scale-105'
                                                    : 'bg-white/5 text-[#B5A1C2] hover:bg-white/10'
                                                    }`}
                                            >
                                                {req.status === 'pending_approval' ? 'Examiner' : 'Consulter'}
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between mt-12 pt-8 border-t border-white/5">
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#B5A1C2]/20">Terminal Page {currentPage} / {totalPages}</p>
                                <div className="flex gap-4">
                                    <button
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-[#B5A1C2]/60 hover:text-white transition-all disabled:opacity-20"
                                    >
                                        Précédent
                                    </button>
                                    <button
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        className="px-6 py-2.5 rounded-xl bg-primary/20 border border-primary/20 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/30 transition-all disabled:opacity-20"
                                    >
                                        Suivant
                                    </button>
                                </div>
                            </div>
                        )}

                        {filteredRequests.length === 0 && (
                            <div className="py-32 text-center">
                                <ShieldCheck size={48} className="mx-auto text-white/5 mb-6 animate-pulse" />
                                <p className="text-sm font-bold text-white/60 mb-2">
                                    {isQueue ? 'Aucun changement en attente' : 'Aucun historique'}
                                </p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#B5A1C2]/20">
                                    {isQueue ? 'Toutes les requêtes de votre console ont été traitées.' : 'Aucune requête ne correspond à ce filtre.'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}