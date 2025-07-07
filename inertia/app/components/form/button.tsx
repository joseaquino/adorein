import { PropsWithChildren } from 'react'

interface ButtonProps {
  type?: 'submit' | 'button' | 'reset'
  onClick?: () => void
  variant?: 'contained' | 'outlined' | 'text'
  color?: 'primary' | 'secondary' | 'danger'
  fullWidth?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}

export default function Button(props: PropsWithChildren<ButtonProps>) {
  const {
    children,
    type = 'button',
    onClick,
    variant = 'contained',
    fullWidth = false,
    className = '',
    size = 'md',
    disabled = false,
  } = props

  const variantClasses = [className]

  switch (variant) {
    case 'contained':
      variantClasses.push(
        'bg-primary-9 text-white hover:bg-primary-10 active:bg-primary-10 rounded-md'
      )
      break
    case 'outlined':
      variantClasses.push('border border-indigo-600 text-indigo-600 hover:bg-indigo-50 rounded-md')
      break
    case 'text':
      variantClasses.push('text-indigo-600 hover:text-indigo-800')
      break
  }

  switch (size) {
    case 'sm':
      variantClasses.push('text-sm px-3 py-1')
      break
    case 'md':
      variantClasses.push('text-base px-4 py-2')
      break
    case 'lg':
      variantClasses.push('text-lg px-6 py-3')
      break
  }

  if (fullWidth) {
    variantClasses.push('w-full')
  }

  if (disabled) {
    variantClasses.push('opacity-50 cursor-not-allowed')
  }

  return (
    <button className={variantClasses.join(' ')} type={type} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}
