/**
 * Calculates the time remaining until expiry in seconds
 * @param expiresAt - ISO string of expiry date
 * @returns Number of seconds until expiry (0 if already expired)
 */
export const calculateTimeToExpiry = (expiresAt: string): number => {
  const expiryTime = new Date(expiresAt).getTime()
  const now = Date.now()
  return Math.max(0, Math.floor((expiryTime - now) / 1000))
}

/**
 * Formats time in seconds to a human-readable format
 * @param seconds - Number of seconds to format
 * @returns Formatted time string (e.g., "2:30" or "15s")
 */
export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return minutes > 0
    ? `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    : `${remainingSeconds}s`
}
