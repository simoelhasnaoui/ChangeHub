import { useEffect, useRef, useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, NavLink, useLocation } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useSearch } from '../context/SearchContext'
import OpsyLogo from './OpsyLogo'
import NotificationCenter from './NotificationCenter'

// ─── Constants ───────────────────────────────────────────────────────────────
const SNAP_DIST = 100;
const SB_W = 74; 
const SB_H = 380; 

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
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
  users: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  changes: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  ),
  new: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
    </svg>
  ),
  requests: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
    </svg>
  ),
  logout: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
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
    { to: '/admin',         label: 'Dashboard',      icon: icons.dashboard },
    { to: '/admin/users',   label: 'Utilisateurs',   icon: icons.users },
    { to: '/admin/changes', label: 'Changements',    icon: icons.changes },
  ],
  approver: [
    { to: '/approver',         label: 'Tableau de bord', icon: icons.dashboard },
    { to: '/approver/changes', label: 'Demandes',         icon: icons.requests },
  ],
  implementer: [
    { to: '/implementer',         label: 'Tableau de bord', icon: icons.dashboard },
    { to: '/implementer/changes', label: 'Mes demandes',     icon: icons.requests },
  ],
  requester: [
    { to: '/requester',         label: 'Tableau de bord',  icon: icons.dashboard },
    { to: '/requester/changes', label: 'Mes demandes',      icon: icons.requests },
    { to: '/requester/new',     label: 'Nouvelle demande',  icon: icons.new },
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

  const offsetRef = useRef({ x: 0, y: 0 });
  const posRef = useRef(pos);
  posRef.current = pos;

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
    };
  }, [dragging, onMove, stopDrag]);

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
        // Must use api directly to hit the endpoint we made
        const api = (await import('../api/axios')).default
        await api.post('/password/change', pwdForm)
        setPwdSuccess('Mot de passe mis à jour !')
        
        // Update current user context to clear force flag, simulate refresh
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
    if (to === `/${user?.role}`) return location.pathname === to
    return location.pathname.startsWith(to)
  }

  const isNearHome = (homeIndex) =>
    nearestHome && nearestHome.index === homeIndex && nearestHome.dist < SNAP_DIST;

  const pulseHome = pulse ? homes[activeHomeIndex] : null;

  const { searchQuery, setSearchQuery } = useSearch()

  return (
    <div ref={containerRef} className={`min-h-screen flex bg-body text-[#E8E0F0] font-inter relative overflow-hidden select-none ${dragging ? 'cursor-grabbing' : ''}`}>
      
      {/* ── Password Change Modal Overlay ── */}
      {showPasswordModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="bg-[#2B1042] border border-[#5C2D8F] p-8 rounded-xl shadow-2xl max-w-sm w-full">
                  <h2 className="text-[#E8E0F0] text-lg font-semibold mb-2">Changer le mot de passe</h2>
                  {isForcedPwdChange && <p className="text-red-400 text-xs mb-4">L'administrateur exige le changement de votre mot de passe temporaire pour continuer.</p>}
                  
                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
                      <div>
                          <label className="block text-xs text-[#B5A1C2]/70 mb-1">Mot de passe actuel</label>
                          <input required type="password" value={pwdForm.current_password} onChange={e => setPwdForm(f => ({...f, current_password: e.target.value}))}
                              className="w-full border border-[#5C2D8F]/50 bg-[#3E1E70]/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-[#E8E0F0]" />
                      </div>
                      <div>
                          <label className="block text-xs text-[#B5A1C2]/70 mb-1">Nouveau mot de passe</label>
                          <input required type="password" value={pwdForm.new_password} onChange={e => setPwdForm(f => ({...f, new_password: e.target.value}))}
                              title="1 Majuscule, 1 Chiffre, Min 8 car."
                              className="w-full border border-[#5C2D8F]/50 bg-[#3E1E70]/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-[#E8E0F0]" />
                      </div>
                      <div>
                          <label className="block text-xs text-[#B5A1C2]/70 mb-1">Confirmer le nouveau</label>
                          <input required type="password" value={pwdForm.new_password_confirmation} onChange={e => setPwdForm(f => ({...f, new_password_confirmation: e.target.value}))}
                              className="w-full border border-[#5C2D8F]/50 bg-[#3E1E70]/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-[#E8E0F0]" />
                      </div>
                      
                      {pwdError && <div className="text-red-400 text-xs">{pwdError}</div>}
                      {pwdSuccess && <div className="text-green-400 text-xs">{pwdSuccess}</div>}

                      <div className="flex gap-2 justify-end pt-2">
                          {!isForcedPwdChange && (
                              <button type="button" onClick={() => setShowPwdModal(false)}
                                  className="text-[#B5A1C2] hover:text-white px-3 py-2 text-sm transition-colors">Annuler</button>
                          )}
                          <button type="submit" disabled={pwdLoading}
                              className="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:shadow-xl transition-all disabled:opacity-50">
                              {pwdLoading ? 'Mise à jour...' : 'Confirmer'}
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}

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
        className={`transition-transform duration-200 cursor-grab active:cursor-grabbing ${
          dragging ? 'scale-[1.02]' : ''
        } ${
          snapping ? 'transition-all duration-300 cubic-bezier(0.34,1.56,0.64,1)' : ''
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
          
          {/* Expansion Shelves */}
          {links.map((_, i) => (
            <div 
              key={i} 
              className={`absolute h-12 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                currentSide === 'left' ? 'left-8 origin-left' : 'right-8 origin-right'
              } w-[204px] rounded-full ${
                hoveredIndex === i ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'
              }`}
              style={{ 
                top: 89 + i * 60,
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
        <div className="relative z-20 flex flex-col items-center py-5 h-full">
          {/* Top Handle / Logo */}
          <div className="drag-handle w-12 h-12 rounded-full cursor-grab active:cursor-grabbing flex items-center justify-center shrink-0 mb-3 hover:scale-105 active:scale-95 transition-all text-[#D5CBE5]">
            <OpsyLogo size={40} />
          </div>

          <div className="w-8 h-px bg-purple-700/30 mb-2" />

          <nav className="flex-1 flex flex-col items-center gap-3 w-full">
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
                  {/* Outer container — h-12 gives items-center a rererence axis */}
                  <div className={`flex items-center h-12 transition-all duration-500 ${
                    isHovered
                      ? (currentSide === 'left'
                          ? 'w-[200px] pl-6 translate-x-[68px]'
                          : 'w-[200px] pr-6 -translate-x-[68px]')
                      : 'w-12'
                  }`}>

                    {/* Icon */}
                    <div className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-full transition-all duration-500 z-30 group-hover/item:scale-90 active:scale-80 ${
                      active ? 'text-[#D5CBE5]' : 'text-[#B5A1C2]/70'
                    }`}>
                      <span className={`${
                        active
                          ? 'text-[#D5CBE5]'
                          : 'text-[#B5A1C2]/40 group-hover/item:text-[#D5CBE5]/80'
                      } transition-transform duration-500`}>
                        {icon}
                      </span>
                    </div>

                    {/* Label — leading-none removes invisible line-height space */}
                    <div className={`flex-1 flex justify-center items-center transition-all duration-500 ${
                      isHovered ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden'
                    }`}>
                      <span className="text-[11px] font-bold uppercase tracking-widest text-[#D5CBE5] whitespace-nowrap leading-none">
                        {label}
                      </span>
                    </div>

                  </div>
                </NavLink>
              )
            })}
          </nav>

          <div className="w-8 h-px bg-purple-700/30 mb-2" />

          {/* Notifications */}
          <NotificationCenter />

          {/* Change Password */}
          <button
            onClick={() => setShowPwdModal(true)}
            className="w-12 h-12 rounded-full flex items-center justify-center text-[#816A9E]/60 hover:bg-[#5C2D8F]/20 hover:text-[#D5CBE5] transition-all mb-1 hover:scale-105 active:scale-90"
            title="Changer de mot de passe"
          >
            {icons.password}
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-12 h-12 rounded-full flex items-center justify-center text-[#816A9E]/60 hover:bg-red-500/10 hover:text-red-500 transition-all mb-1 hover:scale-105 active:scale-90"
            title="Se déconnecter"
          >
            {icons.logout}
          </button>
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
              <div className="relative w-full max-w-2xl">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-primary opacity-30 group-focus-within:opacity-100 group-focus-within:scale-110 transition-all" size={20} />
                  <input 
                      type="text" 
                      placeholder="Rechercher des demandes, systèmes ou utilisateurs..." 
                      className="w-full bg-[#0F051E]/60 backdrop-blur-3xl border border-white/10 rounded-[2rem] pl-16 pr-8 py-5 text-sm text-white placeholder:text-[#B5A1C2]/30 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-[#0F051E]/90 transition-all shadow-[0_20px_50px_rgba(0,0,0,0.4)]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
                       <span className="text-[10px] font-black tracking-tighter text-[#B5A1C2]/20 border border-white/5 px-2 py-1 rounded-md uppercase">⌘ K</span>
                  </div>
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

      {/* Animation Styles */}
      <style>{`
        @keyframes pulseRing {
          0%   { transform: scale(0.6); opacity: 0.8; border-color: rgba(213, 203, 229,0.8); }
          100% { transform: scale(1.6); opacity: 0; border-color: rgba(213, 203, 229,0); }
        }
      `}</style>
    </div>
  )
}