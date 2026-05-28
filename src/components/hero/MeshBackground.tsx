import { motion } from 'framer-motion'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

/**
 * Soft, slowly rotating gradient bloom behind the hero. Two layered
 * conic gradients with heavy blur create a fluid "mesh" feel without
 * any image assets.
 */
export function MeshBackground() {
  const reduced = usePrefersReducedMotion()

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute -inset-[20%] opacity-60"
        style={{
          background:
            'conic-gradient(from 0deg at 30% 40%, var(--accent), transparent 40%, var(--accent2), transparent 70%, var(--accent))',
          filter: 'blur(120px)',
        }}
        animate={
          reduced ? undefined : { rotate: [0, 360], scale: [1, 1.05, 1] }
        }
        transition={{
          rotate: { duration: 40, ease: 'linear', repeat: Infinity },
          scale: { duration: 12, ease: 'easeInOut', repeat: Infinity },
        }}
      />
      <motion.div
        className="absolute -inset-[20%] opacity-40 mix-blend-screen"
        style={{
          background:
            'conic-gradient(from 180deg at 70% 60%, var(--accent2), transparent 40%, var(--accent), transparent 70%, var(--accent2))',
          filter: 'blur(140px)',
        }}
        animate={reduced ? undefined : { rotate: [360, 0] }}
        transition={{ duration: 55, ease: 'linear', repeat: Infinity }}
      />
    </div>
  )
}
