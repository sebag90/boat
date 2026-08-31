import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'brass'
type Size = 'sm' | 'md' | 'lg'

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-navy-950 text-white hover:bg-navy-900 active:bg-navy-950 disabled:hover:bg-navy-950',
  secondary: 'bg-white text-navy-950 border border-navy-200 hover:bg-tint',
  ghost: 'text-navy-600 hover:bg-tint hover:text-navy-950',
  danger: 'bg-signal-600 text-white hover:bg-signal-700',
  /** Safety orange — reserved for save / start / emergency actions. */
  brass: 'bg-brass-500 text-white hover:bg-brass-600',
}

const SIZES: Record<Size, string> = {
  sm: 'h-8 gap-1.5 px-3',
  md: 'h-10 gap-2 px-4',
  lg: 'h-12 gap-2 px-5',
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
        'inline-flex shrink-0 items-center justify-center rounded-xl label-mono whitespace-nowrap',
        'transition-colors duration-200 select-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
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
