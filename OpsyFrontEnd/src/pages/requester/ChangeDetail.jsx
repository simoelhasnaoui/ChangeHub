import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../../api/axios'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    ArrowLeft, FileText, Activity, ShieldAlert, 
    History, CheckCircle2, AlertCircle, XCircle,
    Edit3, Trash2, Send, Server, Calendar, 
    User, ChevronRight, MessageSquare, Info, Layers
} from 'lucide-react'
import ConfirmModal from '../../components/ConfirmModal'

const STATUS_MAP = {
    draft: { label: 'Brouillon', color: '#B5A1C2', bg: 'bg-[#B5A1C2]/10' },
    pending_approval: { label: 'En attente', color: '#f59e0b', bg: 'bg-amber-500/10' },
    approved: { label: 'Approuvé', color: '#3b82f6', bg: 'bg-blue-500/10' },
    in_progress: { label: 'En cours', color: '#6366f1', bg: 'bg-indigo-500/10' },
    done: { label: 'Terminé', color: '#10b981', bg: 'bg-emerald-500/10' },
    rejected: { label: 'Rejeté', color: '#f43f5e', bg: 'bg-rose-500/10', glow: 'shadow-[0_0_30px_rgba(244,63,94,0.2)]' },
}

const MODULE_GLOWS = {
    draft: 'from-[#B5A1C2]/10 to-transparent',
    pending_approval: 'from-amber-500/10 to-transparent',
    approved: 'from-blue-500/10 to-transparent',
    in_progress: 'from-indigo-500/10 to-transparent',
    done: 'from-emerald-500/10 to-transparent',
    rejected: 'from-rose-500/10 to-transparent',
}

const reqValidationConfig = {
    pending: { label: 'Validation en attente', color: 'text-amber-400' },
    validated: { label: 'Validé avec succès', color: 'text-green-400' },
    rejected: { label: 'Rejeté / À refaire', color: 'text-red-400' },
}

const RISK_MAP = {
    low: { label: 'Faible', color: '#10b981' },
    medium: { label: 'Moyen', color: '#f59e0b' },
    high: { label: 'Élevé', color: '#f43f5e' },
}

