import React, { useEffect, useState, useMemo } from 'react'
import { Link, useLocation } from 'react-router-dom'
import api from '../../api/axios'
import { motion, AnimatePresence } from 'framer-motion'
import {
    DndContext,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    useDroppable
} from '@dnd-kit/core'
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
    Activity, Layout, CheckCircle2, Clock,
    Server, ChevronRight, Hash, Layers,
    Maximize2, GripVertical, AlertCircle
} from 'lucide-react'
import { useSearch } from '../../context/SearchContext'

const STATUS_MAP = {
    approved: { label: 'Approuvé', color: '#3b82f6', bg: 'bg-blue-500/10' },
    in_progress: { label: 'En cours', color: '#D18CFF', bg: 'bg-[#D18CFF]/10' },
    done: { label: 'Terminé', color: '#10b981', bg: 'bg-emerald-500/10' },
    rejected: { label: 'Rejeté', color: '#f43f5e', bg: 'bg-rose-500/10' },
}

const RISK_MAP = {
    low: { label: 'Faible', color: '#10b981' },
    medium: { label: 'Moyen', color: '#f59e0b' },
    high: { label: 'Élevé', color: '#f43f5e' },
}

const COLUMNS = [
    { id: 'approved', title: 'À traiter', subtitle: 'Demandes approuvées', color: '#B5A1C2', icon: <Layers size={14} /> },
    { id: 'in_progress', title: 'En cours', subtitle: 'Exécution active', color: '#D18CFF', icon: <Activity size={14} /> },
    { id: 'done', title: 'Terminé', subtitle: 'Attente validation PV', color: '#10b981', icon: <CheckCircle2 size={14} /> },
]

