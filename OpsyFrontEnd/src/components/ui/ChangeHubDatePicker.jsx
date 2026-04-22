import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'

export default function ChangeHubDatePicker({ 
    value, 
    onChange, 
    placeholder = 'Sélectionner une date...',
    icon: Icon = CalendarIcon,
    className = ""
}) {
    const [isOpen, setIsOpen] = useState(false)
    const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date())
    const containerRef = useRef(null)

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate()
    const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay()

    const handlePrevMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))
    }

    const handleNextMonth = () => {
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))
    }

    const handleDateSelect = (day) => {
        const selected = new Date(viewDate.getFullYear(), viewDate.getMonth(), day)
        // Format as YYYY-MM-DD for standard input compatibility
        const formatted = selected.toISOString().split('T')[0]
        onChange(formatted)
        setIsOpen(false)
    }

    const isSelected = (day) => {
        if (!value) return false
        const d = new Date(value)
        return d.getDate() === day && 
               d.getMonth() === viewDate.getMonth() && 
               d.getFullYear() === viewDate.getFullYear()
    }

    const isToday = (day) => {
        const today = new Date()
        return today.getDate() === day && 
               today.getMonth() === viewDate.getMonth() && 
               today.getFullYear() === viewDate.getFullYear()
    }

    const monthNames = [
        "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
        "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
    ]

    const days = []
    const totalDays = daysInMonth(viewDate.getFullYear(), viewDate.getMonth())
    const startDay = firstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth())

    // Pad leading days
    for (let i = 0; i < startDay; i++) {
        days.push(null)
    }
    for (let i = 1; i <= totalDays; i++) {
        days.push(i)
    }

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-xs text-white flex items-center justify-between group transition-all hover:bg-white/[0.06] ${isOpen ? 'ring-1 ring-primary/50 border-primary/30' : ''}`}
            >
                <div className="flex items-center gap-3">
                    <Icon size={14} className="text-primary/40 group-hover:text-primary/60 transition-colors" />
                    <span className={value ? "text-white" : "text-[#816A9E]/40"}>
                        {value ? new Date(value).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : placeholder}
                    </span>
                </div>
            </button>

            {/* Calendar Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 5, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute z-50 w-72 left-0 mt-2 bg-[#1A0B2E]/95 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.6)] p-6"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <button onClick={handlePrevMonth} className="p-2 hover:bg-white/5 rounded-full text-primary/60 transition-colors">
                                <ChevronLeft size={16} />
                            </button>
                            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white">
                                {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
                            </div>
                            <button onClick={handleNextMonth} className="p-2 hover:bg-white/5 rounded-full text-primary/60 transition-colors">
                                <ChevronRight size={16} />
                            </button>
                        </div>

                        {/* Weekdays */}
                        <div className="grid grid-cols-7 mb-2">
                            {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map(d => (
                                <div key={d} className="text-center text-[10px] font-black text-white/20 pb-2">{d}</div>
                            ))}
                        </div>

                        {/* Grid */}
                        <div className="grid grid-cols-7 gap-1">
                            {days.map((day, i) => (
                                <div key={i} className="aspect-square flex items-center justify-center">
                                    {day && (
                                        <button
                                            type="button"
                                            onClick={() => handleDateSelect(day)}
                                            className={`w-full h-full rounded-xl text-[10px] font-bold transition-all flex items-center justify-center relative ${
                                                isSelected(day)
                                                ? 'bg-primary text-[#0F051E] shadow-[0_0_15px_rgba(209,140,255,0.4)]'
                                                : isToday(day)
                                                ? 'bg-primary/10 text-primary border border-primary/30'
                                                : 'text-[#B5A1C2]/60 hover:bg-white/10 hover:text-white'
                                            }`}
                                        >
                                            {day}
                                            {isToday(day) && !isSelected(day) && (
                                                <div className="absolute bottom-1 w-1 h-1 bg-primary rounded-full" />
                                            )}
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
