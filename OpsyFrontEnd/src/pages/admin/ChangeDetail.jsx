import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../api/axios'

const statusConfig = {
    draft: { label: 'Brouillon', color: 'bg-slate-100 text-[#B5A1C2]/70' },
    pending_approval: { label: 'En attente', color: 'bg-[#D5CBE5] text-[#816A9E] font-semibold ring-1 ring-inset ring-[#5C2D8F]/20' },
    approved: { label: 'Approuvé', color: 'bg-blue-50 text-blue-700 font-semibold ring-1 ring-inset ring-blue-600/20' },
    in_progress: { label: 'En cours', color: 'bg-[#D5CBE5] text-[#5C2D8F] font-semibold ring-1 ring-inset ring-[#5C2D8F]/20' },
    done: { label: 'Terminé', color: 'bg-green-50 text-green-700 font-semibold ring-1 ring-inset ring-green-600/20' },
    rejected: { label: 'Rejeté', color: 'bg-red-50 text-red-700 font-semibold ring-1 ring-inset ring-red-600/20' },
}

export default function AdminChangeDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [cr, setCr] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const load = () => {
        setError(null)
        api.get(`/change-requests/${id}`)
            .then(res => setCr(res.data))
            .catch(err => {
                const msg = err.response?.data?.message || `Erreur ${err.response?.status || ''}`
                setError(msg)
            })
            .finally(() => setLoading(false))
    }

    useEffect(() => { load() }, [id])

    if (loading) return <div className="text-sm text-[#B5A1C2]/70 p-8">Chargement...</div>
    if (error) return <div className="text-sm text-red-500 p-8">Erreur : {error}</div>
    if (!cr) return <div className="text-sm text-red-500 p-8">Demande introuvable.</div>

    const status = statusConfig[cr.status]

    return (
        <div className="max-w-3xl">
            <button onClick={() => navigate(-1)} className="text-sm text-[#B5A1C2]/70 hover:text-white mb-4 inline-flex items-center gap-1 transition-colors">
                ← Retour
            </button>

            <div className="bg-[#3E1E70]/40 backdrop-blur-[24px] border border-[#5C2D8F]/30 shadow-card rounded-xl border border-[#5C2D8F]/50 p-6 mb-5">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h1 className="text-lg font-semibold text-[#E8E0F0]">{cr.title}</h1>
                        <p className="text-xs text-[#B5A1C2]/70 mt-1">ID: #REQ-{cr.id}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${status?.color}`}>
                        {status?.label}
                    </span>
                </div>

                <p className="text-sm text-[#D5CBE5]/90 mb-6 whitespace-pre-wrap">{cr.description}</p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm bg-black/20 p-4 rounded-lg border border-[#5C2D8F]/30 mb-6">
                    {[
                        ['Type', cr.change_type?.name],
                        ['Système affecté', cr.affected_system],
                        ['Date planifiée', cr.planned_date],
                        ['Risque', cr.risk_level === 'high' ? 'Élevé' : cr.risk_level === 'medium' ? 'Moyen' : 'Faible'],
                        ['Demandeur', cr.requester?.name],
                        ['Implémenteurs', cr.implementers?.length > 0 ? cr.implementers.map(i => i.name).join(', ') : 'Aucun'],
                    ].map(([label, value]) => (
                        <div key={label}>
                            <p className="text-xs text-[#B5A1C2]/70">{label}</p>
                            <p className="text-[#D5CBE5] font-medium mt-0.5">{value || '—'}</p>
                        </div>
                    ))}
                </div>

                {cr.approval_conditions && (
                    <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-lg mb-6">
                        <h3 className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Conditions d'approbation</h3>
                        <p className="text-sm text-[#E8E0F0] italic">"{cr.approval_conditions}"</p>
                    </div>
                )}
            </div>

            {/* Post-Change Analysis Display */}
            {cr.analysis && (
                <div className="bg-[#3E1E70]/40 backdrop-blur-[24px] shadow-card rounded-xl border border-[#5C2D8F]/50 p-6 mb-6">
                    <h2 className="text-sm font-medium text-[#D5CBE5] mb-4">Rapport d'exécution</h2>
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm bg-black/20 p-4 rounded-lg border border-[#5C2D8F]/30">
                        <div>
                            <span className="block text-xs text-[#B5A1C2]/70 mb-1">Impact</span>
                            <span className="text-[#E8E0F0]">{cr.analysis.impact_analysis || cr.analysis.impact}</span>
                        </div>
                        <div>
                            <span className="block text-xs text-[#B5A1C2]/70 mb-1">Résumé</span>
                            <span className="text-[#E8E0F0]">{cr.analysis.execution_summary || cr.analysis.description}</span>
                        </div>
                    </div>
                    {cr.incidents && cr.incidents.length > 0 && (
                        <div>
                            <h3 className="text-xs font-semibold text-amber-400 mb-3">Incidents signalés ({cr.incidents.length})</h3>
                            <div className="space-y-3">
                                {cr.incidents.map(inc => (
                                    <div key={inc.id} className="bg-red-500/5 border border-red-500/20 p-3 rounded-lg">
                                        <div className="flex justify-between mb-1">
                                            <span className="text-xs font-bold text-red-200">{inc.title}</span>
                                            <span className="text-[10px] uppercase font-bold text-red-400">{inc.severity}</span>
                                        </div>
                                        <p className="text-xs text-[#B5A1C2]/80">{inc.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* History */}
            {cr.histories?.length > 0 && (
                <div className="bg-[#3E1E70]/40 backdrop-blur-[24px] border border-[#5C2D8F]/30 shadow-card rounded-xl border border-[#5C2D8F]/50 p-6">
                    <h2 className="text-sm font-medium text-[#D5CBE5]/90 mb-4">Journal d'historique</h2>
                    <div className="space-y-4">
                        {cr.histories.map(h => (
                            <div key={h.id} className="border-l-2 border-[#5C2D8F]/50 pl-4 py-1">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-xs font-bold text-[#E8E0F0]">{h.user?.name}</span>
                                    <span className="text-[10px] text-[#B5A1C2]/50">{new Date(h.created_at).toLocaleString('fr-FR')}</span>
                                </div>
                                <div className="text-[10px] text-primary uppercase font-bold tracking-tighter mb-1">{h.status}</div>
                                {h.comment && <p className="text-xs text-[#B5A1C2] italic">"{h.comment}"</p>}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
