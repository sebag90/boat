import { cn } from '../../lib/cn'

/** Deepwater luxury compass mark matching favicon.svg. */
export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={cn('size-9 shrink-0', className)} aria-hidden="true">
      <circle cx="32" cy="32" r="30" fill="#111c2a" />
      <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
      <circle
        cx="32"
        cy="32"
        r="20"
        fill="none"
        stroke="rgba(0,112,235,0.4)"
        strokeWidth="1"
        strokeDasharray="3 3"
      />
      <path d="M32 8 L37.5 32 L32 28 L26.5 32 Z" fill="#ff4d00" />
      <path d="M32 56 L26.5 32 L32 36 L37.5 32 Z" fill="#798596" />
      <path d="M56 32 L32 37.5 L36 32 L32 26.5 Z" fill="#0070eb" />
      <path d="M8 32 L32 26.5 L28 32 L32 37.5 Z" fill="#0058bc" />
      <circle cx="32" cy="32" r="4.5" fill="#ffffff" />
      <circle cx="32" cy="32" r="2.5" fill="#111c2a" />
    </svg>
  )
}

export function BrandMark({ subtitle }: { subtitle?: string }) {
  return (
    <div className="flex items-center gap-3">
      <Logo />
      <div className="leading-tight">
        <p className="font-display text-lg font-bold text-primary">Boat Organizer</p>
        {subtitle && <p className="label-caps text-secondary font-semibold">{subtitle}</p>}
      </div>
    </div>
  )
}
