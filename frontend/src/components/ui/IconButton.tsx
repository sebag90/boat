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
        'inline-flex size-9 items-center justify-center rounded-xl transition-all duration-200 cursor-pointer',
        'disabled:cursor-not-allowed disabled:opacity-40',
        tone === 'danger'
          ? 'text-on-surface-variant hover:bg-error hover:text-white'
          : tone === 'onDark'
            ? 'text-on-primary-container hover:bg-white/15 hover:text-white'
            : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface active:bg-surface-container-high',
        className,
      )}
    >
      {icon}
    </button>
  )
}
