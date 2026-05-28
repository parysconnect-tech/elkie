import { motion, useScroll, useSpring } from 'framer-motion'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

/**
 * Accent-gradient bar pinned to the top of the viewport. Fills from 0 → 1
 * as the user scrolls through the document. Springs slightly to feel weighted.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const reduced = usePrefersReducedMotion()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  })

  return (
    <motion.div
      aria-hidden="true"
      className="cta-gradient pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px] origin-left"
      style={{ scaleX: reduced ? scrollYProgress : scaleX }}
    />
  )
}
