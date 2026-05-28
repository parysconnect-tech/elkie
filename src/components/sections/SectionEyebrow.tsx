import { motion } from 'framer-motion'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { cn } from '@/lib/cn'

type Props = {
  children: React.ReactNode
  className?: string
}

/**
 * Reusable "eyebrow" tag above section titles. Small caps, accent color,
 * animated dot indicator, pill background.
 */
export function SectionEyebrow({ children, className }: Props) {
  const reduced = usePrefersReducedMotion()
  return (
    <motion.span
      initial={reduced ? false : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'bg-accent-dim text-accent mb-6 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs uppercase tracking-[0.3em]',
        className,
      )}
    >
      <span className="bg-accent block h-1.5 w-1.5 animate-pulse rounded-full" />
      {children}
    </motion.span>
  )
}
