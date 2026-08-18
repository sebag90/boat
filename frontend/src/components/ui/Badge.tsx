import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

type Tone = 'navy' | 'ocean' | 'brass' | 'foam' | 'signal' | 'neutral'

const TONES: Record<Tone, string> = {
  navy: 'bg-navy-950/90 text-white ring-navy-950/10',
  ocean: 'bg-ocean-100 text-ocean-800 ring-ocean-200',
  brass: 'bg-brass-100 text-brass-800 ring-brass-200',
  foam: 'bg-teal-50 text-foam-600 ring-teal-200',
  signal: 'bg-red-50 text-signal-600 ring-red-200',
  neutral: 'bg-navy-50 text-navy-600 ring-navy-200',
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
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] font-semibold',
        'ring-1 ring-inset tracking-wide uppercase',
        TONES[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  )
}
