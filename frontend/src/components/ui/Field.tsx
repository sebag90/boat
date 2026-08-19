import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

const CONTROL =
  'w-full rounded-xl border border-navy-300 bg-white px-3.5 py-2.5 text-sm text-navy-900 ' +
  'placeholder:text-navy-400 shadow-inner shadow-navy-950/[0.03] transition-colors duration-200 ' +
  'focus:border-ocean-600 focus:ring-2 focus:ring-ocean-300 focus:outline-none ' +
  'disabled:cursor-not-allowed disabled:bg-navy-50 disabled:text-navy-400'

interface FieldProps {
  label?: ReactNode
  hint?: ReactNode
  htmlFor?: string
  children: ReactNode
  className?: string
}

export function Field({ label, hint, htmlFor, children, className }: FieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="block text-[0.7rem] font-semibold tracking-[0.08em] text-navy-600 uppercase"
        >
          {label}
        </label>
      )}
      {children}
      {hint && <p className="text-xs text-navy-500">{hint}</p>}
    </div>
  )
}

export function TextInput({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(CONTROL, className)} />
}

export function TextArea({ className, rows = 4, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={rows} {...props} className={cn(CONTROL, 'resize-y leading-relaxed', className)} />
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={cn(CONTROL, 'appearance-none pr-9 font-medium', className)}>
      {children}
    </select>
  )
}
