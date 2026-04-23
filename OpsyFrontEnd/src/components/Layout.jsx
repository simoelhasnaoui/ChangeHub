import { useEffect, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '../context/AuthContext'
import { useNavigate, NavLink, useLocation } from 'react-router-dom'
import { Search, Shield, X, Key, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearch } from '../context/SearchContext'
import ChangeHubLogo from './ChangeHubLogo'
import NotificationCenter from './NotificationCenter'
import GlobalSearch from './GlobalSearch'
import api from '../api/axios'

// ─── Constants ───────────────────────────────────────────────────────────────
const SNAP_DIST = 100;
const SB_W = 74;
const SB_H = 460;

function getHomes(containerW, containerH) {
  return [
    { x: 32, y: Math.round(containerH / 2 - SB_H / 2), side: "left" },
    { x: containerW - SB_W - 32, y: Math.round(containerH / 2 - SB_H / 2), side: "right" },
  ];
}

// ─── SVG Icons ───────────────────────────────────────────────────────────────
const icons = {
  dashboard: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  users: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  changes: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  new: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  ),
  requests: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
  logout: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  password: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
  ),
}

const navItems = {
  admin: [
    { to: '/admin', label: 'Dashboard', icon: icons.dashboard },
    { to: '/admin/users', label: 'Utilisateurs', icon: icons.users },
    { to: '/admin/changes', label: 'Interventions', icon: icons.changes },
  ],
  approver: [
    { to: '/approver', label: 'Dashboard', icon: icons.dashboard },
    { to: '/approver/changes', label: 'File d\'attente', icon: icons.requests },
    { to: '/approver/changes?history=true', label: 'Historique', icon: icons.changes },
  ],
  implementer: [
    { to: '/implementer', label: 'Dashboard', icon: icons.dashboard },
    { to: '/implementer/changes', label: 'Pipeline', icon: icons.requests },
    { to: '/implementer/changes?archived=true', label: 'Archives', icon: icons.changes },
  ],
  requester: [
    { to: '/requester', label: 'Dashboard', icon: icons.dashboard },
    { to: '/requester/changes', label: 'Mes demandes', icon: icons.requests },
    { to: '/requester/new', label: 'Nouvelle requête', icon: icons.new },
  ],
}

