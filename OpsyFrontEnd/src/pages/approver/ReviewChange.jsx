import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../../api/axios'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    ArrowLeft, ShieldCheck, XCircle, CheckCircle2, 
    AlertCircle, UserCheck, MessageSquare, Info, 
    Server, Layers, Calendar, User, History,
    ChevronRight, Save, Send, Activity, Globe, 
    Terminal, Cpu
} from 'lucide-react'

const STATUS_MAP = {
    draft: { label: 'Brouillon', color: '#B5A1C2', bg: 'bg-[#B5A1C2]/10' },
    pending_approval: { label: 'En attente', color: '#f59e0b', bg: 'bg-amber-500/10', glow: 'shadow-[0_0_30px_rgba(245,158,11,0.2)]' },
    approved: { label: 'Approuvé', color: '#3b82f6', bg: 'bg-blue-500/10' },
    in_progress: { label: 'En cours', color: '#6366f1', bg: 'bg-indigo-500/10' },
    done: { label: 'Terminé', color: '#10b981', bg: 'bg-emerald-500/10' },
    rejected: { label: 'Rejeté', color: '#f43f5e', bg: 'bg-rose-500/10' },
}

const GLOWS = {
    pending_approval: 'from-amber-500/15 via-transparent to-transparent',
    approved: 'from-blue-500/15 via-transparent to-transparent',
    rejected: 'from-rose-500/15 via-transparent to-transparent',
}

