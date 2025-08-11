import Input from './input'

interface EditableFieldProps {
  /** The field label displayed in the left column */
  label: string
  /** The name attribute for the input element */
  name: string
  /** The current value of the field */
  value: string
  /** Whether the field is currently in edit mode */
  isEditing: boolean
  /** Callback function called when the input value changes */
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  /** The input type (text, email, etc.) - defaults to 'text' */
  type?: string
  /** Whether the input should auto-focus when entering edit mode */
  autoFocus?: boolean
  /** Additional CSS classes for the input element */
  className?: string
  /** CSS classes for the display value in view mode - defaults to styled text */
  displayClassName?: string
  /** Optional helper text displayed below the input in edit mode */
  helperText?: string
  /** Validation error message to display */
  error?: string
  /** Whether to align items to start instead of center - useful for fields with helper text */
  alignStart?: boolean
}

const EditableField = ({
  label,
  name,
  value,
  isEditing,
  onChange,
  type = 'text',
  autoFocus = false,
  className = '',
  displayClassName = 'text-sm text-slate-900 py-2',
  helperText,
  error,
  alignStart = false,
}: EditableFieldProps) => {
  const containerClass = alignStart
    ? 'grid grid-cols-5 gap-4 items-start'
    : 'grid grid-cols-5 gap-4 items-center'

  const labelClass = alignStart
    ? 'text-sm font-medium text-slate-500 pt-2'
    : 'text-sm font-medium text-slate-500'

  return (
    <div className={containerClass}>
      <div className={labelClass}>{label}</div>
      <div className="col-span-4">
        {isEditing ? (
          <Input
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            autoFocus={autoFocus}
            className={className}
            helperText={helperText}
            error={error}
          />
        ) : (
          <div className={displayClassName}>{value}</div>
        )}
      </div>
    </div>
  )
}

export default EditableField
