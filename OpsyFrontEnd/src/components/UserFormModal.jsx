import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    User, Mail, Briefcase, Hash, Phone, Image as ImageIcon,
    Edit3, X, Check, Shield, Activity, Building2
} from 'lucide-react'
import api from '../api/axios'
import ChangeHubSelect from './ui/ChangeHubSelect'


export default function UserFormModal({ isOpen, onClose, onSuccess, initialData = null }) {
    const [form, setForm] = useState({
        name: '', email: '', role: 'requester',
        department: '', job_title: '', phone: '', employee_id: '', status: 'active'
    })
    const [avatarFile, setAvatarFile] = useState(null)
    const [avatarPreview, setAvatarPreview] = useState(null)
    const [error, setError] = useState('')
    const [saving, setSaving] = useState(false)
    const [generatedPassword, setGeneratedPassword] = useState('')

    const fileInputRef = useRef()

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setForm({
                    name: initialData.name || '', email: initialData.email || '', role: initialData.role || 'requester',
                    department: initialData.department || '', job_title: initialData.job_title || '',
                    phone: initialData.phone || '', employee_id: initialData.employee_id || '', status: initialData.status || 'active'
                })
                setAvatarFile(null)
                setAvatarPreview(initialData.avatar_path ? `http://127.0.0.1:8000/storage/${initialData.avatar_path}` : null)
            } else {
                setForm({ name: '', email: '', role: 'requester', department: '', job_title: '', phone: '', employee_id: '', status: 'active' })
                setAvatarFile(null)
                setAvatarPreview(null)
            }
            setError('')
            setGeneratedPassword('')
        }
    }, [isOpen, initialData])

    const setField = (k, v) => setForm(f => ({ ...f, [k]: v }))

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setAvatarFile(file)
            setAvatarPreview(URL.createObjectURL(file))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        setError('')

        const fd = new FormData()
        Object.entries(form).forEach(([k, v]) => fd.append(k, v))
        if (avatarFile) fd.append('avatar', avatarFile)

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
                setGeneratedPassword(r.data.generated_password)
                onSuccess()
                // Don't close immediately if we created, show password modal first
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
                                    <div className="flex flex-col md:flex-row gap-8 items-center p-8 bg-primary/5 border border-white/5 rounded-3xl">
                                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                            <div className="w-24 h-24 rounded-3xl border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden bg-primary/5 transition-all group-hover:border-primary/50">
                                                {avatarPreview ? (
                                                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <ImageIcon size={24} className="text-text-dim/20" />
                                                )}
                                            </div>
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl">
                                                <Edit3 size={20} className="text-text-main" />
                                            </div>
                                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                                        </div>
                                        <div className="text-center md:text-left space-y-2">
                                            <p className="text-xs font-bold text-text-main uppercase tracking-widest">Identité visuelle (Optionnel)</p>
                                            <p className="text-[10px] text-text-dim leading-relaxed">
                                                Taille recommandée: 512x512px. Formats supportés: PNG, JPG (Max 2Mo).
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {[
                                            { label: 'Nom complet', key: 'name', type: 'text', icon: <User size={14} />, placeholder: 'Ex: Jean Dupont' },
                                            { label: 'Email opérationnel', key: 'email', type: 'email', icon: <Mail size={14} />, placeholder: 'jean.dupont@ChangeHub.tech' },
                                            { label: 'Département', key: 'department', type: 'text', icon: <Building2 size={14} />, placeholder: 'Security Ops' },
                                            { label: 'Titre de poste', key: 'job_title', type: 'text', icon: <Briefcase size={14} />, placeholder: 'Senior DevSecOps' },
                                            { label: 'Numéro de contact', key: 'phone', type: 'text', icon: <Phone size={14} />, placeholder: '+33 6 ...' },
                                            { label: 'Matricule / ID', key: 'employee_id', type: 'text', icon: <Hash size={14} />, placeholder: 'OPS-2024-...' },
                                        ].map((field) => (
                                            <div key={field.key} className="space-y-3 group">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-text-dim ml-1 flex items-center gap-2">
                                                    {field.icon} {field.label}
                                                </label>
                                                <input
                                                    required={field.key === 'name' || field.key === 'email'}
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

                            <div className="p-6 rounded-2xl bg-black/40 border border-white/5 font-mono text-xl tracking-[0.2em] relative group">
                                <span className="text-primary group-hover:blur-sm transition-all duration-300 select-all">{generatedPassword}</span>
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white">Copier</span>
                                </div>
                            </div>

                            <button
                                onClick={onClose}
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
