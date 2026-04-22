import React, { useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useLocation } from 'react-router-dom'
import api from '../../api/axios'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    Users as UsersIcon, UserPlus, Shield, UserCheck, User,
    Mail, Briefcase, Hash, Phone, Image as ImageIcon,
    Edit3, Trash2, Key, X, Check, Copy, MoreHorizontal,
    Search, Filter, ChevronRight, AlertCircle, Building2, Activity
} from 'lucide-react'

// ─── Constants & Localization ───────────────────────────────────────────────
const ROLE_CONFIG = {
    admin: { label: 'Administrateur', color: '#D18CFF', bg: 'bg-[#D18CFF]/10' },
    approver: { label: 'Approbateur', color: '#3b82f6', bg: 'bg-blue-500/10' },
    implementer: { label: 'Implémenteur', color: '#10b981', bg: 'bg-emerald-500/10' },
    requester: { label: 'Demandeur', color: '#B5A1C2', bg: 'bg-[#B5A1C2]/10' },
}

export default function Users() {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    
    // Modal states
    const [showForm, setShowForm] = useState(false)
    const [editingUser, setEditingUser] = useState(null)
    const [generatedPassword, setGeneratedPassword] = useState('')
    
    // Form state
    const [form, setForm] = useState({ 
        name: '', email: '', role: 'requester', 
        department: '', job_title: '', phone: '', employee_id: '', status: 'active'
    })
    const [avatarFile, setAvatarFile] = useState(null)
    const [avatarPreview, setAvatarPreview] = useState(null)
    const fileInputRef = useRef()
    
    const [error, setError] = useState('')
    const [saving, setSaving] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const hasAutoOpened = useRef(false)

    const loadUsers = async () => {
        try {
            const r = await api.get('/users')
            setUsers(r.data)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { loadUsers() }, [])

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setAvatarFile(file)
            setAvatarPreview(URL.createObjectURL(file))
        }
    }

    const openCreateForm = () => {
        setEditingUser(null)
        setForm({ name: '', email: '', role: 'requester', department: '', job_title: '', phone: '', employee_id: '', status: 'active' })
        setAvatarFile(null)
        setAvatarPreview(null)
        setError('')
        setShowForm(true)
    }

    const openEditForm = (u) => {
        setEditingUser(u.id)
        setForm({
            name: u.name || '', email: u.email || '', role: u.role || 'requester',
            department: u.department || '', job_title: u.job_title || '',
            phone: u.phone || '', employee_id: u.employee_id || '', status: u.status || 'active'
        })
        setAvatarFile(null)
        setAvatarPreview(u.avatar_path ? `http://127.0.0.1:8000/storage/${u.avatar_path}` : null)
        setError('')
        setShowForm(true)
    }

    const location = useLocation()
    useEffect(() => {
        const params = new URLSearchParams(location.search)
        if (params.get('create') === 'true' && !showForm && !hasAutoOpened.current) {
            hasAutoOpened.current = true // Protect against re-triggering
            // Delay slightly to ensure layout and users are loaded
            const timer = setTimeout(() => {
                openCreateForm()
            }, 100)
            return () => clearTimeout(timer)
        }
    }, [location.search, showForm])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        setError('')
        
        const fd = new FormData()
        Object.entries(form).forEach(([k, v]) => fd.append(k, v))
        if (avatarFile) fd.append('avatar', avatarFile)

        try {
            if (editingUser) {
                fd.append('_method', 'PATCH')
                await api.post(`/users/${editingUser}`, fd, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                })
                setShowForm(false)
            } else {
                const r = await api.post('/users', fd, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                })
                setGeneratedPassword(r.data.generated_password)
                setShowForm(false)
            }
            loadUsers()
        } catch (err) {
            const errors = err.response?.data?.errors
            setError(errors ? Object.values(errors).flat().join(' ') : 'Une erreur technique est survenue.')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Supprimer définitivement cet accès répertorié ?')) return
        try {
            await api.delete(`/users/${id}`)
            loadUsers()
        } catch(err) {
            alert('Impossible de supprimer cet utilisateur.')
        }
    }

    const handleResetPassword = async (id) => {
        if (!window.confirm('Forcer la réinitialisation des accès pour cet agent ?')) return
        try {
            await api.post(`/users/${id}/reset-password`)
            alert('Procédure de réinitialisation initiée par email.')
        } catch (err) {
            alert('Erreur lors de la réinitialisation.')
        }
    }

    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.department && u.department.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
                <div className="w-20 h-20 border-2 border-white/5 border-t-primary rounded-full animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary animate-pulse">Scan de la base agents...</p>
            </div>
        )
    }

    const handleClose = () => {
        setShowForm(false)
        navigate('/admin/users', { replace: true })
    }

    return (
        <div className="space-y-12 pb-20 font-inter max-w-[1600px] mx-auto overflow-visible relative">
            
            {/* ── HEADER ── */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-10 border-b border-white/5">
                <div className="space-y-4">
                    <p className="text-[11px] font-black uppercase tracking-[0.6em] text-primary">IDENTITY_MANAGEMENT_V4</p>
                    <h1 className="text-5xl font-light tracking-tight text-text-main leading-none">Registre <span className="font-medium text-text-main/40">Utilisateurs</span></h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-dim">
                        {users.length} agents répertoriés dans l'infrastructure Opsy.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim group-focus-within:text-primary transition-colors" size={16} />
                        <input 
                            type="text"
                            placeholder="Rechercher un agent..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-primary/5 border border-white/5 rounded-2xl pl-12 pr-6 py-4 text-xs text-text-main placeholder:text-text-dim/20 focus:outline-none focus:bg-primary/10 focus:border-primary/30 transition-all w-[300px]"
                        />
                    </div>
                    <button
                        onClick={openCreateForm}
                        className="group flex items-center gap-3 bg-primary text-[#0F051E] font-black uppercase tracking-widest text-[11px] px-8 py-4 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl"
                    >
                        <UserPlus size={16} />
                        Nvel Agent
                    </button>
                </div>
            </div>

            {/* ── USERS GRID/TABLE ── */}
            <div className="bg-surface backdrop-blur-3xl border border-white/5 rounded-[3rem] shadow-2xl p-8 xl:p-12 overflow-visible">
                <table className="w-full text-left border-separate border-spacing-y-3">
                    <thead>
                        <tr className="text-[10px] font-black uppercase tracking-widest text-text-dim">
                            <th className="px-6 py-4">Identité & Accès</th>
                            <th className="px-6 py-4">Structure</th>
                            <th className="px-6 py-4">Privilèges</th>
                            <th className="px-6 py-4">État de connexion</th>
                            <th className="px-6 py-4 text-right">Opérations</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((u) => (
                            <tr key={u.id} className="group bg-primary/5 hover:bg-primary/10 transition-all rounded-2xl overflow-hidden h-[100px]">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <div className="w-12 h-12 rounded-2xl overflow-hidden border border-white/10 bg-primary/5">
                                                {u.avatar_path ? (
                                                    <img src={`http://127.0.0.1:8000/storage/${u.avatar_path}`} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xs font-black text-primary">
                                                        {u.name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-body ${u.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-text-main group-hover:text-primary transition-colors">{u.name}</span>
                                            <span className="text-[10px] font-medium text-text-dim lowercase tracking-tight">{u.email}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-text-main tracking-tight">{u.job_title || 'Expert Système'}</span>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-text-dim/20 mt-1 flex items-center gap-1">
                                            <Building2 size={10} /> {u.department || 'Infrastructure'}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-white/5 whitespace-nowrap ${ROLE_CONFIG[u.role]?.bg}`} style={{ color: ROLE_CONFIG[u.role]?.color }}>
                                        {ROLE_CONFIG[u.role]?.label}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${u.status === 'active' ? 'text-emerald-500/60' : 'text-rose-500/40'}`}>
                                        {u.status === 'active' ? 'Opérationnel' : 'Révocaté'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => handleResetPassword(u.id)} className="p-3 rounded-xl bg-primary/5 text-text-dim/40 hover:text-text-main transition-all shadow-sm" title="Réinitialiser MDP">
                                            <Key size={14} />
                                        </button>
                                        <button onClick={() => openEditForm(u)} className="p-3 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-body transition-all shadow-lg shadow-primary/5" title="Modifier">
                                            <Edit3 size={14} />
                                        </button>
                                        <button onClick={() => handleDelete(u.id)} className="p-3 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all shadow-lg shadow-rose-500/5" title="Supprimer">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredUsers.length === 0 && (
                    <div className="py-24 text-center space-y-4">
                        <UsersIcon size={48} className="mx-auto text-text-dim/5 mb-4" />
                        <p className="text-sm font-bold text-text-dim">Aucun agent trouvé pour "{searchQuery}"</p>
                    </div>
                )}
            </div>

            {/* ── MODAL: CREATE / EDIT ── */}
            {showForm && createPortal(
                <AnimatePresence mode="wait">
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
                                        <h2 className="text-3xl font-light text-text-main leading-none">{editingUser ? 'Mise à jour' : 'Enregistrement'} <span className="font-medium text-text-main/40">Agent</span></h2>
                                    </div>
                                    <button onClick={handleClose} className="p-3 rounded-full hover:bg-white/5 text-text-dim/40 transition-colors">
                                        <X size={24} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-10">
                                    {/* Avatar Upload (Horizontal) */}
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
                                        {/* Inputs */}
                                        {[
                                            { label: 'Nom complet', key: 'name', type: 'text', icon: <User size={14} />, placeholder: 'Ex: Jean Dupont' },
                                            { label: 'Email opérationnel', key: 'email', type: 'email', icon: <Mail size={14} />, placeholder: 'jean.dupont@opsy.tech' },
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
                                                    onChange={e => set(field.key, e.target.value)}
                                                    className="w-full bg-primary/5 border border-white/5 rounded-2xl px-5 py-4 text-xs text-text-main placeholder:text-text-dim/20 focus:ring-1 focus:ring-primary/50 focus:bg-primary/10 transition-all shadow-inner"
                                                    placeholder={field.placeholder}
                                                />
                                            </div>
                                        ))}

                                        {/* Selects */}
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-text-dim ml-1 flex items-center gap-2">
                                                <Shield size={14} /> Niveau d'Accès
                                            </label>
                                            <select 
                                                value={form.role}
                                                onChange={e => set('role', e.target.value)}
                                                className="w-full bg-primary/5 border border-white/5 rounded-2xl px-5 py-4 text-xs text-text-main focus:ring-1 focus:ring-primary/50 focus:bg-primary/10 transition-all appearance-none cursor-pointer"
                                            >
                                                <option value="requester" className="bg-body">DEMANDEUR</option>
                                                <option value="implementer" className="bg-body">IMPLÉMENTEUR</option>
                                                <option value="approver" className="bg-body">APPROBATEUR</option>
                                                <option value="admin" className="bg-body">ADMINISTRATEUR</option>
                                            </select>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-text-dim ml-1 flex items-center gap-2">
                                                <Activity size={14} /> État du Compte
                                            </label>
                                            <select 
                                                value={form.status}
                                                onChange={e => set('status', e.target.value)}
                                                className="w-full bg-primary/5 border border-white/5 rounded-2xl px-5 py-4 text-xs text-text-main focus:ring-1 focus:ring-primary/50 focus:bg-primary/10 transition-all appearance-none cursor-pointer"
                                            >
                                                <option value="active" className="bg-body">OPÉRATIONNEL</option>
                                                <option value="inactive" className="bg-body">RÉVOCATÉ</option>
                                            </select>
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[10px] font-bold text-rose-400">
                                            {error}
                                        </div>
                                    )}

                                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-10 border-t border-white/5 uppercase font-black tracking-widest text-[10px]">
                                        <p className="text-text-dim/30">Agent_Terminal_Access_v4.2.1</p>
                                        <div className="flex items-center gap-4 w-full md:w-auto">
                                            <button 
                                                type="button" 
                                                onClick={handleClose}
                                                className="flex-1 md:flex-none px-10 py-5 rounded-2xl text-text-dim hover:text-text-main transition-colors"
                                            >
                                                Annuler
                                            </button>
                                            <button 
                                                type="submit" 
                                                disabled={saving}
                                                className="flex-1 md:flex-none px-12 py-5 bg-primary text-body rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-primary/20 disabled:opacity-50"
                                            >
                                                {saving ? 'Synchronisation...' : (editingUser ? 'Sauvegarder' : 'Inscrire l\'agent')}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                </AnimatePresence>,
                document.body
            )}

            {/* ── PASSWORD MODAL ── */}
            {generatedPassword && createPortal(
                <AnimatePresence>
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-[#0F051E]/95 backdrop-blur-xl">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
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
                            <div className="relative group">
                                <div className="bg-black/40 border border-white/5 p-6 rounded-3xl font-mono text-[#D18CFF] text-2xl tracking-[0.2em] select-all shadow-inner">
                                    {generatedPassword}
                                </div>
                                <button 
                                    onClick={() => { navigator.clipboard.writeText(generatedPassword); alert("Clé copiée !") }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-white/5 text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Copy size={16} />
                                </button>
                            </div>
                            <button 
                                onClick={() => setGeneratedPassword('')}
                                className="w-full py-5 bg-primary/10 border border-primary/20 text-primary font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-primary hover:text-[#0F051E] transition-all"
                            >
                                Terminer l'intégration
                            </button>
                        </motion.div>
                    </div>
                </AnimatePresence>,
                document.body
            )}
        </div>
    )
}