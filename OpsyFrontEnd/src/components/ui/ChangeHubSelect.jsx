import React, { useState, useRef, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check, Search } from 'lucide-react'
import { createPortal } from 'react-dom'

export default function ChangeHubSelect({ 
    options = [], 
    value, 
    onChange, 
    placeholder = 'Sélectionner...',
    icon: Icon,
    className = "",
    disabled = false,
    usePortal = false,
    searchable = false,
    searchPlaceholder = 'Rechercher…',
}) {
    const [isOpen, setIsOpen] = useState(false)
    const [query, setQuery] = useState('')
    const containerRef = useRef(null)
    const triggerRef = useRef(null)
    const menuRef = useRef(null)
    const searchInputRef = useRef(null)
    const [menuRect, setMenuRect] = useState(null)

    const selectedOption = options.find(opt => String(opt.value) === String(value))

    const displayOptions = useMemo(() => {
        if (!searchable) return options
        const q = query.trim().toLowerCase()
        const emptyOpt = options.find((o) => String(o.value) === '')
        const rest = emptyOpt ? options.filter((o) => o !== emptyOpt) : options
        const filteredRest = !q
            ? rest
            : rest.filter(
                  (o) =>
                      String(o.label).toLowerCase().includes(q) ||
                      String(o.value).toLowerCase().includes(q)
              )
        return emptyOpt ? [emptyOpt, ...filteredRest] : filteredRest
    }, [options, query, searchable])

    useEffect(() => {
        if (!isOpen) setQuery('')
    }, [isOpen])

    useEffect(() => {
        if (!isOpen || !searchable) return
        const t = requestAnimationFrame(() => searchInputRef.current?.focus())
        return () => cancelAnimationFrame(t)
    }, [isOpen, searchable])

    useEffect(() => {
        const handleClickOutside = (event) => {
            const inContainer = containerRef.current && containerRef.current.contains(event.target)
            const inMenu = usePortal && menuRef.current && menuRef.current.contains(event.target)
            if (!inContainer && !inMenu) setIsOpen(false)
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [usePortal])

    useEffect(() => {
        if (!usePortal || !isOpen) return

        const update = () => {
            const el = triggerRef.current
            if (!el) return
            const r = el.getBoundingClientRect()
            setMenuRect({
                left: r.left,
                top: r.bottom,
                width: r.width,
            })
        }

        update()
        window.addEventListener('resize', update)
        window.addEventListener('scroll', update, true)
        return () => {
            window.removeEventListener('resize', update)
            window.removeEventListener('scroll', update, true)
        }
    }, [usePortal, isOpen])

    const renderMenu = () => {
        if (!isOpen) return null

        const menuContent = (
            <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 6, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                transition={{ type: 'spring', damping: 26, stiffness: 320 }}
                ref={menuRef}
                className="bg-[#1A0B2E]/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col"
                style={{
                    width: usePortal ? (menuRect?.width ?? 320) : '100%',
                }}
            >
                {searchable && (
                    <div
                        className="shrink-0 p-2 border-b border-white/10"
                        onMouseDown={(e) => e.stopPropagation()}
                    >
                        <div className="relative">
                            <Search
                                size={14}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B5A1C2]/45 pointer-events-none"
                                strokeWidth={2}
                            />
                            <input
                                ref={searchInputRef}
                                type="search"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder={searchPlaceholder}
                                autoComplete="off"
                                spellCheck={false}
                                className="w-full bg-black/25 border border-white/10 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder:text-[#B5A1C2]/35 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:border-primary/30"
                            />
                        </div>
                    </div>
                )}
                <div className="max-h-60 overflow-y-auto custom-scrollbar p-2 min-h-0">
                    {options.length === 0 && (
                        <div className="px-4 py-3 text-[10px] text-white/20 uppercase font-black tracking-widest text-center">
                            Aucune option
                        </div>
                    )}
                    {options.length > 0 && displayOptions.length === 0 && (
                        <div className="px-4 py-6 text-[10px] text-[#B5A1C2]/45 uppercase font-black tracking-widest text-center">
                            Aucun résultat
                        </div>
                    )}
                    {displayOptions.map((option) => (
                        <button
                            key={`${String(option.value)}-${option.label}`}
                            type="button"
                            onClick={() => {
                                onChange(option.value)
                                setIsOpen(false)
                            }}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left text-xs transition-all ${
                                String(value) === String(option.value)
                                    ? 'bg-primary/20 text-primary'
                                    : 'text-[#B5A1C2]/60 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                            <span className="truncate">{option.label}</span>
                            {String(value) === String(option.value) && <Check size={14} />}
                        </button>
                    ))}
                </div>
            </motion.div>
        )

        if (!usePortal) {
            return (
                <div className="absolute z-50 w-full left-0 mt-2">
                    {menuContent}
                </div>
            )
        }

        if (!menuRect) return null

        // Dedicated overlay layer to bypass stacking contexts.
        return createPortal(
            <div
                style={{
                    position: 'fixed',
                    left: menuRect.left,
                    top: menuRect.top,
                    zIndex: 2147483647,
                    pointerEvents: 'auto',
                }}
            >
                <AnimatePresence>{menuContent}</AnimatePresence>
            </div>,
            document.body
        )
    }

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            {/* Trigger Button */}
            <button
                type="button"
                disabled={disabled}
                onClick={() => {
                    if (disabled) return
                    setIsOpen(!isOpen)
                }}
                ref={triggerRef}
                className={`w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 text-xs text-white flex items-center justify-between group transition-all hover:bg-white/[0.06] ${
                    isOpen ? 'ring-1 ring-primary/50 border-primary/30' : ''
                } ${disabled ? 'opacity-50 cursor-not-allowed hover:bg-white/[0.03]' : ''}`}
            >
                <div className="flex items-center gap-3">
                    {Icon && <Icon size={14} className="text-primary/40 group-hover:text-primary/60 transition-colors" />}
                    <span className={selectedOption ? "text-white" : "text-[#816A9E]/40"}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                </div>
                <ChevronDown 
                    size={16} 
                    className={`text-primary/40 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
                />
            </button>

            {/* Dropdown Menu */}
            {!usePortal ? (
                <AnimatePresence>{renderMenu()}</AnimatePresence>
            ) : (
                renderMenu()
            )}
        </div>
    )
}
