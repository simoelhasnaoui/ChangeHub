import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import api from '../../api/axios'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    ArrowLeft, Send, Save, X, Info, 
    Server, Calendar, ShieldAlert, Layers,
    CheckCircle2, AlertCircle
} from 'lucide-react'
import ChangeHubSelect from '../../components/ui/ChangeHubSelect'
import ChangeHubDatePicker from '../../components/ui/ChangeHubDatePicker'


export default function NewRequest() {
    const navigate = useNavigate()
    const { id } = useParams()
    const isEdit = Boolean(id)

    const [types, setTypes] = useState([])
    const [form, setForm] = useState({
        title: '', description: '', change_type_id: '',
        affected_system: '', planned_date: '', risk_level: '',
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [initialFetch, setInitialFetch] = useState(isEdit)

    useEffect(() => {
        api.get('/change-types').then(r => setTypes(r.data))
        if (isEdit) {
            api.get(`/change-requests/${id}`).then(r => {
                const fetched = r.data
                setForm({
                    title: fetched.title, description: fetched.description, change_type_id: fetched.change_type_id,
                    affected_system: fetched.affected_system, planned_date: fetched.planned_date, risk_level: fetched.risk_level,
                })
                setInitialFetch(false)
            }).catch(() => setInitialFetch(false))
        }
    }, [id, isEdit])

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            if (isEdit) {
                await api.put(`/change-requests/${id}`, form)
                navigate(`/requester/changes/${id}`)
            } else {
                await api.post('/change-requests', form)
                navigate('/requester/changes')
            }
        } catch (err) {
            const errors = err.response?.data?.errors
            if (errors) {
                setError(Object.values(errors).flat().join(' '))
            } else {
                setError(err.response?.data?.message || 'Une erreur est survenue.')
            }
        } finally {
            setLoading(false)
        }
    }

    if (initialFetch) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
                <div className="w-20 h-20 border-2 border-white/5 border-t-primary rounded-full animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary animate-pulse">Récupération du dossier...</p>
            </div>
        )
    }

    return (
        <div className="max-w-[1000px] mx-auto space-y-12 pb-20">
            {/* ── HEADER ── */}
            <div className="flex items-center justify-between">
                <div className="space-y-4">
                    <Link 
                        to="/requester/changes" 
                        className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#B5A1C2]/40 hover:text-primary transition-colors"
                    >
                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                        Retour au flux
                    </Link>
                    <h1 className="text-4xl font-light tracking-tight text-white capitalize leading-none">
                        {isEdit ? 'Mise à jour' : 'Initialisation'} <span className="font-medium text-primary">Intervention</span>
                    </h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-8"
                >
                    {/* LEFT SECTION: MAIN INFO */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="bg-[#150522]/40 backdrop-blur-3xl border border-white/5 p-8 xl:p-12 rounded-[3.5rem] shadow-2xl space-y-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
                            
                            <div className="space-y-6">
                                <div className="space-y-2 group">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#B5A1C2]/40 ml-1">Sujet de l'intervention</label>
                                    <input
                                        required 
                                        value={form.title}
                                        onChange={e => set('title', e.target.value)}
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-4 text-sm text-white placeholder:text-[#816A9E]/30 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:bg-white/[0.06] transition-all"
                                        placeholder="Ex: Optimisation du cluster Kubernetes"
                                    />
                                </div>

                                <div className="space-y-2 group">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#B5A1C2]/40 ml-1">Description détaillée</label>
                                    <textarea
                                        required 
                                        value={form.description}
                                        onChange={e => set('description', e.target.value)}
                                        rows={6}
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-3xl px-6 py-4 text-sm text-white placeholder:text-[#816A9E]/30 focus:outline-none focus:ring-1 focus:ring-primary/50 focus:bg-white/[0.06] transition-all resize-none"
                                        placeholder="Décrivez les étapes techniques et les objectifs du changement..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SECTION: CONFIGURATION */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Technical Selects */}
                        <div className="bg-[#150522]/40 backdrop-blur-3xl border border-white/5 p-8 rounded-[3rem] shadow-2xl space-y-8">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#B5A1C2]/40 ml-1">
                                        <Layers size={14} className="text-primary/40" /> Catégorie
                                    </label>
                                    <ChangeHubSelect 
                                        options={types.map(t => ({ value: t.id, label: t.name }))}
                                        value={form.change_type_id}
                                        onChange={val => set('change_type_id', val)}
                                        icon={Layers}
                                        placeholder="Sélectionner une catégorie..."
                                    />

                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#B5A1C2]/40 ml-1">
                                        <Server size={14} className="text-primary/40" /> Système Affecté
                                    </label>
                                    <input
                                        required 
                                        value={form.affected_system}
                                        onChange={e => set('affected_system', e.target.value)}
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-xs text-white placeholder:text-[#816A9E]/30 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                                        placeholder="Ex: DB-PROD-01"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#B5A1C2]/40 ml-1">
                                        <Calendar size={14} className="text-primary/40" /> Date Prévue
                                    </label>
                                    <ChangeHubDatePicker 
                                        value={form.planned_date}
                                        onChange={val => set('planned_date', val)}
                                        icon={Calendar}
                                    />

                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#B5A1C2]/40 ml-1">
                                        <ShieldAlert size={14} className="text-primary/40" /> Niveau de Risque
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['low', 'medium', 'high'].map((level) => (
                                            <button
                                                key={level}
                                                type="button"
                                                onClick={() => set('risk_level', level)}
                                                className={`py-3 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${
                                                    form.risk_level === level 
                                                    ? 'bg-primary/20 border-primary text-primary shadow-[0_0_20px_rgba(209,140,255,0.1)]' 
                                                    : 'bg-white/5 border-white/5 text-[#B5A1C2]/40 hover:border-white/10'
                                                }`}
                                            >
                                                {level === 'low' ? 'Faible' : level === 'medium' ? 'Moyen' : 'Élevé'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Guidelines / Tips */}
                        <div className="bg-primary/5 border border-primary/10 p-8 rounded-[3rem] space-y-4">
                            <div className="flex items-center gap-3 text-primary">
                                <Info size={16} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Conseil d'expert</span>
                            </div>
                            <p className="text-[11px] text-[#B5A1C2]/40 leading-relaxed italic">
                                Assurez-vous que la description contient un plan de retour arrière précis pour faciliter l'approbation.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* ── FOOTER ACTIONS ── */}
                <AnimatePresence>
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-rose-500/10 border border-rose-500/20 p-6 rounded-3xl flex items-center gap-4 text-xs font-bold text-rose-400"
                        >
                            <AlertCircle size={18} />
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex items-center justify-end gap-6 pt-8 border-t border-white/5">
                    <button
                        type="button"
                        onClick={() => navigate('/requester/changes')}
                        className="text-[10px] font-black uppercase tracking-[0.2em] text-[#B5A1C2]/40 hover:text-white transition-colors"
                    >
                        Abandonner
                    </button>
                    <button
                        type="submit" 
                        disabled={loading}
                        className="group flex items-center gap-3 bg-primary text-[#0F051E] font-black uppercase tracking-widest text-[11px] px-10 py-5 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl disabled:opacity-50"
                    >
                        {loading ? (
                            'Synchronisation...'
                        ) : (
                            <>
                                {isEdit ? <Save size={16} /> : <Send size={16} />}
                                {isEdit ? 'Enregistrer' : 'Soumettre au comité'}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}