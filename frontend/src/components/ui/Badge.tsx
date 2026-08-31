import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

type Tone = 'navy' | 'ocean' | 'brass' | 'foam' | 'signal' | 'neutral'

/** Status chips: label-mono uppercase on a tonal tint, 12px radius. */
const TONES: Record<Tone, string> = {
  navy: 'bg-navy-950 text-white',
  ocean: 'bg-tint-strong text-navy-900',
  /** Critical — safety orange tint. */
  brass: 'bg-brass-100 text-brass-800',
  /** Resolved — green tint. */
  foam: 'bg-emerald-50 text-emerald-800',
  signal: 'bg-red-50 text-signal-700',
  /** Pending — navy tint. */
  neutral: 'bg-tint text-navy-700',
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