export default function ReviewChange() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [cr, setCr] = useState(null)
    const [loading, setLoading] = useState(true)
    const [comment, setComment] = useState('')
    const [approvalConditions, setApprovalConditions] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    
    // Multi-Implementers state
    const [implementers, setImplementers] = useState([])
    const [selectedImplementers, setSelectedImplementers] = useState([])

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const [crRes, implRes] = await Promise.all([
                    api.get(`/change-requests/${id}`),
                    api.get('/users/implementers')
                ])
                setCr(crRes.data)
                setImplementers(implRes.data)
                
                // Pre-select if already assigned
                if (crRes.data.implementers) {
                    setSelectedImplementers(crRes.data.implementers.map(i => i.id))
                }
            } catch (err) {
                setError('Erreur lors de la récupération des données.')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [id])

    const handleImplementerToggle = (userId) => {
        if (selectedImplementers.includes(userId)) {
            setSelectedImplementers(selectedImplementers.filter(id => id !== userId))
        } else {
            setSelectedImplementers([...selectedImplementers, userId])
        }
    }

    const handleAction = async (type) => {
        if (type === 'reject' && !comment.trim()) {
            setError('Un commentaire est obligatoire pour rejeter une demande.')
            return
        }
        if (type === 'approve' && selectedImplementers.length === 0) {
            setError('Veuillez sélectionner au moins un implémenteur avant d\'approuver.')
            return
        }
        setSubmitting(true)
        setError('')
        try {
            const payload = { comment }
            if (type === 'approve') {
                payload.implementers = selectedImplementers
                if (approvalConditions.trim()) {
                    payload.approval_conditions = approvalConditions.trim()
                }
            }
            await api.post(`/change-requests/${id}/${type}`, payload)
            navigate('/approver')
        } catch (err) {
            setError(err.response?.data?.message || 'Une erreur est survenue.')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
                <div className="w-20 h-20 border-2 border-white/5 border-t-primary rounded-full animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary animate-pulse">Analyse du dossier en cours...</p>
            </div>
        )
    }

    if (error || !cr) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
                <XCircle size={48} className="text-rose-500/20" />
                <p className="text-sm font-bold text-white tracking-widest">{error || 'Dossier introuvable'}</p>
                <Link to="/approver" className="text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:underline">Retour →</Link>
            </div>
        )
    }

    return (
        <div className="max-w-[1400px] mx-auto space-y-12 pb-20 font-inter">
            {/* ── ATMOSPHERIC BACKGROUND ── */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className={`absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] opacity-20 bg-gradient-to-br ${GLOWS[cr.status] || 'from-primary/10 to-transparent'}`} />
            </div>

            {/* ── CINEMATIC HEADER ── */}
            <div className="relative z-10 space-y-10 pb-12 border-b border-white/5">
                <div className="flex items-center justify-between">
                    <Link 
                        to="/approver" 
                        className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-[#B5A1C2]/40 hover:text-primary transition-all"
                    >
                        <div className="p-2 rounded-lg bg-white/5 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                        </div>
                        Back_to_Queue
                    </Link>
                    <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-[#B5A1C2]/20">
                        <span className="text-primary/40">AUDIT_SESSION</span>
                        <span className="w-1 h-1 rounded-full bg-white/10" />
                        <span>NODE_ID: REQ-{cr.id}</span>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
                    <div className="space-y-6 max-w-3xl">
                        <div className="flex items-center gap-4">
                            <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-white/10 ${STATUS_MAP[cr.status]?.bg} ${STATUS_MAP[cr.status]?.glow || ''}`} style={{ color: STATUS_MAP[cr.status]?.color }}>
                                {STATUS_MAP[cr.status]?.label?.toUpperCase()}
                            </div>
                            <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#B5A1C2]/40">Decision_Intelligence_Module</span>
                        </div>
                        <h1 className="text-6xl font-light tracking-tighter text-white leading-[0.9] lg:text-7xl">
                            {cr.title}
                        </h1>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* ── LEFT: SPECIFICATIONS ── */}
                <div className="lg:col-span-8 space-y-10">
                    <div className="bg-[#0F051E]/60 backdrop-blur-3xl border border-white/5 p-10 xl:p-14 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-primary/10 transition-colors" />
                        
                        <div className="space-y-12">
                            <div className="space-y-6">
                                <h3 className="text-xs font-black uppercase tracking-[0.4em] text-[#B5A1C2]/40 flex items-center gap-3">
                                    <Terminal size={16} className="text-primary" /> Technical_Brief
                                </h3>
                                <div className="relative pl-6">
                                    <div className="absolute left-0 top-0 bottom-0 w-px bg-primary/20 shadow-[0_0_10px_rgba(209,140,255,0.3)]" />
                                    <p className="text-sm font-mono text-[#D5CBE5]/90 leading-relaxed whitespace-pre-wrap">{cr.description}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                                {[
                                    { label: 'Type', value: cr.change_type?.name, icon: <Layers size={14} /> },
                                    { label: 'System', value: cr.affected_system, icon: <Server size={14} /> },
                                    { label: 'Schedule', value: new Date(cr.planned_date).toLocaleDateString('fr-FR'), icon: <Calendar size={14} /> },
                                    { label: 'Author', value: cr.requester?.name, icon: <User size={14} /> },
                                    { label: 'Risk', value: cr.risk_level === 'high' ? 'HIGH' : cr.risk_level === 'medium' ? 'MEDIUM' : 'LOW', icon: <ShieldCheck size={14} />, color: cr.risk_level === 'high' ? 'text-rose-400' : cr.risk_level === 'medium' ? 'text-amber-400' : 'text-emerald-400' },
                                ].map((item, idx) => (
                                    <div key={idx} className="p-4 bg-white/[0.02] rounded-2xl border border-white/5 group/card hover:bg-white/[0.05] transition-all">
                                        <div className="text-primary/40 group-hover/card:text-primary transition-colors mb-3">{item.icon}</div>
                                        <p className="text-[8px] font-black uppercase tracking-widest text-[#B5A1C2]/20 mb-1">{item.label}</p>
                                        <p className={`text-[10px] font-bold truncate ${item.color || 'text-white'}`}>{item.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Timeline / History */}
                    {cr.histories?.length > 0 && (
                        <div className="bg-[#150522]/40 backdrop-blur-3xl border border-white/5 p-10 rounded-[3rem] shadow-2xl space-y-8">
                            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-[#B5A1C2]/40 flex items-center gap-3">
                                <History size={16} /> Chronologie du Dossier
                            </h3>
                            <div className="space-y-6">
                                {cr.histories.map((h) => (
                                    <div key={h.id} className="flex gap-6 p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[10px] font-black text-[#B5A1C2] shrink-0">
                                            {h.user?.name.charAt(0)}
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <div className="flex justify-between">
                                                <p className="text-xs font-bold text-white">{h.user?.name}</p>
                                                <span className="text-[9px] font-medium text-[#B5A1C2]/30 tabular-nums">{new Date(h.created_at).toLocaleString('fr-FR')}</span>
                                            </div>
                                            <div className="text-[10px] uppercase font-black tracking-widest text-primary/40">{h.status}</div>
                                            {h.comment && <p className="text-xs text-[#B5A1C2]/60 italic leading-relaxed">"{h.comment}"</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── RIGHT: DECISION CONSOLE ── */}
                <div className="lg:col-span-4 space-y-10">
                    <div className="bg-[#150522]/40 backdrop-blur-3xl border border-white/5 p-10 rounded-[3.5rem] shadow-2xl space-y-10 border-t-4 border-t-primary/20 sticky top-12">
                        <div className="space-y-2 text-center lg:text-left">
                            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-primary">Decision_Console</h3>
                            <p className="text-[11px] text-[#B5A1C2]/40 leading-relaxed italic">
                                En tant qu'approbateur, votre décision engage la responsabilité technique de l'infrastructure.
                            </p>
                        </div>

                        {cr.status === 'pending_approval' ? (
                            <div className="space-y-8">
                                {/* Implementer Selection */}
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#B5A1C2]/40 flex items-center gap-2">
                                        <UserCheck size={14} className="text-primary" /> Assigner les Implémenteurs
                                    </label>
                                    <div className="grid grid-cols-1 gap-2 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                                        {implementers.map(u => (
                                            <button
                                                key={u.id}
                                                type="button"
                                                onClick={() => handleImplementerToggle(u.id)}
                                                className={`flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${
                                                    selectedImplementers.includes(u.id) 
                                                    ? 'bg-primary/20 border-primary shadow-[0_0_20px_rgba(209,140,255,0.1)]' 
                                                    : 'bg-white/5 border-white/5 text-[#B5A1C2]/40 hover:bg-white/10'
                                                }`}
                                            >
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-white">{u.name}</span>
                                                    <span className="text-[9px] text-[#B5A1C2]/40 uppercase tracking-tighter">{u.email}</span>
                                                </div>
                                                {selectedImplementers.includes(u.id) && <CheckCircle2 size={16} className="text-primary" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Conditions */}
                                <div className="space-y-4 group">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#B5A1C2]/40 flex items-center gap-2">
                                        <Info size={14} className="text-primary" /> Conditions d'approbation
                                    </label>
                                    <textarea
                                        value={approvalConditions}
                                        onChange={e => setApprovalConditions(e.target.value)}
                                        rows={2}
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-xs text-white placeholder:text-[#816A9E]/30 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all resize-none"
                                        placeholder="Spécifiez les prérequis techniques (ex: Test backup, monitoring actif)..."
                                    />
                                </div>

                                {/* Comment */}
                                <div className="space-y-4 group">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#B5A1C2]/40 flex items-center gap-2">
                                        <MessageSquare size={14} className="text-primary" /> Avis Décisionnel
                                    </label>
                                    <textarea
                                        value={comment}
                                        onChange={e => setComment(e.target.value)}
                                        rows={3}
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-xs text-white placeholder:text-[#816A9E]/30 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all resize-none"
                                        placeholder="Justifiez votre décision (Indispensable pour un rejet)..."
                                    />
                                </div>

                                <AnimatePresence>
                                    {error && (
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3 text-[10px] font-bold text-rose-400"
                                        >
                                            <AlertCircle size={14} />
                                            {error}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => handleAction('approve')}
                                        disabled={submitting}
                                        className="py-5 rounded-2xl bg-primary text-[#0F051E] font-black uppercase tracking-widest text-[11px] hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/20 disabled:opacity-50"
                                    >
                                        {submitting ? 'Traitement...' : 'Approuver'}
                                    </button>
                                    <button
                                        onClick={() => handleAction('reject')}
                                        disabled={submitting}
                                        className="py-5 rounded-2xl bg-white/5 border border-white/5 text-rose-400 font-black uppercase tracking-widest text-[11px] hover:bg-rose-500/10 hover:border-rose-500/30 transition-all disabled:opacity-50"
                                    >
                                        Rejeter
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="py-20 text-center space-y-6 bg-white/[0.02] rounded-[2.5rem] border border-dashed border-white/5">
                                <ShieldCheck size={48} className="mx-auto text-emerald-500/20" />
                                <div className="space-y-2">
                                    <p className="text-sm font-bold text-emerald-400">Action déjà effectuée</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#B5A1C2]/20">La décision pour ce dossier a été verrouillée par {cr.implementer?.name || 'le système'}.</p>
                                </div>
                                <button
                                    onClick={() => navigate('/approver')}
                                    className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
                                >
                                    Retourner au registre →
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}