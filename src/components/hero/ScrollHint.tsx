import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

/**
 * Bouncing chevron at the bottom of the hero hinting "scroll to see more".
 */
export function ScrollHint() {
  const reduced = usePrefersReducedMotion()
  return (
    <motion.div
      aria-hidden="true"
      className="text-text-muted absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
      animate={reduced ? undefined : { y: [0, 8, 0] }}
      transition={{ duration: 1.8, ease: 'easeInOut', repeat: Infinity }}
    >
      <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
      <ChevronDown size={18} />
    </motion.div>
  )
}
