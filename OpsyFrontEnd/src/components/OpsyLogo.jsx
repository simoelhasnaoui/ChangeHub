// Opsy Logo SVG — gears-diamond mark only (no text, transparent background)
// Original green: #6B8E23 (olive-green gears), purple text: #5C2D8F
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
      <line x1="50" y1="18" x2="22" y2="50" stroke="#6B8E23" strokeWidth="2.5" />
      <line x1="50" y1="18" x2="78" y2="50" stroke="#6B8E23" strokeWidth="2.5" />
      <line x1="22" y1="50" x2="50" y2="82" stroke="#6B8E23" strokeWidth="2.5" />
      <line x1="78" y1="50" x2="50" y2="82" stroke="#6B8E23" strokeWidth="2.5" />

      {/* Gear function — 5 gears at each point + center */}
      {/* Top gear */}
      <circle cx="50" cy="18" r="8" fill="#6B8E23" />
      <circle cx="50" cy="18" r="4" fill="#2B1042" />
      {/* Teeth top */}
      <rect x="46.5" y="7" width="7" height="4" rx="1" fill="#6B8E23" />
      <rect x="46.5" y="25" width="7" height="4" rx="1" fill="#6B8E23" />
      <rect x="39" y="14.5" width="4" height="7" rx="1" fill="#6B8E23" />
      <rect x="57" y="14.5" width="4" height="7" rx="1" fill="#6B8E23" />

      {/* Lert gear */}
      <circle cx="22" cy="50" r="8" fill="#6B8E23" />
      <circle cx="22" cy="50" r="4" fill="#2B1042" />
      <rect x="18.5" y="39" width="7" height="4" rx="1" fill="#6B8E23" />
      <rect x="18.5" y="57" width="7" height="4" rx="1" fill="#6B8E23" />
      <rect x="11" y="46.5" width="4" height="7" rx="1" fill="#6B8E23" />
      <rect x="29" y="46.5" width="4" height="7" rx="1" fill="#6B8E23" />

      {/* Right gear */}
      <circle cx="78" cy="50" r="8" fill="#6B8E23" />
      <circle cx="78" cy="50" r="4" fill="#2B1042" />
      <rect x="74.5" y="39" width="7" height="4" rx="1" fill="#6B8E23" />
      <rect x="74.5" y="57" width="7" height="4" rx="1" fill="#6B8E23" />
      <rect x="67" y="46.5" width="4" height="7" rx="1" fill="#6B8E23" />
      <rect x="85" y="46.5" width="4" height="7" rx="1" fill="#6B8E23" />

      {/* Bottom gear */}
      <circle cx="50" cy="82" r="8" fill="#6B8E23" />
      <circle cx="50" cy="82" r="4" fill="#2B1042" />
      <rect x="46.5" y="71" width="7" height="4" rx="1" fill="#6B8E23" />
      <rect x="46.5" y="89" width="7" height="4" rx="1" fill="#6B8E23" />
      <rect x="39" y="78.5" width="4" height="7" rx="1" fill="#6B8E23" />
      <rect x="57" y="78.5" width="4" height="7" rx="1" fill="#6B8E23" />

      {/* Center gear (slightly larger) */}
      <circle cx="50" cy="50" r="10" fill="#6B8E23" />
      <circle cx="50" cy="50" r="5" fill="#2B1042" />
      <rect x="45.5" y="37" width="9" height="4.5" rx="1" fill="#6B8E23" />
      <rect x="45.5" y="58.5" width="9" height="4.5" rx="1" fill="#6B8E23" />
      <rect x="37" y="45.5" width="4.5" height="9" rx="1" fill="#6B8E23" />
      <rect x="58.5" y="45.5" width="4.5" height="9" rx="1" fill="#6B8E23" />
    </svg>
  )
}
