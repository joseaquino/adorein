import React from 'react'

interface InputProps {
  label?: string
  name: string
  placeholder?: string
  type?: string
  value: any
  error?: string
  helperText?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  className?: string
  maxLength?: number
  autoComplete?: string
  autoFocus?: boolean
  disabled?: boolean
}

export default function Input(props: InputProps) {
  const {
    label,
    name,
    type = 'text',
    placeholder,
    value,
    error,
    helperText,
    onChange,
    className,
    maxLength,
    autoComplete,
    autoFocus,
    disabled = false,
  } = props

  const baseClassName =
    'block w-full px-3 py-2 border border-indigo-800 rounded-md focus:shadow-xs focus:outline-hidden focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white focus:bg-indigo-50 text-indigo-800 data-[error=true]:border-red-600'
  const disabledClassName = disabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''
  const finalClassName = className
    ? `${baseClassName} ${disabledClassName} ${className}`
    : `${baseClassName} ${disabledClassName}`

  const inputElement = (
    <input
      type={type}
      name={name}
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      id={name}
      data-error={!!error}
      className={finalClassName}
      maxLength={maxLength}
      autoComplete={autoComplete}
      autoFocus={autoFocus}
      disabled={disabled}
    />
  )

  if (!label) {
    return (
      <div className="flex flex-col gap-1">
        {inputElement}
        {error && <p className="text-red-600 text-xs">{error}</p>}
        {helperText && !error && <p className="text-slate-600 text-xs">{helperText}</p>}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="block text-sm font-bold text-indigo-950">{label}</label>
      <div className="flex flex-col gap-1">
        {inputElement}
        {error && <p className="text-red-600 text-xs">{error}</p>}
        {helperText && !error && <p className="text-slate-600 text-xs">{helperText}</p>}
      </div>
    </div>
  )
}
