import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { generateReport } from '../../utils/generateReport'

export default function ManageChange() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [cr, setCr] = useState(null)
    const [loading, setLoading] = useState(true)
    const [comment, setComment] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [analysis, setAnalysis] = useState({
        incident_occurred: false, description: '', impact: '', solution: '', incidents: []
    })
    const [savingAnalysis, setSavingAnalysis] = useState(false)
    const [error, setError] = useState('')

    const load = () => {
        api.get(`/change-requests/${id}`)
            .then(r => {
                setCr(r.data)
                if (r.data.analysis) {
                    setAnalysis({
                        ...r.data.analysis,
                        incidents: r.data.incidents || []
                    })
                } else if (r.data.incidents) {
                    setAnalysis(a => ({ ...a, incidents: r.data.incidents }))
                }
            })
            .finally(() => setLoading(false))
    }

    useEffect(() => { load() }, [id])

    const handleStatusUpdate = async (status) => {
        setSubmitting(true)
        setError('')
        try {
            await api.post(`/change-requests/${id}/update-status`, { status, comment })
            load()
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur.')
        } finally {
            setSubmitting(false)
        }
    }

    const handleAnalysis = async (e) => {
        e.preventDefault()
        setSavingAnalysis(true)
        try {
            await api.post(`/change-requests/${id}/analysis`, analysis)
            await load()  // reload to get fresh data
            // Fetch the latest full CR data for the report
            const freshCr = await api.get(`/change-requests/${id}`).then(r => r.data)
            generateReport(freshCr, freshCr.analysis || analysis)
        } finally {
            setSavingAnalysis(false)
        }
    }

    if (loading) return <div className="text-sm text-[#B5A1C2]/70 p-8">Chargement...</div>
    if (!cr) return <div className="text-sm text-red-500 p-8">Demande introuvable.</div>

    return (
        <div className="max-w-2xl">
            <button onClick={() => navigate(-1)} className="text-sm text-[#B5A1C2]/70 hover:text-[#B5A1C2]/70 mb-4">
                ← Retour
            </button>

            <div className="bg-[#3E1E70]/40 backdrop-blur-[24px] border border-[#5C2D8F]/30 shadow-card rounded-xl border border-[#5C2D8F]/50 p-6 mb-4">
                <h1 className="text-lg font-semibold text-[#E8E0F0] mb-1">{cr.title}</h1>
                <p className="text-sm text-[#B5A1C2]/70 mb-5">{cr.description}</p>

                <div className="grid grid-cols-2 gap-4 text-sm mb-5">
                    {[
                        ['Système affecté', cr.affected_system],
                        ['Date planifiée', cr.planned_date],
                        ['Type', cr.change_type?.name],
                        ['Demandeur', cr.requester?.name],
                    ].map(([label, value]) => (
                        <div key={label}>
                            <p className="text-xs text-[#B5A1C2]/70">{label}</p>
                            <p className="text-[#D5CBE5]/90 font-medium mt-0.5">{value || '—'}</p>
                        </div>
                    ))}
                </div>

                {cr.approval_conditions && (
                    <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-lg mb-5">
                        <h3 className="text-xs font-bold text-amber-400 uppercase tracking-tighter mb-1">Conditions d'approbation (Requis)</h3>
                        <p className="text-sm text-[#E8E0F0] whitespace-pre-wrap italic">"{cr.approval_conditions}"</p>
                    </div>
                )}

                {/* Status actions */}
                {(cr.status === 'approved' || cr.status === 'in_progress') && (
                    <div className="border-t border-[#5C2D8F]/50 pt-5">
                        <label className="block text-sm font-medium text-[#D5CBE5]/90 mb-1">Commentaire</label>
                        <textarea
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            rows={2}
                            className="w-full border border-[#5C2D8F]/50 bg-[#3E1E70]/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                            placeholder="Commentaire optionnel..."
                        />
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-3 py-2 mb-3">
                                {error}
                            </div>
                        )}
                        {cr.status === 'approved' && (
                            <button
                                onClick={() => handleStatusUpdate('in_progress')} disabled={submitting}
                                className="bg-[#816A9E] hover:bg-[#3E1E70] disabled:opacity-50 text-[#E8E0F0] text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                            >
                                Démarrer l'implémentation
                            </button>
                        )}
                        {cr.status === 'in_progress' && (
                            <button
                                onClick={() => handleStatusUpdate('done')} disabled={submitting}
                                className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                            >
                                Marquer comme terminé
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Post-change analysis */}
            {cr.status === 'done' && (
                <div className="bg-[#3E1E70]/40 backdrop-blur-[24px] border border-[#5C2D8F]/30 shadow-card rounded-xl border border-[#5C2D8F]/50 p-6">
                    <h2 className="text-sm font-medium text-[#D5CBE5]/90 mb-4">Analyse post-changement</h2>
                    <form onSubmit={handleAnalysis} className="space-y-4">
                        <label className="flex items-center gap-2 text-sm text-[#D5CBE5]/90 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={analysis.incident_occurred}
                                onChange={e => setAnalysis(a => ({ ...a, incident_occurred: e.target.checked }))}
                                className="rounded"
                            />
                            Un incident est survenu
                        </label>
                        <div>
                            <label className="block text-xs text-[#B5A1C2]/70 mb-1">Description</label>
                            <textarea rows={2} value={analysis.description}
                                onChange={e => setAnalysis(a => ({ ...a, description: e.target.value }))}
                                className="w-full border border-[#5C2D8F]/50 bg-[#3E1E70]/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-[#B5A1C2]/70 mb-1">Impact</label>
                            <textarea rows={2} value={analysis.impact}
                                onChange={e => setAnalysis(a => ({ ...a, impact: e.target.value }))}
                                className="w-full border border-[#5C2D8F]/50 bg-[#3E1E70]/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-[#B5A1C2]/70 mb-1">Solution</label>
                            <textarea rows={2} value={analysis.solution}
                                onChange={e => setAnalysis(a => ({ ...a, solution: e.target.value }))}
                                className="w-full border border-[#5C2D8F]/50 bg-[#3E1E70]/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Incidents Array Field */}
                        <div className="border-t border-[#5C2D8F]/50 pt-4 mt-6">
                            <h3 className="text-sm font-medium text-[#D5CBE5]/90 mb-3">Détails des incidents ({analysis.incidents.length})</h3>
                            {analysis.incidents.map((inc, i) => (
                                <div key={i} className="bg-[#3E1E70]/20 border border-[#5C2D8F]/40 p-4 rounded-lg mb-4 space-y-3 relative">
                                    <button type="button" onClick={() => setAnalysis(a => ({ ...a, incidents: a.incidents.filter((_, idx) => idx !== i) }))}
                                        className="absolute top-2 right-2 text-xs text-red-500 hover:text-red-400">
                                        Retirer
                                    </button>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs text-[#B5A1C2]/70 mb-1">Titre de l'incident *</label>
                                            <input required type="text" value={inc.title || ''}
                                                onChange={e => {
                                                    const newInc = [...analysis.incidents]; newInc[i].title = e.target.value; setAnalysis(a => ({ ...a, incidents: newInc }));
                                                }}
                                                className="w-full border border-[#5C2D8F]/50 bg-[#3E1E70]/20 rounded-lg px-3 py-1.5 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-[#B5A1C2]/70 mb-1">Sévérité *</label>
                                            <select required value={inc.severity || 'low'}
                                                onChange={e => {
                                                    const newInc = [...analysis.incidents]; newInc[i].severity = e.target.value; setAnalysis(a => ({ ...a, incidents: newInc }));
                                                }}
                                                className="w-full border border-[#5C2D8F]/50 bg-[#3E1E70]/20 rounded-lg px-3 py-1.5 text-sm text-[#D5CBE5]"
                                            >
                                                <option value="low">Faible</option>
                                                <option value="medium">Moyenne</option>
                                                <option value="high">Haute</option>
                                                <option value="critical">Critique</option>
                                            </select>
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-xs text-[#B5A1C2]/70 mb-1">Description *</label>
                                            <textarea required rows={2} value={inc.description || ''}
                                                onChange={e => {
                                                    const newInc = [...analysis.incidents]; newInc[i].description = e.target.value; setAnalysis(a => ({ ...a, incidents: newInc }));
                                                }}
                                                className="w-full border border-[#5C2D8F]/50 bg-[#3E1E70]/20 rounded-lg px-3 py-1.5 text-sm"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-xs text-[#B5A1C2]/70 mb-1">Résolution *</label>
                                            <textarea required rows={2} value={inc.resolution || ''}
                                                onChange={e => {
                                                    const newInc = [...analysis.incidents]; newInc[i].resolution = e.target.value; setAnalysis(a => ({ ...a, incidents: newInc }));
                                                }}
                                                className="w-full border border-[#5C2D8F]/50 bg-[#3E1E70]/20 rounded-lg px-3 py-1.5 text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-[#B5A1C2]/70 mb-1">Temps de résolution (min) *</label>
                                            <input required type="number" min="0" value={inc.time_to_resolve_minutes || 0}
                                                onChange={e => {
                                                    const newInc = [...analysis.incidents]; newInc[i].time_to_resolve_minutes = parseInt(e.target.value) || 0; setAnalysis(a => ({ ...a, incidents: newInc }));
                                                }}
                                                className="w-full border border-[#5C2D8F]/50 bg-[#3E1E70]/20 rounded-lg px-3 py-1.5 text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button type="button" onClick={() => setAnalysis(a => ({ ...a, incidents: [...a.incidents, { title: '', severity: 'low', description: '', resolution: '', time_to_resolve_minutes: 30 }] }))}
                                className="text-xs text-[#D5CBE5] bg-[#3E1E70]/40 hover:bg-[#3E1E70]/60 border border-[#5C2D8F]/50 px-3 py-1.5 rounded-lg transition-colors">
                                + Ajouter un incident
                            </button>
                        </div>
                        <div className="flex items-center gap-3">
                            <button type="submit" disabled={savingAnalysis}
                                className="bg-primary hover:shadow-xl hover:shadow-[#5C2D8F]/50 hover:-translate-y-0.5 transition-all disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                            >
                                {savingAnalysis ? 'Enregistrement...' : 'Enregistrer l\'analyse'}
                            </button>
                            {cr.analysis && (
                                <button
                                    type="button"
                                    onClick={() => generateReport(cr, cr.analysis)}
                                    className="border border-[#5C2D8F]/50 bg-[#3E1E70]/20 hover:bg-[#5C2D8F]/30 text-[#B5A1C2]/70 text-sm font-medium px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-1.5"
                                >
                                    ↓ Exporter le rapport
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            )}
        </div>
    )
}