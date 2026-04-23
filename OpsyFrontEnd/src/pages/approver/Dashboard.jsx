import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Activity, ShieldCheck, Clock, FileText,
    Filter, ChevronRight, CheckCircle, XCircle,
    TrendingUp, Search, AlertTriangle, Users
} from 'lucide-react'
import { Link } from 'react-router-dom'
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

export default function ApproverDashboard() {
    const { user } = useAuth()
    const { searchQuery } = useSearch()
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('pending_approval')
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 8

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
    useEffect(() => { setCurrentPage(1) }, [searchQuery, filter])

    const filteredRequests = useMemo(() => {
        let res = [...requests]

        // Tab Filtering
        if (filter !== 'all') {
            res = res.filter(r => r.status === filter)
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
    }, [requests, searchQuery, filter])

    const totalPages = Math.ceil(filteredRequests.length / itemsPerPage)
    const paginatedRequests = filteredRequests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    const stats = {
        pending: requests.filter(r => r.status === 'pending_approval').length,
        approved: requests.filter(r => r.status === 'approved' || r.status === 'in_progress' || r.status === 'done').length,
        rejected: requests.filter(r => r.status === 'rejected').length,
        total: requests.length
    }

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
                    <p className="text-[11px] font-black uppercase tracking-[0.6em] text-primary">DECISION_TERMINAL</p>
                    <h1 className="text-5xl font-light tracking-tight text-white leading-none">
                        Bonjour,{' '}
                        <span className="font-medium text-white normal-case">{displayUserName(user)}</span>
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#B5A1C2]/40 mt-2">
                        Console approbateur
                    </p>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#B5A1C2]/40">
                        {stats.pending > 0
                            ? `${stats.pending} demandes nécessitent une action immédiate`
                            : 'Flux décisionnel à jour • Aucune action requise'}
                    </p>
                </div>
            </div>

            {/* ── ANALYTICS ROW ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="En attente" value={stats.pending} icon={<Clock />} color="#f59e0b" />
                <StatCard title="Total Décisions" value={stats.approved + stats.rejected} icon={<ShieldCheck />} color="#D18CFF" />
                <StatCard title="Approuvées" value={stats.approved} icon={<CheckCircle />} color="#3b82f6" />
                <StatCard title="Historique" value={stats.total} icon={<FileText />} color="#B5A1C2" />
            </div>

            {/* ── INTERVENTION FLUX ── */}
            <div className="bg-[#150522]/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] shadow-2xl p-8 xl:p-12 transition-all">

                {/* Tabs & Title */}
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 mb-12">
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#E8E0F0]">Registre des Changements</h3>
                        <p className="text-[10px] text-[#B5A1C2]/20 mt-1">{filteredRequests.length} entrées correspondantes</p>
                    </div>

                    <div className="flex items-center gap-3 bg-white/5 p-1.5 rounded-2xl border border-white/5">
                        {[
                            { key: 'pending_approval', label: 'À Traiter' },
                            { key: 'all', label: 'Tout' },
                            { key: 'approved', label: 'Validé' },
                            { key: 'rejected', label: 'Refusé' },
                        ].map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setFilter(tab.key)}
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === tab.key
                                        ? 'bg-primary text-[#0F051E] shadow-xl shadow-primary/20'
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
                                <tr key={req.id} className="group bg-white/[0.02] hover:bg-white/[0.05] transition-all h-[100px]">
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
                                            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${req.status === 'pending_approval'
                                                    ? 'bg-primary text-[#0F051E] shadow-lg shadow-primary/20 hover:scale-105'
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
                            <p className="text-sm font-bold text-white/60 mb-2">Aucun changement en attente</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#B5A1C2]/20">Toutes les requêtes de votre console ont été traitées.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}