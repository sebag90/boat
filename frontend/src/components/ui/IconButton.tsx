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
          ? 'text-navy-500 hover:bg-signal-600 hover:text-white'
          : 'text-navy-600 hover:bg-navy-950 hover:text-brass-300',
        className,
      )}
    >
      {icon}
    </button>
  )
}
