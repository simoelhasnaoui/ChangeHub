import { useEffect, useState, useRef } from 'react'
import api from '../../api/axios'

const roleLabel = {
    admin: 'Admin', approver: 'Approbateur',
    implementer: 'Implémenteur', requester: 'Demandeur',
}
const roleColor = {
    admin: 'bg-[#D5CBE5] text-[#5C2D8F] font-semibold ring-1 ring-inset ring-[#5C2D8F]/20',
    approver: 'bg-blue-50 text-blue-700 font-semibold ring-1 ring-inset ring-blue-600/20',
    implementer: 'bg-teal-500/10 text-teal-400 ring-1 ring-inset ring-teal-500/20',
    requester: 'bg-slate-100 text-[#B5A1C2]/70',
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
    const fileInputRef = useRef()
    
    const [error, setError] = useState('')
    const [saving, setSaving] = useState(false)

    const load = () => {
        api.get('/users').then(r => setUsers(r.data)).finally(() => setLoading(false))
    }

    useEffect(() => { load() }, [])

    const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

    const openCreateForm = () => {
        setEditingUser(null)
        setForm({ name: '', email: '', role: 'requester', department: '', job_title: '', phone: '', employee_id: '', status: 'active' })
        setAvatarFile(null)
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
        setShowForm(true)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        setError('')
        
        const fd = new FormData()
        Object.entries(form).forEach(([k, v]) => fd.append(k, v))
        if (avatarFile) fd.append('avatar', avatarFile)

        try {
            if (editingUser) {
                // Must use _method=PATCH for multipart/form-data
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
            load()
        } catch (err) {
            const errors = err.response?.data?.errors
            setError(errors ? Object.values(errors).flat().join(' ') : 'Erreur.')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Supprimer cet utilisateur ?')) return
        await api.delete(`/users/${id}`)
        load()
    }

    const handleResetPassword = async (id) => {
        if (!confirm('Réinitialiser le mot de passe de cet utilisateur ? Un email lui sera envoyé.')) return
        try {
            await api.post(`/users/${id}/reset-password`)
            alert('Mot de passe réinitialisé avec succès.')
        } catch (err) {
            alert('Erreur lors de la réinitialisation.')
        }
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-semibold text-[#E8E0F0]">Utilisateurs</h1>
                <button
                    onClick={() => showForm ? setShowForm(false) : openCreateForm()}
                    className="bg-primary hover:shadow-xl hover:shadow-[#5C2D8F]/50 hover:-translate-y-0.5 transition-all text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                    {showForm ? 'Fermer le formulaire' : '+ Nouvel utilisateur'}
                </button>
            </div>

            {/* Generated Password Modal */}
            {generatedPassword && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-[#2B1042] border border-[#5C2D8F] p-8 rounded-xl shadow-2xl max-w-sm w-full text-center">
                        <h2 className="text-[#E8E0F0] text-lg font-semibold mb-2">Utilisateur créé !</h2>
                        <p className="text-[#B5A1C2] text-sm mb-4">Voici le mot de passe temporaire auto-généré :</p>
                        <div className="bg-black/40 border border-[#5C2D8F]/50 p-3 rounded font-mono text-[#D5CBE5] text-lg tracking-wider mb-4 select-all">
                            {generatedPassword}
                        </div>
                        <div className="flex justify-center gap-3">
                            <button onClick={() => { navigator.clipboard.writeText(generatedPassword); alert("Copié !") }}
                                className="bg-[#3E1E70] text-[#D5CBE5] px-4 py-2 rounded-lg text-sm hover:bg-[#5C2D8F] transition-colors">
                                Copier
                            </button>
                            <button onClick={() => setGeneratedPassword('')}
                                className="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:shadow-xl transition-all">
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create/Edit Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="bg-[#3E1E70]/40 backdrop-blur-[24px] border border-[#5C2D8F]/30 shadow-card rounded-xl border border-[#5C2D8F]/50 p-6 mb-5 transition-all">
                    <h2 className="text-sm font-medium text-[#D5CBE5]/90 mb-4">{editingUser ? 'Modifier l\'utilisateur' : 'Créer un utilisateur'}</h2>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-xs text-[#B5A1C2]/70 mb-1">Nom complet *</label>
                            <input required value={form.name} onChange={e => set('name', e.target.value)}
                                className="w-full border border-[#5C2D8F]/50 bg-[#3E1E70]/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#816A9E] text-[#E8E0F0]" />
                        </div>
                        <div>
                            <label className="block text-xs text-[#B5A1C2]/70 mb-1">Email *</label>
                            <input required type="email" value={form.email} onChange={e => set('email', e.target.value)}
                                className="w-full border border-[#5C2D8F]/50 bg-[#3E1E70]/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#816A9E] text-[#E8E0F0]" />
                        </div>

                        <div>
                            <label className="block text-xs text-[#B5A1C2]/70 mb-1">Rôle *</label>
                            <select value={form.role} onChange={e => set('role', e.target.value)}
                                className="w-full border border-[#5C2D8F]/50 bg-[#3E1E70]/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#816A9E] text-[#E8E0F0]">
                                <option value="requester">Demandeur</option>
                                <option value="implementer">Implémenteur</option>
                                <option value="approver">Approbateur</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-[#B5A1C2]/70 mb-1">Département / Équipe</label>
                            <input value={form.department} onChange={e => set('department', e.target.value)}
                                className="w-full border border-[#5C2D8F]/50 bg-[#3E1E70]/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#816A9E] text-[#E8E0F0]" />
                        </div>

                        <div>
                            <label className="block text-xs text-[#B5A1C2]/70 mb-1">Titre de poste</label>
                            <input value={form.job_title} onChange={e => set('job_title', e.target.value)}
                                className="w-full border border-[#5C2D8F]/50 bg-[#3E1E70]/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#816A9E] text-[#E8E0F0]" />
                        </div>
                        <div>
                            <label className="block text-xs text-[#B5A1C2]/70 mb-1">Numéro de téléphone</label>
                            <input value={form.phone} onChange={e => set('phone', e.target.value)}
                                className="w-full border border-[#5C2D8F]/50 bg-[#3E1E70]/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#816A9E] text-[#E8E0F0]" />
                        </div>

                        <div>
                            <label className="block text-xs text-[#B5A1C2]/70 mb-1">ID Employé</label>
                            <input value={form.employee_id} onChange={e => set('employee_id', e.target.value)}
                                className="w-full border border-[#5C2D8F]/50 bg-[#3E1E70]/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#816A9E] text-[#E8E0F0]" />
                        </div>
                        <div>
                            <label className="block text-xs text-[#B5A1C2]/70 mb-1">Statut du compte</label>
                            <select value={form.status} onChange={e => set('status', e.target.value)}
                                className="w-full border border-[#5C2D8F]/50 bg-[#3E1E70]/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#816A9E] text-[#E8E0F0]">
                                <option value="active">Actif</option>
                                <option value="inactive">Inactif</option>
                            </select>
                        </div>
                        
                        <div className="col-span-2">
                            <label className="block text-xs text-[#B5A1C2]/70 mb-1">Avatar de profil (optionnel)</label>
                            <input type="file" ref={fileInputRef} accept="image/*" onChange={(e) => setAvatarFile(e.target.files[0])}
                                className="block w-full text-sm text-[#B5A1C2] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#5C2D8F]/30 file:text-[#E8E0F0] hover:file:bg-[#5C2D8F]/50" />
                        </div>
                    </div>

                    {!editingUser && (
                        <div className="text-xs text-[#B5A1C2] mb-4">
                            * Le mot de passe sera généré automatiquement et envoyé par email à la création.
                        </div>
                    )}

                    {error && <div className="bg-red-500/10 border border-red-500/50 text-red-200 text-sm rounded-lg px-3 py-2 mb-4">{error}</div>}
                    
                    <button type="submit" disabled={saving}
                        className="bg-primary hover:shadow-xl hover:shadow-[#5C2D8F]/50 hover:-translate-y-0.5 transition-all disabled:opacity-50 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors">
                        {saving ? 'Enregistrement...' : (editingUser ? 'Mettre à jour' : 'Créer l\'utilisateur')}
                    </button>
                </form>
            )}

            {/* Table */}
            <div className="bg-[#3E1E70]/40 backdrop-blur-[24px] border border-[#5C2D8F]/30 shadow-card rounded-xl border border-[#5C2D8F]/50 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-sm text-[#B5A1C2]/70">Chargement...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm whitespace-nowrap">
                            <thead>
                                <tr className="border-b border-[#5C2D8F]/50 bg-[#3E1E70]/20">
                                    <th className="text-left px-5 py-3 text-xs font-medium text-[#B5A1C2]/70">Nom</th>
                                    <th className="text-left px-5 py-3 text-xs font-medium text-[#B5A1C2]/70">Détails</th>
                                    <th className="text-left px-5 py-3 text-xs font-medium text-[#B5A1C2]/70">Rôle</th>
                                    <th className="text-left px-5 py-3 text-xs font-medium text-[#B5A1C2]/70">Statut</th>
                                    <th className="px-5 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id} className="border-b border-[#5C2D8F]/50 hover:bg-[#5C2D8F]/30 transition-colors">
                                        <td className="px-5 py-3">
                                            <div className="flex items-center gap-3">
                                                {u.avatar_path ? (
                                                    <img src={`http://127.0.0.1:8000/storage/${u.avatar_path}`} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-[#5C2D8F]" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-[#5C2D8F]/40 border border-[#5C2D8F] flex items-center justify-center text-[#E8E0F0] font-bold text-xs uppercase">
                                                        {u.name.charAt(0)}
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-medium text-[#E8E0F0]">{u.name}</div>
                                                    <div className="text-xs text-[#B5A1C2]">{u.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3">
                                            <div className="text-[#D5CBE5]">{u.job_title || '—'}</div>
                                            <div className="text-xs text-[#B5A1C2]">{u.department || '—'}</div>
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${roleColor[u.role]}`}>
                                                {roleLabel[u.role]}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3">
                                            {u.status === 'active' ? (
                                                <span className="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full border border-green-400/20">Actif</span>
                                            ) : (
                                                <span className="text-xs text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full border border-red-400/20">Inactif</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3 text-right space-x-3">
                                            <button onClick={() => handleResetPassword(u.id)}
                                                className="text-xs text-[#D5CBE5] hover:text-white transition-colors">
                                                Réinit. MP
                                            </button>
                                            <button onClick={() => openEditForm(u)}
                                                className="text-xs text-[#816A9E] hover:text-[#D5CBE5] transition-colors">
                                                Modifier
                                            </button>
                                            <button onClick={() => handleDelete(u.id)}
                                                className="text-xs text-red-400 hover:text-red-300 transition-colors">
                                                Supprimer
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}