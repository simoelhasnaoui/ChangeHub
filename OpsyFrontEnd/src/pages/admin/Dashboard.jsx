import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Users, FileText, Clock, AlertTriangle,
    CheckCircle, XCircle, TrendingUp, Filter,
    ChevronRight, ArrowUpRight, Search, Trash2,
    BarChart3, PieChart as PieChartIcon, Activity, UserPlus
} from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import { displayUserName } from '../../utils/displayUserName'
import { useSearch } from '../../context/SearchContext'
import ConfirmModal from '../../components/ConfirmModal'
import UserFormModal from '../../components/UserFormModal'
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
    Tooltip as RechartsTooltip, PieChart, Pie, Cell,
    BarChart, Bar, CartesianGrid
} from 'recharts'

// ─── Constants & Localization ───────────────────────────────────────────────
const COLORS = ['#D18CFF', '#816A9E', '#FF3DBC', '#4D3DF7', '#00D1FF', '#FFBD3D']

const STATUS_MAP = {
    draft: { label: 'Brouillon', color: '#B5A1C2', bg: 'bg-[#B5A1C2]/10' },
    pending_approval: { label: 'En attente', color: '#f59e0b', bg: 'bg-amber-500/10' },
    approved: { label: 'Approuvé', color: '#3b82f6', bg: 'bg-blue-500/10' },
    in_progress: { label: 'En cours', color: '#6366f1', bg: 'bg-indigo-500/10' },
    done: { label: 'Terminé', color: '#10b981', bg: 'bg-emerald-500/10' },
    rejected: { label: 'Rejeté', color: '#f43f5e', bg: 'bg-rose-500/10' },
}

const RISK_MAP = {
    low: { label: 'Faible', color: '#10b981' },
    medium: { label: 'Moyen', color: '#f59e0b' },
    high: { label: 'Élevé', color: '#f43f5e' },
}

// ─── Sub-Components ──────────────────────────────────────────────────────────

const StatCard = ({ title, value, icon, color, trend }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="bg-surface backdrop-blur-3xl border border-white/5 p-6 rounded-[2rem] flex flex-col justify-between shadow-2xl group relative overflow-hidden h-full"
    >
        <div className={`absolute top-0 right-0 w-24 h-24 blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity`} style={{ backgroundColor: color }} />
        <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-3 rounded-2xl bg-primary/5">
                {React.cloneElement(icon, { size: 20, color: color || 'var(--ChangeHub-primary)' })}
            </div>
            {trend && <span className="text-[10px] font-black text-emerald-400">+{trend}%</span>}
        </div>
        <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-dim mb-1 whitespace-nowrap">{title}</p>
            <p className="text-3xl font-light text-text-main tracking-tighter">{value}</p>
        </div>
    </motion.div>
);

const ChartModule = ({ title, children, icon, onClear, isFiltered }) => (
    <div className="bg-surface backdrop-blur-3xl border border-white/5 p-8 rounded-[3rem] shadow-2xl flex flex-col h-full">
        <div className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/5 rounded-2xl text-text-dim">{icon}</div>
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-text-main">{title}</h3>
            </div>
            {isFiltered && (
                <button onClick={onClear} className="text-[9px] font-black uppercase tracking-widest text-[#D18CFF] hover:text-text-main transition-colors flex items-center gap-2">
                    <Filter size={10} /> Effacer Filtre
                </button>
            )}
        </div>
        <div className="flex-1 flex items-center justify-center min-h-[220px]">
            {children}
        </div>
    </div>
);

const UserRow = ({ user, onDelete }) => (
    <div className="flex items-center justify-between p-4 bg-primary/5 hover:bg-primary/10 rounded-2xl transition-all border border-white/5 group">
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-xs font-black text-text-main">
                {user.name.charAt(0)}
            </div>
            <div>
                <p className="text-sm font-bold text-text-main mb-0.5">{user.name}</p>
                <p className="text-[10px] text-text-dim font-medium">{user.email}</p>
            </div>
        </div>
        <div className="flex items-center gap-6">
            <span className="text-[10px] font-black uppercase tracking-widest text-text-dim">{user.role}</span>
            <button onClick={() => onDelete(user.id)} className="text-text-dim/40 hover:text-rose-500 transition-colors">
                <Trash2 size={16} />
            </button>
        </div>
    </div>
);

