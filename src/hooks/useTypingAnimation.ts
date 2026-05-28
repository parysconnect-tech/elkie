import { useEffect, useState } from 'react'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

type Options = {
  /** ms per character */
  speed?: number
  /** ms to wait before the first character appears */
  delay?: number
}

/**
 * Types `text` out one character at a time. Falls back to instant display
 * when the user prefers reduced motion. Restarts when `text` changes
 * (useful when the headline switches languages).
 */
export function useTypingAnimation(text: string, { speed = 45, delay = 600 }: Options = {}) {
  const reduced = usePrefersReducedMotion()
  const [display, setDisplay] = useState(reduced ? text : '')
  const [typing, setTyping] = useState(!reduced)

  useEffect(() => {
    if (reduced) {
      setDisplay(text)
      setTyping(false)
      return
    }

    setDisplay('')
    setTyping(true)
    let i = 0
    let interval: ReturnType<typeof setInterval> | undefined
    const timer = setTimeout(() => {
      interval = setInterval(() => {
        i++
        if (i <= text.length) {
          setDisplay(text.slice(0, i))
        } else {
          setTyping(false)
          if (interval) clearInterval(interval)
        }
      }, speed)
    }, delay)

    return () => {
      clearTimeout(timer)
      if (interval) clearInterval(interval)
    }
  }, [text, speed, delay, reduced])

  return { display, typing }
}
