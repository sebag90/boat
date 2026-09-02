import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface StatTileProps {
  label: string
  value: ReactNode
  sub?: ReactNode
  icon?: ReactNode
  className?: string
}

export function StatTile({ label, value, sub, icon, className }: StatTileProps) {
  return (
    <div
      className={cn(
        'rounded-2xl bg-surface-container-low/70 backdrop-blur-sm border border-outline-variant/30 p-5 shadow-xs transition-colors hover:bg-surface-container-low',
        className,
      )}
    >
      <div className="flex items-center gap-2 label-caps text-on-surface-variant">
        {icon && <span className="text-secondary">{icon}</span>}
        <span>{label}</span>
      </div>
      <p className="mt-2 font-display text-2xl font-bold tracking-tight text-primary">{value}</p>
      {sub && <p className="mt-1 text-xs text-on-surface-variant font-medium">{sub}</p>}
    </div>
  )
}
