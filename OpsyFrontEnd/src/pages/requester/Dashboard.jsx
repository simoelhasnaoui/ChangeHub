import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'

const statusConfig = {
    draft: { label: 'Brouillon', color: 'bg-slate-100 text-[#B5A1C2]/70' },
    pending_approval: { label: 'En attente', color: 'bg-[#D5CBE5] text-[#816A9E] font-semibold ring-1 ring-inset ring-[#5C2D8F]/20' },
    approved: { label: 'Approuvé', color: 'bg-blue-50 text-blue-700 font-semibold ring-1 ring-inset ring-blue-600/20' },
    in_progress: { label: 'En cours', color: 'bg-[#D5CBE5] text-[#5C2D8F] font-semibold ring-1 ring-inset ring-[#5C2D8F]/20' },
    done: { label: 'Terminé', color: 'bg-green-50 text-green-700 font-semibold ring-1 ring-inset ring-green-600/20' },
    rejected: { label: 'Rejeté', color: 'bg-red-50 text-red-700 font-semibold ring-1 ring-inset ring-red-600/20' },
}

const riskConfig = {
    low: { label: 'Faible', color: 'bg-green-50 text-green-700 font-semibold ring-1 ring-inset ring-green-600/20' },
    medium: { label: 'Moyen', color: 'bg-[#D5CBE5] text-[#816A9E] font-semibold ring-1 ring-inset ring-[#5C2D8F]/20' },
    high: { label: 'Élevé', color: 'bg-red-50 text-red-700 font-semibold ring-1 ring-inset ring-red-600/20' },
}

export default function RequesterDashboard() {
    const { user } = useAuth()
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)

    const load = () => {
        setLoading(true)
        api.get('/change-requests')
            .then(r => setRequests(r.data))
            .finally(() => setLoading(false))
    }

    useEffect(() => { load() }, [])

    const handleDelete = async (id) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce brouillon ?')) return
        try {
            await api.delete(`/change-requests/${id}`)
            load()
        } catch (err) {
            alert(err.response?.data?.message || 'Erreur lors de la suppression.')
        }
    }

    const counts = {
        total: requests.length,
        pending: requests.filter(r => r.status === 'pending_approval').length,
        approved: requests.filter(r => r.status === 'approved').length,
        done: requests.filter(r => r.status === 'done').length,
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-xl font-semibold text-[#E8E0F0]">Bonjour, {user?.name}</h1>
                    <p className="text-sm text-[#B5A1C2]/70 mt-0.5">Vos demandes de changement</p>
                </div>
                <Link
                    to="/requester/new"
                    className="bg-primary hover:shadow-xl hover:shadow-[#5C2D8F]/50 hover:-translate-y-0.5 transition-all text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                    + Nouvelle demande
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Total', value: counts.total, color: 'text-[#E8E0F0]' },
                    { label: 'En attente', value: counts.pending, color: 'text-[#B5A1C2]' },
                    { label: 'Approuvées', value: counts.approved, color: 'text-primary' },
                    { label: 'Terminées', value: counts.done, color: 'text-green-600' },
                ].map(s => (
                    <div key={s.label} className="bg-[#3E1E70]/40 backdrop-blur-[24px] border border-[#5C2D8F]/30 shadow-card rounded-xl border border-[#5C2D8F]/50 p-4">
                        <p className="text-xs text-[#B5A1C2]/70">{s.label}</p>
                        <p className={`text-2xl font-semibold mt-1 ${s.color}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* List */}
            <div className="bg-[#3E1E70]/40 backdrop-blur-[24px] border border-[#5C2D8F]/30 shadow-card rounded-xl border border-[#5C2D8F]/50 overflow-hidden">
                <div className="px-5 py-4 border-b border-[#5C2D8F]/50">
                    <h2 className="text-sm font-medium text-[#D5CBE5]/90">Mes demandes récentes</h2>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-sm text-[#B5A1C2]/70">Chargement...</div>
                ) : requests.length === 0 ? (
                    <div className="p-8 text-center">
                        <p className="text-sm text-[#B5A1C2]/70">Aucune demande pour l'instant.</p>
                        <Link to="/requester/new" className="text-sm text-primary hover:underline mt-1 inline-block">
                            Créer votre première demande →
                        </Link>
                    </div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-[#5C2D8F]/50">
                                <th className="text-left px-5 py-3 text-xs font-medium text-[#B5A1C2]/70">Titre</th>
                                <th className="text-left px-5 py-3 text-xs font-medium text-[#B5A1C2]/70">Type</th>
                                <th className="text-left px-5 py-3 text-xs font-medium text-[#B5A1C2]/70">Risque</th>
                                <th className="text-left px-5 py-3 text-xs font-medium text-[#B5A1C2]/70">Statut</th>
                                <th className="text-left px-5 py-3 text-xs font-medium text-[#B5A1C2]/70">Date planifiée</th>
                                <th className="px-5 py-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map(req => (
                                <tr key={req.id} className="border-b border-[#5C2D8F]/50 hover:bg-[#5C2D8F]/30 transition-colors">
                                    <td className="px-5 py-3 font-medium text-[#D5CBE5]/90">{req.title}</td>
                                    <td className="px-5 py-3 text-[#B5A1C2]/70">{req.change_type?.name}</td>
                                    <td className="px-5 py-3">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${riskConfig[req.risk_level]?.color}`}>
                                            {riskConfig[req.risk_level]?.label}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusConfig[req.status]?.color}`}>
                                            {statusConfig[req.status]?.label}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-[#B5A1C2]/70">{req.planned_date}</td>
                                    <td className="px-5 py-3 text-right space-x-3">
                                        <Link to={`/requester/changes/${req.id}`} className="text-primary hover:underline text-xs">
                                            Voir →
                                        </Link>
                                        {req.status === 'draft' && (
                                            <>
                                                <Link to={`/requester/changes/${req.id}/edit`} className="text-[#816A9E] hover:text-[#D5CBE5] transition-colors text-xs">
                                                    Modifier
                                                </Link>
                                                <button onClick={() => handleDelete(req.id)} className="text-red-400 hover:text-red-300 transition-colors text-xs">
                                                    Supprimer
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}