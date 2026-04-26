import React, { useState, useEffect, useMemo } from 'react'
import { Activity, ChevronRight, Filter, Search, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import { useSearch } from '../../context/SearchContext'

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

export default function Changes() {
    const { searchQuery: globalSearchQuery } = useSearch()
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeFilter, setActiveFilter] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [localSearchQuery, setLocalSearchQuery] = useState('')
    const itemsPerPage = 8

    const loadData = async () => {
        try {
            const r = await api.get('/change-requests')
            setRequests(r.data)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    useEffect(() => {
        setCurrentPage(1)
    }, [activeFilter, globalSearchQuery, localSearchQuery])

    const filteredRequests = useMemo(() => {
        let res = [...requests]
        if (activeFilter) {
            if (activeFilter.type === 'status') res = res.filter(r => r.status === activeFilter.value)
            if (activeFilter.type === 'risk') res = res.filter(r => r.risk_level === activeFilter.value)
            if (activeFilter.type === 'category') {
                res = res.filter(r => {
                    const typeName = r.change_type?.name || r.changeType?.name;
                    return typeName === activeFilter.value;
                })
            }
        }
        const query = localSearchQuery || globalSearchQuery
        if (query) {
            const q = query.toLowerCase()
            res = res.filter(r =>
                (r.title && r.title.toLowerCase().includes(q)) ||
                (r.id && r.id.toString().toLowerCase().includes(q)) ||
                (r.requester?.name && r.requester.name.toLowerCase().includes(q))
            )
        }
        return res
    }, [requests, activeFilter, globalSearchQuery, localSearchQuery])

    const totalPages = Math.ceil(filteredRequests.length / itemsPerPage)
    const paginatedRequests = filteredRequests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
                <div className="w-20 h-20 border-2 border-white/5 border-t-primary rounded-full animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary animate-pulse">Extraction des interventions...</p>
            </div>
        )
    }

    return (
        <div className="space-y-12 pb-20 font-inter max-w-[1600px] mx-auto overflow-visible relative">
            {/* ── HEADER ── */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-10 border-b border-white/5">
                <div className="space-y-4">
                    <p className="text-[11px] font-black uppercase tracking-[0.6em] text-primary">CHANGE_MANAGEMENT</p>
                    <h1 className="text-5xl font-light tracking-tight text-text-main leading-none">
                        Registre <span className="font-medium text-text-main/40">Interventions</span>
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-dim">
                        {filteredRequests.length} interventions enregistrées dans l'infrastructure.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim group-focus-within:text-primary transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder="Rechercher une intervention..."
                            value={localSearchQuery}
                            onChange={(e) => setLocalSearchQuery(e.target.value)}
                            className="bg-primary/5 border border-white/5 rounded-2xl pl-12 pr-6 py-4 text-xs text-text-main placeholder:text-text-dim/20 focus:outline-none focus:bg-primary/10 focus:border-primary/30 transition-all w-[300px]"
                        />
                    </div>
                </div>
            </div>

            {/* ── TABLE ROW ── */}
            <div className="bg-surface backdrop-blur-3xl border border-white/5 rounded-[3rem] shadow-2xl p-8 xl:p-12 overflow-visible">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-text-main">Flux des Interventions</h3>
                        <p className="text-[10px] text-text-dim mt-1">{filteredRequests.length} résultats correspondants</p>
                    </div>
                    {activeFilter && (
                        <span className="bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-primary/20 flex items-center justify-between gap-2">
                            {activeFilter.type}: {activeFilter.value}
                            <button onClick={() => setActiveFilter(null)} className="hover:text-text-main text-primary focus:outline-none ml-2">x</button>
                        </span>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-separate border-spacing-y-3">
                        <thead>
                            <tr className="text-[10px] font-black uppercase tracking-widest text-text-dim">
                                <th className="px-6 py-4">Sujet / ID</th>
                                <th className="px-6 py-4">Intervenant</th>
                                <th className="px-6 py-4">Statut</th>
                                <th className="px-6 py-4">Risque</th>
                                <th className="px-6 py-4">Date Prévue</th>
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedRequests.map((req) => (
                                <tr key={req.id} className="group bg-primary/5 hover:bg-primary/10 transition-all h-[100px] rounded-2xl overflow-hidden">
                                    <td className="px-6 py-4 max-w-[300px] rounded-l-3xl">
                                        <div className="flex flex-col justify-center h-full">
                                            <span className="text-sm font-bold text-text-main group-hover:text-primary transition-colors line-clamp-2 leading-tight mb-1">{req.title}</span>
                                            <span className="text-[10px] font-medium text-text-dim truncate group-hover:text-text-main/60 transition-colors">#{req.id} • {req.affected_system}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 max-w-[150px] h-full">
                                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[8px] font-black shrink-0">
                                                {req.requester?.name.charAt(0)}
                                            </div>
                                            <span className="text-xs text-text-main truncate">{req.requester?.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center h-full">
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-white/5 whitespace-nowrap ${STATUS_MAP[req.status]?.bg || 'bg-primary/10'} ${STATUS_MAP[req.status]?.color ? '' : 'text-text-dim'}`} style={{ color: STATUS_MAP[req.status]?.color }}>
                                                {STATUS_MAP[req.status]?.label || req.status}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 h-full">
                                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: RISK_MAP[req.risk_level]?.color }} />
                                            <span className="text-[10px] font-bold text-text-main uppercase tracking-tighter">{RISK_MAP[req.risk_level]?.label}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs text-text-dim tabular-nums flex items-center h-full">{new Date(req.planned_date).toLocaleDateString('fr-FR')}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right rounded-r-3xl">
                                        <div className="flex items-center justify-end h-full">
                                            <Link to={`/admin/changes/${req.id}`} className="p-2 inline-flex items-center justify-center rounded-xl bg-primary/10 hover:bg-primary/20 hover:text-text-main text-text-dim transition-all">
                                                <ChevronRight size={14} />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-10 pt-8 border-t border-white/5">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-dim">Page {currentPage} sur {totalPages}</p>
                            <div className="flex gap-4">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    className="px-6 py-2 rounded-xl bg-primary/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-text-dim hover:text-text-main hover:bg-primary/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
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
                        <div className="py-20 text-center space-y-4">
                            <Activity size={40} className="mx-auto text-white/5" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-text-dim">Aucune intervention ne correspond aux filtres</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
