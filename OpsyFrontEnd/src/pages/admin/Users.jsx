import React, { useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Users as UsersIcon, UserPlus, Shield, UserCheck, User,
    Mail, Briefcase, Hash, Phone,
    Edit3, Trash2, Key, X, Check, Copy, MoreHorizontal,
    Search, Filter, ChevronRight, AlertCircle, Building2, Activity
} from 'lucide-react'
import UserFormModal from '../../components/UserFormModal'
import ConfirmModal from '../../components/ConfirmModal'

// ─── Constants & Localization ───────────────────────────────────────────────
const ROLE_CONFIG = {
    admin: { label: 'Administrateur', color: '#D18CFF', bg: 'bg-[#D18CFF]/10' },
    approver: { label: 'Approbateur', color: '#3b82f6', bg: 'bg-blue-500/10' },
    implementer: { label: 'Implémenteur', color: '#10b981', bg: 'bg-emerald-500/10' },
    requester: { label: 'Demandeur', color: '#B5A1C2', bg: 'bg-[#B5A1C2]/10' },
}

export default function Users() {
    const navigate = useNavigate()
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)

    // Modal states
    const [showForm, setShowForm] = useState(false)
    const [editingUser, setEditingUser] = useState(null)

    const [searchQuery, setSearchQuery] = useState('')
    const [confirmAction, setConfirmAction] = useState(null) // { type: 'delete'|'reset', id: number }
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

    const openCreateForm = () => {
        setEditingUser(null)
        setShowForm(true)
    }

    const openEditForm = (u) => {
        setEditingUser(u)
        setShowForm(true)
    }

    const location = useLocation()
    useEffect(() => {
        const params = new URLSearchParams(location.search)
        if (params.get('create') === 'true' && !showForm && !hasAutoOpened.current) {
            hasAutoOpened.current = true // Protect against re-triggering
            const timer = setTimeout(() => { openCreateForm() }, 100)
            return () => clearTimeout(timer)
        }
    }, [location.search, showForm])

    const handleDelete = async (id) => {
        setConfirmAction({ type: 'delete', id })
    }

    const handleResetPassword = async (id) => {
        setConfirmAction({ type: 'reset', id })
    }

    const executeConfirmAction = async () => {
        const { type, id } = confirmAction
        setConfirmAction(null)
        if (type === 'delete') {
            try {
                await api.delete(`/users/${id}`)
                loadUsers()
            } catch (err) {
                alert(err.response?.data?.message || 'Impossible de supprimer cet utilisateur.')
            }
        } else if (type === 'reset') {
            try {
                await api.post(`/users/${id}/reset-password`)
                alert('Procédure de réinitialisation initiée par email.')
            } catch (err) {
                alert('Erreur lors de la réinitialisation.')
            }
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
        <>
            <div className="space-y-12 pb-20 font-inter max-w-[1600px] mx-auto overflow-visible relative">

                {/* ── HEADER ── */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-10 border-b border-white/5">
                    <div className="space-y-4">
                        <p className="text-[11px] font-black uppercase tracking-[0.6em] text-primary">IDENTITY_MANAGEMENT</p>
                        <h1 className="text-5xl font-light tracking-tight text-text-main leading-none">Registre <span className="font-medium text-text-main/40">Utilisateurs</span></h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-dim">
                            {users.length} agents répertoriés dans l'infrastructure ChangeHub.
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
                            Nouvel Utilisateur
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
                                                    <div className="w-full h-full flex items-center justify-center text-xs font-black text-primary">
                                                        {u.name.charAt(0)}
                                                    </div>
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

                <UserFormModal
                    isOpen={showForm}
                    onClose={handleClose}
                    onSuccess={() => { setShowForm(false); loadUsers(); navigate('/admin/users', { replace: true }); }}
                    initialData={editingUser}
                />
            </div>

            <ConfirmModal
                isOpen={confirmAction !== null}
                onConfirm={executeConfirmAction}
                onCancel={() => setConfirmAction(null)}
                title={confirmAction?.type === 'delete' ? 'Suppression' : 'Réinitialisation'}
                message={confirmAction?.type === 'delete'
                    ? "Cette action est irréversible. L'utilisateur et toutes ses données associées seront définitivement supprimés du système."
                    : "Un nouveau mot de passe sera généré et envoyé par email à l'agent. L'ancien mot de passe sera invalidé immédiatement."
                }
                confirmText={confirmAction?.type === 'delete' ? 'Supprimer' : 'Réinitialiser'}
                cancelText="Annuler"
                danger={confirmAction?.type === 'delete'}
            />
        </>
    )
}