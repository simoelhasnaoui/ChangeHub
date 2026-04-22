// Opsy Logo SVG — gears-diamond mark only (no text, transparent background)
// Obsidian Theme: Primary #D18CFF, Dark #0F051E
export default function OpsyLogo({ size = 40, className = "" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Connecting lines (diamond shape) */}
      <line x1="50" y1="18" x2="22" y2="50" stroke="#D18CFF" strokeWidth="2.5" />
      <line x1="50" y1="18" x2="78" y2="50" stroke="#D18CFF" strokeWidth="2.5" />
      <line x1="22" y1="50" x2="50" y2="82" stroke="#D18CFF" strokeWidth="2.5" />
      <line x1="78" y1="50" x2="50" y2="82" stroke="#D18CFF" strokeWidth="2.5" />

      {/* Gear function — 5 gears at each point + center */}
      {/* Top gear */}
      <circle cx="50" cy="18" r="8" fill="#D18CFF" />
      <circle cx="50" cy="18" r="4" fill="#0F051E" />
      {/* Teeth top */}
      <rect x="46.5" y="7" width="7" height="4" rx="1" fill="#D18CFF" />
      <rect x="46.5" y="25" width="7" height="4" rx="1" fill="#D18CFF" />
      <rect x="39" y="14.5" width="4" height="7" rx="1" fill="#D18CFF" />
      <rect x="57" y="14.5" width="4" height="7" rx="1" fill="#D18CFF" />

      {/* Left gear */}
      <circle cx="22" cy="50" r="8" fill="#D18CFF" />
      <circle cx="22" cy="50" r="4" fill="#0F051E" />
      <rect x="18.5" y="39" width="7" height="4" rx="1" fill="#D18CFF" />
      <rect x="18.5" y="57" width="7" height="4" rx="1" fill="#D18CFF" />
      <rect x="11" y="46.5" width="4" height="7" rx="1" fill="#D18CFF" />
      <rect x="29" y="46.5" width="4" height="7" rx="1" fill="#D18CFF" />

      {/* Right gear */}
      <circle cx="78" cy="50" r="8" fill="#D18CFF" />
      <circle cx="78" cy="50" r="4" fill="#0F051E" />
      <rect x="74.5" y="39" width="7" height="4" rx="1" fill="#D18CFF" />
      <rect x="74.5" y="57" width="7" height="4" rx="1" fill="#D18CFF" />
      <rect x="67" y="46.5" width="4" height="7" rx="1" fill="#D18CFF" />
      <rect x="85" y="46.5" width="4" height="7" rx="1" fill="#D18CFF" />

      {/* Bottom gear */}
      <circle cx="50" cy="82" r="8" fill="#D18CFF" />
      <circle cx="50" cy="82" r="4" fill="#0F051E" />
      <rect x="46.5" y="71" width="7" height="4" rx="1" fill="#D18CFF" />
      <rect x="46.5" y="89" width="7" height="4" rx="1" fill="#D18CFF" />
      <rect x="39" y="78.5" width="4" height="7" rx="1" fill="#D18CFF" />
      <rect x="57" y="78.5" width="4" height="7" rx="1" fill="#D18CFF" />

      {/* Center gear (slightly larger) */}
      <circle cx="50" cy="50" r="10" fill="#D18CFF" />
      <circle cx="50" cy="50" r="5" fill="#0F051E" />
      <rect x="45.5" y="37" width="9" height="4.5" rx="1" fill="#D18CFF" />
      <rect x="45.5" y="58.5" width="9" height="4.5" rx="1" fill="#D18CFF" />
      <rect x="37" y="45.5" width="4.5" height="9" rx="1" fill="#D18CFF" />
      <rect x="58.5" y="45.5" width="4.5" height="9" rx="1" fill="#D18CFF" />
    </svg>
  )
}
