import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface PanelProps {
  children: ReactNode
  className?: string
  as?: 'section' | 'div' | 'article'
}

/** Level 1 surface: white card, 12px radius, soft ambient shadow. */
export function Panel({ children, className, as: Tag = 'section' }: PanelProps) {
  return (
    <Tag className={cn('overflow-hidden rounded-card bg-white shadow-sm', className)}>
      {children}
    </Tag>
  )
}

interface PanelHeaderProps {
  title: ReactNode
  subtitle?: ReactNode
  icon?: ReactNode
  actions?: ReactNode
  className?: string
}

export function PanelHeader({ title, subtitle, icon, actions, className }: PanelHeaderProps) {
  return (
    <div
      className={cn(
        'relative flex flex-wrap items-start justify-between gap-3 bg-tint px-5 py-4',
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        {icon && (
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-ocean-100 text-ocean-700">
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <h2 className="text-headline-md text-navy-950">{title}</h2>
          {subtitle && <p className="mt-0.5 label-mono text-navy-500">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}

export function PanelBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('px-5 py-5', className)}>{children}</div>
}
