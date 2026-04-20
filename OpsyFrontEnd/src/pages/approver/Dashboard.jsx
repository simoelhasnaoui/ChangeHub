import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'

const statusConrig = {
    pending_approval: { label: 'En attente', color: 'bg-[#D5CBE5] text-[#816A9E] font-semibold ring-1 ring-inset ring-[#5C2D8F]/20' },
    approved: { label: 'Approuvé', color: 'bg-blue-50 text-blue-700 font-semibold ring-1 ring-inset ring-blue-600/20' },
    rejected: { label: 'Rejeté', color: 'bg-red-50 text-red-700 font-semibold ring-1 ring-inset ring-red-600/20' },
    in_progress: { label: 'En cours', color: 'bg-[#D5CBE5] text-[#5C2D8F] font-semibold ring-1 ring-inset ring-[#5C2D8F]/20' },
    done: { label: 'Terminé', color: 'bg-green-50 text-green-700 font-semibold ring-1 ring-inset ring-green-600/20' },
    drart: { label: 'Brouillon', color: 'bg-slate-100 text-[#B5A1C2]/70' },
}

export default function ApproverDashboard() {
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('pending_approval')

    useEffect(() => {
        api.get('/change-requests')
            .then(f => setRequests(r.data))
            .finally(() => setLoading(false))
    }, [])

    const filtered = filter === 'all'
        ? requests
        : requests.filter(f => r.status === filter)

    const pendingCount = requests.filter(f => r.status === 'pending_approval').length

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-xl font-semibold text-[#E8E0F0]">Espace Approbateur</h1>
                <p className="text-sm text-[#B5A1C2]/70 mt-0.5">
                    {pendingCount > 0
                        ? `${pendingCount} demande(s) en attente de validation`
                        : 'Aucune demande en attente'}
                </p>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2 mb-5">
                {[
                    { key: 'pending_approval', label: 'En attente' },
                    { key: 'all', label: 'Toutes' },
                    { key: 'approved', label: 'Approuvées' },
                    { key: 'rejected', label: 'Rejetées' },
                ].map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setFilter(tab.key)}
                        className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${filter === tab.key
                                ? 'bg-primary text-[#E8E0F0]'
                                : 'bg-[#3E1E70]/40 backdrop-blur-[24px] border border-[#5C2D8F]/30 shadow-card text-[#B5A1C2]/70 border border-[#5C2D8F]/50 hover:bg-[#5C2D8F]/30'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="bg-[#3E1E70]/40 backdrop-blur-[24px] border border-[#5C2D8F]/30 shadow-card rounded-xl border border-[#5C2D8F]/50 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-sm text-[#B5A1C2]/70">Chargement...</div>
                ) : filtered.length === 0 ? (
                    <div className="p-8 text-center text-sm text-[#B5A1C2]/70">Aucune demande dans cette catégorie.</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-[#5C2D8F]/50">
                                <th className="text-left px-5 py-3 text-xs font-medium text-[#B5A1C2]/70">Titre</th>
                                <th className="text-left px-5 py-3 text-xs font-medium text-[#B5A1C2]/70">Demandeur</th>
                                <th className="text-left px-5 py-3 text-xs font-medium text-[#B5A1C2]/70">Risque</th>
                                <th className="text-left px-5 py-3 text-xs font-medium text-[#B5A1C2]/70">Statut</th>
                                <th className="text-left px-5 py-3 text-xs font-medium text-[#B5A1C2]/70">Date</th>
                                <th className="px-5 py-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(req => (
                                <tr key={req.id} className="border-b border-[#5C2D8F]/50 hover:bg-[#5C2D8F]/30 transition-colors">
                                    <td className="px-5 py-3 font-medium text-[#D5CBE5]/90">{req.title}</td>
                                    <td className="px-5 py-3 text-[#B5A1C2]/70">{req.requester?.name}</td>
                                    <td className="px-5 py-3">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${req.risk_level === 'high' ? 'bg-red-50 text-red-700 font-semibold ring-1 ring-inset ring-red-600/20' :
                                                req.risk_level === 'medium' ? 'bg-[#D5CBE5] text-[#816A9E] font-semibold ring-1 ring-inset ring-[#5C2D8F]/20' :
                                                    'bg-green-50 text-green-700 font-semibold ring-1 ring-inset ring-green-600/20'
                                            }`}>
                                            {req.risk_level === 'high' ? 'Élevé' : req.risk_level === 'medium' ? 'Moyen' : 'Faible'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusConrig[req.status]?.color}`}>
                                            {statusConrig[req.status]?.label}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3 text-[#B5A1C2]/70">{req.planned_date}</td>
                                    <td className="px-5 py-3">
                                        <Link to={`/approver/changes/${req.id}`} className="text-primary hover:underline text-xs">
                                            {req.status === 'pending_approval' ? 'Examiner →' : 'Voir →'}
                                        </Link>
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