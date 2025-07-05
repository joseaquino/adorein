import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

interface OtpInputProps {
  label: string
  name: string
  value: string
  onChange: (value: string) => void
  error?: string
  length?: number
  disabled?: boolean
  autoFocus?: boolean
  className?: string
}

export interface OtpInputRef {
  focusFirst: () => void
}

const OtpInput = forwardRef<OtpInputRef, OtpInputProps>((props, ref) => {
  const {
    label,
    name,
    value,
    onChange,
    error,
    length = 6,
    disabled = false,
    autoFocus = false,
    className = '',
  } = props

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length)
    for (let i = 0; i < length; i++) {
      if (!inputRefs.current[i]) {
        inputRefs.current[i] = null
      }
    }
  }, [length])

  // Auto-focus first input when component mounts
  useEffect(() => {
    if (autoFocus && !disabled && inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [autoFocus, disabled])

  // Expose focusFirst method via ref
  useImperativeHandle(
    ref,
    () => ({
      focusFirst: () => {
        if (inputRefs.current[0] && !disabled) {
          inputRefs.current[0].focus()
        }
      },
    }),
    [disabled]
  )

  const handleInputChange = (index: number, inputValue: string) => {
    // Only allow digits
    const digit = inputValue.replace(/\D/g, '').slice(-1)

    if (!digit) return // Exit early if no valid digit

    // Create array from current value, ensuring it's the right length
    const currentArray = value.split('')
    while (currentArray.length < length) {
      currentArray.push('')
    }

    // Find the first empty position
    const firstEmptyIndex = currentArray.findIndex((val) => !val || val === '')

    // If there's an empty position before the clicked index, use that instead
    const targetIndex = firstEmptyIndex !== -1 && firstEmptyIndex < index ? firstEmptyIndex : index

    // Update the value at the target index
    currentArray[targetIndex] = digit

    const finalValue = currentArray.slice(0, length).join('')
    onChange(finalValue)

    // Move focus after state update
    handleFocusMove(targetIndex, currentArray)
  }

  const handleFocusMove = (targetIndex: number, currentArray: string[]) => {
    requestAnimationFrame(() => {
      if (targetIndex < length - 1) {
        const nextInput = inputRefs.current[targetIndex + 1]
        if (nextInput) {
          nextInput.focus()
          // If the next input has content, select it
          if (currentArray[targetIndex + 1]) {
            nextInput.select()
          }
        }
      }
    })
  }

  const handleInput = (index: number, e: React.FormEvent<HTMLInputElement>) => {
    const inputValue = (e.target as HTMLInputElement).value
    const digit = inputValue.replace(/\D/g, '').slice(-1)

    if (!digit) return

    // Create array from current value
    const currentArray = value.split('')
    while (currentArray.length < length) {
      currentArray.push('')
    }

    // Find target position
    const firstEmptyIndex = currentArray.findIndex((val) => !val || val === '')
    const targetIndex = firstEmptyIndex !== -1 && firstEmptyIndex < index ? firstEmptyIndex : index

    // Always trigger focus move, even if value doesn't change
    handleFocusMove(targetIndex, currentArray)
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      e.preventDefault()

      // Create array from current value, ensuring it's the right length
      const currentArray = value.split('')
      while (currentArray.length < length) {
        currentArray.push('')
      }

      // If current box has value, clear it
      if (currentArray[index]) {
        currentArray[index] = ''
        const newValue = currentArray.join('')
        onChange(newValue)
      } else if (index > 0) {
        // If current box is empty, move to previous and clear it
        const prevInput = inputRefs.current[index - 1]
        if (prevInput) {
          currentArray[index - 1] = ''
          const newValue = currentArray.join('')
          onChange(newValue)
          prevInput.focus()
        }
      }
    }

    // Handle arrow key navigation
    if (e.key === 'ArrowLeft' && index > 0) {
      const prevInput = inputRefs.current[index - 1]
      if (prevInput) {
        prevInput.focus()
        // Select content if it exists
        setTimeout(() => {
          prevInput.select()
        }, 0)
      }
    }

    if (e.key === 'ArrowRight' && index < length - 1) {
      const nextInput = inputRefs.current[index + 1]
      if (nextInput) {
        nextInput.focus()
        // Select content if it exists
        setTimeout(() => {
          nextInput.select()
        }, 0)
      }
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    onChange(pastedData)

    // Focus the next empty input or the last input
    const nextEmptyIndex = Math.min(pastedData.length, length - 1)
    const targetInput = inputRefs.current[nextEmptyIndex]
    if (targetInput) {
      targetInput.focus()
    }
  }

  const handleClick = (index: number) => {
    // When clicking an input, focus it and select any existing content
    const input = inputRefs.current[index]
    if (input && !disabled) {
      input.select()
    }
  }

  const baseInputClassName =
    'w-12 h-12 text-center text-xl font-mono border-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
  const normalClassName = 'border-gray-300 bg-white text-gray-900'
  const errorClassName = 'border-red-500 bg-red-50 text-red-900'
  const disabledClassName = 'opacity-50 cursor-not-allowed bg-gray-100 border-gray-200'
  const filledClassName = 'border-indigo-400 bg-indigo-50'

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label className="block text-sm font-bold text-indigo-950 text-center">{label}</label>
      <div className="flex gap-2 justify-center">
        {Array.from({ length }, (_, index) => {
          const hasValue = value[index] && value[index] !== ''
          const inputClassName = [
            baseInputClassName,
            error ? errorClassName : normalClassName,
            disabled ? disabledClassName : '',
            hasValue && !error && !disabled ? filledClassName : '',
          ]
            .filter(Boolean)
            .join(' ')

          return (
            <input
              key={`${name}-${index}`}
              ref={(el) => {
                inputRefs.current[index] = el
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={value[index] || ''}
              onChange={(e) => handleInputChange(index, e.target.value)}
              onInput={(e) => handleInput(index, e)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              onClick={() => handleClick(index)}
              className={inputClassName}
              disabled={disabled}
              autoComplete={index === 0 ? 'one-time-code' : 'off'}
              aria-label={`${label} digit ${index + 1}`}
            />
          )
        })}
      </div>
      {error && <p className="text-red-600 text-xs text-center">{error}</p>}
      <p className="text-xs text-gray-500 text-center">
        Enter the {length}-digit code from your email
      </p>
    </div>
  )
})

OtpInput.displayName = 'OtpInput'

export default OtpInput
