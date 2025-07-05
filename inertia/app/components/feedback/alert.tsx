import React from 'react'
import Button from '../form/button'

export type AlertVariant = 'info' | 'success' | 'warning' | 'error'
export type AlertStyle = 'compact' | 'dialog'

interface AlertProps {
  variant: AlertVariant
  style?: AlertStyle
  title?: string
  children: React.ReactNode
  action?: {
    label: string
    onClick: () => void
    disabled?: boolean
  }
  className?: string
}

const Alert: React.FC<AlertProps> = ({
  variant,
  style = 'compact',
  title,
  children,
  action,
  className = '',
}) => {
  // Base styles for both variants
  const baseStyles = 'border rounded-md text-gray-600 overflow-hidden shadow-xl'

  // Style-specific layouts
  const styleClasses = {
    compact: 'p-4 text-sm',
    dialog: 'text-center',
  }

  // Tile styles
  const textColor: Record<AlertVariant, string> = {
    info: 'text-blue-800',
    success: 'text-green-800',
    warning: 'text-yellow-800',
    error: 'text-red-700',
  }

  const bgColor: Record<AlertVariant, string> = {
    info: 'bg-blue-50',
    success: 'bg-green-50',
    warning: 'bg-yellow-50',
    error: 'bg-red-50',
  }

  const borderColor: Record<AlertVariant, string> = {
    info: 'border-blue-700',
    success: 'border-green-700',
    warning: 'border-yellow-500',
    error: 'border-red-700',
  }

  const shadowColor: Record<AlertVariant, string> = {
    info: 'shadow-blue-700/20',
    success: 'shadow-green-700/20',
    warning: 'shadow-yellow-500/20',
    error: 'shadow-red-700/20',
  }

  const combinedClasses = [
    baseStyles,
    styleClasses[style],
    borderColor[variant],
    shadowColor[variant],
    style === 'dialog' ? '' : bgColor[variant],
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={combinedClasses}>
      {title && style === 'dialog' && (
        <h3
          className={`font-semibold text-lg border-b py-3 ${textColor[variant]} ${borderColor[variant]} ${bgColor[variant]}`}
        >
          {title}
        </h3>
      )}

      <div className={style === 'dialog' ? 'px-4 py-6' : textColor[variant]}>{children}</div>

      {action && (
        <div
          className={style === 'dialog' ? `border-t py-3 px-4 text-right border-gray-300` : 'mt-2'}
        >
          <Button
            onClick={action.onClick}
            disabled={action.disabled}
            className={style === 'dialog' ? 'px-6' : 'text-sm'}
          >
            {action.label}
          </Button>
        </div>
      )}
    </div>
  )
}

export default Alert
