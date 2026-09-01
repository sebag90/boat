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
    <div className={cn('rounded-card bg-tint px-4 py-3.5', className)}>
      <div className="flex items-center gap-1.5 label-mono text-navy-600">
        {icon}
        {label}
      </div>
      <p className="mt-1.5 text-headline-lg text-navy-950">{value}</p>
      {sub && <p className="label-mono text-navy-500">{sub}</p>}
    </div>
  )
}
