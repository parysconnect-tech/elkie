import { useEffect, useState } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

/**
 * Returns `true` if the user has asked their OS to reduce motion.
 * Components should fall back to a static (or near-static) render when this
 * is true.
 */
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(QUERY).matches
  })

  useEffect(() => {
    const mql = window.matchMedia(QUERY)
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return reduced
}
