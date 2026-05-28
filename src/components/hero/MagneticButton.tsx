import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useMagnetic } from '@/hooks/useMagnetic'
import { cn } from '@/lib/cn'

type Props = {
  to: string
  children: ReactNode
  className?: string
  /** Larger radius and stronger pull = more dramatic magnet */
  radius?: number
  strength?: number
}

/**
 * A `react-router` Link that gently follows the cursor when hovered near.
 * Used for the hero CTAs and any other "hero feel" buttons.
 */
export function MagneticButton({ to, children, className, radius, strength }: Props) {
  const { ref, x, y, onMouseMove, onMouseLeave } = useMagnetic<HTMLAnchorElement>({
    radius,
    strength,
  })

  return (
    <motion.div
      style={{ x, y, display: 'inline-block' }}
      onMouseMove={onMouseMove as never}
      onMouseLeave={onMouseLeave}
    >
      <Link
        ref={ref}
        to={to}
        className={cn('cta-btn inline-block rounded-full font-medium transition-transform', className)}
      >
        {children}
      </Link>
    </motion.div>
  )
}
