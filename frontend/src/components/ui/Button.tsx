import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'brass'
type Size = 'sm' | 'md' | 'lg'

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-navy-950 text-white shadow-chart hover:bg-navy-800 active:bg-navy-900 disabled:hover:bg-navy-950',
  secondary:
    'bg-white text-navy-800 ring-1 ring-navy-300 shadow-sm hover:bg-ocean-50 hover:text-ocean-900 hover:ring-ocean-400',
  ghost: 'text-navy-600 hover:bg-navy-100 hover:text-navy-950',
  danger: 'bg-signal-600 text-white shadow-chart hover:bg-signal-700',
  brass: 'bg-brass-600 text-white shadow-chart hover:bg-brass-700',
}

const SIZES: Record<Size, string> = {
  sm: 'h-8 gap-1.5 px-3 text-[0.8rem]',
  md: 'h-10 gap-2 px-4 text-sm',
  lg: 'h-12 gap-2 px-5 text-[0.95rem]',
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
        'inline-flex shrink-0 items-center justify-center rounded-xl font-semibold whitespace-nowrap',
        'transition-all duration-200 ease-sail select-none',
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
