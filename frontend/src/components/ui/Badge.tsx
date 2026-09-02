import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

type Tone = 'navy' | 'ocean' | 'brass' | 'foam' | 'signal' | 'neutral'

/** Status chips: label-caps uppercase on a subtle tonal tint, rounded-full pill. */
const TONES: Record<Tone, string> = {
  navy: 'bg-primary-container text-white',
  /** Active / connected — light ocean tint. */
  ocean: 'bg-secondary-fixed text-on-secondary-fixed',
  /** Critical — safety orange. */
  brass: 'bg-safety-orange/15 text-safety-orange border border-safety-orange/30',
  /** Resolved — green tint. */
  foam: 'bg-emerald-50 text-emerald-800 border border-emerald-200/60',
  signal: 'bg-error-container text-on-error-container border border-error-container',
  /** Neutral — surface container tint. */
  neutral: 'bg-surface-container text-on-surface-variant',
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
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1',
        'label-caps',
        TONES[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  )
}
