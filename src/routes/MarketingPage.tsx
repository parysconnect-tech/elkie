import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { useLanguage } from '@/lib/language'
import { t } from '@/lib/translations'
import { useTypingAnimation } from '@/hooks/useTypingAnimation'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { ParticleCanvas } from '@/components/hero/ParticleCanvas'
import { MeshBackground } from '@/components/hero/MeshBackground'
import { FloatingShapes } from '@/components/hero/FloatingShapes'
import { MagneticButton } from '@/components/hero/MagneticButton'
import { ScrollHint } from '@/components/hero/ScrollHint'
import { TrustMarquee } from '@/components/hero/TrustMarquee'
import { ProblemSection } from '@/components/sections/ProblemSection'
import { SolutionSection } from '@/components/sections/SolutionSection'
import { HowItWorks } from '@/components/sections/HowItWorks'
import { RecentWork } from '@/components/sections/RecentWork'
import { DashboardDemo } from '@/components/sections/DashboardDemo'
import { PricingTeaser } from '@/components/sections/PricingTeaser'
import { Testimonials } from '@/components/sections/Testimonials'
import { FinalCTA } from '@/components/sections/FinalCTA'

export default function MarketingPage() {
  const { lang } = useLanguage()
  const headline = t(lang, 'heroHeadline')
  const { display, typing } = useTypingAnimation(headline, { speed: 35, delay: 400 })
  const reduced = usePrefersReducedMotion()

  return (
    <>
      <Helmet>
        <title>Elkie Web Studio — We build the website. You just describe it.</title>
      </Helmet>

      <section
        aria-label="Hero"
        className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center overflow-hidden px-4 py-20"
      >
        {/* Layered backgrounds */}
        <MeshBackground />
        <FloatingShapes />
        <ParticleCanvas count={70} />

        {/* Hero content */}
        <motion.div
          className="relative z-10 mx-auto max-w-4xl text-center"
          initial={reduced ? false : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.p
            className="mb-6 text-xs uppercase tracking-[0.4em]"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <span className="bg-accent-dim text-accent inline-flex items-center gap-1.5 rounded-full px-3 py-1">
              <span className="bg-accent block h-1.5 w-1.5 animate-pulse rounded-full" />
              {t(lang, 'heroEyebrow')}
            </span>
          </motion.p>

          <h1
            className={`gradient-text mb-6 font-heading text-[clamp(2.25rem,7vw,5.5rem)] font-bold leading-[1.05] tracking-tight ${
              typing ? 'typing-cursor' : ''
            }`}
            aria-label={headline}
          >
            {display || ' '}
          </h1>

          <motion.p
            className="text-text-muted mx-auto mb-10 max-w-2xl text-lg md:text-xl"
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.7 }}
          >
            {t(lang, 'heroSub')}
          </motion.p>

          <motion.div
            className="flex flex-col items-center justify-center gap-3 sm:flex-row"
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.7 }}
          >
            <MagneticButton
              to="/start"
              className="cta-gradient glow-border px-8 py-4 text-white shadow-xl"
            >
              {t(lang, 'ctaStart')}
            </MagneticButton>
            <MagneticButton
              to="/work"
              className="glass text-text border-card-border border px-8 py-4"
              radius={150}
              strength={0.25}
            >
              {t(lang, 'ctaDemo')}
            </MagneticButton>
          </motion.div>
        </motion.div>

        <ScrollHint />
      </section>

      <TrustMarquee />

      <ProblemSection />
      <SolutionSection />
      <HowItWorks />
      <RecentWork />
      <DashboardDemo />
      <PricingTeaser />
      <Testimonials />
      <FinalCTA />
    </>
  )
}
