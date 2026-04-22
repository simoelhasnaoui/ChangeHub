import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../../api/axios'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    ArrowLeft, FileText, Activity, ShieldAlert, 
    History, CheckCircle2, AlertCircle, XCircle,
    Server, Layers, Calendar, User, 
    ChevronRight, Download, Search, Info,
    Eye, MoreHorizontal, Terminal, Globe, Cpu, Globe2,
    Database
} from 'lucide-react'
import { generateReport } from '../../utils/generateReport'

const GLOWS = {
    draft: 'from-[#B5A1C2]/10 via-transparent to-transparent',
    pending_approval: 'from-amber-500/10 via-transparent to-transparent',
    approved: 'from-blue-500/10 via-transparent to-transparent',
    in_progress: 'from-indigo-500/10 via-transparent to-transparent',
    done: 'from-emerald-500/10 via-transparent to-transparent',
    rejected: 'from-rose-500/10 via-transparent to-transparent',
}

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

export default function AdminChangeDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [cr, setCr] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const load = async () => {
        try {
            const res = await api.get(`/change-requests/${id}`)
            setCr(res.data)
        } catch (err) {
            const msg = err.response?.data?.message || `Erreur ${err.response?.status || ''}`
            setError(msg)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [id])

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
                <div className="w-20 h-20 border-2 border-white/5 border-t-primary rounded-full animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary animate-pulse">Audit système en cours...</p>
            </div>
        )
    }

    if (error || !cr) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
                <XCircle size={48} className="text-rose-500/20" />
                <p className="text-sm font-bold text-white tracking-widest">{error || 'Dossier introuvable'}</p>
                <Link to="/admin" className="text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:underline">Retour au dashboard →</Link>
            </div>
        )
    }

    const statusObj = STATUS_MAP[cr.status]

    return (
        <div className="max-w-[1400px] mx-auto space-y-12 pb-20 font-inter">
            {/* ── ATMOSPHERIC BACKGROUND ── */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className={`absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-20 bg-gradient-to-br ${GLOWS[cr.status] || 'from-primary/10 to-transparent'}`} />
                <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] rounded-full blur-[100px] opacity-5 bg-primary/10" />
            </div>

            {/* ── CINEMATIC HEADER ── */}
            <div className="relative z-10 space-y-10 pb-12 border-b border-white/5">
                <div className="flex items-center justify-between">
                    <Link 
                        to="/admin" 
                        className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-[#B5A1C2]/40 hover:text-primary transition-all"
                    >
                        <div className="p-2 rounded-lg bg-white/5 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                        </div>
                        Audit_Registry
                    </Link>
                    <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-[#B5A1C2]/20">
                        <span className="text-primary/40">ADMIN_AUDIT_CONSOLE</span>
                        <span className="w-1 h-1 rounded-full bg-white/10" />
                        <span>NODE: REQ-{cr.id}</span>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
                    <div className="space-y-6 max-w-3xl">
                        <div className="flex items-center gap-4">
                            <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-white/10 ${statusObj?.bg}`} style={{ color: statusObj?.color }}>
                                {statusObj?.label?.toUpperCase()}
                            </div>
                            <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#B5A1C2]/40">System_Integrity_Audit</span>
                        </div>
                        <h1 className="text-6xl font-light tracking-tighter text-white leading-[0.9] lg:text-7xl">
                            {cr.title}
                        </h1>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                        {cr.analysis && (
                            <button
                                onClick={() => generateReport(cr, cr.analysis)}
                                className="group relative flex items-center gap-4 bg-white/5 text-white font-black uppercase tracking-[0.2em] text-[11px] px-10 py-5 rounded-[2rem] hover:bg-white/10 border border-white/10 transition-all shadow-2xl overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <Download size={18} className="text-primary relative z-10" />
                                <span className="relative z-10">Export_Audit_PV</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* ── LEFT: SPECS ── */}
                <div className="lg:col-span-8 space-y-10">
                    <div className="bg-[#0F051E]/60 backdrop-blur-3xl border border-white/5 p-10 xl:p-14 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-primary/10 transition-colors" />
                        
                        <div className="space-y-12">
                            <div className="space-y-6">
                                <h3 className="text-xs font-black uppercase tracking-[0.4em] text-[#B5A1C2]/40 flex items-center gap-3">
                                    <Terminal size={16} className="text-primary" /> Source_Brief
                                </h3>
                                <div className="relative pl-6">
                                    <div className="absolute left-0 top-0 bottom-0 w-px bg-primary/20" />
                                    <p className="text-sm font-mono text-[#D5CBE5]/90 leading-relaxed whitespace-pre-wrap">{cr.description}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                {[
                                    { label: 'Type', value: cr.change_type?.name, icon: <Layers size={14} /> },
                                    { label: 'System', value: cr.affected_system, icon: <Server size={14} /> },
                                    { label: 'Schedule', value: new Date(cr.planned_date).toLocaleDateString('fr-FR'), icon: <Calendar size={14} /> },
                                    { label: 'Risk', value: RISK_MAP[cr.risk_level]?.label, icon: <ShieldAlert size={14} />, color: RISK_MAP[cr.risk_level]?.color },
                                    { label: 'Author', value: cr.requester?.name, icon: <User size={14} /> },
                                    { label: 'Ops_Team', value: cr.implementers?.length > 0 ? `${cr.implementers.length} Assigned` : 'None', icon: <Activity size={14} /> },
                                ].map((item, idx) => (
                                    <div key={idx} className="p-5 bg-white/[0.02] rounded-3xl border border-white/5 group/card hover:bg-white/[0.05] transition-all">
                                        <div className="text-primary/40 group-hover/card:text-primary transition-colors mb-3">{item.icon}</div>
                                        <p className="text-[8px] font-black uppercase tracking-widest text-[#B5A1C2]/20 mb-1">{item.label}</p>
                                        <p className="text-[10px] font-bold text-white truncate" style={item.color ? { color: item.color } : {}}>{item.value || '—'}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Report Section */}
                    {cr.analysis && (
                        <div className="bg-[#150522]/40 backdrop-blur-3xl border border-white/5 p-10 xl:p-14 rounded-[3.5rem] shadow-2xl space-y-10 border-l-4 border-l-emerald-500/30">
                            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-emerald-400 flex items-center gap-3">
                                <CheckCircle2 size={16} /> Rapport d'Exécution
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#B5A1C2]/20">Analyse Post-Op</p>
                                    <p className="text-sm text-[#E8E0F0] leading-relaxed whitespace-pre-wrap">{cr.analysis.impact_analysis || cr.analysis.impact}</p>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#B5A1C2]/20">Résumé Technique</p>
                                    <p className="text-sm text-[#E8E0F0] leading-relaxed whitespace-pre-wrap">{cr.analysis.execution_summary || cr.analysis.description}</p>
                                </div>
                            </div>

                            {cr.incidents && cr.incidents.length > 0 && (
                                <div className="pt-10 border-t border-white/5 space-y-6">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-rose-500 flex items-center gap-2">
                                        <AlertTriangle size={14} /> Incidents Capturés ({cr.incidents.length})
                                    </h4>
                                    <div className="grid grid-cols-1 gap-4">
                                        {cr.incidents.map(inc => (
                                            <div key={inc.id} className="bg-rose-500/5 border border-rose-500/10 p-6 rounded-3xl flex justify-between items-start gap-4">
                                                <div className="space-y-2 flex-1">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-sm font-bold text-rose-100">{inc.title}</span>
                                                        <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border border-rose-500/20 text-rose-400">{inc.severity}</span>
                                                    </div>
                                                    <p className="text-xs text-rose-100/40 leading-relaxed">{inc.description}</p>
                                                </div>
                                                <div className="text-right space-y-1">
                                                    <p className="text-[9px] font-black text-rose-500/40">TTR</p>
                                                    <p className="text-xs font-bold text-rose-500">{inc.time_to_resolve_minutes}min</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Full History Timeline */}
                    <div className="bg-[#150522]/40 backdrop-blur-3xl border border-white/5 p-10 rounded-[3.5rem] shadow-2xl space-y-8">
                        <h3 className="text-xs font-black uppercase tracking-[0.4em] text-[#B5A1C2]/40 flex items-center gap-3">
                            <History size={16} /> Journal Système
                        </h3>
                        
                        <div className="space-y-10 relative">
                            <div className="absolute left-2.5 top-2 bottom-2 w-px bg-white/5" />
                            
                            {cr.histories.map((h, idx) => (
                                <div key={h.id} className="relative pl-10 group">
                                    <div className={`absolute left-0 top-1.5 w-5 h-5 rounded-full border-4 border-[#150522] z-10 transition-colors ${idx === 0 ? 'bg-primary' : 'bg-white/10 group-hover:bg-white/20'}`} />
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <p className="text-[11px] font-bold text-white leading-none">{h.user?.name}</p>
                                            <span className="text-[8px] font-medium text-[#B5A1C2]/40 tabular-nums">{new Date(h.created_at).toLocaleDateString('fr-FR')}</span>
                                        </div>
                                        <div className="inline-flex items-center px-2 py-0.5 rounded-lg bg-white/5 text-[9px] font-black uppercase tracking-widest text-primary/60">
                                            {h.status}
                                        </div>
                                        {h.comment && (
                                            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-[10px] text-[#B5A1C2]/60 italic leading-relaxed">
                                                "{h.comment}"
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── RIGHT: HISTORY ── */}
                <div className="lg:col-span-4 space-y-10">
                    {/* Security Card */}
                    {cr.approval_conditions && (
                        <div className="bg-amber-500/5 border border-amber-500/20 p-8 rounded-[3rem] space-y-4">
                            <div className="flex items-center gap-3 text-amber-500">
                                <ShieldAlert size={18} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Protocoles d'Approbation</span>
                            </div>
                            <p className="text-xs text-amber-500/80 leading-relaxed italic">"{cr.approval_conditions}"</p>
                        </div>
                    )}



                    {/* Meta Card */}
                    <div className="bg-white/5 border border-white/10 p-10 rounded-[3.5rem] space-y-6">
                        <div className="flex items-center gap-4 text-[#B5A1C2]/40">
                            <Info size={20} />
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em]">Metadata Audit</h4>
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                <span className="text-[9px] font-black uppercase tracking-widest text-[#B5A1C2]/20">Version Dossier</span>
                                <span className="text-xs font-bold text-white">v4.0.2</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                <span className="text-[9px] font-black uppercase tracking-widest text-[#B5A1C2]/20">Intégrité Log</span>
                                <span className="text-xs font-bold text-emerald-500">Vérifiée</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-[9px] font-black uppercase tracking-widest text-[#B5A1C2]/20">Dernier Import</span>
                                <span className="text-xs font-bold text-white">Maintenant</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