function SortableItem({ id, req }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: req.id.toString(),
        data: req
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
        zIndex: isDragging ? 100 : 1,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="group relative"
        >
            <div className="bg-[#150522]/60 backdrop-blur-md border border-white/5 p-5 rounded-2xl shadow-xl hover:border-primary/30 transition-all mb-4 relative overflow-hidden">
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black tracking-widest text-primary opacity-40">ITEM_{req.id}</span>
                        {req.risk_level === 'high' && <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]" />}
                    </div>
                    <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 hover:bg-white/5 rounded-md text-[#B5A1C2]/20 hover:text-white transition-colors">
                        <GripVertical size={14} />
                    </div>
                </div>

                <h3 className="font-bold text-white text-sm leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">{req.title}</h3>

                <div className="flex flex-wrap gap-2 mt-4">
                    <span className="text-[8px] font-black uppercase tracking-widest bg-white/5 px-2 py-1 rounded-lg text-[#B5A1C2]/60 border border-white/5">
                        {req.affected_system}
                    </span>
                </div>

                <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-[9px] font-medium text-[#B5A1C2]/20">
                        <Clock size={10} />
                        {new Date(req.planned_date).toLocaleDateString('fr-FR')}
                    </div>
                    <Link
                        to={`/implementer/changes/${req.id}`}
                        className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-[#0F051E] transition-all shadow-lg shadow-primary/5"
                    >
                        <ChevronRight size={14} />
                    </Link>
                </div>
            </div>
        </div>
    )
}

function KanbanColumn({ col, items, activeItem, pulse }) {
    const { setNodeRef, isOver } = useDroppable({ id: col.id })

    return (
        <div
            ref={setNodeRef}
            className={`flex flex-col bg-[#150522]/40 backdrop-blur-3xl border transition-all duration-500 rounded-[2.5rem] min-h-[70vh] shadow-2xl relative ${isOver ? 'border-primary/40 scale-[1.02] bg-primary/5' : 'border-white/5'
                } ${pulse ? 'animate-pulse-magnetic' : ''}`}
        >
            {/* Magnetic Pulse Ripple */}
            {pulse && (
                <div className="absolute inset-0 bg-primary/20 animate-ripple pointer-events-none z-0 rounded-[2.5rem]" />
            )}

            <div className="p-6 xl:p-8 flex justify-between items-center border-b border-white/10 bg-white/[0.04] relative z-10 rounded-t-[2.4rem]">
                <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-white/5 rounded-xl transition-colors" style={{ color: col.color }}>{col.icon}</div>
                    <div>
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white">{col.title}</h2>
                        <p className="text-[9px] font-medium uppercase tracking-widest text-[#B5A1C2]/20 mt-0.5">{col.subtitle}</p>
                    </div>
                </div>
                <span className="bg-white/5 border border-white/10 text-[10px] font-black px-3 py-1 rounded-full text-[#B5A1C2]">{items.length}</span>
            </div>

            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar flex flex-col relative z-10">
                <SortableContext id={col.id} items={items.map(i => i.id.toString())} strategy={verticalListSortingStrategy}>
                    {items.map(req => (
                        <SortableItem key={req.id} id={req.id.toString()} req={req} />
                    ))}
                </SortableContext>

                {/* Magnetic Ghost Target */}
                {isOver && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border-2 border-dashed border-primary/30 rounded-2xl p-10 flex items-center justify-center bg-primary/5 mb-4"
                    >
                        <div className="flex flex-col items-center gap-2">
                            <Activity size={24} className="text-primary/20 animate-pulse" />
                            <span className="text-[8px] font-black uppercase tracking-widest text-primary/40">Snap_Here</span>
                        </div>
                    </motion.div>
                )}

                {items.length === 0 && !isOver && (
                    <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-white/5 rounded-3xl p-10 space-y-4 opacity-30 select-none">
                        <div className="p-4 bg-white/5 rounded-full"><Maximize2 size={24} className="text-[#B5A1C2]" /></div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-center">Déposer ici <br /> pour assigner</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function ImplementerDashboard() {
    const { searchQuery } = useSearch()
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeItem, setActiveItem] = useState(null)
    const [pulseColumn, setPulseColumn] = useState(null)
    const location = useLocation()
    const isArchive = new URLSearchParams(location.search).get('archived') === 'true'

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor)
    )

    const load = async (silent = false) => {
        if (!silent) setLoading(true)
        try {
            const r = await api.get('/change-requests')
            setRequests(r.data)
        } finally {
            if (!silent) setLoading(false)
        }
    }

    useEffect(() => { load() }, [])

    const filteredRequests = useMemo(() => {
        if (!searchQuery) return requests
        const q = searchQuery.toLowerCase()
        return requests.filter(r =>
            (r.title && r.title.toLowerCase().includes(q)) ||
            (r.affected_system && r.affected_system.toLowerCase().includes(q)) ||
            (r.id.toString().includes(q))
        )
    }, [requests, searchQuery])

    const handleDragStart = (e) => {
        const { active } = e
        const req = requests.find(r => r.id.toString() === active.id)
        setActiveItem(req)
    }

    const handleDragEnd = async (e) => {
        const { active, over } = e
        setActiveItem(null)

        if (!over) return

        const activeId = active.id
        const overContainer = over.id

        let targetStatus = null
        if (COLUMNS.map(c => c.id).includes(overContainer)) {
            targetStatus = overContainer
        } else {
            const overItem = requests.find(r => r.id.toString() === overContainer)
            if (overItem) targetStatus = overItem.status
        }

        const activeReq = requests.find(r => r.id.toString() === activeId)

        // Final check: For implementers, we allow moving between approved, in_progress, and done
        const statuses = ['approved', 'in_progress', 'done']
        if (!statuses.includes(targetStatus) || !statuses.includes(activeReq.status)) return

        // Optimistic UI
        const previousRequests = [...requests]
        setRequests(requests.map(r => r.id.toString() === activeId ? { ...r, status: targetStatus } : r))

        setPulseColumn(targetStatus)
        setTimeout(() => setPulseColumn(null), 1000)

        try {
            await api.post(`/change-requests/${activeId}/update-status`, { status: targetStatus })
            load(true)
        } catch (err) {
            setRequests(previousRequests)
            alert(err.response?.data?.message || 'Erreur lors de la mise à jour du statut.')
        }
    }

    const counts = {
        total: requests.length,
        todo: requests.filter(r => r.status === 'approved').length,
        active: requests.filter(r => r.status === 'in_progress').length,
        done: requests.filter(r => r.status === 'done').length,
    }

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
                <div className="w-20 h-20 border-2 border-white/5 border-t-primary rounded-full animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary animate-pulse">Initialisation du Pipeline technique...</p>
            </div>
        )
    }

    return (
        <div className="space-y-12 pb-20 font-inter max-w-[1600px] mx-auto flex flex-col h-full px-4">

            {/* ── HEADER ── */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-10 border-b border-white/5 shrink-0">
                <div className="space-y-4">
                    <p className="text-[11px] font-black uppercase tracking-[0.6em] text-primary">{isArchive ? 'RESOURCE_HISTORY_V1' : 'PIPELINE_TERMINAL'}</p>
                    <h1 className="text-5xl font-light tracking-tight text-white leading-none">
                        {isArchive ? 'Archives' : 'Console'} <span className="font-medium text-white/40">{isArchive ? 'Techniques' : 'Exécution'}</span>
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#B5A1C2]/40">
                        {isArchive ? 'Consultez l\'historique complet des interventions et des validations.' : 'Glissez-déposez les cartes pour synchroniser l\'état des opérations en temps réel.'}
                    </p>
                </div>
            </div>

            {!isArchive ? (
                <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1 min-h-0">
                        {COLUMNS.map(col => (
                            <KanbanColumn
                                key={col.id}
                                col={col}
                                items={filteredRequests.filter(r => r.status === col.id)}
                                activeItem={activeItem}
                                pulse={pulseColumn === col.id}
                            />
                        ))}
                    </div>

                    <DragOverlay dropAnimation={{
                        duration: 500,
                        easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
                    }}>
                        {activeItem ? (
                            <div className="bg-[#150522]/90 backdrop-blur-3xl border-2 border-primary/50 p-5 rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.8)] opacity-90 scale-105 rotate-2 cursor-grabbing ring-4 ring-primary/10">
                                <div className="flex justify-between items-start mb-3">
                                    <span className="text-[9px] font-black tracking-widest text-primary">ITEM_{activeItem.id}</span>
                                    <div className="p-1 px-2 rounded-md bg-primary/20 text-[8px] text-primary font-bold">MAGNETIC_LOCK</div>
                                </div>
                                <h3 className="font-bold text-white text-sm leading-tight mb-2">{activeItem.title}</h3>
                                <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-[#B5A1C2]/40">
                                    <Server size={10} /> {activeItem.affected_system}
                                </div>
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            ) : (
                <div className="bg-[#150522]/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] shadow-2xl p-8 xl:p-12">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#E8E0F0]">Répertoire Historique</h3>
                            <p className="text-[10px] text-[#B5A1C2]/40 mt-1">{filteredRequests.length} dossiers indexés</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-separate border-spacing-y-3">
                            <thead>
                                <tr className="text-[10px] font-black uppercase tracking-widest text-[#B5A1C2]/40">
                                    <th className="px-6 py-4">Sujet / ID</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Risque</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRequests.map((req) => (
                                    <tr key={req.id} className="group bg-white/[0.02] hover:bg-white/[0.05] transition-all h-[90px]">
                                        <td className="px-6 py-4 rounded-l-3xl">
                                            <div className="flex flex-col justify-center h-full">
                                                <span className="text-sm font-bold text-white group-hover:text-primary transition-colors line-clamp-1 leading-tight mb-1">{req.title}</span>
                                                <span className="text-[10px] font-medium text-[#B5A1C2]/40 group-hover:text-[#B5A1C2]/60">ITEM_{req.id} • {req.affected_system}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-white/5 ${STATUS_MAP[req.status]?.bg} ${STATUS_MAP[req.status]?.color ? '' : 'text-[#B5A1C2]'}`} style={{ color: STATUS_MAP[req.status]?.color }}>
                                                {STATUS_MAP[req.status]?.label || req.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: RISK_MAP[req.risk_level]?.color }} />
                                                <span className="text-[10px] font-bold text-[#E8E0F0] uppercase tracking-tighter">{RISK_MAP[req.risk_level]?.label}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs text-[#B5A1C2]/60 tabular-nums">{new Date(req.planned_date).toLocaleDateString('fr-FR')}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right rounded-r-3xl">
                                            <Link
                                                to={`/implementer/changes/${req.id}`}
                                                className="p-3 inline-flex items-center justify-center rounded-xl bg-white/5 hover:bg-primary hover:text-black transition-all"
                                            >
                                                <ChevronRight size={16} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes ripple {
                    0% { transform: scale(0.8); opacity: 0; }
                    50% { opacity: 0.5; }
                    100% { transform: scale(1.2); opacity: 0; }
                }
                .animate-ripple {
                    animation: ripple 0.8s ease-out forwards;
                }
                @keyframes pulse-magnetic {
                    0% { box-shadow: 0 0 0 0 rgba(209, 140, 255, 0); }
                    50% { box-shadow: 0 0 20px 5px rgba(209, 140, 255, 0.2); }
                    100% { box-shadow: 0 0 0 0 rgba(209, 140, 255, 0); }
                }
                .animate-pulse-magnetic {
                    animation: pulse-magnetic 1s ease-in-out infinite;
                }
            `}</style>
        </div>
    )
}