const PerformanceBoard = ({ title, data, type }) => (
    <div className="space-y-6 bg-[#150522]/40 border border-white/5 p-8 rounded-[3rem] shadow-2xl h-full">
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#B5A1C2]/40">{title}</h3>
        <div className="space-y-4">
            {data.map((item, i) => (
                <div key={i} className="flex flex-col gap-2">
                    <div className="flex justify-between text-[11px] font-bold text-white">
                        <span className="flex items-center gap-2">
                            <span className="text-[#D18CFF] opacity-40">0{i + 1}</span> {item.name}
                        </span>
                        <span>{type === 'rate' ? `${item.rate}%` : `${item.total} req.`}</span>
                    </div>
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: type === 'rate' ? `${item.rate}%` : `${(item.total / (data[0]?.total || 1)) * 100}%` }}
                            className="h-full bg-primary/40"
                        />
                    </div>
                </div>
            ))}
            {data.length === 0 && <p className="text-[10px] text-[#B5A1C2]/30 uppercase tracking-widest text-center py-4">Aucune donnée</p>}
        </div>
    </div>
);

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function AdminDashboard() {
    const { user } = useAuth()
    const { searchQuery } = useSearch()
    const [stats, setStats] = useState(null)
    const [requests, setRequests] = useState([])
    const [allUsers, setAllUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeFilter, setActiveFilter] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [confirmDelete, setConfirmDelete] = useState(null)
    const [showUserForm, setShowUserForm] = useState(false)
    const itemsPerPage = 8

    const loadData = async () => {
        try {
            const [s, r, u] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/change-requests'),
                api.get('/users')
            ])
            setStats(s.data)
            setRequests(r.data)
            setAllUsers(u.data)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadData()
    }, [])

    useEffect(() => {
        setCurrentPage(1)
    }, [activeFilter, searchQuery])

    const handleDeleteUser = async (id) => {
        setConfirmDelete(id)
    }

    const executeDelete = async () => {
        const id = confirmDelete
        setConfirmDelete(null)
        try {
            await api.delete(`/users/${id}`)
            setAllUsers(allUsers.filter(u => u.id !== id))
        } catch (err) {
            alert(err.response?.data?.message || 'Erreur lors de la suppression')
        }
    }

    // ─── INTERACTIVE FILTERING ───
    const filteredRequests = useMemo(() => {
        let res = [...requests]
        if (activeFilter) {
            if (activeFilter.type === 'status') res = res.filter(r => r.status === activeFilter.value)
            if (activeFilter.type === 'risk') res = res.filter(r => r.risk_level === activeFilter.value)
            if (activeFilter.type === 'category') {
                res = res.filter(r => {
                    const typeName = r.change_type?.name || r.changeType?.name;
                    return typeName === activeFilter.value;
                })
            }
        }
        if (searchQuery) {
            const q = searchQuery.toLowerCase()
            res = res.filter(r =>
                (r.title && r.title.toLowerCase().includes(q)) ||
                (r.id && r.id.toString().toLowerCase().includes(q)) ||
                (r.requester?.name && r.requester.name.toLowerCase().includes(q))
            )
        }
        return res
    }, [requests, activeFilter, searchQuery])

    const totalPages = Math.ceil(filteredRequests.length / itemsPerPage)
    const paginatedRequests = filteredRequests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

    if (loading || !stats) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6">
                <div className="w-20 h-20 border-2 border-white/5 border-t-primary rounded-full animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-primary animate-pulse">Chargement de l'intelligence...</p>
            </div>
        )
    }

    const { cards, breakdowns, performance, metrics } = stats;

    return (
        <div className="space-y-12 pb-20 font-inter max-w-[1600px] mx-auto overflow-visible">

            {/* ── HEADER ── */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-10 border-b border-white/5 relative">
                <div className="space-y-4">
                    <p className="text-[11px] font-black uppercase tracking-[0.6em] text-primary">ADMIN_COMMAND_HUB</p>
                    <h1 className="text-5xl font-light tracking-tight text-text-main leading-none">
                        Ravi de vous revoir,{' '}
                        <span className="font-medium normal-case">{displayUserName(user)}</span>
                    </h1>
                </div>

                <div className="flex flex-col items-end">
                    <div className="flex items-center gap-6 mb-2">
                        <div className="text-right">
                            <span className="text-3xl font-light text-text-main leading-none block">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text-dim">Flux Opérationnel</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── STATS ROW (7 Cards) ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-6">
                <StatCard title="Total" value={cards.totalRequests} icon={<FileText />} color="#D18CFF" />
                <StatCard title="En attente" value={cards.pendingApproval} icon={<Clock />} color="#f59e0b" trend={12} />
                <StatCard title="En cours" value={cards.inProgress} icon={<Activity />} color="#6366f1" />
                <StatCard title="Terminés" value={cards.doneThisMonth} icon={<CheckCircle />} color="#10b981" />
                <StatCard title="Rejetés" value={cards.rejected} icon={<XCircle />} color="#f43f5e" />
                <StatCard title="Équipe" value={cards.totalUsers} icon={<Users />} color="#00D1FF" />
                <StatCard title="Capacité" value={cards.activeImplementers} icon={<TrendingUp />} color="#D18CFF" />
            </div>

            {/* ── ANALYTICS ROW ── */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* 1. Status Breakdown */}
                <ChartModule
                    title="Répartition des Statuts"
                    icon={<Activity size={16} />}
                    isFiltered={activeFilter?.type === 'status'}
                    onClear={() => setActiveFilter(null)}
                >
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie
                                data={breakdowns.status}
                                innerRadius={70}
                                outerRadius={90}
                                paddingAngle={8}
                                dataKey="value"
                                stroke="none"
                                onClick={(data) => setActiveFilter({ type: 'status', value: data.name })}
                                className="cursor-pointer outline-none"
                            >
                                {breakdowns.status.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={STATUS_MAP[entry.name]?.color || COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <RechartsTooltip
                                contentStyle={{ backgroundColor: '#150522', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px' }}
                                itemStyle={{ color: '#fff' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartModule>

                {/* 2. Risk Distribution */}
                <ChartModule
                    title="Analyse des Risques"
                    icon={<AlertTriangle size={16} />}
                    isFiltered={activeFilter?.type === 'risk'}
                    onClear={() => setActiveFilter(null)}
                >
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={breakdowns.risk} onClick={(data) => data && setActiveFilter({ type: 'risk', value: data.activeLabel })}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#B5A1C2', fontSize: 10 }}
                                tickFormatter={(val) => RISK_MAP[val]?.label || val}
                            />
                            <YAxis hide />
                            <RechartsTooltip
                                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                contentStyle={{ backgroundColor: '#150522', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px' }}
                            />
                            <Bar
                                dataKey="value"
                                radius={[8, 8, 0, 0]}
                                barSize={40}
                                className="cursor-pointer"
                            >
                                {breakdowns.risk.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={RISK_MAP[entry.name]?.color || '#816A9E'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </ChartModule>

                {/* 3. Volume Historique */}
                <ChartModule title="Volume Historique" icon={<TrendingUp size={16} />}>
                    <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={breakdowns.overTime}>
                            <defs>
                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#D18CFF" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#D18CFF" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#B5A1C2', fontSize: 10 }} />
                            <YAxis hide />
                            <RechartsTooltip contentStyle={{ backgroundColor: '#150522', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px' }} />
                            <Area type="monotone" dataKey="count" stroke="#D18CFF" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartModule>
            </div>

            {/* ── PERFORMANCE ROW ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <PerformanceBoard title="Top Demandeurs" data={performance.topRequesters} />
                <PerformanceBoard title="Top Exécuteurs" data={performance.topImplementers} />
                <PerformanceBoard title="Taux d'Approbation" data={performance.approvers} type="rate" />
            </div>

            {/* ── TABLES ROW ── */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Main Filtered Table */}
                <div className="xl:col-span-8 bg-surface backdrop-blur-3xl border border-white/5 rounded-[3rem] shadow-2xl p-8">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-text-main">Flux des Interventions</h3>
                            <p className="text-[10px] text-text-dim mt-1">{filteredRequests.length} résultats correspondants</p>
                        </div>
                        {activeFilter && (
                            <span className="bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-primary/20">
                                {activeFilter.type}: {activeFilter.value}
                            </span>
                        )}
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-separate border-spacing-y-3">
                            <thead>
                                <tr className="text-[10px] font-black uppercase tracking-widest text-text-dim">
                                    <th className="px-6 py-4">Sujet / ID</th>
                                    <th className="px-6 py-4">Intervenant</th>
                                    <th className="px-6 py-4">Statut</th>
                                    <th className="px-6 py-4">Risque</th>
                                    <th className="px-6 py-4">Date Prévue</th>
                                    <th className="px-6 py-4"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedRequests.map((req) => (
                                    <tr key={req.id} className="group bg-primary/5 hover:bg-primary/10 transition-all h-[100px]">
                                        <td className="px-6 py-4 max-w-[300px] rounded-l-3xl">
                                            <div className="flex flex-col justify-center h-full">
                                                <span className="text-sm font-bold text-text-main group-hover:text-primary transition-colors line-clamp-2 leading-tight mb-1">{req.title}</span>
                                                <span className="text-[10px] font-medium text-text-dim truncate group-hover:text-text-main/60 transition-colors">#{req.id} • {req.affected_system}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 max-w-[150px] h-full">
                                                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[8px] font-black shrink-0">
                                                    {req.requester?.name.charAt(0)}
                                                </div>
                                                <span className="text-xs text-text-main truncate">{req.requester?.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center h-full">
                                                <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-white/5 whitespace-nowrap ${STATUS_MAP[req.status]?.bg || 'bg-primary/10'} ${STATUS_MAP[req.status]?.color ? '' : 'text-text-dim'}`} style={{ color: STATUS_MAP[req.status]?.color }}>
                                                    {STATUS_MAP[req.status]?.label || req.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 h-full">
                                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: RISK_MAP[req.risk_level]?.color }} />
                                                <span className="text-[10px] font-bold text-text-main uppercase tracking-tighter">{RISK_MAP[req.risk_level]?.label}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs text-text-dim tabular-nums flex items-center h-full">{new Date(req.planned_date).toLocaleDateString('fr-FR')}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right rounded-r-3xl">
                                            <div className="flex items-center justify-end h-full">
                                                <Link to={`/admin/changes/${req.id}`} className="p-2 inline-flex items-center justify-center rounded-xl bg-primary/10 hover:bg-primary/20 hover:text-text-main text-text-dim transition-all">
                                                    <ChevronRight size={14} />
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between mt-10 pt-8 border-t border-white/5">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-dim">Page {currentPage} sur {totalPages}</p>
                                <div className="flex gap-4">
                                    <button
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        className="px-6 py-2 rounded-xl bg-primary/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-text-dim hover:text-text-main hover:bg-primary/10 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                                    >
                                        Précédent
                                    </button>
                                    <button
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        className="px-6 py-2 rounded-xl bg-primary/20 border border-primary/20 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/30 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                                    >
                                        Suivant
                                    </button>
                                </div>
                            </div>
                        )}
                        {filteredRequests.length === 0 && (
                            <div className="py-20 text-center space-y-4">
                                <Activity size={40} className="mx-auto text-white/5" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-text-dim">Aucune intervention ne correspond aux filtres</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* User Administration */}
                <div className="xl:col-span-4 space-y-8">
                    <div className="bg-surface backdrop-blur-3xl border border-white/5 rounded-[3rem] shadow-2xl p-8">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-text-main">Administration</h3>
                            <div className="flex items-center gap-4">
                                <button onClick={() => setShowUserForm(true)} className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-[#0F051E] transition-all shadow-lg shadow-primary/5">
                                    <UserPlus size={16} />
                                </button>
                            </div>
                        </div>
                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                            {allUsers.map(user => (
                                <UserRow key={user.id} user={user} onDelete={handleDeleteUser} />
                            ))}
                        </div>
                    </div>

                    {/* Insights Summary */}
                    <div className="bg-gradient-to-br from-primary/20 to-transparent border border-primary/20 p-8 rounded-[3rem] relative overflow-hidden group">
                        <div className="relative z-10 flex flex-col justify-between h-full">
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-text-main brightness-125 mb-2">Taux d'Incident Actuel</h3>
                                <p className="text-[10px] text-text-main/60 leading-relaxed max-w-[200px]">Calculé sur la base de {metrics.totalReports} rapports de clôture analysés.</p>
                            </div>
                            <div className="mt-8 flex items-baseline gap-3">
                                <span className="text-6xl font-light tracking-tighter text-text-main brightness-125">{metrics.incidentRate}%</span>
                                <ArrowUpRight className="text-rose-400 opacity-50" size={24} />
                            </div>
                        </div>
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-[60px] group-hover:scale-150 transition-transform duration-700" />
                    </div>
                </div>
            </div>

            <ConfirmModal
                isOpen={confirmDelete !== null}
                onConfirm={executeDelete}
                onCancel={() => setConfirmDelete(null)}
                title="Suppression"
                message="Cette action est irréversible. L'utilisateur et toutes ses données associées seront définitivement supprimés du système."
                confirmText="Supprimer"
                cancelText="Annuler"
                danger={true}
            />
            <UserFormModal
                isOpen={showUserForm}
                onClose={() => setShowUserForm(false)}
                onSuccess={() => { setShowUserForm(false); loadData(); }}
            />
        </div>
    );
}