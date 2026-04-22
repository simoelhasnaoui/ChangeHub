import { useEffect, useRef } from 'react'

const ICONS = [
  { bg: '#4A154B', svg: `<path d="M8 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm6-6a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm0 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm6-6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill="#fff"/>` },
  { bg: '#5865F2', svg: `<path d="M19.5 8.5s-1.5-.5-3-.5c-.2.4-.3.8-.4 1.2-1.1-.2-2.2-.2-3.2 0-.1-.4-.3-.8-.4-1.2-1.5 0-3 .5-3 .5C7.7 12 7 15 7 18c1 1 2.5 1.5 4 1.5.3-.4.6-.8.8-1.3-.7-.3-1.3-.6-2-.9.2-.1.3-.2.5-.4 2.5 1.2 5.5 1.2 8 0 .2.1.3.3.5.4-.7.3-1.3.6-2 .9.2.5.5.9.8 1.3 1.5 0 3-.5 4-1.5 0-3-.7-6-2.1-9.5zM11.5 16.5c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zm5 0c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5z" fill="#fff"/>` },
  { bg: '#10a37f', svg: `<path d="M14 7c-3.9 0-7 3.1-7 7s3.1 7 7 7 7-3.1 7-7-3.1-7-7-7zm0 3c.8 0 1.5.2 2.1.5L9.5 16.1c-.3-.6-.5-1.3-.5-2.1 0-2.2 1.8-4 4-4zm0 8c-.8 0-1.5-.2-2.1-.5l6.6-6.6c.3.6.5 1.3.5 2.1 0 2.2-1.8 4-4 4z" fill="#fff"/>` },
  { bg: '#0052CC', svg: `<path d="M7 14l4.5 7L16 14l-4.5-7L7 14zm4.5 4.5L9 14l2.5-4.5 2.5 4.5-2.5 4.5zm5-4.5l4.5 7-4.5-4.5V14zm0-4.5L21 14l-4.5-4.5V9.5z" fill="#fff"/>` },
  { bg: '#217346', svg: `<path d="M8 8h12v12H8V8zm2 2v8h8v-8h-8zm1.5 1.5h2V13H11.5v-1.5zm3 0H17V13h-2.5v-1.5zm-3 3h2V16H11.5v-1.5zm3 0H17V16h-2.5v-1.5z" fill="#fff"/>` },
  { bg: '#0078d4', svg: `<path d="M8 8h5l5 5v7H8V8zm2 2v8h8v-5l-3-3h-5z" fill="#fff"/>` },
  { bg: '#FF6B35', svg: `<path d="M7 20l4-8 3 5 2-3 5 6H7z" fill="#fff"/>` },
  { bg: '#171515', svg: `<path d="M14 5C9 5 5 9 5 14c0 4 2.6 7.4 6.2 8.6.5.1.6-.2.6-.4v-1.5c-2.6.6-3.1-1.2-3.1-1.2-.4-1.1-1-1.4-1-1.4-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.8.8.1-.6.3-1.1.6-1.3-2.1-.2-4.3-1-4.3-4.6 0-1 .4-1.9 1-2.5-.1-.2-.4-1.2.1-2.5 0 0 .8-.3 2.7 1a9.4 9.4 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1 .5 1.3.2 2.3.1 2.5.6.7 1 1.5 1 2.5 0 3.6-2.2 4.4-4.3 4.6.3.3.6.8.6 1.6v2.4c0 .2.2.5.6.4C20.4 21.4 23 18 23 14c0-5-4-9-9-9z" fill="#fff"/>` },
  { bg: '#1DB954', svg: `<circle cx="14" cy="14" r="7" stroke="#fff" stroke-width="2" fill="none"/><path d="M10 14.5q4-1.5 8 0M10.5 16.5q3.5-1 7 0M11 12q3-1 6 0" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>` },
  { bg: '#ea4335', svg: `<path d="M14 7l7 12H7L14 7z" fill="#fff"/>` },
  { bg: '#f59e0b', svg: `<rect x="8" y="8" width="5" height="5" rx="1" fill="#fff"/><rect x="15" y="8" width="5" height="5" rx="1" fill="#fff"/><rect x="8" y="15" width="5" height="5" rx="1" fill="#fff"/><rect x="15" y="15" width="5" height="5" rx="1" fill="#fff"/>` },
  { bg: '#7c3aed', svg: `<path d="M14 8l1.5 4.5H20l-3.7 2.7 1.4 4.3L14 17l-3.7 2.5 1.4-4.3L8 12.5h4.5L14 8z" fill="#fff"/>` },
  { bg: '#059669', svg: `<path d="M8 14l4 4 8-8" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>` },
  { bg: '#8b5cf6', svg: `<circle cx="10" cy="14" r="2.5" fill="#fff"/><circle cx="18" cy="10" r="2.5" fill="#fff"/><circle cx="18" cy="18" r="2.5" fill="#fff"/><line x1="12.2" y1="12.8" x2="16" y2="11" stroke="#fff" stroke-width="1.3"/><line x1="12.2" y1="15.2" x2="16" y2="17" stroke="#fff" stroke-width="1.3"/>` },
  { bg: '#dc2626', svg: `<rect x="8" y="12" width="12" height="2" rx="1" fill="#fff"/><rect x="8" y="15.5" width="12" height="2" rx="1" fill="#fff"/><rect x="8" y="8.5" width="12" height="2" rx="1" fill="#fff"/>` },
  { bg: '#0ea5e9', svg: `<path d="M9 19V13l5-5 5 5v6h-4v-4h-2v4H9z" fill="#fff"/>` },
  { bg: '#f97316', svg: `<path d="M10 10h8l-2 4h-4l-2 4h8" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>` },
  { bg: '#06b6d4', svg: `<path d="M9 14a5 5 0 1 1 10 0 5 5 0 0 1-10 0z" stroke="#fff" stroke-width="2" fill="none"/><line x1="14" y1="9" x2="14" y2="7" stroke="#fff" stroke-width="2" stroke-linecap="round"/>` },
  { bg: '#e11d48', svg: `<path d="M14 8c-3.3 0-6 2.7-6 6s2.7 6 6 6 6-2.7 6-6-2.7-6-6-6zm0 10c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z" fill="#fff"/><circle cx="14" cy="14" r="2" fill="#fff"/>` },
  { bg: '#1877F2', svg: `<path d="M17 14h-2v7h-3v-7h-1.5v-3H12v-1.5C12 8 13 7 14.5 7H17v3h-1.5c-.3 0-.5.2-.5.5V11H17l-.5 3z" fill="#fff"/>` },
]

