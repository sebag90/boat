import { Check } from 'lucide-react'
import { cn } from '../../lib/cn'

interface CheckToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  disabled?: boolean
  className?: string
}

/** Round completion toggle — the ship's-brass porthole check. */
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
        'flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200 ease-sail',
        checked
          ? 'border-foam-700 bg-foam-600 text-white'
          : 'border-navy-400 bg-white text-transparent hover:border-brass-500 hover:bg-brass-100',
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
      className="inline-flex items-center gap-2.5 text-sm font-medium text-navy-700"
    >
      <span
        className={cn(
          'relative h-6 w-11 rounded-full transition-colors duration-200',
          checked ? 'bg-foam-600' : 'bg-navy-300',
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
