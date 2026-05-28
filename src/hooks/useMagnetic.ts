import { useRef, type RefObject } from 'react'
import { useMotionValue, useSpring, type MotionValue } from 'framer-motion'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

type Options = {
  /** Radius in px around the element where the magnetic effect kicks in */
  radius?: number
  /** Fraction of the cursor's offset the element follows (0–1) */
  strength?: number
}

type MagneticReturn<T extends HTMLElement> = {
  ref: RefObject<T | null>
  x: MotionValue<number>
  y: MotionValue<number>
  onMouseMove: (e: React.MouseEvent<T>) => void
  onMouseLeave: () => void
}

/**
 * Makes any element subtly chase the cursor when it's nearby.
 * Springs ensure the motion feels weighted, not jittery.
 */
export function useMagnetic<T extends HTMLElement = HTMLElement>({
  radius = 120,
  strength = 0.35,
}: Options = {}): MagneticReturn<T> {
  const ref = useRef<T | null>(null)
  const reduced = usePrefersReducedMotion()
  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const x = useSpring(rawX, { stiffness: 180, damping: 18, mass: 0.4 })
  const y = useSpring(rawY, { stiffness: 180, damping: 18, mass: 0.4 })

  const onMouseMove = (e: React.MouseEvent<T>) => {
    if (reduced) return
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const dx = e.clientX - cx
    const dy = e.clientY - cy
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist < radius) {
      rawX.set(dx * strength)
      rawY.set(dy * strength)
    } else {
      rawX.set(0)
      rawY.set(0)
    }
  }

  const onMouseLeave = () => {
    rawX.set(0)
    rawY.set(0)
  }

  return { ref, x, y, onMouseMove, onMouseLeave }
}
