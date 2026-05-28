import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

// Register the GSAP scroll plugin once at module load.
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const LenisContext = createContext<Lenis | null>(null)

/**
 * Wraps the entire app. Sets up Lenis (smooth inertia scroll) and wires it
 * to GSAP's ticker so ScrollTrigger uses the smoothed scroll position.
 * Falls back to native scroll when the user prefers reduced motion.
 */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  const reduced = usePrefersReducedMotion()
  const [lenis, setLenis] = useState<Lenis | null>(null)

  useEffect(() => {
    if (reduced) return

    const instance = new Lenis({
      duration: 1.15,
      // Mobile devices use native scroll for accessibility / momentum on iOS
      smoothWheel: true,
      lerp: 0.1,
    })

    setLenis(instance)

    // Sync ScrollTrigger to every Lenis frame.
    instance.on('scroll', ScrollTrigger.update)

    // Drive Lenis from GSAP's ticker for a single shared rAF loop.
    const tick = (time: number) => {
      instance.raf(time * 1000)
    }
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tick)
      instance.destroy()
      setLenis(null)
    }
  }, [reduced])

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
}

/**
 * Read the Lenis instance from anywhere in the tree — useful for programmatic
 * scrolls (`lenis.scrollTo('#contact', { duration: 1.6 })`) or pausing scroll
 * while a modal is open.
 */
export function useLenis() {
  return useContext(LenisContext)
}