export default function ChangeDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [cr, setCr] = useState(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState(null)

    // Validation state
    const [validationStatus, setValidationStatus] = useState('')
    const [validationComment, setValidationComment] = useState('')
    const [validating, setValidating] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [showAppealForm, setShowAppealForm] = useState(false)
    const [appealComment, setAppealComment] = useState('')
    const [appealing, setAppealing] = useState(false)

    const load = async () => {
        setError(null)
        try {
            const r = await api.get(`/change-requests/${id}`)
            setCr(r.data)
        } catch (err) {
            const msg = err.response?.data?.message || `Erreur ${err.response?.status || ''}`
            setError(msg)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [id])

    const handleSubmit = async () => {
        setSubmitting(true)
        try {
            await api.post(`/change-requests/${id}/submit`)
            await load()
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async () => {
        setShowDeleteConfirm(true)
    }

    const executeDelete = async () => {
        setShowDeleteConfirm(false)
        setSubmitting(true)
        try {
            await api.delete(`/change-requests/${id}`)
            navigate('/requester/changes')
        } catch (err) {
            alert('Erreur lors de la suppression.')
            setSubmitting(false)
        }
    }

    const handleValidate = async (e) => {
        e.preventDefault()
        setValidating(true)
        try {
            await api.post(`/change-requests/${id}/validate`, {
                validation_status: validationStatus,
                comment: validationComment
            })
            await load()
        } catch (err) {
            alert(err.response?.data?.message || 'Erreur.')
        } finally {
            setValidating(false)
        }
    }

    const handleAppeal = async (e) => {
        e.preventDefault()
        if (!appealComment.trim()) return
        setAppealing(true)
        try {
            await api.post(`/change-requests/${id}/appeal`, {
                comment: appealComment
            })
            setAppealComment('')
            setShowAppealForm(false)
            await load()
        } catch (err) {
            alert(err.response?.data?.message || 'Erreur lors de l\'appel.')
        } finally {
            setAppealing(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
                <div className="w-20 h-20 border-2 border-white/5 border-t-primary rounded-full animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary animate-pulse">Chargement du dossier technique...</p>
            </div>
        )
    }

    if (error || !cr) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
                <XCircle size={48} className="text-rose-500/20" />
                <p className="text-sm font-bold text-white tracking-widest">{error || 'Dossier introuvable'}</p>
                <Link to="/requester/changes" className="text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:underline">Retour au flux →</Link>
            </div>
        )
    }

    const statusObj = STATUS_MAP[cr.status]

    return (
        <>
            <div className="max-w-[1400px] mx-auto space-y-12 pb-20 font-inter">
            {/* ── ATMOSPHERIC BACKGROUND ── */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] opacity-20 bg-gradient-to-br ${MODULE_GLOWS[cr.status]}`} />
                <div className={`absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full blur-[100px] opacity-10 bg-gradient-to-tl ${MODULE_GLOWS[cr.status]}`} />
            </div>

            {/* ── CINEMATIC HEADER ── */}
            <div className="relative z-10 space-y-10 pb-12 border-b border-white/5">
                <div className="flex items-center justify-between">
                    <Link 
                        to="/requester/changes" 
                        className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-[#B5A1C2]/40 hover:text-primary transition-all"
                    >
                        <div className="p-2 rounded-lg bg-white/5 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                        </div>
                        Back_to_Flow
                    </Link>
                    <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-[#B5A1C2]/20">
                        <span className="text-primary/40">NODE_SESSION</span>
                        <span className="w-1 h-1 rounded-full bg-white/10" />
                        <span>REQ-{cr.id}</span>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12">
                    <div className="space-y-6 max-w-3xl">
                        <div className="flex items-center gap-4">
                            <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border border-white/10 ${statusObj?.bg} ${statusObj?.glow || ''}`} style={{ color: statusObj?.color }}>
                                {statusObj?.label}
                            </div>
                            <span className="w-1.5 h-1.5 rounded-full bg-white/10" />
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#B5A1C2]/40">Intelligence_Dossier</span>
                        </div>
                        <h1 className="text-6xl font-light tracking-tighter text-white leading-[0.9] lg:text-7xl">
                            {cr.title}
                        </h1>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                        <AnimatePresence>
                            {cr.status === 'draft' && (
                                <motion.div 
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-center gap-4"
                                >
                                    <button
                                        onClick={handleDelete}
                                        disabled={submitting}
                                        className="p-5 rounded-3xl bg-white/5 border border-white/5 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all group overflow-hidden relative"
                                        title="Supprimer"
                                    >
                                        <div className="absolute inset-0 bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <Trash2 size={20} className="relative z-10" />
                                    </button>
                                    <Link
                                        to={`/requester/changes/${id}/edit`}
                                        className="p-5 rounded-3xl bg-white/5 border border-white/5 text-primary hover:bg-primary/10 hover:border-primary/20 transition-all group overflow-hidden relative"
                                        title="Modifier"
                                    >
                                        <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <Edit3 size={20} className="relative z-10" />
                                    </Link>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={submitting}
                                        className="group relative flex items-center gap-4 bg-primary text-[#0F051E] font-black uppercase tracking-[0.2em] text-[11px] px-10 py-5 rounded-[2rem] hover:scale-105 active:scale-95 transition-all shadow-[0_20px_40px_rgba(209,140,255,0.2)] overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
                                        <Send size={18} className="relative z-10" />
                                        <span className="relative z-10">{submitting ? 'Transmitting...' : 'Commit_to_CAB'}</span>
                                    </button>
                                </motion.div>
                            )}
                            {cr.status === 'rejected' && (
                                <motion.div 
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-center gap-4"
                                >
                                    <button
                                        onClick={() => setShowAppealForm(!showAppealForm)}
                                        className="group relative flex items-center gap-4 bg-rose-500 text-white font-black uppercase tracking-[0.2em] text-[11px] px-10 py-5 rounded-[2rem] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-rose-500/20 overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
                                        <ShieldAlert size={18} className="relative z-10" />
                                        <span className="relative z-10">{showAppealForm ? 'Fermer_Console' : 'Interjeter_Appel'}</span>
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* ── LEFT COLUMN: CONTENT ── */}
                <div className="lg:col-span-8 space-y-10">
                    {/* Technical Console Module */}
                    <div className="group relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[3.5rem]" />
                        <div className="relative bg-[#0F051E]/80 backdrop-blur-3xl border border-white/5 p-10 xl:p-14 rounded-[3.5rem] shadow-2xl space-y-10">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xs font-black uppercase tracking-[0.4em] text-[#B5A1C2]/40 flex items-center gap-3">
                                    <Layers size={16} className="text-primary" /> Spécifications_Techniques
                                </h3>
                                <div className="flex gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-rose-500/20" />
                                    <div className="w-2 h-2 rounded-full bg-amber-500/20" />
                                    <div className="w-2 h-2 rounded-full bg-emerald-500/20" />
                                </div>
                            </div>
                            
                            <div className="relative group/console">
                                <div className="absolute -left-6 top-0 bottom-0 w-px bg-white/5" />
                                <pre className="font-mono text-sm text-[#D5CBE5]/90 leading-relaxed whitespace-pre-wrap pl-2 h-full">
                                    <div className="absolute -left-12 top-0 text-[10px] font-mono text-white/5 select-none leading-relaxed">
                                        {cr.description.split('\n').map((_, i) => (
                                            <div key={i}>{String(i + 1).padStart(2, '0')}</div>
                                        ))}
                                    </div>
                                    {cr.description}
                                </pre>
                            </div>
                        </div>
                    </div>

                    {/* Report Module (Implementation Analysis) */}
                    {cr.analysis && (
                        <div className="bg-[#150522]/40 backdrop-blur-3xl border border-white/5 p-10 xl:p-14 rounded-[3.5rem] shadow-2xl space-y-10 border-l-4 border-l-emerald-500/30">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xs font-black uppercase tracking-[0.4em] text-[#B5A1C2]/40 flex items-center gap-3 text-emerald-400">
                                    <CheckCircle2 size={16} /> Rapport d'exécution
                                </h3>
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400/40 bg-emerald-400/5 px-3 py-1 rounded-full border border-emerald-400/10">LIVRÉ</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#B5A1C2]/20">Analyse d'Impact</p>
                                    <p className="text-sm text-[#E8E0F0] leading-relaxed whitespace-pre-wrap">{cr.analysis.impact_analysis}</p>
                                </div>
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#B5A1C2]/20">Résumé de l'Opération</p>
                                    <p className="text-sm text-[#E8E0F0] leading-relaxed whitespace-pre-wrap">{cr.analysis.execution_summary}</p>
                                </div>
                                <div className="col-span-full pt-8 border-t border-white/5 space-y-4">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#B5A1C2]/20">Validation du Rollback</p>
                                    <p className="text-sm text-emerald-400/80 leading-relaxed italic">{cr.analysis.rollback_tests || 'Tests de retour arrière validés sans exception.'}</p>
                                </div>
                            </div>

                            {/* Incidents Module */}
                            {cr.incidents && cr.incidents.length > 0 && (
                                <div className="pt-10 border-t border-white/5 space-y-6">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-rose-500 flex items-center gap-2">
                                        <AlertCircle size={14} /> Alertes Incidents ({cr.incidents.length})
                                    </h4>
                                    <div className="space-y-4">
                                        {cr.incidents.map(inc => (
                                            <div key={inc.id} className="bg-rose-500/5 border border-rose-500/10 p-6 rounded-3xl space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <span className="text-sm font-bold text-rose-100">{inc.title}</span>
                                                    <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border border-rose-500/20 text-rose-400">SEV_{inc.severity.toUpperCase()}</span>
                                                </div>
                                                <p className="text-xs text-rose-100/60 leading-relaxed">{inc.description}</p>
                                                <div className="bg-emerald-950/20 p-4 rounded-2xl border border-emerald-500/10 flex items-center gap-4">
                                                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                                                    <div className="text-[10px]">
                                                        <span className="font-black uppercase tracking-widest text-emerald-400 mr-2">Résolu :</span>
                                                        <span className="text-emerald-400/60 font-medium">Temps de résolution {inc.time_to_resolve_minutes} min • {inc.resolution}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Requester Validation UI */}
                            {cr.status === 'done' && (
                                <div className="pt-10 border-t border-white/5 space-y-8">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-[#E8E0F0]">Action Requise : Évaluation de Livraison</h3>
                                        {cr.requester_validation_status === 'validated' && (
                                            <div className={`flex items-center gap-2 text-xs font-bold ${reqValidationConfig[cr.requester_validation_status]?.color}`}>
                                                <CheckCircle2 size={16} /> {reqValidationConfig[cr.requester_validation_status]?.label}
                                            </div>
                                        )}
                                    </div>

                                    {(cr.requester_validation_status === 'pending' || cr.requester_validation_status === 'rejected') && (
                                        <form onSubmit={handleValidate} className="bg-[#150522]/60 p-8 rounded-[2.5rem] border border-white/10 space-y-6">
                                            {cr.requester_validation_status === 'rejected' && (
                                                <p className="text-[10px] font-black uppercase tracking-widest text-amber-400/90 border border-amber-500/20 bg-amber-500/5 rounded-2xl px-4 py-3">
                                                    Nouvelle livraison : merci de confirmer ou de signaler à nouveau si le correctif est encore insuffisant.
                                                </p>
                                            )}
                                            <p className="text-xs text-[#B5A1C2]/60 leading-relaxed italic">
                                                Confirmez-vous que les fonctionnalités ou correctifs ont été livrés conformément aux spécifications techniques ?
                                            </p>
                                            
                                            <div className="flex flex-wrap gap-4">
                                                <label className={`flex-1 min-w-[200px] flex items-center justify-center gap-3 border transition-all px-6 py-4 rounded-2xl cursor-pointer ${validationStatus === 'validated' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-white/5 border-white/5 text-[#B5A1C2]/40 hover:bg-white/10'}`}>
                                                    <input type="radio" name="validation" value="validated" required 
                                                        onChange={(e) => setValidationStatus(e.target.value)} 
                                                        className="hidden" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Confirmer la Livraison</span>
                                                </label>
                                                <label className={`flex-1 min-w-[200px] flex items-center justify-center gap-3 border transition-all px-6 py-4 rounded-2xl cursor-pointer ${validationStatus === 'rejected' ? 'bg-rose-500/20 border-rose-500 text-rose-400' : 'bg-white/5 border-white/5 text-[#B5A1C2]/40 hover:bg-white/10'}`}>
                                                    <input type="radio" name="validation" value="rejected" required 
                                                        onChange={(e) => setValidationStatus(e.target.value)} 
                                                        className="hidden" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Signaler une erreur</span>
                                                </label>
                                            </div>
                                            
                                            <AnimatePresence>
                                                {validationStatus === 'rejected' && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        className="space-y-2"
                                                    >
                                                        <label className="text-[9px] font-black uppercase tracking-widest text-[#B5A1C2]/40 ml-1">Observation de rejet</label>
                                                        <textarea
                                                            required placeholder="Détaillez les anomalies constatées..."
                                                            value={validationComment} onChange={(e) => setValidationComment(e.target.value)}
                                                            rows="3" className="w-full bg-rose-500/5 border border-rose-500/20 rounded-2xl px-5 py-4 text-xs text-white focus:outline-none focus:ring-1 focus:ring-rose-500/50 transition-all resize-none placeholder:text-rose-500/20"
                                                        />
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            <div className="pt-4">
                                                <button disabled={validating || !validationStatus} type="submit"
                                                    className="w-full bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 text-white font-black uppercase tracking-[0.2em] text-[10px] py-5 rounded-2xl transition-all disabled:opacity-50">
                                                    {validating ? 'Validation en cours...' : 'Transmettre l\'évaluation technique'}
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Appeal Console Module */}
                    <AnimatePresence>
                        {cr.status === 'rejected' && showAppealForm && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="bg-rose-500/5 backdrop-blur-3xl border border-rose-500/20 p-10 xl:p-14 rounded-[3.5rem] shadow-2xl space-y-10"
                            >
                                <div className="flex justify-between items-center">
                                    <h3 className="text-xs font-black uppercase tracking-[0.4em] text-rose-400 flex items-center gap-3">
                                        <ShieldAlert size={16} /> Console_Intervention_Appel
                                    </h3>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-rose-500/40 bg-rose-500/5 px-3 py-1 rounded-full border border-rose-500/10">PROTOCOL_A2</span>
                                </div>

                                <div className="space-y-8">
                                    <p className="text-xs text-rose-100/60 leading-relaxed italic">
                                        L'appel permet de soumettre de nouveau le dossier aux approbeurs avec une justification complémentaire. Expliquez pourquoi cette décision devrait être reconsidérée.
                                    </p>

                                    <form onSubmit={handleAppeal} className="space-y-6">
                                        <div className="space-y-3">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-rose-500/40 ml-1">Arguments_Justificatifs</label>
                                            <textarea
                                                required
                                                placeholder="Saisissez vos arguments techniques ou organisationnels..."
                                                value={appealComment}
                                                onChange={(e) => setAppealComment(e.target.value)}
                                                rows="4"
                                                className="w-full bg-rose-500/5 border border-rose-500/20 rounded-[2rem] px-8 py-6 text-sm text-white focus:outline-none focus:ring-2 focus:ring-rose-500/30 transition-all resize-none placeholder:text-rose-500/20"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={appealing || !appealComment.trim()}
                                            className="w-full relative flex items-center justify-center gap-4 bg-rose-500 text-white font-black uppercase tracking-[0.3em] text-[11px] py-6 rounded-[2rem] hover:bg-rose-400 transition-all shadow-xl shadow-rose-500/20 disabled:opacity-50 group"
                                        >
                                            <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                            <span>{appealing ? 'TRANSMISSION_EN_COURS...' : 'TRANSMETTRE_L_APPEL'}</span>
                                        </button>
                                    </form>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    {/* Timeline Module */}
                    <div className="bg-[#150522]/40 backdrop-blur-3xl border border-white/5 p-10 rounded-[3.5rem] shadow-2xl space-y-8">
                        <h3 className="text-xs font-black uppercase tracking-[0.4em] text-[#B5A1C2]/40 flex items-center gap-3">
                            <History size={16} /> Historique & Logs
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
                                        <div className="inline-flex items-center px-2 py-0.5 rounded-lg bg-white/5 text-[9px] font-black uppercase tracking-widest text-[#B5A1C2]/60">
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

                            {cr.histories.length === 0 && (
                                <p className="text-[10px] text-[#B5A1C2]/20 italic py-4">Aucun log enregistré pour ce dossier.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── RIGHT COLUMN: INFO & HISTORY ── */}
                <div className="lg:col-span-4 space-y-10">
                    {/* Modular Identification Group */}
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: 'Type', value: cr.change_type?.name, icon: <Layers size={16} /> },
                                { label: 'Cible', value: cr.affected_system, icon: <Server size={16} /> },
                            ].map((item, idx) => (
                                <div key={idx} className="bg-[#150522]/40 backdrop-blur-3xl border border-white/5 p-6 rounded-3xl group hover:border-primary/20 transition-all">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                                        {item.icon}
                                    </div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-[#B5A1C2]/20 mb-1">{item.label}</p>
                                    <p className="text-sm font-bold text-white truncate">{item.value}</p>
                                </div>
                            ))}
                        </div>

                        <div className="bg-[#150522]/40 backdrop-blur-3xl border border-white/5 p-8 rounded-[2.5rem] space-y-8">
                            {[
                                { label: 'Planning', value: new Date(cr.planned_date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }), icon: <Calendar size={14} />, sub: 'Date d\'exécution prévue' },
                                { label: 'Responsable', value: cr.requester?.name, icon: <User size={14} />, sub: 'Auteur du dossier (Requester)' },
                                { label: 'Équipe OPS', value: cr.implementers?.length > 0 ? `${cr.implementers.length} Spécialistes` : 'Non assigné', icon: <Activity size={14} />, sub: cr.implementers?.map(i => i.name).join(', ') || 'En attente de déploiement' },
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-start gap-4 group">
                                    <div className="mt-1 p-2.5 bg-white/5 rounded-xl text-primary/60 group-hover:text-primary transition-colors">{item.icon}</div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/80">{item.value}</p>
                                        <p className="text-[9px] text-[#B5A1C2]/30 mt-0.5">{item.sub}</p>
                                    </div>
                                </div>
                            ))}

                            <div className="pt-8 border-t border-white/5">
                                <div className="flex items-center justify-between p-5 rounded-2xl bg-white/[0.02] border border-white/5 group hover:border-white/10 transition-all cursor-help">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400 opacity-60">
                                            <ShieldAlert size={14} />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[#B5A1C2]/40">Risk_Matrix</span>
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-tighter" style={{ color: RISK_MAP[cr.risk_level]?.color }}>
                                        LVL_{cr.risk_level.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>


                </div>
            </div>
        </div>

        <ConfirmModal
            isOpen={showDeleteConfirm}
            onConfirm={executeDelete}
            onCancel={() => setShowDeleteConfirm(false)}
            title="Supprimer le dossier"
            message="Ce dossier et toutes les données associées seront définitivement supprimés. Cette action est irréversible."
            confirmText="Supprimer"
            cancelText="Annuler"
            danger={true}
        />
        </>
    )
}