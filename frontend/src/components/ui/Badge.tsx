import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

type Tone = 'navy' | 'ocean' | 'brass' | 'foam' | 'signal' | 'neutral'

const TONES: Record<Tone, string> = {
  navy: 'bg-navy-950 text-white ring-navy-950',
  ocean: 'bg-ocean-100 text-ocean-900 ring-ocean-300',
  brass: 'bg-brass-100 text-brass-800 ring-brass-400',
  foam: 'bg-teal-100 text-teal-800 ring-teal-400',
  signal: 'bg-red-100 text-red-800 ring-red-300',
  neutral: 'bg-navy-100 text-navy-700 ring-navy-300',
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