function buildRow(icons, offset, count = 60) {
  const result = []
  for (let i = 0; i < count; i++) {
    result.push(icons[(i + offset) % icons.length])
  }
  return result
}

export default function IntegrationsCarousel() {
  const row1Ref   = useRef(null)
  const row2Ref   = useRef(null)
  const tiltRef   = useRef(null)
  const stateRef  = useRef({ pos1: 0, pos2: 0, currentTilt: 0, targetTilt: 0, lastScrollY: 0, rafId: null, rafTiltId: null })

  useEffect(() => {
    const s = stateRef.current
    s.lastScrollY = window.scrollY

    const SPEED1 = 0.4
    const SPEED2 = 0.3
    const TILE_W = 87 // 72px width + 15px gap
    const LOOP_W = ICONS.length * TILE_W

    function animateScroll() {
      s.pos1 -= SPEED1
      s.pos2 += SPEED2
      if (Math.abs(s.pos1) > LOOP_W) s.pos1 += LOOP_W
      if (s.pos2 > LOOP_W) s.pos2 -= LOOP_W
      if (row1Ref.current) row1Ref.current.style.transform = `translateX(${s.pos1}px)`
      if (row2Ref.current) row2Ref.current.style.transform = `translateX(${s.pos2}px)`
      s.rafId = requestAnimationFrame(animateScroll)
    }

    function animateTilt() {
      s.currentTilt += (s.targetTilt - s.currentTilt) * 0.08
      s.targetTilt  *= 0.88
      if (tiltRef.current) {
        tiltRef.current.style.transform = `perspective(900px) rotateX(${s.currentTilt}deg)`
      }
      s.rafTiltId = requestAnimationFrame(animateTilt)
    }

    function onScroll() {
      const delta = window.scrollY - s.lastScrollY
      s.lastScrollY = window.scrollY
      s.targetTilt = Math.max(-22, Math.min(22, delta * 1.8))
    }

    s.rafId     = requestAnimationFrame(animateScroll)
    s.rafTiltId = requestAnimationFrame(animateTilt)
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      cancelAnimationFrame(s.rafId)
      cancelAnimationFrame(s.rafTiltId)
      window.removeEventListener('scroll', onScroll)
    }
  }, [])

  const row1Icons = buildRow(ICONS, 0, 100)
  const row2Icons = buildRow(ICONS, 10, 100)

  const maskStyle = {
    overflow: 'hidden',
  }

  return (
    <div className="py-32 relative overflow-hidden bg-transparent">
      {/* Deep Shadow Overlays - Video Match */}
      <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-[#2B1042] via-[#2B1042]/90 to-transparent z-30 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-[#2B1042] via-[#2B1042]/90 to-transparent z-30 pointer-events-none" />

      <div className="max-w-[1200px] mx-auto px-6 mb-24 text-center relative z-40">
          <p className="text-[10px] font-black uppercase tracking-[0.6em] text-primary/40 mb-6">INTEGRATION_ECOSYSTEM</p>
          <h2 className="text-4xl md:text-6xl font-light text-white tracking-tight leading-tight">
            Plug AI into your own data &<br/>
            <span className="font-medium text-white/40 italic">over 500 integrations</span>
          </h2>
      </div>

      {/* 3D Perspective Container */}
      <div style={{ 
        perspective: '1200px',
        perspectiveOrigin: 'center center',
      }} className="relative z-20">
        <div style={{ 
          transform: 'rotateX(25deg) scale(1.1)',
          transformOrigin: 'center center',
        }}>
          <div ref={tiltRef} style={{ transition: 'transform .1s linear' }}>
            <div style={maskStyle}>
              <div ref={row1Ref} style={{ display: 'flex', gap: 20, willChange: 'transform' }}>
                {row1Icons.map((icon, i) => (
                  <IconTile key={i} icon={icon} />
                ))}
              </div>
            </div>

            <div style={{ ...maskStyle, marginTop: 20 }}>
              <div ref={row2Ref} style={{ display: 'flex', gap: 20, willChange: 'transform' }}>
                {row2Icons.map((icon, i) => (
                  <IconTile key={i} icon={icon} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
    </div>
  )
}

function IconTile({ icon }) {
  return (
    <div style={{
      width: 82, height: 82, borderRadius: 20, flexShrink: 0,
      background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,.04)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'all 0.5s cubic-bezier(0.23, 1, 0.32, 1)'
    }} className="hover:bg-white/10 hover:border-white/20 hover:scale-105">
      <svg viewBox="0 0 28 28" width={38} height={38} fill="none">
        <rect width="28" height="28" rx="7" fill={icon.bg} />
        <g dangerouslySetInnerHTML={{ __html: icon.svg }} />
      </svg>
    </div>
  )
}
