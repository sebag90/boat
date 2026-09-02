import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'brass' | 'dark'
type Size = 'sm' | 'md' | 'lg'

const VARIANTS: Record<Variant, string> = {
  /** Vibrant yacht blue with subtle depth. */
  primary:
    'bg-gradient-to-r from-secondary to-secondary-container text-white shadow-xs hover:brightness-105 active:brightness-95 disabled:hover:brightness-100',
  /** Crisp ghost / luxury surface with subtle border. */
  secondary:
    'bg-surface-container-lowest text-on-surface border border-outline-variant/50 hover:bg-surface-container-low active:bg-surface-container shadow-xs',
  ghost:
    'text-on-surface-variant hover:bg-surface-container hover:text-on-surface active:bg-surface-container-high',
  danger:
    'bg-error text-white hover:brightness-110 active:brightness-95 shadow-xs',
  /** Safety orange — emergency / critical alerts. */
  brass:
    'bg-safety-orange text-white hover:brightness-110 active:brightness-95 shadow-xs',
  /** Deep luxury midnight navy. */
  dark:
    'bg-primary-container text-white hover:bg-navy-muted active:brightness-95 shadow-xs',
}

const SIZES: Record<Size, string> = {
  sm: 'h-8.5 gap-1.5 px-3.5 text-xs',
  md: 'h-10.5 gap-2 px-4.5 text-sm',
  lg: 'h-12.5 gap-2.5 px-6 text-base',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  icon?: ReactNode
  full?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  full,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-2xl font-semibold tracking-tight whitespace-nowrap cursor-pointer',
        'transition-all duration-200 select-none',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:pointer-events-none',
        VARIANTS[variant],
        SIZES[size],
        full && 'w-full',
        className,
      )}
    >
      {icon}
      {children}
    </button>
  )
}
