import { motion } from 'framer-motion'
import { useLanguage } from '@/lib/language'
import { t } from '@/lib/translations'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { SectionEyebrow } from './SectionEyebrow'
import { MagneticButton } from '@/components/hero/MagneticButton'

/**
 * Full-screen final call-to-action. Huge gradient headline, dual CTAs,
 * mesh-style glow behind the text.
 */
export function FinalCTA() {
  const { lang } = useLanguage()
  const reduced = usePrefersReducedMotion()

  return (
    <section
      aria-labelledby="final-heading"
      className="relative flex min-h-[80vh] items-center justify-center overflow-hidden px-4 py-24"
    >
      {/* Glow behind */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, var(--accent-glow) 0%, transparent 60%)',
        }}
        animate={reduced ? undefined : { scale: [1, 1.1, 1], opacity: [0.6, 0.9, 0.6] }}
        transition={{ duration: 8, ease: 'easeInOut', repeat: Infinity }}
      />

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <div className="flex justify-center">
          <SectionEyebrow>{t(lang, 'finalEyebrow')}</SectionEyebrow>
        </div>
        <motion.h2
          id="final-heading"
          className="gradient-text mb-6 font-heading text-[clamp(3rem,9vw,7.5rem)] font-bold leading-[1] tracking-tight"
          initial={reduced ? false : { opacity: 0, scale: 0.95, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        >
          {t(lang, 'finalTitle')}
        </motion.h2>
        <motion.p
          className="text-text-muted mx-auto mb-10 max-w-2xl text-lg md:text-xl"
          initial={reduced ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          {t(lang, 'finalSub')}
        </motion.p>
        <motion.div
          className="flex flex-col items-center justify-center gap-3 sm:flex-row"
          initial={reduced ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, delay: 0.35 }}
        >
          <MagneticButton
            to="/start"
            className="cta-gradient glow-border px-8 py-4 text-white shadow-xl"
          >
            {t(lang, 'ctaStart')}
          </MagneticButton>
          <MagneticButton
            to="/pricing"
            className="glass text-text border-card-border border px-8 py-4"
            radius={150}
            strength={0.25}
          >
            See pricing →
          </MagneticButton>
        </motion.div>
      </div>
    </section>
  )
}
