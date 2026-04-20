import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

const COLUMNS = [
    { id: 'approved', title: 'À faire (Approuvé)' },
    { id: 'in_progress', title: 'En cours' },
    { id: 'done', title: 'Terminé' },
]

function SortableItem({ id, req }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: req.id.toString(), data: req })
    
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    }

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="bg-[#2B1042]/80 backdrop-blur-md border border-[#5C2D8F]/30 p-4 rounded-xl shadow-lg cursor-grab active:cursor-grabbing mb-3 hover:border-[#5C2D8F] transition-colors relative group">
            <h3 className="font-medium text-[#E8E0F0] text-sm break-words">{req.title}</h3>
            <p className="text-xs text-[#B5A1C2] mt-1 line-clamp-2">{req.description}</p>
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-[#5C2D8F]/30">
                <span className="text-[10px] bg-black/30 px-2 py-0.5 rounded text-[#D5CBE5]">{req.affected_system || 'N/A'}</span>
                <span className="text-[10px] text-fuchsia-300">#{req.id}</span>
            </div>
            
            {/* Action overlay that appears on hover, allows clicking without dragging */}
            <div className="absolute inset-x-0 bottom-0 top-0 hidden group-hover:flex items-end justify-center pointer-events-none pb-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link 
                    to={`/implementer/changes/${req.id}`} 
                    onPointerDown={(e) => e.stopPropagation()} // Prevent drag start when clicking button
                    className="pointer-events-auto bg-[#5C2D8F] text-white text-[10px] px-3 py-1 rounded-full shadow-lg hover:bg-fuchsia-600 transition-colors"
                >
                    Gérer
                </Link>
            </div>
        </div>
    )
}

function KanbanColumn({ col, items }) {
    return (
        <div className="flex flex-col bg-[#3E1E70]/20 border border-[#5C2D8F]/30 rounded-2xl overflow-hidden h-[65vh]">
            <div className="bg-[#3E1E70]/60 p-4 border-b border-[#5C2D8F]/30 flex justify-between items-center shrink-0">
                <h2 className="text-sm font-semibold text-[#D5CBE5]">{col.title}</h2>
                <span className="bg-black/30 text-xs px-2 py-0.5 rounded-full text-[#B5A1C2] font-mono">{items.length}</span>
            </div>
            <div className="p-3 flex-1 overflow-y-auto min-h-[100px]">
                <SortableContext id={col.id} items={items.map(i => i.id.toString())} strategy={verticalListSortingStrategy}>
                    {items.map(req => (
                        <SortableItem key={req.id} id={req.id.toString()} req={req} />
                    ))}
                </SortableContext>
                {items.length === 0 && (
                    <div className="h-full border-2 border-dashed border-[#5C2D8F]/20 rounded-xl flex items-center justify-center">
                        <span className="text-[#B5A1C2]/40 text-xs">Déposez ici</span>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function ImplementerDashboard() {
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeItem, setActiveItem] = useState(null)

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor)
    )

    const load = () => {
        api.get('/change-requests')
            .then(r => setRequests(r.data))
            .finally(() => setLoading(false))
    }

    useEffect(() => { load() }, [])

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
        const overContainer = over.id // This is the column ID if dropping on an empty area, or item ID if dropping on an item.
        
        let targetStatus = null
        if (COLUMNS.map(c => c.id).includes(overContainer)) {
            targetStatus = overContainer
        } else {
            // Find the item it was dropped over to determine the column
            const overItem = requests.find(r => r.id.toString() === overContainer)
            if (overItem) targetStatus = overItem.status
        }

        const activeReq = requests.find(r => r.id.toString() === activeId)
        
        if (!activeReq || !targetStatus || activeReq.status === targetStatus) return

        // Optimistic UI update
        const previousRequests = [...requests]
        setRequests(requests.map(r => r.id.toString() === activeId ? { ...r, status: targetStatus } : r))

        try {
            await api.post(`/change-requests/${activeId}/update-status`, { status: targetStatus })
            // Re-fetch to ensure the server state is completely sync
            load()
        } catch (err) {
            // Revert changes on fail
            setRequests(previousRequests)
            alert(err.response?.data?.message || 'Erreur lors de la mise à jour du statut.')
        }
    }

    if (loading) return <div className="p-8 text-[#B5A1C2]/70 text-sm">Chargement du Dashboard...</div>

    return (
        <div className="h-full flex flex-col">
            <div className="mb-6 shrink-0">
                <h1 className="text-xl font-semibold text-[#E8E0F0]">Kanban d'implémentation</h1>
                <p className="text-sm text-[#B5A1C2]/70 mt-0.5">Glissez-déposez pour mettre à jour l'état (Approuvé → En cours → Terminé)</p>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-0">
                    {COLUMNS.map(col => (
                        <KanbanColumn 
                            key={col.id} 
                            col={col} 
                            items={requests.filter(r => r.status === col.id)} 
                        />
                    ))}
                </div>
                
                <DragOverlay>
                    {activeItem ? (
                        <div className="bg-[#2B1042] border-2 border-[#816A9E] p-4 rounded-xl shadow-2xl opacity-90 scale-105">
                            <h3 className="font-medium text-[#E8E0F0] text-sm break-words">{activeItem.title}</h3>
                            <div className="flex justify-between items-center mt-3 pt-3 border-t border-[#5C2D8F]/30">
                                <span className="text-[10px] bg-black/30 px-2 py-0.5 rounded text-[#D5CBE5]">{activeItem.affected_system}</span>
                            </div>
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    )
}