import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  icon: ReactNode
  tone?: 'neutral' | 'danger' | 'onDark'
}

export function IconButton({ label, icon, tone = 'neutral', className, ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      {...props}
      className={cn(
        'inline-flex size-9 items-center justify-center rounded transition-colors duration-200',
        'disabled:cursor-not-allowed disabled:opacity-40',
        tone === 'danger'
          ? 'text-navy-500 hover:bg-signal-600 hover:text-white'
          : tone === 'onDark'
            ? 'text-navy-200 hover:bg-white/15 hover:text-white'
            : 'text-navy-600 hover:bg-navy-900 hover:text-white',
        className,
      )}
    >
      {icon}
    </button>
  )
}
