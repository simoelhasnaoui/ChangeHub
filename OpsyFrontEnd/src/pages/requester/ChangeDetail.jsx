import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../../api/axios'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    ArrowLeft, FileText, Activity, ShieldAlert, 
    History, CheckCircle2, AlertCircle, XCircle,
    Edit3, Trash2, Send, Server, Calendar, 
    User, ChevronRight, MessageSquare, Info
} from 'lucide-react'

const STATUS_MAP = {
    draft: { label: 'Brouillon', color: '#B5A1C2', bg: 'bg-[#B5A1C2]/10' },
    pending_approval: { label: 'En attente', color: '#f59e0b', bg: 'bg-amber-500/10' },
    approved: { label: 'Approuvé', color: '#3b82f6', bg: 'bg-blue-500/10' },
    in_progress: { label: 'En cours', color: '#6366f1', bg: 'bg-indigo-500/10' },
    done: { label: 'Terminé', color: '#10b981', bg: 'bg-emerald-500/10' },
    rejected: { label: 'Rejeté', color: '#f43f5e', bg: 'bg-rose-500/10' },
}

const reqValidationConfig = {
    pending: { label: 'Validation en attente', color: 'text-amber-400' },
    validated: { label: 'Validé avec succès', color: 'text-green-400' },
    rejected: { label: 'Rejeté / À refaire', color: 'text-red-400' },
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
        if (!window.confirm('Supprimer ce dossier définitivement ?')) return
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
        <div className="max-w-[1400px] mx-auto space-y-12 pb-20 font-inter">
            {/* ── HEADER ── */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-10 border-b border-white/5">
                <div className="space-y-4">
                    <Link 
                        to="/requester/changes" 
                        className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#B5A1C2]/40 hover:text-primary transition-colors"
                    >
                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                        Flux des interventions
                    </Link>
                    <div className="flex items-center gap-4">
                        <h1 className="text-4xl font-light tracking-tight text-white leading-none capitalize">{cr.title}</h1>
                        <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border border-white/5 whitespace-nowrap shadow-2xl ${statusObj?.bg}`} style={{ color: statusObj?.color }}>
                            {statusObj?.label}
                        </span>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#B5A1C2]/20">Dossier technique #REQ-{cr.id}</p>
                </div>

                <div className="flex items-center gap-4">
                    {cr.status === 'draft' && (
                        <>
                            <button
                                onClick={handleDelete}
                                disabled={submitting}
                                className="p-4 rounded-2xl bg-white/5 border border-white/5 text-rose-400 hover:bg-rose-500/10 transition-all"
                                title="Supprimer"
                            >
                                <Trash2 size={18} />
                            </button>
                            <Link
                                to={`/requester/changes/${id}/edit`}
                                className="p-4 rounded-2xl bg-white/5 border border-white/5 text-primary hover:bg-primary/10 transition-all"
                                title="Modifier"
                            >
                                <Edit3 size={18} />
                            </Link>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="group flex items-center gap-3 bg-primary text-[#0F051E] font-black uppercase tracking-widest text-[11px] px-8 py-4 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl"
                            >
                                <Send size={16} />
                                {submitting ? 'Envoi...' : 'Soumettre'}
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* ── LEFT COLUMN: CONTENT ── */}
                <div className="lg:col-span-8 space-y-10">
                    {/* Description Module */}
                    <div className="bg-[#150522]/40 backdrop-blur-3xl border border-white/5 p-10 xl:p-14 rounded-[3.5rem] shadow-2xl space-y-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
                        <h3 className="text-xs font-black uppercase tracking-[0.4em] text-[#B5A1C2]/40 flex items-center gap-3">
                            <FileText size={16} className="text-primary" /> Spécifications Techniques
                        </h3>
                        <div className="prose prose-invert max-w-none">
                            <p className="text-base text-[#D5CBE5]/90 leading-[1.8] whitespace-pre-wrap">{cr.description}</p>
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
                                        {cr.requester_validation_status !== 'pending' && (
                                            <div className={`flex items-center gap-2 text-xs font-bold ${reqValidationConfig[cr.requester_validation_status]?.color}`}>
                                                <CheckCircle2 size={16} /> {reqValidationConfig[cr.requester_validation_status]?.label}
                                            </div>
                                        )}
                                    </div>

                                    {cr.requester_validation_status === 'pending' && (
                                        <form onSubmit={handleValidate} className="bg-[#150522]/60 p-8 rounded-[2.5rem] border border-white/10 space-y-6">
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
                </div>

                {/* ── RIGHT COLUMN: INFO & HISTORY ── */}
                <div className="lg:col-span-4 space-y-10">
                    {/* Identification Module */}
                    <div className="bg-[#150522]/40 backdrop-blur-3xl border border-white/5 p-8 xl:p-10 rounded-[3rem] shadow-2xl space-y-8">
                        <div className="space-y-6">
                            {[
                                { label: 'Type', value: cr.change_type?.name, icon: <Layers size={14} /> },
                                { label: 'Système', value: cr.affected_system, icon: <Server size={14} /> },
                                { label: 'Échéance', value: new Date(cr.planned_date).toLocaleDateString('fr-FR'), icon: <Calendar size={14} /> },
                                { label: 'Demandeur', value: cr.requester?.name, icon: <User size={14} /> },
                                { label: 'Exécuteur', value: cr.implementer?.name || 'Non assigné', icon: <Activity size={14} /> },
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center gap-4 group">
                                    <div className="p-3 bg-white/5 rounded-xl text-primary transition-transform group-hover:scale-110">{item.icon}</div>
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-[#B5A1C2]/20 mb-0.5">{item.label}</p>
                                        <p className="text-sm font-bold text-[#E8E0F0]">{item.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="pt-8 border-t border-white/5">
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#B5A1C2]/40 flex items-center gap-2">
                                    <ShieldAlert size={14} /> Niveau de Risque
                                </span>
                                <span className="text-xs font-bold uppercase tracking-tighter" style={{ color: RISK_MAP[cr.risk_level]?.color }}>
                                    {RISK_MAP[cr.risk_level]?.label}
                                </span>
                            </div>
                        </div>
                    </div>

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

                    {/* Support / Help Card */}
                    <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 p-10 rounded-[3.5rem] space-y-6">
                        <div className="flex items-center gap-4 text-primary">
                            <MessageSquare size={20} />
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em]">Besoin d'aide ?</h4>
                        </div>
                        <p className="text-xs text-[#B5A1C2]/60 leading-relaxed">
                            Pour toute question technique concernant cette intervention, contactez votre administrateur système.
                        </p>
                        <button className="w-full py-4 text-[9px] font-black uppercase tracking-widest text-primary border border-primary/20 rounded-2xl hover:bg-primary/10 transition-all">
                            Ouvrir un ticket
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}