// ─── Layout ───────────────────────────────────────────────────────────────────
export default function Layout({ children }) {
  const { user, login, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Password Change State
  const [showPwdModal, setShowPwdModal] = useState(false)
  const isForcedPwdChange = user?.force_password_change === true;
  const showPasswordModal = showPwdModal || isForcedPwdChange;

  const [pwdForm, setPwdForm] = useState({ current_password: '', new_password: '', new_password_confirmation: '' })
  const [pwdLoading, setPwdLoading] = useState(false)
  const [pwdError, setPwdError] = useState('')
  const [pwdSuccess, setPwdSuccess] = useState('')

  // Magnetic Logic State
  const containerRef = useRef(null);
  const sbRef = useRef(null);

  const [pos, setPos] = useState({ x: 32, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [snapping, setSnapping] = useState(false);
  const [showGhosts, setShowGhosts] = useState(false);
  const [nearestHome, setNearestHome] = useState(null);
  const [pulse, setPulse] = useState(false);
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });
  const [activeHomeIndex, setActiveHomeIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [searchResults, setSearchResults] = useState({ requests: [], users: [] });
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const offsetRef = useRef({ x: 0, y: 0 });
  const posRef = useRef(pos);
  posRef.current = pos;
  const searchBarRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      setContainerSize({ w, h });
      const homes = getHomes(w, h);
      setPos({ x: homes[0].x, y: homes[0].y });
      setActiveHomeIndex(0);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const homes = containerSize.w ? getHomes(containerSize.w, containerSize.h) : [];
  const currentSide = homes[activeHomeIndex]?.side || 'left';

  const getNearestHome = useCallback((cx, cy) => {
    if (!homes.length) return null;
    let best = null, bestDist = Infinity;
    homes.forEach((h, i) => {
      const d = Math.hypot(cx - (h.x + SB_W / 2), cy - (h.y + SB_H / 2));
      if (d < bestDist) { bestDist = d; best = i; }
    });
    return { index: best, dist: bestDist };
  }, [homes]);

  const startDrag = useCallback((e) => {
    if (e.target.closest('a') || e.target.closest('button:not(.drag-handle)')) return;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const sbRect = sbRef.current.getBoundingClientRect();

    offsetRef.current = {
      x: clientX - sbRect.left,
      y: clientY - sbRect.top,
    };

    setSnapping(false);
    setDragging(true);
    setShowGhosts(true);
  }, []);

  const onMove = useCallback((e) => {
    if (!dragging) return;
    const ar = containerRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    let newX = clientX - ar.left - offsetRef.current.x;
    let newY = clientY - ar.top - offsetRef.current.y;
    newX = Math.max(0, Math.min(newX, ar.width - SB_W));
    newY = Math.max(0, Math.min(newY, ar.height - SB_H));

    setPos({ x: newX, y: newY });

    const cx = newX + SB_W / 2;
    const cy = newY + SB_H / 2;
    const nearest = getNearestHome(cx, cy);
    setNearestHome(nearest);
  }, [dragging, getNearestHome]);

  const stopDrag = useCallback(() => {
    setDragging(false);
    setShowGhosts(false);
    setNearestHome(null);

    const cur = posRef.current;
    const cx = cur.x + SB_W / 2;
    const cy = cur.y + SB_H / 2;
    const nearest = getNearestHome(cx, cy);

    if (nearest && nearest.dist < SNAP_DIST) {
      const h = homes[nearest.index];
      setActiveHomeIndex(nearest.index);
      setSnapping(true);
      setPos({ x: h.x, y: h.y });
      setPulse(true);
      setTimeout(() => setPulse(false), 600);
    }
  }, [homes, getNearestHome]);

  useEffect(() => {
    if (!dragging) return;
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("mouseup", stopDrag);
    window.addEventListener("touchend", stopDrag);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mouseup", stopDrag);
      window.removeEventListener("touchend", stopDrag);
    }
  }, [dragging, onMove, stopDrag]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPwdError('')
    setPwdSuccess('')
    setPwdLoading(true)
    try {
      const api = (await import('../api/axios')).default
      await api.post('/password/change', pwdForm)
      setPwdSuccess('Mot de passe mis à jour !')

      if (isForcedPwdChange) {
        const updatedUser = { ...user, force_password_change: false }
        localStorage.setItem('user', JSON.stringify(updatedUser))
        window.location.reload()
      } else {
        setTimeout(() => { setShowPwdModal(false); setPwdSuccess(''); setPwdForm({ current_password: '', new_password: '', new_password_confirmation: '' }) }, 1500)
      }
    } catch (err) {
      const errors = err.response?.data?.errors;
      let errMsg = 'Erreur lors de la mise à jour.';
      if (errors) {
        errMsg = Object.values(errors).flat()[0];
      } else if (err.response?.data?.message) {
        errMsg = err.response?.data?.message;
      }
      setPwdError(errMsg)
    } finally {
      setPwdLoading(false)
    }
  }

  const links = navItems[user?.role] || []
  const isActive = (to) => {
    const [pathname, search] = to.split('?')
    const isBaseRoleUrl = to === `/${user?.role}`

    if (isBaseRoleUrl) return location.pathname === pathname

    const pathnameMatches = location.pathname.startsWith(pathname)
    if (!pathnameMatches) return false

    // If 'to' has search params, current location must have them too
    if (search) {
      return location.search.includes(search)
    }

    // If 'to' has NO search params, current location must NOT have 'archived' or 'history'
    // to avoid overlapping with those specific sub-views
    if (!search && (location.search.includes('archived=true') || location.search.includes('history=true'))) {
      return false
    }

    return true
  }

  const isNearHome = (homeIndex) =>
    nearestHome && nearestHome.index === homeIndex && nearestHome.dist < SNAP_DIST;

  const pulseHome = pulse ? homes[activeHomeIndex] : null;

  const { searchQuery, setSearchQuery } = useSearch()

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        try {
          const res = await api.get(`/search?q=${searchQuery}`);
          setSearchResults(res.data);
          setIsSearchOpen(true);
        } catch (err) {
          console.error('Search failed', err);
        }
      } else {
        setIsSearchOpen(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  return (
    <div ref={containerRef} className={`min-h-screen flex bg-body text-[#E8E0F0] font-inter relative overflow-hidden select-none ${dragging ? 'cursor-grabbing' : ''}`}>

      {/* ── Magnetic Feedback Overlay ── */}
      {showGhosts && (
        <div className="absolute inset-0 pointer-events-none z-30">
          {homes.map((h, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: h.x,
                top: h.y,
                width: SB_W,
                height: SB_H,
                borderRadius: 40,
                border: `2px dashed ${isNearHome(i) ? "rgba(213, 203, 229,0.6)" : "rgba(92, 45, 143,0.3)"}`,
                background: isNearHome(i) ? "rgba(213, 203, 229,0.08)" : "rgba(62, 30, 112,0.08)",
                transition: "all 0.2s",
              }}
            />
          ))}
        </div>
      )}

      {/* Pulse effect */}
      {pulseHome && (
        <div
          className="absolute pointer-events-none z-30"
          style={{
            left: pulseHome.x + SB_W / 2 - 60,
            top: pulseHome.y + SB_H / 2 - 60,
            width: 120,
            height: 120,
            borderRadius: "50%",
            border: "2px solid rgba(213, 203, 229,0.8)",
            animation: "pulseRing 0.6s ease-out forwards",
          }}
        />
      )}

      {/* ── THE MAGNETIC SIDEBAR ── */}
      <aside
        ref={sbRef}
        onMouseDown={startDrag}
        onTouchStart={startDrag}
        style={{
          position: "fixed",
          left: pos.x,
          top: pos.y,
          width: SB_W,
          height: SB_H,
          zIndex: 50,
        }}
        className={`transition-transform duration-200 cursor-grab active:cursor-grabbing ${dragging ? 'scale-[1.02]' : ''
          } ${snapping ? 'transition-all duration-300 cubic-bezier(0.34,1.56,0.64,1)' : ''
          }`}
      >
        {/* LIQUID BACKGROUND LAYER (Gooey Filtered) */}
        <div
          style={{ filter: "url(#liquid-shelr-goo)", zIndex: 15 }}
          className="absolute inset-x-0 inset-y-0 pointer-events-none"
        >
          {/* Main vertical mass */}
          <div
            className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[64px] rounded-[32px] border border-white/10"
            style={{ backgroundColor: '#150522' }}
          />

          {/* Expansion Shelves (Nav + System) */}
          {[...links, { label: 'Notifications' }, { label: 'Sécurité' }, { label: 'Sortie' }].map((_, i) => (
            <div
              key={i}
              className={`absolute h-12 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${currentSide === 'left' ? 'left-1 origin-left' : 'right-1 origin-right'
                } w-[210px] rounded-full ${hoveredIndex === i && !(isNotifOpen && (i === links.length)) ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'
                }`}
              style={{
                top: i < links.length
                  ? 89 + i * 64                              // Nav items: from top
                  : SB_H - 187 + (i - links.length) * 64,   // System items: from bottom
                backgroundColor: '#150522',
                border: '1px solid rgba(213, 203, 229, 0.2)'
              }}
            />
          ))}
        </div>

        {/* TOP GLASSMORPHISM OVERLAY (Custom Orrset Shadow) */}
        <div
          className="absolute inset-0 backdrop-blur-[24px] rounded-[40px] pointer-events-none z-10 transition-all duration-300 shadow-2xl"
          style={{
            backgroundColor: 'rgba(15, 5, 30, 0.4)',
            boxShadow: '-10px 0 30px -5px rgba(0,0,0,0.8), 0 10px 20px -5px rgba(0,0,0,0.5), 0 -10px 20px -5px rgba(0,0,0,0.5)',
            border: '1px solid rgba(213, 203, 229, 0.2)'
          }}
        />

        {/* INTERACTIVE CONTENT LAYER */}
        <div className="relative z-20 flex flex-col items-center py-5 pb-8 h-full">
          {/* Top Handle / Logo */}
          <div className="drag-handle w-12 h-12 rounded-full cursor-grab active:cursor-grabbing flex items-center justify-center shrink-0 mb-3 hover:scale-105 active:scale-95 transition-all text-[#D5CBE5]">
            <ChangeHubLogo size={40} />
          </div>

          <div className="w-8 h-px bg-purple-700/30 mb-2" />

          <nav className="flex-1 flex flex-col items-center gap-4 w-full relative">
            {links.map(({ to, label, icon }, i) => {
              const active = isActive(to)
              const isHovered = hoveredIndex === i;
              return (
                <NavLink
                  key={to}
                  to={to}
                  end={to === `/${user?.role}`}
                  className="decoration-none group/item relative h-12 w-full flex items-center justify-center"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => setHoveredIndex(null)}
                >
                  {/* Outer container — absolute pinning to edge */}
                  <div className={`absolute h-12 transition-all duration-500 flex items-center ${currentSide === 'left'
                    ? `left-0 flex-row ${isHovered ? 'w-[210px]' : 'w-full'}`
                    : `right-0 flex-row-reverse ${isHovered ? 'w-[210px]' : 'w-full'}`
                    }`}>

                    {/* Icon Container (Fixed position in mass) */}
                    <div className="w-[74px] h-12 flex-shrink-0 flex items-center justify-center relative z-30">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${active ? 'text-[#D5CBE5] bg-white/5' : 'text-[#B5A1C2]/40 group-hover/item:text-[#D5CBE5]'
                        }`}>
                        {icon}
                      </div>
                    </div>

                    {/* Label Container (Expansion) */}
                    <div className={`flex-1 flex items-center transition-all duration-500 overflow-hidden ${isHovered ? 'opacity-100 px-4' : 'opacity-0 w-0'
                      } ${currentSide === 'left' ? 'justify-start' : 'justify-end'}`}>
                      <div className="w-[136px] overflow-hidden">
                        <div className={`${isHovered ? (label.length > 10 ? 'animate-marquee' : '') : ''} whitespace-nowrap flex w-max justify-start`}>
                          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#D5CBE5] py-1">
                            {label}
                          </span>
                          {label.length > 10 && (
                            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#D5CBE5] py-1 ml-12">
                              {label}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </NavLink>
              )
            })}
          </nav>

          <div className="w-8 h-px bg-purple-700/30 mb-2" />

          {/* System Actions Area */}
          <div className="flex flex-col items-center gap-4 mb-2 w-full relative">
            {[
              { id: 'notif', label: 'Notifications', icon: <NotificationCenter side={currentSide} onToggle={setIsNotifOpen} />, component: true },
              { id: 'pwd', label: 'Sécurité', icon: icons.password, onClick: () => setShowPwdModal(true) },
              { id: 'logout', label: 'Sortie', icon: icons.logout, onClick: handleLogout, danger: true }
            ].map((item, i) => {
              const idx = links.length + i;
              const isHovered = hoveredIndex === idx;

              return (
                <div
                  key={item.id}
                  className="relative h-12 w-full flex items-center justify-center cursor-pointer group/sys"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={item.onClick}
                >
                  <div className={`absolute h-12 transition-all duration-500 flex items-center ${currentSide === 'left'
                    ? `left-0 flex-row ${isHovered && !(item.id === 'notif' && isNotifOpen) ? 'w-[210px]' : 'w-full'}`
                    : `right-0 flex-row-reverse ${isHovered && !(item.id === 'notif' && isNotifOpen) ? 'w-[210px]' : 'w-full'}`
                    }`}>

                    {/* Icon */}
                    <div className="w-[74px] h-12 flex-shrink-0 flex items-center justify-center relative z-30">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${item.danger ? 'text-rose-400 group-hover/sys:text-rose-500' : 'text-[#816A9E]/60 group-hover/sys:text-[#D5CBE5]'
                        }`}>
                        {item.icon}
                      </div>
                    </div>

                    {/* Label */}
                    <div className={`flex-1 flex items-center transition-all duration-500 overflow-hidden ${isHovered && !(item.id === 'notif' && isNotifOpen) ? 'opacity-100 px-4' : 'opacity-0 w-0'
                      } ${currentSide === 'left' ? 'justify-start' : 'justify-end'}`}>
                      <div className="w-[136px] overflow-hidden">
                        <div className={`${isHovered ? (item.label.length > 10 ? 'animate-marquee' : '') : ''} whitespace-nowrap flex w-max justify-start`}>
                          <span className={`text-[11px] font-bold uppercase tracking-[0.2em] py-1 ${item.danger ? 'text-rose-400' : 'text-[#D5CBE5]'
                            }`}>
                            {item.label}
                          </span>
                          {item.label.length > 10 && (
                            <span className={`text-[11px] font-bold uppercase tracking-[0.2em] py-1 ml-12 ${item.danger ? 'text-rose-400' : 'text-[#D5CBE5]'
                              }`}>
                              {item.label}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </aside>

      {/* SVG Filters for Liquid Shelf Effect */}
      <svg className="hidden">
        <defs>
          <filter id="liquid-shelr-goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 25 -10" result="goo" />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Main content ── */}
      <main className="flex-1 bg-body overflow-auto h-screen relative w-full transition-all duration-500">
        <div className="max-w-[1600px] mx-auto p-6 md:p-12 lg:p-16 xl:p-10 translate-x-[4px]">

          {/* Global Command Center (Search Bar) */}
          <div className="flex justify-center mb-14 group">
            <div ref={searchBarRef} className="relative w-full max-w-2xl">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-primary opacity-30 group-focus-within:opacity-100 group-focus-within:scale-110 transition-all" size={20} />
              <input
                type="text"
                placeholder="Rechercher des demandes, systèmes ou utilisateurs..."
                className="w-full bg-[#0F051E]/60 backdrop-blur-3xl border border-white/10 rounded-[2rem] pl-16 pr-8 py-5 text-sm text-white placeholder:text-[#B5A1C2]/30 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-[#0F051E]/90 transition-all shadow-[0_20px_50px_rgba(0,0,0,0.4)]"
                value={searchQuery}
                onFocus={() => searchQuery.length >= 2 && setIsSearchOpen(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <span className="text-[10px] font-black tracking-tighter text-[#B5A1C2]/20 border border-white/5 px-2 py-1 rounded-md uppercase">⌘ K</span>
              </div>

              {/* Global Search Results Overlay */}
              <GlobalSearch
                results={searchResults}
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                setSearchQuery={setSearchQuery}
                role={user?.role}
              />
            </div>
          </div>

          <div className="bg-[#0F051E]/85 backdrop-blur-[32px] rounded-[3.5rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/10 p-10 lg:p-16 min-h-[88vh] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />
            <div className="relative z-10">
              {children}
            </div>
          </div>
        </div>
      </main>

      {/* ── MODAL: GLOBAL PORTALS ── */}
      {showPasswordModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-[#0F051E]/95 backdrop-blur-3xl overflow-y-auto">
          <AnimatePresence>
            <motion.div
              key="pwd-modal"
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="bg-[#150522] border border-white/10 rounded-[3rem] shadow-2xl max-w-lg w-full relative overflow-hidden"
            >
              {/* Decorative Glow */}
              <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />

              <div className="p-10 space-y-10 relative z-10">
                <div className="space-y-4 text-center">
                  <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mx-auto text-primary mb-6 shadow-[0_0_30px_rgba(209,140,255,0.1)]">
                    <Shield size={32} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">PROTOCOL_SECURITY</p>
                  <h2 className="text-3xl font-light text-white tracking-tight uppercase leading-none">Accès <span className="font-medium text-white/40 text-2xl">Sécurisé</span></h2>
                  <p className="text-[10px] text-[#B5A1C2]/40 font-black uppercase tracking-[0.2em] leading-relaxed mx-auto max-w-xs">
                    {isForcedPwdChange
                      ? "La mise à jour de vos identifiants temporaires est requise pour accéder aux couches applicatives."
                      : "Veuillez confirmer vos nouveaux paramètres de chiffrement."
                    }
                  </p>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                  <div className="space-y-3 group">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#B5A1C2]/40 ml-1 flex items-center gap-2">
                      <Key size={12} /> Mot de passe actuel
                    </label>
                    <input
                      required
                      type="password"
                      value={pwdForm.current_password}
                      onChange={(e) => setPwdForm(f => ({ ...f, current_password: e.target.value }))}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-5 text-xs text-white focus:ring-1 focus:ring-primary/50 focus:bg-white/10 transition-all outline-none"
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="space-y-3 group text-left">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#B5A1C2]/40 ml-1 flex items-center gap-2">
                      <Shield size={12} /> Nouvelle Clé
                    </label>
                    <input
                      required
                      type="password"
                      value={pwdForm.new_password}
                      onChange={(e) => setPwdForm(f => ({ ...f, new_password: e.target.value }))}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-5 text-xs text-white focus:ring-1 focus:ring-primary/50 focus:bg-white/10 transition-all outline-none"
                      placeholder="••••••••"
                    />
                  </div>

                  <div className="space-y-3 group text-left">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[#B5A1C2]/40 ml-1 flex items-center gap-2">
                      <Check size={12} /> Confirmation
                    </label>
                    <input
                      required
                      type="password"
                      value={pwdForm.new_password_confirmation}
                      onChange={(e) => setPwdForm(f => ({ ...f, new_password_confirmation: e.target.value }))}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-5 text-xs text-white focus:ring-1 focus:ring-primary/50 focus:bg-white/10 transition-all outline-none"
                      placeholder="••••••••"
                    />
                  </div>

                  {pwdError && (
                    <div className="text-[10px] font-bold text-rose-400 bg-rose-500/10 p-4 rounded-2xl border border-rose-500/20 text-center animate-pulse">
                      {pwdError}
                    </div>
                  )}

                  {pwdSuccess && (
                    <div className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20 text-center">
                      {pwdSuccess}
                    </div>
                  )}

                  <div className="flex flex-col gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={pwdLoading}
                      className="w-full py-5 bg-primary text-[#0F051E] font-black uppercase tracking-widest text-[11px] rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-primary/20 disabled:opacity-50"
                    >
                      {pwdLoading ? 'Synchronisation...' : 'Valider les accès'}
                    </button>

                    {!isForcedPwdChange && (
                      <button
                        type="button"
                        onClick={() => setShowPwdModal(false)}
                        className="w-full py-4 text-[#B5A1C2] hover:text-white font-black uppercase tracking-widest text-[10px] transition-colors"
                      >
                        Annuler
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>,
        document.body
      )}

      {/* Animation Styles */}
      <style>{`
        @keyframes pulseRing {
          0%   { transform: scale(0.6); opacity: 0.8; border-color: rgba(213, 203, 229,0.8); }
          100% { transform: scale(1.6); opacity: 0; border-color: rgba(213, 203, 229,0); }
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-50% - 1.5rem)); }
        }
        .animate-marquee {
          animation: marquee 4s linear infinite;
        }
      `}</style>
    </div>
  )
}
