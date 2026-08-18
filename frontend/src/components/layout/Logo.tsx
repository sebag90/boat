import { cn } from '../../lib/cn'

/** Ship's wheel / compass rose mark. */
export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={cn('size-9', className)} aria-hidden="true">
      <circle cx="32" cy="32" r="29" className="fill-white" />
      <circle
        cx="32"
        cy="32"
        r="29"
        className="fill-none stroke-navy-950"
        strokeWidth="2.5"
      />
      <circle cx="32" cy="32" r="21" className="fill-none stroke-navy-200" strokeWidth="1.5" />
      <path d="M32 6 L38.5 30 L32 26.5 L25.5 30 Z" className="fill-brass-500" />
      <path d="M32 58 L25.5 34 L32 37.5 L38.5 34 Z" className="fill-navy-950" />
      <path d="M6 32 L30 25.5 L26.5 32 L30 38.5 Z" className="fill-navy-700/70" />
      <path d="M58 32 L34 38.5 L37.5 32 L34 25.5 Z" className="fill-ocean-500" />
      <circle cx="32" cy="32" r="3.2" className="fill-navy-950" />
    </svg>
  )
}

export function BrandMark({ subtitle }: { subtitle?: string }) {
  return (
    <div className="flex items-center gap-3">
      <Logo />
      <div className="leading-tight">
        <p className="font-display text-[1.05rem] font-semibold tracking-tight text-navy-950">
          Boat Organizer
        </p>
        {subtitle && (
          <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-navy-400 uppercase">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  )
}
