import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { useLanguage } from '@/lib/language'
import { t } from '@/lib/translations'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { SectionEyebrow } from './SectionEyebrow'

/**
 * Split-layout "the solution" section. Text on one side, a stylised
 * phone-screen mockup on the other. The mockup is a CSS / SVG composition
 * for step 2 — step 3 will animate it screen-by-screen as the user scrolls.
 */
export function SolutionSection() {
  const { lang } = useLanguage()
  const reduced = usePrefersReducedMotion()

  const points = [
    t(lang, 'solutionPoint1'),
    t(lang, 'solutionPoint2'),
    t(lang, 'solutionPoint3'),
  ]

  return (
    <section aria-labelledby="solution-heading" className="bg-bg-sec/30 px-4 py-24 md:py-32">
      <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2 md:gap-16">
        {/* Text side */}
        <div>
          <SectionEyebrow>{t(lang, 'solutionEyebrow')}</SectionEyebrow>
          <motion.h2
            id="solution-heading"
            className="text-text mb-6 font-heading text-[clamp(2rem,4.5vw,3.5rem)] font-semibold leading-[1.1] tracking-tight"
            initial={reduced ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {t(lang, 'solutionTitle')}
          </motion.h2>
          <motion.p
            className="text-text-muted mb-8 text-lg leading-relaxed"
            initial={reduced ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            {t(lang, 'solutionBody')}
          </motion.p>
          <ul className="space-y-3">
            {points.map((point, i) => (
              <motion.li
                key={point}
                className="text-text flex items-start gap-3"
                initial={reduced ? false : { opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.1, ease: 'easeOut' }}
              >
                <span className="bg-accent-dim text-accent mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full">
                  <Check size={14} />
                </span>
                <span>{point}</span>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Visual side — stylised phone mockup */}
        <motion.div
          className="relative mx-auto w-full max-w-sm"
          initial={reduced ? false : { opacity: 0, scale: 0.92, rotateY: -8 }}
          whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          style={{ perspective: 1200 }}
        >
          <div className="anim-border p-1">
            <div className="bg-bg-sec relative overflow-hidden rounded-[1.125rem] p-6">
              {/* Fake top status bar */}
              <div className="mb-4 flex items-center justify-between text-[10px] tracking-widest text-text-muted">
                <span>9:41</span>
                <span className="flex gap-1">
                  <span className="bg-text-muted/40 h-1 w-1 rounded-full" />
                  <span className="bg-text-muted/40 h-1 w-1 rounded-full" />
                  <span className="bg-text-muted/40 h-1 w-1 rounded-full" />
                </span>
              </div>
              {/* Fake hero card */}
              <div className="cta-gradient mb-3 h-32 rounded-xl shadow-lg" />
              {/* Fake content blocks */}
              <div className="space-y-2">
                <div className="bg-card-bg h-3 w-3/4 rounded" />
                <div className="bg-card-bg h-3 w-1/2 rounded" />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="bg-card-bg h-16 rounded-lg" />
                <div className="bg-card-bg h-16 rounded-lg" />
              </div>
              <div className="mt-4 space-y-2">
                <div className="bg-card-bg h-2 w-full rounded" />
                <div className="bg-card-bg h-2 w-5/6 rounded" />
                <div className="bg-card-bg h-2 w-2/3 rounded" />
              </div>
              {/* Fake CTA */}
              <div className="cta-gradient mt-4 h-10 rounded-full shadow-lg" />
            </div>
          </div>
          {/* Glow behind */}
          <div
            aria-hidden="true"
            className="from-accent/30 to-accent2/30 absolute -inset-8 -z-10 rounded-full bg-gradient-to-tr opacity-50 blur-3xl"
          />
        </motion.div>
      </div>
    </section>
  )
}
