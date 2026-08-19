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
        'rounded-2xl bg-white px-4 py-3 ring-1 ring-brass-200 shadow-sm',
        className,
      )}
    >
      <div className="flex items-center gap-1.5 text-[0.65rem] font-semibold tracking-[0.12em] text-brass-700 uppercase">
        {icon}
        {label}
      </div>
      <p className="mt-1 font-display text-xl leading-tight font-semibold text-navy-950">{value}</p>
      {sub && <p className="text-xs text-navy-500">{sub}</p>}
    </div>
  )
}
