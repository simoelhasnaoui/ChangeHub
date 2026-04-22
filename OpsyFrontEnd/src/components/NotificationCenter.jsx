import { useState, useEffect, useRef } from 'react'
import { Bell, Check, ExternalLink, X, Info, AlertTriangle, CheckCircle2 } from 'lucide-react'
import api from '../api/axios'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

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
                className="w-12 h-12 rounded-full flex items-center justify-center text-[#B5A1C2]/40 hover:bg-white/5 hover:text-primary transition-all relative group"
            >
                <Bell size={18} className={notifications.length > 0 ? 'animate-pulse' : ''} />
                {notifications.length > 0 && (
                    <span className="absolute top-3 right-3 w-3 h-3 bg-primary rounded-full border-2 border-[#150522] shadow-[0_0_10px_rgba(209,140,255,0.6)]">
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95, x: 20 }}
                        animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95, x: 20 }}
                        className="absolute bottom-16 left-0 w-[350px] bg-[#150522] border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.8)] rounded-3xl z-[100] overflow-hidden backdrop-blur-3xl"
                    >
                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#E8E0F0]">Notifications</h3>
                            {notifications.length > 0 && (
                                <button onClick={markAllAsRead} className="text-[9px] font-black uppercase tracking-widest text-primary hover:underline">
                                    Tout marquer
                                </button>
                            )}
                        </div>

                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-2">
                            {notifications.length === 0 ? (
                                <div className="p-12 text-center space-y-4">
                                    <div className="p-4 bg-white/5 rounded-full w-fit mx-auto opacity-10">
                                        <Bell size={24} className="text-[#B5A1C2]" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#B5A1C2]/20">Aucun signal capturé</p>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    {notifications.map(n => (
                                        <div key={n.id} className="p-4 hover:bg-white/[0.03] rounded-2xl transition-all group relative border border-transparent hover:border-white/5">
                                            <div className="flex gap-4">
                                                <div className="mt-0.5 shrink-0 p-2 bg-primary/5 rounded-lg text-primary/40">
                                                    <Info size={14} />
                                                </div>
                                                <div className="flex-1 space-y-3">
                                                    <p className="text-[11px] font-medium text-[#D5CBE5] leading-relaxed">
                                                        {n.data.message}
                                                    </p>
                                                    <div className="flex items-center gap-4">
                                                        <Link
                                                            to={n.data.link}
                                                            onClick={() => { markAsRead(n.id); setIsOpen(false) }}
                                                            className="text-[9px] font-black uppercase tracking-widest text-primary inline-flex items-center gap-1 hover:underline"
                                                        >
                                                            Accéder <ExternalLink size={10} />
                                                        </Link>
                                                        <button
                                                            onClick={() => markAsRead(n.id)}
                                                            className="text-[9px] font-black uppercase tracking-widest text-[#B5A1C2]/20 hover:text-emerald-400 inline-flex items-center gap-1 transition-colors"
                                                        >
                                                            <Check size={10} /> Acquitter
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
