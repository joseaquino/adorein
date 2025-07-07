import { useEffect, useState } from 'react'
import { formatTime } from '@shared/utils/time'

export interface UseTimerReturn {
  formattedTime: string
  secondsRemaining: number
}

/**
 * Generic countdown timer hook
 * @param initialSeconds - Initial seconds to count down from
 * @returns Timer state with formatted time and seconds remaining
 */
export const useTimer = (initialSeconds: number): UseTimerReturn => {
  const [secondsRemaining, setSecondsRemaining] = useState(initialSeconds)

  // Reset timer when initialSeconds changes
  useEffect(() => {
    setSecondsRemaining(initialSeconds)
  }, [initialSeconds])

  // Countdown timer
  useEffect(() => {
    // Only start timer if there's time to count down
    if (initialSeconds <= 0) {
      return
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        const newValue = prev - 1
        if (newValue <= 0) {
          clearInterval(timer)
          return 0
        }
        return newValue
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [initialSeconds]) // Only restart timer when initialSeconds changes

  return {
    formattedTime: formatTime(secondsRemaining),
    secondsRemaining,
  }
}
