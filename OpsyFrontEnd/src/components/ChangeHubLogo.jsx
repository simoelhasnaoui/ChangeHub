// ChangeHub Logo SVG â€” gears-diamond mark only (no text, transparent background)
// Obsidian Theme: Primary #D18CFF, Dark #0F051E
export default function ChangeHubLogo({ size = 40, className = "" }) {
  return (
    <img 
      src="/logo.png" 
      alt="ChangeHub Logo" 
      width={size} 
      height={size} 
      className={`object-contain ${className}`}
      style={{ width: size, height: size }}
    />
  )
}
