import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, User as UserIcon, Calendar, ArrowRight, Search, Activity, CornerDownRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const STATUS_MINI_MAP = {
    draft: 'bg-[#B5A1C2]/20 text-[#B5A1C2]',
    pending_approval: 'bg-amber-500/20 text-amber-500',
    approved: 'bg-blue-500/20 text-blue-500',
    in_progress: 'bg-indigo-500/20 text-indigo-500',
    done: 'bg-emerald-500/20 text-emerald-500',
    rejected: 'bg-rose-500/20 text-rose-500',
};

export default function GlobalSearch({ results, isOpen, onClose, role, setSearchQuery }) {
    const navigate = useNavigate();

    if (!isOpen) return null;

    const hasResults = results.requests?.length > 0 || results.users?.length > 0;

    const handleNavigate = (path) => {
        setSearchQuery('');
        navigate(path);
        onClose();
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.98 }}
                className="absolute top-full left-0 right-0 mt-4 bg-[#150522]/95 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.8)] z-[200] overflow-hidden"
            >
                {/* Search atmospheric background */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />

                <div className="relative max-h-[60vh] overflow-y-auto custom-scrollbar p-8 space-y-10">
                    {!hasResults ? (
                        <div className="py-20 text-center space-y-6">
                            <div className="p-6 bg-white/5 rounded-full w-fit mx-auto animate-pulse">
                                <Search size={32} className="text-[#B5A1C2]/20" />
                            </div>
                            <div className="space-y-2">
                                <p className="text-xs font-black uppercase tracking-[0.4em] text-[#B5A1C2]/20">Aucun signal capturé</p>
                                <p className="text-[10px] text-[#B5A1C2]/10 uppercase tracking-widest">Vérifiez les paramètres de recherche ou la fréquence</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Requests Results */}
                            {results.requests?.length > 0 && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#B5A1C2]/40 flex items-center gap-2">
                                            <FileText size={14} className="text-primary" /> Dossiers_CR_MATCH ({results.requests.length})
                                        </h4>
                                    </div>
                                    <div className="grid grid-cols-1 gap-2">
                                        {results.requests.map((cr) => (
                                            <div
                                                key={cr.id}
                                                onClick={() => handleNavigate(`/${role}/changes/${cr.id}`)}
                                                className="group flex items-center justify-between p-4 bg-white/[0.02] border border-transparent hover:border-white/10 hover:bg-white/[0.05] rounded-2xl transition-all cursor-pointer"
                                            >
                                                <div className="flex items-center gap-4 min-w-0">
                                                    <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black ${STATUS_MINI_MAP[cr.status]}`}>
                                                        {cr.status.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-bold text-white truncate group-hover:text-primary transition-colors">{cr.title}</p>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            <span className="text-[9px] font-black uppercase tracking-widest text-[#B5A1C2]/30">REQ-{cr.id}</span>
                                                            <span className="w-1 h-1 rounded-full bg-white/5" />
                                                            <span className="text-[9px] font-medium text-[#B5A1C2]/20 truncate">{cr.affected_system}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <ArrowRight size={14} className="text-white/0 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* User Results */}
                            {results.users?.length > 0 && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#B5A1C2]/40 flex items-center gap-2">
                                            <UserIcon size={14} className="text-[#B5A1C2]/40" /> Intelligence_Equipe ({results.users.length})
                                        </h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {results.users.map((u) => (
                                            <div
                                                key={u.id}
                                                className="group flex items-center gap-4 p-4 bg-white/[0.02] border border-transparent hover:border-white/10 rounded-2xl transition-all cursor-default"
                                            >
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-transparent flex items-center justify-center text-primary font-black text-xs border border-primary/20 group-hover:scale-105 transition-transform">
                                                    {u.name.charAt(0)}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs font-bold text-white truncate">{u.name}</p>
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-[#B5A1C2]/20 mt-0.5 truncate">{u.department || 'OPS_NODE'}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer hints */}
                <div className="px-8 py-4 bg-black/20 border-t border-white/5 flex items-center justify-between text-[8px] font-black uppercase tracking-[0.2em] text-[#B5A1C2]/20">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5"><CornerDownRight size={10} className="text-primary/40" /> ENT_SELECTIONNER</span>
                        <span className="flex items-center gap-1.5"><Activity size={10} className="text-primary/40" /> ESC_FERMER</span>
                    </div>
                    <span>ChangeHub_CORE_SEARCH</span>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
