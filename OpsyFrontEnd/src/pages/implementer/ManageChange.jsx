import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../../api/axios'
import { generateReport } from '../../utils/generateReport'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    ArrowLeft, Activity, CheckCircle2, AlertCircle, 
    FileText, ShieldCheck, Server, Layers, Calendar, 
    User, ChevronRight, Save, Download, Plus, Trash2,
    Info, AlertTriangle, Clock
} from 'lucide-react'

export default function ManageChange() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [cr, setCr] = useState(null)
    const [loading, setLoading] = useState(true)
    const [comment, setComment] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [analysis, setAnalysis] = useState({
        incident_occurred: false, description: '', impact: '', solution: '', incidents: []
    })
    const [savingAnalysis, setSavingAnalysis] = useState(false)
    const [error, setError] = useState('')

    const load = async () => {
        try {
            const r = await api.get(`/change-requests/${id}`)
            setCr(r.data)
            if (r.data.analysis) {
                setAnalysis({
                    ...r.data.analysis,
                    incidents: r.data.incidents || []
                })
            } else if (r.data.incidents) {
                setAnalysis(a => ({ ...a, incidents: r.data.incidents }))
            }
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [id])

    const handleStatusUpdate = async (status) => {
        setSubmitting(true)
        setError('')
        try {
            await api.post(`/change-requests/${id}/update-status`, { status, comment })
            await load()
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la mise à jour.')
        } finally {
            setSubmitting(false)
        }
    }

    const handleAnalysis = async (e) => {
        e.preventDefault()
        setSavingAnalysis(true)
        try {
            await api.post(`/change-requests/${id}/analysis`, analysis)
            const freshCr = await api.get(`/change-requests/${id}`).then(r => r.data)
            setCr(freshCr)
            generateReport(freshCr, freshCr.analysis || analysis)
        } finally {
            setSavingAnalysis(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
                <div className="w-20 h-20 border-2 border-white/5 border-t-primary rounded-full animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary animate-pulse">Initialisation du Terminal d'Implémentation...</p>
            </div>
        )
    }

    if (!cr) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 text-rose-400">
                <AlertCircle size={48} />
                <p className="text-sm font-bold uppercase tracking-widest">Dossier technique introuvable</p>
                <Link to="/implementer" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">Retour au pipeline →</Link>
            </div>
        )
    }

    return (
        <div className="max-w-[1400px] mx-auto space-y-12 pb-20 font-inter">
            {/* ── HEADER ── */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-10 border-b border-white/5">
                <div className="space-y-4">
                    <Link 
                        to="/implementer" 
                        className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#B5A1C2]/40 hover:text-primary transition-colors"
                    >
                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                        Retour au pipeline
                    </Link>
                    <div className="flex items-center gap-4">
                        <h1 className="text-4xl font-light tracking-tight text-white leading-none capitalize">{cr.title}</h1>
                        <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border border-white/5 whitespace-nowrap shadow-2xl bg-primary/10 text-primary`}>
                            {cr.status}
                        </span>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#B5A1C2]/20">EXECUTION_NODE: REQ-{cr.id}</p>
                </div>

                <div className="flex items-center gap-4">
                    {cr.analysis && (
                        <button
                            onClick={() => generateReport(cr, cr.analysis)}
                            className="group flex items-center gap-3 bg-white/5 text-white font-black uppercase tracking-widest text-[11px] px-8 py-4 rounded-2xl hover:bg-white/10 border border-white/5 transition-all shadow-2xl"
                        >
                            <Download size={16} className="text-primary" />
                            Générer PV
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* ── LEFT: SPECS & STATUS ── */}
                <div className="lg:col-span-12 xl:col-span-5 space-y-10">
                    <div className="bg-[#150522]/40 backdrop-blur-3xl border border-white/5 p-10 xl:p-12 rounded-[3.5rem] shadow-2xl space-y-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
                        
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-[0.4em] text-[#B5A1C2]/40 flex items-center gap-3 mb-6">
                                    <FileText size={16} className="text-primary" /> Spécifications
                                </h3>
                                <p className="text-sm text-[#D5CBE5]/80 leading-relaxed whitespace-pre-wrap">{cr.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-6 p-6 bg-white/[0.02] rounded-3xl border border-white/5">
                                {[
                                    { label: 'Cible', value: cr.affected_system, icon: <Server size={14} /> },
                                    { label: 'Type', value: cr.change_type?.name, icon: <Layers size={14} /> },
                                    { label: 'Date', value: new Date(cr.planned_date).toLocaleDateString('fr-FR'), icon: <Calendar size={14} /> },
                                    { label: 'Auteur', value: cr.requester?.name, icon: <User size={14} /> },
                                ].map((item, idx) => (
                                    <div key={idx} className="space-y-1">
                                        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-[#B5A1C2]/20">
                                            {item.icon} {item.label}
                                        </div>
                                        <p className="text-[11px] font-bold text-[#D5CBE5]">{item.value}</p>
                                    </div>
                                ))}
                            </div>

                            {cr.approval_conditions && (
                                <div className="bg-amber-500/5 border border-amber-500/20 p-8 rounded-[2.5rem] space-y-4">
                                    <div className="flex items-center gap-3 text-amber-500">
                                        <ShieldCheck size={18} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Conditions d'implémentation</span>
                                    </div>
                                    <p className="text-xs text-[#E8E0F0] leading-relaxed italic">"{cr.approval_conditions}"</p>
                                </div>
                            )}
                        </div>

                        {/* STATUS TRANSITIONS */}
                        {(cr.status === 'approved' || cr.status === 'in_progress') && (
                            <div className="pt-10 border-t border-white/5 space-y-8">
                                <div className="space-y-2 group">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#B5A1C2]/40 ml-1">Journal de session (Optionnel)</label>
                                    <textarea
                                        value={comment}
                                        onChange={e => setComment(e.target.value)}
                                        rows={2}
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-xs text-white placeholder:text-[#816A9E]/30 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all resize-none shadow-inner"
                                        placeholder="Logs techniques, observations lors du déploiement..."
                                    />
                                </div>

                                {error && (
                                    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[10px] font-bold text-rose-400">
                                        {error}
                                    </div>
                                )}

                                <div className="grid grid-cols-1 gap-4">
                                    {cr.status === 'approved' && (
                                        <button
                                            onClick={() => handleStatusUpdate('in_progress')}
                                            disabled={submitting}
                                            className="group flex items-center justify-center gap-3 bg-primary text-[#0F051E] font-black uppercase tracking-widest text-[11px] py-5 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-primary/20"
                                        >
                                            <Activity size={16} />
                                            {submitting ? 'Activation...' : 'Démarrer l\'opération'}
                                        </button>
                                    )}
                                    {cr.status === 'in_progress' && (
                                        <button
                                            onClick={() => handleStatusUpdate('done')}
                                            disabled={submitting}
                                            className="group flex items-center justify-center gap-3 bg-emerald-500 text-[#0F051E] font-black uppercase tracking-widest text-[11px] py-5 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-emerald-500/20"
                                        >
                                            <CheckCircle2 size={16} />
                                            {submitting ? 'Validation...' : 'Clôturer l\'intervention'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── RIGHT: POST-CHANGE ANALYSIS ── */}
                <div className="lg:col-span-12 xl:col-span-7">
                    <AnimatePresence mode="wait">
                        {cr.status === 'done' ? (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-[#150522]/40 backdrop-blur-3xl border border-white/5 p-10 xl:p-14 rounded-[3.5rem] shadow-2xl space-y-10"
                            >
                                <div className="flex justify-between items-center">
                                    <h2 className="text-xs font-black uppercase tracking-[0.4em] text-[#B5A1C2]/40 flex items-center gap-3">
                                        <Activity size={16} className="text-primary" /> Analyse Post-Changement
                                    </h2>
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/40">
                                        Phase: Rapport_Final
                                    </div>
                                </div>

                                <form onSubmit={handleAnalysis} className="space-y-10">
                                    {/* Incident Toggle */}
                                    <label className="group flex items-center gap-4 bg-white/[0.02] hover:bg-white/[0.05] p-6 rounded-[2rem] border border-white/5 cursor-pointer transition-all">
                                        <div className={`w-12 h-6 rounded-full relative transition-colors ${analysis.incident_occurred ? 'bg-rose-500' : 'bg-white/10'}`}>
                                            <input
                                                type="checkbox"
                                                checked={analysis.incident_occurred}
                                                onChange={e => setAnalysis(a => ({ ...a, incident_occurred: e.target.checked }))}
                                                className="hidden"
                                            />
                                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${analysis.incident_occurred ? 'left-7' : 'left-1'}`} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-white">Incident signalé ?</p>
                                            <p className="text-[10px] text-[#B5A1C2]/40 uppercase tracking-widest">Indiquer toute anomalie rencontrée lors de l'exécution.</p>
                                        </div>
                                    </label>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3 group">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-[#B5A1C2]/40 ml-1">Analyse des impacts</label>
                                            <textarea 
                                                required rows={3} value={analysis.description}
                                                onChange={e => setAnalysis(a => ({ ...a, description: e.target.value }))}
                                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-xs text-white placeholder:text-[#816A9E]/30 focus:ring-1 focus:ring-primary/50 transition-all resize-none"
                                                placeholder="Effets constatés sur les systèmes périphériques..."
                                            />
                                        </div>
                                        <div className="space-y-3 group">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-[#B5A1C2]/40 ml-1">Résumé d'Exécution</label>
                                            <textarea 
                                                required rows={3} value={analysis.impact}
                                                onChange={e => setAnalysis(a => ({ ...a, impact: e.target.value }))}
                                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-xs text-white placeholder:text-[#816A9E]/30 focus:ring-1 focus:ring-primary/50 transition-all resize-none"
                                                placeholder="Étapes clés et succès de l'opération..."
                                            />
                                        </div>
                                        <div className="col-span-full space-y-3 group">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-[#B5A1C2]/40 ml-1">Validation des Correctifs / Rollback</label>
                                            <textarea 
                                                required rows={2} value={analysis.solution}
                                                onChange={e => setAnalysis(a => ({ ...a, solution: e.target.value }))}
                                                className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-xs text-white placeholder:text-[#816A9E]/30 focus:ring-1 focus:ring-primary/50 transition-all resize-none"
                                                placeholder="Mesures prises pour stabiliser le système après l'opération..."
                                            />
                                        </div>
                                    </div>

                                    {/* Incidents Array */}
                                    <div className="space-y-6 pt-10 border-t border-white/5">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <AlertTriangle size={18} className="text-amber-500" />
                                                <h3 className="text-xs font-black uppercase tracking-widest text-[#E8E0F0]">Registre d'Anomalies ({analysis.incidents.length})</h3>
                                            </div>
                                            <button 
                                                type="button" 
                                                onClick={() => setAnalysis(a => ({ ...a, incidents: [...a.incidents, { title: '', severity: 'low', description: '', resolution: '', time_to_resolve_minutes: 30 }] }))}
                                                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:text-white transition-colors"
                                            >
                                                <Plus size={14} /> Ajouter Incident
                                            </button>
                                        </div>

                                        <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                            {analysis.incidents.map((inc, i) => (
                                                <div key={i} className="bg-white/[0.02] border border-white/10 p-8 rounded-[2.5rem] relative group/incident">
                                                    <button 
                                                        type="button" 
                                                        onClick={() => setAnalysis(a => ({ ...a, incidents: a.incidents.filter((_, idx) => idx !== i) }))}
                                                        className="absolute top-6 right-6 p-2 rounded-full bg-rose-500/10 text-rose-400 opacity-0 group-hover/incident:opacity-100 transition-all"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                    
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            <div className="space-y-2">
                                                                <label className="text-[9px] font-black uppercase tracking-widest text-[#B5A1C2]/20 ml-1">Titre de l'incident</label>
                                                                <input required type="text" value={inc.title || ''}
                                                                    onChange={e => {
                                                                        const newInc = [...analysis.incidents]; newInc[i].title = e.target.value; setAnalysis(a => ({ ...a, incidents: newInc }));
                                                                    }}
                                                                    className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs text-white placeholder:text-[#816A9E]/20 focus:ring-1 focus:ring-primary/50 transition-all"
                                                                    placeholder="Ex: Latence DB excessive"
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-[9px] font-black uppercase tracking-widest text-[#B5A1C2]/20 ml-1">Sévérité technique</label>
                                                                <select required value={inc.severity || 'low'}
                                                                    onChange={e => {
                                                                        const newInc = [...analysis.incidents]; newInc[i].severity = e.target.value; setAnalysis(a => ({ ...a, incidents: newInc }));
                                                                    }}
                                                                    className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs text-[#E8E0F0] focus:ring-1 focus:ring-primary/50 transition-all appearance-none cursor-pointer"
                                                                >
                                                                    <option value="low" className="bg-[#150522]">FAIBLE</option>
                                                                    <option value="medium" className="bg-[#150522]">MOYENNE</option>
                                                                    <option value="high" className="bg-[#150522]">HAUTE</option>
                                                                    <option value="critical" className="bg-[#150522]">CRITIQUE</option>
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[9px] font-black uppercase tracking-widest text-[#B5A1C2]/20 ml-1">Détails Anomalie</label>
                                                            <textarea required rows={2} value={inc.description || ''}
                                                                onChange={e => {
                                                                    const newInc = [...analysis.incidents]; newInc[i].description = e.target.value; setAnalysis(a => ({ ...a, incidents: newInc }));
                                                                }}
                                                                className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs text-white placeholder:text-[#816A9E]/20 focus:ring-1 focus:ring-primary/50 transition-all resize-none"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[9px] font-black uppercase tracking-widest text-[#B5A1C2]/20 ml-1">Résolution Technologique</label>
                                                            <textarea required rows={2} value={inc.resolution || ''}
                                                                onChange={e => {
                                                                    const newInc = [...analysis.incidents]; newInc[i].resolution = e.target.value; setAnalysis(a => ({ ...a, incidents: newInc }));
                                                                }}
                                                                className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs text-white placeholder:text-[#816A9E]/20 focus:ring-1 focus:ring-primary/50 transition-all resize-none"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-[9px] font-black uppercase tracking-widest text-[#B5A1C2]/20 ml-1">TTR (Temps de résolution min)</label>
                                                            <input required type="number" min="0" value={inc.time_to_resolve_minutes || 0}
                                                                onChange={e => {
                                                                    const newInc = [...analysis.incidents]; newInc[i].time_to_resolve_minutes = parseInt(e.target.value) || 0; setAnalysis(a => ({ ...a, incidents: newInc }));
                                                                }}
                                                                className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:ring-1 focus:ring-primary/50 transition-all"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 pt-10 border-t border-white/5 justify-end">
                                        <button 
                                            type="submit" 
                                            disabled={savingAnalysis}
                                            className="group flex items-center gap-4 bg-primary text-[#0F051E] font-black uppercase tracking-widest text-[11px] px-10 py-5 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/20 disabled:opacity-50"
                                        >
                                            <Save size={18} />
                                            {savingAnalysis ? 'Sauvegarde...' : 'Valider & Générer Rapport'}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        ) : (
                            <div className="py-32 text-center bg-white/[0.02] border-2 border-dashed border-white/5 rounded-[4rem] space-y-6">
                                <Activity size={48} className="mx-auto text-[#B5A1C2]/10 animate-pulse" />
                                <div className="space-y-2">
                                    <p className="text-sm font-bold text-[#E8E0F0]">Module d'analyse verrouillé</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#B5A1C2]/20">Activez l'intervention et marquez-la comme terminée pour débloquer le rapport final.</p>
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}