import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../api/axios'

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

    if (initialFetch) return <div className="text-sm text-[#B5A1C2]/70 p-8">Chargement...</div>

    return (
        <div className="max-w-2xl">
            <div className="mb-6">
                <h1 className="text-xl font-semibold text-[#E8E0F0]">{isEdit ? 'Modifier le brouillon' : 'Nouvelle demande'}</h1>
                <p className="text-sm text-[#B5A1C2]/70 mt-0.5">{isEdit ? 'Mettez à jour les informations de votre brouillon' : 'Remplissez les informations de votre demande de changement'}</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-[#3E1E70]/40 backdrop-blur-[24px] border border-[#5C2D8F]/30 shadow-card rounded-xl border border-[#5C2D8F]/50 p-6 space-y-5">
                <div>
                    <label className="block text-sm font-medium text-[#D5CBE5]/90 mb-1">Titre</label>
                    <input
                        required value={form.title}
                        onChange={e => set('title', e.target.value)}
                        className="w-full border border-[#5C2D8F]/50 bg-[#3E1E70]/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: Déploiement version 2.1"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-[#D5CBE5]/90 mb-1">Description</label>
                    <textarea
                        required value={form.description}
                        onChange={e => set('description', e.target.value)}
                        rows={3}
                        className="w-full border border-[#5C2D8F]/50 bg-[#3E1E70]/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Décrivez le changement à effectuer..."
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-[#D5CBE5]/90 mb-1">Type de changement</label>
                        <select
                            required value={form.change_type_id}
                            onChange={e => set('change_type_id', e.target.value)}
                            className="w-full border border-[#5C2D8F]/50 bg-[#3E1E70]/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Sélectionner...</option>
                            {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#D5CBE5]/90 mb-1">Système affecté</label>
                        <input
                            required value={form.affected_system}
                            onChange={e => set('affected_system', e.target.value)}
                            className="w-full border border-[#5C2D8F]/50 bg-[#3E1E70]/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Ex: Serveur web production"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-[#D5CBE5]/90 mb-1">Date planifiée</label>
                        <input
                            type="date" required value={form.planned_date}
                            onChange={e => set('planned_date', e.target.value)}
                            className="w-full border border-[#5C2D8F]/50 bg-[#3E1E70]/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[#D5CBE5]/90 mb-1">Niveau de risque</label>
                        <select
                            required value={form.risk_level}
                            onChange={e => set('risk_level', e.target.value)}
                            className="w-full border border-[#5C2D8F]/50 bg-[#3E1E70]/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Sélectionner...</option>
                            <option value="low">Faible</option>
                            <option value="medium">Moyen</option>
                            <option value="high">Élevé</option>
                        </select>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-3 py-2">
                        {error}
                    </div>
                )}

                <div className="flex gap-3 pt-2">
                    <button
                        type="submit" disabled={loading}
                        className="bg-primary hover:shadow-xl hover:shadow-[#5C2D8F]/50 hover:-translate-y-0.5 transition-all disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
                    >
                        {loading ? 'Envoi...' : (isEdit ? 'Enregistrer les modifications' : 'Créer la demande')}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/requester/changes')}
                        className="text-[#B5A1C2]/70 hover:text-[#D5CBE5]/90 text-sm px-4 py-2 rounded-lg border border-[#5C2D8F]/50 hover:bg-[#5C2D8F]/30 transition-colors"
                    >
                        Annuler
                    </button>
                </div>
            </form>
        </div>
    )
}