import { motion } from 'framer-motion'
import { useLanguage } from '@/lib/language'
import { t } from '@/lib/translations'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { SectionEyebrow } from './SectionEyebrow'

/**
 * Full-bleed "the problem" section. Big text, sparse layout, fades in as
 * the section scrolls into view. The word-by-word reveal lands in step 3
 * via GSAP SplitText — for now we fade the two body paragraphs sequentially.
 */
export function ProblemSection() {
  const { lang } = useLanguage()
  const reduced = usePrefersReducedMotion()

  return (
    <section aria-labelledby="problem-heading" className="px-4 py-24 md:py-32">
      <div className="mx-auto max-w-4xl text-center">
        <SectionEyebrow>{t(lang, 'problemEyebrow')}</SectionEyebrow>
        <motion.h2
          id="problem-heading"
          className="text-text mb-12 font-heading text-[clamp(2rem,5.5vw,4rem)] font-semibold leading-tight tracking-tight"
          initial={reduced ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {t(lang, 'problemTitle')}
        </motion.h2>

        <div className="mx-auto max-w-3xl space-y-6">
          <motion.p
            className="text-text-muted text-lg md:text-2xl"
            initial={reduced ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          >
            {t(lang, 'problemBody1')}
          </motion.p>
          <motion.p
            className="text-text-muted text-lg md:text-2xl"
            initial={reduced ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {t(lang, 'problemBody2')}
          </motion.p>
        </div>
      </div>
    </section>
  )
}
