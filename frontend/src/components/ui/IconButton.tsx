import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  icon: ReactNode
  tone?: 'neutral' | 'danger'
}

export function IconButton({ label, icon, tone = 'neutral', className, ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      {...props}
      className={cn(
        'inline-flex size-9 items-center justify-center rounded-xl transition-colors duration-200',
        'disabled:cursor-not-allowed disabled:opacity-40',
        tone === 'danger'
          ? 'text-navy-400 hover:bg-signal-500/10 hover:text-signal-600'
          : 'text-navy-500 hover:bg-navy-100 hover:text-navy-900',
        className,
      )}
    >
      {icon}
    </button>
  )
}
