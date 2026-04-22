import React, { useEffect, useRef, useState, useMemo, Suspense } from 'react'
import { useFrame, useThree, createPortal, Canvas } from '@react-three/fiber'
import { Image, useFBO, MeshTransmissionMaterial, Float, Environment, RoundedBox, useTexture } from '@react-three/drei'
import * as THREE from 'three'

/**
 * -------------------------------------------------------------------
 * PARTNER LOGOS CONFIG
 * -------------------------------------------------------------------
 */
const PARTNER_LOGOS = [
  "3974233d-c2e2-4c0c-9ef7-a59ecd2bd184_removalai_preview.png",
  "80ba0720-68f5-4098-8f09-2c88c7728c63_removalai_preview.png",
  "881ed3a5-a238-423c-b804-4b450f641c82_removalai_preview.png",
  "8e45f72d-cfc9-495a-9152-36ab356b7d2f_removalai_preview.png",
  "8eb80acd-3c2a-45e0-8537-35788838e873_removalai_preview.png",
  "ANP_761312b5ad-removebg-preview.png",
  "AUTOROUTE_DU_MAROC_9af0b9d03a-removebg-preview.png",
  "Accor_Logo_c5e98e0494.png",
  "Al_Barik_Bank_logo_62c009a83d.png",
  "Alstom_svg_4425713e76.png",
  "Bristol_Myers_Squibb_Logo_svg_1bd3130190.png",
  "CDG_Capital_072a66a967.png",
  "CDG_e41d111e58.png",
  "Diar_Al_Mansour_749eced7ae.png",
  "GDF_svg_feb25c753f.png",
  "Logo_Carrefour_svg_95c41be8b7.png",
  "ONCF_ab4f7ea83d.png",
  "ONDA_c4ca6c6c7c.png",
  "RAM_884e09dd15.png",
  "Societe_Generale_svg_056871b433.png",
  "bank_al_maghrib_6b2c95091e.png",
  "carrefour_groupe_logo_6a6c584b74.png",
  "cdg_dev_a3ff22183e.png",
  "cih_bank_7adb60700a.png",
  "eddafc12-2c0b-439a-991f-ded7fbd8dd1b_removalai_preview.png",
  "logo33_84550781c2.png",
  "marjan_f0d7fb4a65.png",
  "mercedes_benz_2f47151253.png",
  "orange_ac3446c3b6.png",
  "stellantis_54e6f1eeec.jpg"
]

const LOGO_W_3D = 1.8
const GAP_3D = 0.4
const ONE_LOOP_W = PARTNER_LOGOS.length * (LOGO_W_3D + GAP_3D)
const SHELF_H = 3.5
const SHELF_Z = 0.4

/**
 * -------------------------------------------------------------------
 * SUB-COMPONENTS (3D)
 * -------------------------------------------------------------------
 */

/**
 * 3D Logo Component with Aspect-Ratio correction
 */
function PartnerLogo3D({ url, maxWidth, maxHeight, ...props }) {
  const texture = useTexture(url)
  const aspect = texture.image.width / texture.image.height

  // Calculate scale to "contain" logo within the Max bounds
  let width = maxWidth
  let height = maxWidth / aspect

  if (height > maxHeight) {
    height = maxHeight
    width = maxHeight * aspect
  }

  return (
    <Image
      url={url}
      transparent
      scale={[width, height]}
      {...props}
    />
  )
}

function ThreeIconsMarquee({ targetSpeed, buffer }) {
  const group = useRef()
  const state = useRef({ pos: 0, currentSpeed: 0.1 })

  useFrame((_, delta) => {
    if (!group.current) return
    const s = state.current
    s.currentSpeed += (targetSpeed.current - s.currentSpeed) * 0.08
    s.pos -= s.currentSpeed * delta * 15

    // Precise modulo loop for both shelf and icons
    s.pos %= ONE_LOOP_W
    group.current.position.x = s.pos
  })

  // 1. Create the logos centered around the origin
  const items = useMemo(() => {
    const arr = []
    const spacing = LOGO_W_3D + GAP_3D
    // Render 3 sets for gapless wrapping
    for (let i = -PARTNER_LOGOS.length; i < PARTNER_LOGOS.length * 2; i++) {
      const logoName = PARTNER_LOGOS[((i % PARTNER_LOGOS.length) + PARTNER_LOGOS.length) % PARTNER_LOGOS.length]
      arr.push({
        url: `/assets/partners/${logoName}`,
        x: i * spacing
      })
    }
    return arr
  }, [])

  return (
    <group>
      {/* 
        A single, ultra-long continuous glass rail. 
        By making it static and very wide, we eliminate all 'seams' and gaps.
      */}
      <group position={[0, 0, 0]}>
        <RoundedBox args={[300, SHELF_H, SHELF_Z]} radius={0.5} smoothness={10}>
          <MeshTransmissionMaterial
            buffer={buffer}
            ior={1.15}
            thickness={5}
            chromaticAberration={0.2}
            anisotropy={0.1}
            distortion={0.1}
            distortionScale={0.1}
            transmission={1}
            roughness={0}
            color="#ffffff"
          />
        </RoundedBox>
      </group>

      {/* The Scrolling Icon Group */}
      <group ref={group}>
        {items.map((item, i) => (
          <Suspense key={`logo-${i}`} fallback={null}>
            <PartnerLogo3D
              url={item.url}
              maxWidth={LOGO_W_3D * 0.8}
              maxHeight={SHELF_H * 0.6}
              position={[item.x, 0, SHELF_Z / 2 + 0.05]}
              renderOrder={1}
            />
          </Suspense>
        ))}
      </group>
    </group>
  )
}

