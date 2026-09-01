import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

type Tone = 'navy' | 'ocean' | 'brass' | 'foam' | 'signal' | 'neutral'

/** Status chips: label-mono uppercase on a tonal tint, 12px radius. */
const TONES: Record<Tone, string> = {
  navy: 'bg-navy-800 text-white',
  /** Active / connected — light ocean tint. */
  ocean: 'bg-ocean-100 text-ocean-800',
  /** Critical — safety orange. */
  brass: 'bg-brass-100 text-brass-700',
  /** Resolved — green tint. */
  foam: 'bg-emerald-50 text-emerald-800',
  signal: 'bg-signal-600/10 text-signal-700',
  /** Pending — seafoam tint. */
  neutral: 'bg-tint text-navy-800',
}

interface BadgeProps {
  children: ReactNode
  tone?: Tone
  icon?: ReactNode
  className?: string
}

export function Badge({ children, tone = 'neutral', icon, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-chip px-2.5 py-1',
        'label-mono',
        TONES[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  )
}
