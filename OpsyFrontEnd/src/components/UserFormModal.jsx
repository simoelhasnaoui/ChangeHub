import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    User, Mail, Briefcase, Hash, Phone,
    X, Check, Shield, Activity, Building2, Copy,
} from 'lucide-react'
import api from '../api/axios'
import ChangeHubSelect from './ui/ChangeHubSelect'

const USER_DEPARTMENT_OPTIONS = [
    { value: 'IT', label: 'IT / DSI' },
    { value: 'DevOps', label: 'DevOps & plateforme' },
    { value: 'Sécurité', label: 'Sécurité & SOC' },
    { value: 'Réseau', label: 'Réseau & infrastructure' },
    { value: 'Applications', label: 'Applications & delivery' },
    { value: 'Support', label: 'Support utilisateurs' },
    { value: 'Data', label: 'Data & analytics' },
    { value: 'Direction', label: 'Direction & pilotage' },
    { value: 'RH', label: 'RH & administratif' },
    { value: 'Commercial', label: 'Commercial & marketing' },
    { value: 'Finance', label: 'Finance & achats' },
    { value: 'Autre', label: 'Autre service' },
]

const USER_JOB_TITLE_OPTIONS = [
    { value: 'Ingénieur DevOps', label: 'Ingénieur DevOps' },
    { value: 'Ingénieur réseau', label: 'Ingénieur réseau' },
    { value: 'Ingénieur sécurité', label: 'Ingénieur sécurité' },
    { value: 'Développeur', label: 'Développeur' },
    { value: 'Lead développement', label: 'Lead développement' },
    { value: 'Chef de projet IT', label: 'Chef de projet IT' },
    { value: 'Product Owner', label: 'Product Owner' },
    { value: 'Architecte solution', label: 'Architecte solution' },
    { value: 'Support N2 / N3', label: 'Support N2 / N3' },
    { value: 'Administrateur systèmes', label: 'Administrateur systèmes' },
    { value: 'Responsable SOC', label: 'Responsable SOC' },
    { value: 'Consultant', label: 'Consultant' },
    { value: 'Stagiaire / alternant', label: 'Stagiaire / alternant' },
    { value: 'Directeur technique', label: 'Directeur technique' },
    { value: 'Autre', label: 'Autre poste' },
]

function optionsWithCurrentValue(options, current) {
    const s = current != null ? String(current).trim() : ''
    if (!s) return options
    if (options.some((o) => String(o.value) === s)) return options
    return [{ value: s, label: s }, ...options]
}