function RefractiveScene({ targetSpeed }) {
  const buffer = useFBO()
  const { viewport } = useThree()
  const [worldScene] = useState(() => new THREE.Scene())

  useFrame((state) => {
    const { gl, camera } = state
    gl.setRenderTarget(buffer)
    gl.render(worldScene, camera)
    gl.setRenderTarget(null)
  })

  return (
    <>
      {/* Background World Portal */}
      {createPortal(
        <>
          <ambientLight intensity={1} />
          <pointLight position={[10, 10, -5]} intensity={2} color="#5C2D8F" />
          <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <mesh position={[-5, 2, -15]}>
              <sphereGeometry args={[4, 32, 32]} />
              <meshStandardMaterial color="#5C2D8F" emissive="#5C2D8F" emissiveIntensity={0.5} />
            </mesh>
          </Float>
          <Float speed={4} rotationIntensity={1} floatIntensity={1}>
            <mesh position={[6, -3, -12]}>
              <sphereGeometry args={[3, 32, 32]} />
              <meshStandardMaterial color="#4A154B" emissive="#4A154B" emissiveIntensity={0.5} />
            </mesh>
          </Float>
          <mesh position={[0, 0, -20]}>
            <planeGeometry args={[100, 100]} />
            <meshBasicMaterial color="#2B1042" />
          </mesh>
        </>,
        worldScene
      )}

      {/* Backdrop Backdrop Backdrop */}
      <mesh scale={[viewport.width * 2, viewport.height * 2, 1]} position={[0, 0, -5]}>
        <planeGeometry />
        <meshBasicMaterial map={buffer.texture} transparent opacity={0.6} />
      </mesh>

      {/* Scrolling Refractive Marquee */}
      <ThreeIconsMarquee targetSpeed={targetSpeed} buffer={buffer.texture} />
    </>
  )
}

/**
 * 2D FALLBACK (Standard React Component)
 */
function IconTile({ logo }) {
  return (
    <div style={{
      flexShrink: 0,
      padding: '0 30px',
      width: '200px',
      height: '100px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <img
        src={`/assets/partners/${logo}`}
        alt="Partner Logo"
        style={{
          maxHeight: '100%',
          maxWidth: '100%',
          width: 'auto',
          height: 'auto',
          objectFit: 'contain',
          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
        }}
      />
    </div>
  )
}

/**
 * -------------------------------------------------------------------
 * MAIN COMPONENT
 * -------------------------------------------------------------------
 */
export default function IntegrationsCarousel() {
  const [is3DReady, setIs3DReady] = useState(true)
  const targetSpeed = useRef(0.1)
  const rowRef = useRef(null)
  const cssStateRef = useRef({ pos: 0, currentSpeed: 0.5, targetSpeed: 0.5 })

  useEffect(() => {
    if (is3DReady) return
    let rafId
    const s = cssStateRef.current
    const LOOP_W_CSS = PARTNER_LOGOS.length * 160 // Slightly wider gap for 2D
    const animate = () => {
      s.currentSpeed += (s.targetSpeed - s.currentSpeed) * 0.08
      s.pos -= s.currentSpeed
      if (Math.abs(s.pos) > LOOP_W_CSS) s.pos += LOOP_W_CSS
      if (rowRef.current) rowRef.current.style.transform = `translateX(${s.pos}px)`
      rafId = requestAnimationFrame(animate)
    }
    rafId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafId)
  }, [is3DReady])

  const marqueeLogos = useMemo(() => {
    const arr = []
    for (let i = 0; i < 60; i++) arr.push(PARTNER_LOGOS[i % PARTNER_LOGOS.length])
    return arr
  }, [])

  return (
    <div className="relative overflow-hidden bg-transparent" style={{ height: '500px' }}>
      {/* Seamless Vertical Fades */}
      <div className="absolute inset-x-0 top-0 h-64 w-full bg-gradient-to-t from-[#2B1042] via-[#2B1042] via-[20%] to-transparent z-[100] pointer-events-none rotate-180" />
      <div className="absolute inset-x-0 bottom-0 h-48 w-full bg-gradient-to-t from-[#2B1042] via-[#2B1042] to-transparent z-50 pointer-events-none" />



      {is3DReady ? (
        <Canvas
          camera={{ position: [0, 0, 15], fov: 35 }}
          dpr={[1, 2]}
          gl={{ alpha: true }}
          onMouseEnter={() => { targetSpeed.current = 0 }}
          onMouseLeave={() => { targetSpeed.current = 0.1 }}
          onError={() => setIs3DReady(false)}
        >
          <Suspense fallback={null}>
            <RefractiveScene targetSpeed={targetSpeed} />
          </Suspense>
        </Canvas>
      ) : (
        <div className="relative z-40 bg-white/[0.01] border-y border-white/10 backdrop-blur-[40px] py-20 mt-20"
          onMouseEnter={() => { targetSpeed.current = 0; cssStateRef.current.targetSpeed = 0 }}
          onMouseLeave={() => { targetSpeed.current = 0.1; cssStateRef.current.targetSpeed = 0.5 }}>
          <div style={{ overflow: 'hidden' }}>
            <div ref={rowRef} style={{ display: 'flex', alignItems: 'center', willChange: 'transform' }}>
              {marqueeLogos.map((logo, i) => <IconTile key={i} logo={logo} />)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
