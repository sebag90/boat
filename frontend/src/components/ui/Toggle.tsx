import { Check } from 'lucide-react'
import { cn } from '../../lib/cn'

interface CheckToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  disabled?: boolean
  className?: string
}

/** Round completion toggle. */
export function CheckToggle({ checked, onChange, label, disabled, className }: CheckToggleProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation()
        onChange(!checked)
      }}
      className={cn(
        'flex size-6 shrink-0 items-center justify-center rounded-lg border-2 transition-all duration-200 cursor-pointer',
        checked
          ? 'border-emerald-600 bg-emerald-600 text-white shadow-xs'
          : 'border-outline-variant/80 bg-surface-container-lowest text-transparent hover:border-secondary hover:bg-surface-container-low',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      <Check className="size-3.5" strokeWidth={3} />
    </button>
  )
}

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
}

export function Switch({ checked, onChange, label }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-3 text-sm font-medium text-on-surface cursor-pointer select-none"
    >
      <span
        className={cn(
          'relative h-6 w-11 rounded-full transition-colors duration-200',
          checked ? 'bg-secondary' : 'bg-surface-container-highest',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-sail',
            checked && 'translate-x-5',
          )}
        />
      </span>
      {label}
    </button>
  )
}