export default function UserFormModal({ isOpen, onClose, onSuccess, initialData = null }) {
    const [form, setForm] = useState({
        name: '', email: '', role: 'requester',
        department: '', job_title: '', phone: '', employee_id: '', status: 'active'
    })
    const [error, setError] = useState('')
    const [saving, setSaving] = useState(false)
    const [generatedPassword, setGeneratedPassword] = useState('')
    const [copyHint, setCopyHint] = useState('')

    const passwordFieldRef = useRef(null)

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setForm({
                    name: initialData.name || '', email: initialData.email || '', role: initialData.role || 'requester',
                    department: initialData.department || '', job_title: initialData.job_title || '',
                    phone: initialData.phone || '', employee_id: initialData.employee_id || '', status: initialData.status || 'active'
                })
            } else {
                setForm({ name: '', email: '', role: 'requester', department: '', job_title: '', phone: '', employee_id: '', status: 'active' })
            }
            setError('')
            setGeneratedPassword('')
            setCopyHint('')
        }
    }, [isOpen, initialData])

    useEffect(() => {
        if (!generatedPassword) return
        const id = setTimeout(() => {
            passwordFieldRef.current?.focus()
            passwordFieldRef.current?.select()
        }, 150)
        return () => clearTimeout(id)
    }, [generatedPassword])

    const copyGeneratedPassword = async () => {
        const pwd = generatedPassword
        if (!pwd) return
        try {
            await navigator.clipboard.writeText(pwd)
            setCopyHint('Copié dans le presse-papiers.')
        } catch {
            try {
                const el = passwordFieldRef.current
                if (el) {
                    el.focus()
                    el.select()
                    document.execCommand('copy')
                    setCopyHint('Copié (méthode classique).')
                }
            } catch {
                setCopyHint('Sélectionnez le champ puis Ctrl+C.')
            }
        }
        setTimeout(() => setCopyHint(''), 3500)
    }

    const setField = (k, v) => setForm(f => ({ ...f, [k]: v }))

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        setError('')

        const fd = new FormData()
        Object.entries(form).forEach(([k, v]) => fd.append(k, v))

        try {
            if (initialData) {
                fd.append('_method', 'PATCH')
                await api.post(`/users/${initialData.id}`, fd, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                })
                onSuccess()
                onClose()
            } else {
                const r = await api.post('/users', fd, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                })
                const pwd = r.data?.generated_password
                if (pwd) {
                    setGeneratedPassword(pwd)
                } else {
                    setError("Réponse serveur sans mot de passe généré. Vérifiez les logs ou la configuration mail.")
                }
                // onSuccess only after admin copies password (Terminer) — do not close here or the modal unmounts
            }
        } catch (err) {
            const errors = err.response?.data?.errors
            setError(errors ? Object.values(errors).flat().join(' ') : 'Une erreur technique est survenue.')
        } finally {
            setSaving(false)
        }
    }

    if (!isOpen) return null

    return createPortal(
        <>
            {/* ── MODAL: CREATE / EDIT ── */}
            <AnimatePresence mode="wait">
                {!generatedPassword && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 bg-[#0F051E]/95 backdrop-blur-2xl overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#150522] border border-white/5 rounded-[3rem] w-full max-w-4xl my-auto shadow-[0_0_100px_rgba(209,140,255,0.05)] relative overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-10 xl:p-14 space-y-10 relative z-10">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-4">
                                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">AGENT_RECORDS_GATEWAY</p>
                                        <h2 className="text-3xl font-light text-text-main leading-none">{initialData ? 'Mise à jour' : 'Enregistrement'} <span className="font-medium text-text-main/40">Agent</span></h2>
                                    </div>
                                    <button onClick={onClose} className="p-3 rounded-full hover:bg-white/5 text-text-dim/40 transition-colors">
                                        <X size={24} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {[
                                            { label: 'Nom complet', key: 'name', type: 'text', icon: <User size={14} />, placeholder: 'Ex: Jean Dupont' },
                                            { label: 'Email opérationnel', key: 'email', type: 'email', icon: <Mail size={14} />, placeholder: 'jean.dupont@ChangeHub.tech' },
                                        ].map((field) => (
                                            <div key={field.key} className="space-y-3 group">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-text-dim ml-1 flex items-center gap-2">
                                                    {field.icon} {field.label}
                                                </label>
                                                <input
                                                    required
                                                    type={field.type}
                                                    value={form[field.key]}
                                                    onChange={e => setField(field.key, e.target.value)}
                                                    className="w-full bg-primary/5 border border-white/5 rounded-2xl px-5 py-4 text-xs text-text-main placeholder:text-text-dim/20 focus:ring-1 focus:ring-primary/50 focus:bg-primary/10 transition-all shadow-inner"
                                                    placeholder={field.placeholder}
                                                />
                                            </div>
                                        ))}

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-text-dim ml-1 flex items-center gap-2">
                                                <Building2 size={14} /> Département
                                            </label>
                                            <ChangeHubSelect
                                                value={form.department}
                                                onChange={(val) => setField('department', val)}
                                                options={optionsWithCurrentValue(USER_DEPARTMENT_OPTIONS, form.department)}
                                                icon={Building2}
                                                placeholder="Sélectionner un département"
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-text-dim ml-1 flex items-center gap-2">
                                                <Briefcase size={14} /> Titre de poste
                                            </label>
                                            <ChangeHubSelect
                                                value={form.job_title}
                                                onChange={(val) => setField('job_title', val)}
                                                options={optionsWithCurrentValue(USER_JOB_TITLE_OPTIONS, form.job_title)}
                                                icon={Briefcase}
                                                placeholder="Sélectionner un poste"
                                            />
                                        </div>

                                        {[
                                            { label: 'Numéro de contact', key: 'phone', type: 'text', icon: <Phone size={14} />, placeholder: '+33 6 ...' },
                                            { label: 'Matricule / ID', key: 'employee_id', type: 'text', icon: <Hash size={14} />, placeholder: 'OPS-2024-...' },
                                        ].map((field) => (
                                            <div key={field.key} className="space-y-3 group">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-text-dim ml-1 flex items-center gap-2">
                                                    {field.icon} {field.label}
                                                </label>
                                                <input
                                                    type={field.type}
                                                    value={form[field.key]}
                                                    onChange={e => setField(field.key, e.target.value)}
                                                    className="w-full bg-primary/5 border border-white/5 rounded-2xl px-5 py-4 text-xs text-text-main placeholder:text-text-dim/20 focus:ring-1 focus:ring-primary/50 focus:bg-primary/10 transition-all shadow-inner"
                                                    placeholder={field.placeholder}
                                                />
                                            </div>
                                        ))}

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-text-dim ml-1 flex items-center gap-2">
                                                <Shield size={14} /> Niveau d'Accès
                                            </label>
                                            <ChangeHubSelect
                                                value={form.role}
                                                onChange={val => setField('role', val)}
                                                options={[
                                                    { value: 'requester', label: 'DEMANDEUR' },
                                                    { value: 'implementer', label: 'IMPLÉMENTEUR' },
                                                    { value: 'approver', label: 'APPROBATEUR' },
                                                    { value: 'admin', label: 'ADMINISTRATEUR' },
                                                ]}
                                                icon={Shield}
                                            />

                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-text-dim ml-1 flex items-center gap-2">
                                                <Activity size={14} /> État du Compte
                                            </label>
                                            <ChangeHubSelect
                                                value={form.status}
                                                onChange={val => setField('status', val)}
                                                options={[
                                                    { value: 'active', label: 'OPÉRATIONNEL' },
                                                    { value: 'inactive', label: 'RÉVOCATÉ' },
                                                ]}
                                                icon={Activity}
                                            />

                                        </div>
                                    </div>

                                    {error && (
                                        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[10px] font-bold text-rose-400">
                                            {error}
                                        </div>
                                    )}

                                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-10 border-t border-white/5 uppercase font-black tracking-widest text-[10px]">
                                        <p className="text-text-dim/30">Agent_Terminal_Access</p>
                                        <div className="flex items-center gap-4 w-full md:w-auto">
                                            <button
                                                type="button"
                                                onClick={onClose}
                                                className="flex-1 md:flex-none px-10 py-5 rounded-2xl text-text-dim hover:text-text-main transition-colors"
                                            >
                                                Annuler
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={saving}
                                                className="flex-1 md:flex-none px-12 py-5 bg-primary text-body rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/20 disabled:opacity-50"
                                            >
                                                {saving ? 'Synchronisation...' : (initialData ? 'Sauvegarder' : 'Inscrire l\'agent')}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── PASSWORD MODAL ── */}
            <AnimatePresence>
                {generatedPassword && (
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-[#0F051E]/95 backdrop-blur-xl">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="bg-[#150522] border border-primary/20 rounded-[3rem] p-12 max-w-md w-full text-center space-y-8 shadow-[0_0_100px_rgba(209,140,255,0.1)] relative overflow-hidden"
                        >
                            <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/10 rounded-full blur-[60px] pointer-events-none" />
                            <div className="w-20 h-20 bg-primary/10 border border-primary/20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-primary">
                                <Check size={40} />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold text-white tracking-widest">Compte Initialisé</h2>
                                <p className="text-[10px] uppercase font-black tracking-widest text-[#B5A1C2]/40 leading-relaxed">
                                    Une clé d'accès temporaire a été générée. Transmettez-la de manière sécurisée à l'agent.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <input
                                    ref={passwordFieldRef}
                                    readOnly
                                    value={generatedPassword}
                                    onFocus={(e) => e.target.select()}
                                    onClick={(e) => e.target.select()}
                                    className="w-full rounded-2xl bg-black/50 border border-white/10 px-4 py-4 font-mono text-base md:text-lg text-primary text-center tracking-wide outline-none focus:ring-2 focus:ring-primary/40 select-all cursor-text"
                                    aria-label="Mot de passe généré"
                                />
                                <button
                                    type="button"
                                    onClick={copyGeneratedPassword}
                                    className="w-full inline-flex items-center justify-center gap-2 py-4 rounded-2xl bg-primary/20 border border-primary/40 text-primary font-black uppercase tracking-widest text-[10px] hover:bg-primary/30 transition-colors"
                                >
                                    <Copy size={16} />
                                    Copier dans le presse-papiers
                                </button>
                                {copyHint && (
                                    <p className="text-[11px] font-bold text-emerald-400/90 text-center">{copyHint}</p>
                                )}
                                <p className="text-[10px] text-[#B5A1C2]/45 text-center leading-relaxed">
                                    Astuce : triple-clic dans le champ pour tout sélectionner, ou utilisez le bouton ci-dessus.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => {
                                    setCopyHint('')
                                    setGeneratedPassword('')
                                    onSuccess()
                                    onClose()
                                }}
                                className="w-full py-5 bg-white/5 hover:bg-primary/20 text-text-dim hover:text-primary rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all"
                            >
                                Terminer
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>,
        document.body
    )
}
