import { type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes, forwardRef } from 'react'
import clsx from 'clsx'

const fieldClass = 'w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-ink placeholder:text-ink/40 focus:border-torque focus:outline-none focus:ring-1 focus:ring-torque disabled:bg-subtle disabled:text-ink/50'

interface FieldWrapProps { label?: string; error?: string; hint?: string; required?: boolean }

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & FieldWrapProps>(
  function Input({ label, error, hint, required, className, id, ...rest }, ref) {
    return (
      <div>
        {label && (
          <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
            {label}{required && <span className="text-danger"> *</span>}
          </label>
        )}
        <input ref={ref} id={id} className={clsx(fieldClass, error && 'border-danger focus:border-danger focus:ring-danger', className)} {...rest} />
        {hint && !error && <p className="mt-1 text-xs text-ink/50">{hint}</p>}
        {error && <p className="mt-1 text-xs text-danger">{error}</p>}
      </div>
    )
  }
)

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & FieldWrapProps>(
  function Textarea({ label, error, hint, required, className, id, ...rest }, ref) {
    return (
      <div>
        {label && (
          <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
            {label}{required && <span className="text-danger"> *</span>}
          </label>
        )}
        <textarea ref={ref} id={id} className={clsx(fieldClass, 'min-h-[100px] resize-y', error && 'border-danger', className)} {...rest} />
        {hint && !error && <p className="mt-1 text-xs text-ink/50">{hint}</p>}
        {error && <p className="mt-1 text-xs text-danger">{error}</p>}
      </div>
    )
  }
)

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & FieldWrapProps>(
  function Select({ label, error, hint, required, className, id, children, ...rest }, ref) {
    return (
      <div>
        {label && (
          <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink">
            {label}{required && <span className="text-danger"> *</span>}
          </label>
        )}
        <select ref={ref} id={id} className={clsx(fieldClass, 'bg-white', error && 'border-danger', className)} {...rest}>
          {children}
        </select>
        {hint && !error && <p className="mt-1 text-xs text-ink/50">{hint}</p>}
        {error && <p className="mt-1 text-xs text-danger">{error}</p>}
      </div>
    )
  }
)
