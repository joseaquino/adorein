import React from 'react'

interface InputProps {
  label: string
  name: string
  placeholder?: string
  type?: string
  value: any
  error?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export default function Input(props: InputProps) {
  const { label, name, type = 'text', placeholder, value, error, onChange } = props
  return (
    <div className="flex flex-col gap-2">
      <label className="block text-sm font-bold text-indigo-950">{label}</label>
      <div className="flex flex-col gap-1">
        <input
          type={type}
          name={name}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          id={name}
          data-error={!!error}
          className="block w-full px-3 py-2 border border-indigo-800 rounded-md focus:shadow-xs focus:outline-hidden focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white focus:bg-indigo-50 text-indigo-800 data-[error=true]:border-red-600"
        />
        <p className="text-red-600 text-xs">{error}</p>
      </div>
    </div>
  )
}
