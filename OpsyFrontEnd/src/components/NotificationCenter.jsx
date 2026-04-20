import { useState, useEffect, useRef } from 'react'
import { Bell, Check, ExternalLink, X } from 'lucide-react'
import api from '../api/axios'
import { Link } from 'react-router-dom'

export default function NotificationCenter() {
    const [notifications, setNotifications] = useState([])
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef(null)

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications')
            setNotifications(res.data)
        } catch (err) {
            console.error('Failed to fetch notifications', err)
        }
    }

    useEffect(() => {
        fetchNotifications()
        const interval = setInterval(fetchNotifications, 30000) // Poll every 30s
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const markAsRead = async (id) => {
        try {
            await api.post(`/notifications/${id}/read`)
            setNotifications(notifications.filter(n => n.id !== id))
        } catch (err) {
            console.error('Failed to mark as read', err)
        }
    }

    const markAllAsRead = async () => {
        try {
            await api.post('/notifications/read-all')
            setNotifications([])
        } catch (err) {
            console.error('Failed to mark all as read', err)
        }
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-[#B5A1C2]/70 hover:bg-[#5C2D8F]/20 hover:text-[#D5CBE5] transition-all relative group"
            >
                <Bell size={18} className={notifications.length > 0 ? 'animate-pulse' : ''} />
                {notifications.length > 0 && (
                    <span className="absolute top-2 right-2 w-4 h-4 bg-primary text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-[#2B1042]">
                        {notifications.length}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute top-12 left-0 w-80 bg-[#2B1042] border border-[#5C2D8F] shadow-2xl rounded-xl z-[60] overflow-hidden backdrop-blur-xl">
                    <div className="p-4 border-b border-[#5C2D8F]/50 flex justify-between items-center bg-[#3E1E70]/20">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-[#D5CBE5]">Notifications</h3>
                        {notifications.length > 0 && (
                            <button onClick={markAllAsRead} className="text-[10px] text-primary hover:underline font-medium">
                                Tout marquer comme lu
                            </button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <p className="text-xs text-[#B5A1C2]/50 italic">Aucune nouvelle notification</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-[#5C2D8F]/20">
                                {notifications.map(n => (
                                    <div key={n.id} className="p-4 hover:bg-[#5C2D8F]/10 transition-colors group">
                                        <div className="flex gap-3">
                                            <div className="flex-1">
                                                <p className="text-xs text-[#D5CBE5] leading-relaxed mb-2">
                                                    {n.data.message}
                                                </p>
                                                <div className="flex items-center gap-3">
                                                    <Link
                                                        to={n.data.link}
                                                        onClick={() => {markAsRead(n.id); setIsOpen(false)}}
                                                        className="text-[10px] text-primary inline-flex items-center gap-1 hover:underline font-semibold"
                                                    >
                                                        Voir le détail <ExternalLink size={10} />
                                                    </Link>
                                                    <button
                                                        onClick={() => markAsRead(n.id)}
                                                        className="text-[10px] text-[#B5A1C2]/40 hover:text-green-400 inline-flex items-center gap-1 transition-colors"
                                                    >
                                                        <Check size={10} /> Lu
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
