import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    FileText, Clock, CheckCircle, XCircle, 
    Plus, ChevronRight, Search, Activity, Filter, 
    TrendingUp, Trash2, Edit3, Eye
} from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
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
        <div className={`absolute top-0 right-0 w-24 h-24 blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity`} style={{ backgroundColor: color }} />
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

export default function RequesterDashboard() {
    const { user } = useAuth()
    const { searchQuery } = useSearch()
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)
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
    useEffect(() => { setCurrentPage(1) }, [searchQuery])

    const handleDelete = async (id) => {
        if (!window.confirm('Supprimer ce brouillon ?')) return
        try {
            await api.delete(`/change-requests/${id}`)
            load()
        } catch (err) {
            alert('Erreur lors de la suppression.')
        }
    }

    const filteredRequests = useMemo(() => {
        let res = [...requests]
        if (searchQuery) {
            const q = searchQuery.toLowerCase()
            res = res.filter(r => 
                (r.title && r.title.toLowerCase().includes(q)) || 
                (r.affected_system && r.affected_system.toLowerCase().includes(q))
            )
        }
        return res
    }, [requests, searchQuery])

    const totalPages = Math.ceil(filteredRequests.length / itemsPerPage)
    const paginatedRequests = filteredRequests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    const counts = {
        total: requests.length,
        pending: requests.filter(r => r.status === 'pending_approval').length,
        approved: requests.filter(r => r.status === 'approved').length,
        done: requests.filter(r => r.status === 'done').length,
    }

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
                <div className="w-20 h-20 border-2 border-white/5 border-t-primary rounded-full animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary animate-pulse">Flux Personnel en cours...</p>
            </div>
        )
    }

    return (
        <div className="space-y-12 pb-20 font-inter max-w-[1600px] mx-auto overflow-visible">
            
            {/* ── HEADER ── */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-10 border-b border-white/5">
                <div className="space-y-4">
                    <p className="text-[11px] font-black uppercase tracking-[0.6em] text-primary">REQUESTER_TERMINAL_V4</p>
                    <h1 className="text-5xl font-light tracking-tight text-white capitalize leading-none">Bonjour, <span className="font-medium">{user?.name.split(' ')[0]}</span></h1>
                </div>

                <div className="flex items-center gap-6">
                    <Link
                        to="/requester/new"
                        className="group flex items-center gap-3 bg-primary text-[#0F051E] font-black uppercase tracking-widest text-[11px] px-8 py-4 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_20px_40px_rgba(209,140,255,0.2)]"
                    >
                        <Plus size={16} />
                        Nouvelle Demande
                    </Link>
                </div>
            </div>

            {/* ── STATS ROW ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Mes Demandes" value={counts.total} icon={<FileText />} color="#D18CFF" />
                <StatCard title="En attente" value={counts.pending} icon={<Clock />} color="#f59e0b" />
                <StatCard title="Approuvées" value={counts.approved} icon={<TrendingUp />} color="#3b82f6" />
                <StatCard title="Livrées" value={counts.done} icon={<CheckCircle />} color="#10b981" />
            </div>

            {/* ── LIST TAB ── */}
            <div className="bg-[#150522]/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] shadow-2xl p-8 xl:p-12">
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#E8E0F0]">Suivi des Interventions</h3>
                        <p className="text-[10px] text-[#B5A1C2]/40 mt-1">{filteredRequests.length} dossiers actifs</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-separate border-spacing-y-3">
                        <thead>
                            <tr className="text-[10px] font-black uppercase tracking-widest text-[#B5A1C2]/40">
                                <th className="px-6 py-4">Sujet / ID</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Statut</th>
                                <th className="px-6 py-4">Risque</th>
                                <th className="px-6 py-4">Échéance</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedRequests.map((req) => (
                                <tr key={req.id} className="group bg-white/[0.02] hover:bg-white/[0.05] transition-all rounded-2xl overflow-hidden h-[100px]">
                                    <td className="px-6 py-4 max-w-[350px]">
                                        <div className="flex flex-col justify-center h-full">
                                            <span className="text-sm font-bold text-white group-hover:text-primary transition-colors line-clamp-2 leading-tight mb-1">{req.title}</span>
                                            <span className="text-[10px] font-medium text-[#B5A1C2]/40 truncate group-hover:text-[#B5A1C2]/60 transition-colors">#{req.id} • {req.affected_system}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs text-[#E8E0F0] font-medium uppercase tracking-tighter opacity-60">{req.change_type?.name}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center h-full">
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-white/5 whitespace-nowrap ${STATUS_MAP[req.status]?.bg || 'bg-white/5'} ${STATUS_MAP[req.status]?.color ? '' : 'text-[#B5A1C2]'}`} style={{ color: STATUS_MAP[req.status]?.color }}>
                                                {STATUS_MAP[req.status]?.label || req.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 h-full">
                                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: RISK_MAP[req.risk_level]?.color }} />
                                            <span className="text-[10px] font-bold text-[#E8E0F0] uppercase tracking-tighter">{RISK_MAP[req.risk_level]?.label}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs text-[#B5A1C2]/60 tabular-nums flex items-center h-full">{new Date(req.planned_date).toLocaleDateString('fr-FR')}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-3 h-full">
                                            <Link 
                                                to={`/requester/changes/${req.id}`} 
                                                className="p-3 inline-flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-[#B5A1C2] transition-all"
                                                title="Consulter"
                                            >
                                                <Eye size={16} />
                                            </Link>
                                            {req.status === 'draft' && (
                                                <>
                                                    <Link 
                                                        to={`/requester/changes/${req.id}/edit`} 
                                                        className="p-3 inline-flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-primary transition-all"
                                                        title="Modifier"
                                                    >
                                                        <Edit3 size={16} />
                                                    </Link>
                                                    <button 
                                                        onClick={() => handleDelete(req.id)} 
                                                        className="p-3 inline-flex items-center justify-center rounded-xl bg-white/5 hover:bg-rose-500/20 text-rose-400 transition-all"
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-10 pt-8 border-t border-white/5">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#B5A1C2]/40">Page {currentPage} sur {totalPages}</p>
                            <div className="flex gap-4">
                                <button 
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    className="px-6 py-2 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-[#B5A1C2] hover:text-white hover:bg-white/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                                >
                                    Précédent
                                </button>
                                <button 
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    className="px-6 py-2 rounded-xl bg-primary/20 border border-primary/20 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/30 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                                >
                                    Suivant
                                </button>
                            </div>
                        </div>
                    )}

                    {filteredRequests.length === 0 && (
                        <div className="py-24 text-center space-y-6">
                            <Activity size={48} className="mx-auto text-white/5 animate-pulse" />
                            <div className="space-y-2">
                                <p className="text-sm font-bold text-[#E8E0F0]">Aucune demande trouvée</p>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#B5A1C2]/20">Lancez une nouvelle intervention pour commencer.</p>
                            </div>
                            <Link to="/requester/new" className="text-xs text-primary hover:underline font-bold uppercase tracking-widest">
                                Créer maintenant →
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}