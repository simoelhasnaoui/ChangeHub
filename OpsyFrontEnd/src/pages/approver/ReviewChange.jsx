import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../api/axios'

export default function ReviewChange() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [cr, setCr] = useState(null)
    const [loading, setLoading] = useState(true)
    const [comment, setComment] = useState('')
    const [approvalConditions, setApprovalConditions] = useState('')
    const [action, setAction] = useState(null)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    
    // Multi-Implementers state
    const [implementers, setImplementers] = useState([])
    const [selectedImplementers, setSelectedImplementers] = useState([])

    useEffect(() => {
        api.get(`/change-requests/${id}`)
            .then(r => setCr(r.data))
            .finally(() => setLoading(false))
        api.get('/users/implementers').then(r => setImplementers(r.data))
    }, [id])

    const handleImplementerToggle = (userId) => {
        if (selectedImplementers.includes(userId)) {
            setSelectedImplementers(selectedImplementers.filter(id => id !== userId))
        } else {
            setSelectedImplementers([...selectedImplementers, userId])
        }
    }

    const handleAction = async (type) => {
        if (type === 'reject' && !comment.trim()) {
            setError('Un commentaire est obligatoire pour rejeter une demande.')
            return
        }
        if (type === 'approve' && selectedImplementers.length === 0) {
            setError('Veuillez sélectionner au moins un implémenteur avant d\'approuver.')
            return
        }
        setSubmitting(true)
        setError('')
        try {
            const payload = { comment }
            if (type === 'approve') {
                payload.implementers = selectedImplementers
                if (approvalConditions.trim()) {
                    payload.approval_conditions = approvalConditions.trim()
                }
            }
            await api.post(`/change-requests/${id}/${type}`, payload)
            navigate('/approver')
        } catch (err) {
            setError(err.response?.data?.message || 'Une erreur est survenue.')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) return <div className="text-sm text-[#B5A1C2]/70 p-8">Chargement...</div>
    if (!cr) return <div className="text-sm text-red-500 p-8">Demande introuvable.</div>

    return (
        <div className="max-w-2xl">
            <button onClick={() => navigate(-1)} className="text-sm text-[#B5A1C2]/70 hover:text-[#B5A1C2] transition-colors mb-4 inline-flex items-center gap-1">
                ← Retour
            </button>

            <div className="bg-[#3E1E70]/40 backdrop-blur-[24px] border border-[#5C2D8F]/30 shadow-card rounded-xl p-6 mb-4">
                <h1 className="text-lg font-semibold text-[#E8E0F0] mb-1">{cr.title}</h1>
                <p className="text-sm text-[#B5A1C2]/70 mb-5">{cr.description}</p>

                <div className="grid grid-cols-2 gap-4 text-sm mb-5 bg-black/20 p-4 rounded-lg border border-[#5C2D8F]/30">
                    {[
                        ['Type', cr.change_type?.name],
                        ['Système affecté', cr.affected_system],
                        ['Date planifiée', cr.planned_date],
                        ['Risque', cr.risk_level === 'high' ? 'Élevé' : cr.risk_level === 'medium' ? 'Moyen' : 'Faible'],
                        ['Demandeur', cr.requester?.name],
                        ['Implémenteurs assignés', cr.implementers && cr.implementers.length > 0 
                            ? cr.implementers.map(i => i.name).join(', ') 
                            : 'Non assigné'],
                    ].map(([label, value]) => (
                        <div key={label}>
                            <p className="text-xs text-[#B5A1C2]">{label}</p>
                            <p className="text-[#D5CBE5] font-medium mt-0.5">{value || '—'}</p>
                        </div>
                    ))}
                    
                    {cr.approval_conditions && (
                        <div className="col-span-2 mt-2 pt-2 border-t border-[#5C2D8F]/30">
                            <p className="text-xs text-amber-500 font-semibold mb-1">Conditions d'approbation</p>
                            <p className="text-[#D5CBE5] text-sm whitespace-pre-wrap">{cr.approval_conditions}</p>
                        </div>
                    )}
                </div>

                {cr.status === 'pending_approval' && (
                    <div className="border-t border-[#5C2D8F]/50 pt-5">
                        <div className="mb-5">
                            <label className="block text-sm font-medium text-[#D5CBE5]/90 mb-2">
                                Assigner des implémenteurs <span className="text-primary">*</span>
                            </label>
                            <div className="grid grid-cols-2 gap-2 bg-[#3E1E70]/20 p-3 rounded-lg border border-[#5C2D8F]/50">
                                {implementers.length === 0 ? (
                                    <div className="text-xs text-red-400 col-span-2">Aucun implémenteur actif trouvé sur la plateforme.</div>
                                ) : implementers.map(u => (
                                    <label key={u.id} className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors border ${selectedImplementers.includes(u.id) ? 'bg-[#5C2D8F]/40 border-[#816A9E]' : 'border-transparent hover:bg-[#5C2D8F]/20'}`}>
                                        <input type="checkbox" checked={selectedImplementers.includes(u.id)} onChange={() => handleImplementerToggle(u.id)} className="accent-primary" />
                                        <span className="text-sm text-[#E8E0F0]">{u.name}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-[#D5CBE5]/90 mb-1">
                                Conditions d'approbation (Requis pour l'implémentation)
                            </label>
                            <textarea
                                value={approvalConditions}
                                onChange={e => setApprovalConditions(e.target.value)}
                                rows={2}
                                className="w-full border border-[#5C2D8F]/50 bg-[#3E1E70]/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#816A9E] text-[#E8E0F0] placeholder-[#B5A1C2]/40"
                                placeholder="Si des conditions ou étapes spécifiques sont exigées..."
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-[#D5CBE5]/90 mb-1">
                                Commentaire interne {action === 'reject' && <span className="text-red-500">*</span>}
                            </label>
                            <textarea
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                                rows={3}
                                className="w-full border border-[#5C2D8F]/50 bg-[#3E1E70]/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#816A9E] text-[#E8E0F0] placeholder-[#B5A1C2]/40"
                                placeholder="Ajoutez un historique (obligatoire pour rejeter)..."
                            />
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-200 text-sm rounded-lg px-3 py-2 mb-3">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => handleAction('approve')} disabled={submitting}
                                className="bg-green-600/80 hover:bg-green-500 border border-green-500 shadow-lg shadow-green-900/20 disabled:opacity-50 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-all"
                            >
                                {submitting ? 'Traitement...' : 'Approuver la demande'}
                            </button>
                            <button
                                onClick={() => handleAction('reject')} disabled={submitting}
                                className="bg-red-500/20 hover:bg-red-500/40 border border-red-500/50 text-red-300 disabled:opacity-50 text-sm font-medium px-6 py-2.5 rounded-lg transition-all"
                            >
                                Rejeter
                            </button>
                        </div>
                    </div>
                )}

                {cr.status !== 'pending_approval' && (
                    <div className="border-t border-[#5C2D8F]/50 pt-4 mt-5">
                        <p className="text-sm text-green-400 font-semibold">
                            Cette demande ne nécessite plus d'approbation.
                        </p>
                    </div>
                )}
            </div>

            {/* History */}
            {cr.histories?.length > 0 && (
                <div className="bg-[#3E1E70]/40 backdrop-blur-[24px] border border-[#5C2D8F]/30 shadow-card rounded-xl p-6">
                    <h2 className="text-sm font-medium text-[#D5CBE5]/90 mb-4">Historique</h2>
                    <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px before:h-full before:w-0.5 before:bg-[#5C2D8F]/50">
                        {cr.histories.map(h => (
                            <div key={h.id} className="relative flex items-center gap-4 pl-6">
                                <div className="absolute left-0 w-4 h-4 rounded-full border-2 border-[#816A9E] bg-[#2B1042] ml-0.5"></div>
                                <div className="w-full bg-black/20 p-3 rounded-lg border border-[#5C2D8F]/30">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="text-sm font-semibold text-[#E8E0F0]">{h.user?.name}</span>
                                        <span className="text-xs text-[#B5A1C2]">{new Date(h.created_at).toLocaleString('fr-FR')}</span>
                                    </div>
                                    <div className="text-xs text-[#B5A1C2]/80 uppercase font-bold tracking-wider mb-2">{h.status}</div>
                                    {h.comment && <p className="text-sm text-[#D5CBE5] italic border-l-2 border-[#5C2D8F] pl-2 py-1 bg-[#3E1E70]/10 rounded-r">"{h.comment}"</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}