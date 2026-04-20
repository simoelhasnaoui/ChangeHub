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

const reqValidationConfig = {
    pending: { label: 'Validation en attente', color: 'text-amber-400' },
    validated: { label: 'Validé avec succès', color: 'text-green-400' },
    rejected: { label: 'Rejeté / À refaire', color: 'text-red-400' },
}

export default function ChangeDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [cr, setCr] = useState(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState(null)

    // Validation state
    const [validationStatus, setValidationStatus] = useState('')
    const [validationComment, setValidationComment] = useState('')
    const [validating, setValidating] = useState(false)

    const load = () => {
        setError(null)
        api.get(`/change-requests/${id}`)
            .then(r => setCr(r.data))
            .catch(err => {
                const msg = err.response?.data?.message || `Erreur ${err.response?.status || ''}`
                setError(msg)
            })
            .finally(() => setLoading(false))
    }

    useEffect(() => { load() }, [id])

    const handleSubmit = async () => {
        setSubmitting(true)
        try {
            await api.post(`/change-requests/${id}/submit`)
            load()
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!confirm('Êtes-vous sûr ?')) return
        setSubmitting(true)
        try {
            await api.delete(`/change-requests/${id}`)
            navigate('/requester/changes')
        } catch (err) {
            alert('Erreur lors de la suppression.')
            setSubmitting(false)
        }
    }

    const handleValidate = async (e) => {
        e.preventDefault()
        setValidating(true)
        try {
            await api.post(`/change-requests/${id}/validate`, {
                validation_status: validationStatus,
                comment: validationComment
            })
            load()
        } catch (err) {
            alert(err.response?.data?.message || 'Erreur.')
        } finally {
            setValidating(false)
        }
    }

    if (loading) return <div className="text-sm text-[#B5A1C2]/70 p-8">Chargement...</div>
    if (error) return <div className="text-sm text-red-500 p-8">Erreur : {error}</div>
    if (!cr) return <div className="text-sm text-red-500 p-8">Demande introuvable.</div>

    const status = statusConfig[cr.status]

    return (
        <div className="max-w-3xl">
            <button onClick={() => navigate('/requester/changes')} className="text-sm text-[#B5A1C2]/70 hover:text-white mb-4 inline-flex items-center gap-1 transition-colors">
                ← Retour au tableau de bord
            </button>

            <div className="bg-[#3E1E70]/40 backdrop-blur-[24px] shadow-card rounded-xl border border-[#5C2D8F]/50 p-6 mb-5">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h1 className="text-lg font-semibold text-[#E8E0F0]">{cr.title}</h1>
                        <p className="text-xs text-[#B5A1C2]/70 mt-1">#REQ-{cr.id}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${status?.color}`}>
                        {status?.label}
                    </span>
                </div>

                <p className="text-sm text-[#D5CBE5]/90 mb-5 whitespace-pre-wrap">{cr.description}</p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm bg-black/20 p-4 rounded-lg border border-[#5C2D8F]/30">
                    {[
                        ['Type', cr.change_type?.name],
                        ['Système affecté', cr.affected_system],
                        ['Date planifiée', cr.planned_date],
                        ['Risque', cr.risk_level],
                        ['Demandeur', cr.requester?.name],
                        ['Implémenteur', cr.implementer?.name],
                    ].map(([label, value]) => (
                        <div key={label}>
                            <p className="text-xs text-[#B5A1C2]/70">{label}</p>
                            <p className="text-[#E8E0F0] font-medium mt-0.5">{value || '—'}</p>
                        </div>
                    ))}
                </div>

                {cr.status === 'draft' && (
                    <div className="mt-6 flex gap-3">
                        <button
                            onClick={handleSubmit} disabled={submitting}
                            className="bg-primary hover:shadow-xl hover:shadow-[#5C2D8F]/50 hover:-translate-y-0.5 transition-all outline-none text-white text-sm font-medium px-5 py-2.5 rounded-lg"
                        >
                            {submitting ? 'Envoi...' : 'Soumettre pour approbation'}
                        </button>
                        <button
                            onClick={() => navigate(`/requester/changes/${id}/edit`)}
                            className="bg-[#3E1E70]/50 hover:bg-[#5C2D8F]/50 transition-colors text-[#D5CBE5] text-sm font-medium px-5 py-2.5 rounded-lg border border-[#5C2D8F]/50"
                        >
                            Modifier
                        </button>
                        <button
                            onClick={handleDelete} disabled={submitting}
                            className="hover:bg-red-500/10 text-red-400 text-sm font-medium px-5 py-2.5 rounded-lg border border-transparent hover:border-red-500/20 transition-colors"
                        >
                            Supprimer
                        </button>
                    </div>
                )}
            </div>

            {/* Post-Change Analysis Display */}
            {cr.analysis && (
                <div className="bg-[#3E1E70]/40 backdrop-blur-[24px] shadow-card rounded-xl border border-[#5C2D8F]/50 p-6 mb-5">
                    <h2 className="text-sm font-medium text-[#D5CBE5]/90 mb-4 flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Rapport d'implémentation
                    </h2>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm bg-black/20 p-4 border border-[#5C2D8F]/30 rounded-lg">
                        <div>
                            <span className="block text-xs text-[#B5A1C2]/70 mb-1">Impact</span>
                            <span className="text-[#E8E0F0] whitespace-pre-wrap">{cr.analysis.impact_analysis}</span>
                        </div>
                        <div>
                            <span className="block text-xs text-[#B5A1C2]/70 mb-1">Résumé de l'exécution</span>
                            <span className="text-[#E8E0F0] whitespace-pre-wrap">{cr.analysis.execution_summary}</span>
                        </div>
                        <div className="col-span-2 mt-2 pt-2 border-t border-[#5C2D8F]/30">
                            <span className="block text-xs text-[#B5A1C2]/70 mb-1">Tests de retour arrière (Rollback)</span>
                            <span className="text-[#E8E0F0] whitespace-pre-wrap">{cr.analysis.rollback_tests || 'Non spécifié'}</span>
                        </div>
                    </div>

                    {cr.incidents && cr.incidents.length > 0 && (
                        <div>
                            <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-3">Incidents signalés ({cr.incidents.length})</h3>
                            <div className="space-y-3">
                                {cr.incidents.map(inc => (
                                    <div key={inc.id} className="bg-[#2B1042]/50 border border-amber-900/40 p-4 rounded-lg">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-medium text-amber-100 text-sm">{inc.title}</span>
                                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                                                inc.severity === 'high' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                                                inc.severity === 'medium' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                                                'bg-[#3E1E70]/50 text-[#B5A1C2] border-[#5C2D8F]/50'
                                            }`}>Sévérité: {inc.severity}</span>
                                        </div>
                                        <p className="text-xs text-[#B5A1C2]/80 mb-2">{inc.description}</p>
                                        <div className="bg-black/20 p-2 rounded text-xs border border-amber-900/20">
                                            <span className="font-semibold text-green-300">Résolution ({inc.time_to_resolve_minutes} min): </span>
                                            <span className="text-green-100/70">{inc.resolution}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Validation Action */}
                    {cr.status === 'done' && (
                        <div className="mt-6 pt-5 border-t border-[#5C2D8F]/50">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-medium text-[#E8E0F0]">Statut de validation côté demandeur</h3>
                                {cr.requester_validation_status !== 'pending' && (
                                    <span className={`text-sm font-semibold ${reqValidationConfig[cr.requester_validation_status]?.color}`}>
                                        {reqValidationConfig[cr.requester_validation_status]?.label}
                                    </span>
                                )}
                            </div>

                            {cr.requester_validation_status === 'pending' && (
                                <form onSubmit={handleValidate} className="bg-black/20 p-4 rounded border border-[#5C2D8F]/40">
                                    <p className="text-xs text-[#B5A1C2]/90 mb-3">
                                        Veuillez examiner le rapport ci-dessus et confirmer si le changement a été implémenté avec succès ou s'il nécessite une correction.
                                    </p>
                                    
                                    <div className="flex gap-4 mb-4">
                                        <label className="flex items-center gap-2 text-sm cursor-pointer border border-[#5C2D8F]/50 px-4 py-2 rounded-lg hover:bg-[#5C2D8F]/20 transition-colors">
                                            <input type="radio" name="validation" value="validated" required 
                                                onChange={(e) => setValidationStatus(e.target.value)} 
                                                className="accent-primary" />
                                            <span className="text-green-400">Valider (Terminé)</span>
                                        </label>
                                        <label className="flex items-center gap-2 text-sm cursor-pointer border border-[#5C2D8F]/50 px-4 py-2 rounded-lg hover:bg-[#5C2D8F]/20 transition-colors">
                                            <input type="radio" name="validation" value="rejected" required 
                                                onChange={(e) => setValidationStatus(e.target.value)} 
                                                className="accent-primary" />
                                            <span className="text-red-400">Rejeter (À refaire)</span>
                                        </label>
                                    </div>
                                    
                                    {validationStatus === 'rejected' && (
                                        <textarea
                                            required placeholder="Indiquez pourquoi ce changement est rejeté (ce retour sera renvoyé à l'implémenteur)..."
                                            value={validationComment} onChange={(e) => setValidationComment(e.target.value)}
                                            rows="2" className="w-full border border-red-500/50 bg-[#3E1E70]/20 rounded-lg px-3 py-2 text-sm mb-4 focus:outline-none focus:ring-1 focus:ring-red-500 text-[#E8E0F0]"
                                        />
                                    )}

                                    <button disabled={validating || !validationStatus} type="submit"
                                        className="bg-primary hover:shadow-xl hover:-translate-y-0.5 transition-all text-white text-sm font-medium px-5 py-2 rounded-lg disabled:opacity-50">
                                        {validating ? 'Traitement...' : 'Confirmer l\'évaluation'}
                                    </button>
                                </form>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* History */}
            {cr.histories?.length > 0 && (
                <div className="bg-[#3E1E70]/40 backdrop-blur-[24px] shadow-card rounded-xl border border-[#5C2D8F]/50 p-6">
                    <h2 className="text-sm font-medium text-[#D5CBE5]/90 mb-4">Historique</h2>
                    <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[#5C2D8F]/50 before:to-transparent">
                        {cr.histories.map((h, idx) => (
                            <div key={h.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                <div className="flex items-center justify-center w-5 h-5 rounded-full border border-white bg-slate-300 group-[.is-active]:bg-primary text-slate-500 group-[.is-active]:text-emerald-50 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-colors">
                                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                                </div>
                                <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] bg-[#2B1042] border border-[#5C2D8F]/30 p-3 rounded shadow-sm">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-semibold text-xs text-[#D5CBE5]">{h.user?.name}</span>
                                        <span className="text-[10px] text-[#B5A1C2]/60">{new Date(h.created_at).toLocaleString('fr-FR')}</span>
                                    </div>
                                    <div className="text-xs text-[#B5A1C2]/80 mt-1 pb-1">
                                            Status: <span className="text-[#E8E0F0] capitalize bg-[#3E1E70] px-1.5 py-0.5 rounded">{h.status}</span>
                                    </div>
                                    {h.comment && <p className="text-xs text-[#D5CBE5]/90 mt-1 italic border-t border-[#5C2D8F]/20 pt-1">"{h.comment}"</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}