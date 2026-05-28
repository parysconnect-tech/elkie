import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Pencil, Wand2, Rocket } from 'lucide-react'
import { useLanguage } from '@/lib/language'
import { t } from '@/lib/translations'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { SectionEyebrow } from './SectionEyebrow'

/**
 * Three-step "How it works". On mobile renders as a vertical stack.
 * On desktop pins the section and translates the inner card track
 * horizontally as you scroll — Apple-product-page feel.
 */
export function HowItWorks() {
  const { lang } = useLanguage()
  const reduced = usePrefersReducedMotion()
  const sectionRef = useRef<HTMLElement | null>(null)
  const trackRef = useRef<HTMLDivElement | null>(null)

  const steps = [
    {
      icon: Pencil,
      number: '01',
      title: t(lang, 'howStep1Title'),
      desc: t(lang, 'howStep1Desc'),
    },
    {
      icon: Wand2,
      number: '02',
      title: t(lang, 'howStep2Title'),
      desc: t(lang, 'howStep2Desc'),
    },
    {
      icon: Rocket,
      number: '03',
      title: t(lang, 'howStep3Title'),
      desc: t(lang, 'howStep3Desc'),
    },
  ]

  useEffect(() => {
    if (reduced) return
    const section = sectionRef.current
    const track = trackRef.current
    if (!section || !track) return

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      // Desktop only — pin the section and slide the track horizontally.
      mm.add('(min-width: 768px)', () => {
        gsap.to(track, {
          xPercent: -66.6666,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: () => `+=${window.innerHeight * 2}`,
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        })
      })

      return () => mm.revert()
    }, section)

    // Refresh ScrollTrigger after layout settles (fonts, images, etc.)
    const refreshTimeout = window.setTimeout(() => ScrollTrigger.refresh(), 300)

    return () => {
      window.clearTimeout(refreshTimeout)
      ctx.revert()
    }
  }, [reduced, lang])

  return (
    <section
      ref={sectionRef}
      aria-labelledby="how-heading"
      className="overflow-hidden px-4 py-24 md:h-screen md:px-0 md:py-0"
    >
      <div className="mx-auto flex h-full max-w-6xl flex-col">
        {/* Header (always at top of pinned area on desktop) */}
        <div className="mb-12 px-4 text-center md:mb-8 md:pt-24">
          <SectionEyebrow>{t(lang, 'howEyebrow')}</SectionEyebrow>
          <motion.h2
            id="how-heading"
            className="text-text mb-3 font-heading text-[clamp(2rem,5vw,3.75rem)] font-semibold tracking-tight"
            initial={reduced ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {t(lang, 'howTitle')}
          </motion.h2>
          <motion.p
            className="text-text-muted text-lg"
            initial={reduced ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            {t(lang, 'howSub')}
          </motion.p>
        </div>

        {/* Mobile: stacked grid (no scroll pin) */}
        <ol className="grid gap-6 md:hidden">
          {steps.map((step) => (
            <li
              key={step.number}
              className="group glass card-hover relative flex flex-col items-start gap-4 rounded-2xl p-8"
            >
              <span
                aria-hidden="true"
                className="text-accent/10 absolute right-6 top-4 font-heading text-6xl font-bold leading-none"
              >
                {step.number}
              </span>
              <span className="cta-gradient flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-lg transition-transform group-hover:scale-110">
                <step.icon size={22} strokeWidth={2.25} />
              </span>
              <h3 className="text-text font-heading text-2xl font-semibold">{step.title}</h3>
              <p className="text-text-muted leading-relaxed">{step.desc}</p>
            </li>
          ))}
        </ol>

        {/* Desktop: horizontal pinned track */}
        <div className="hidden flex-1 overflow-hidden md:block">
          <div
            ref={trackRef}
            className="flex h-full w-[300%] items-center"
          >
            {steps.map((step) => (
              <div
                key={step.number}
                className="flex h-full w-1/3 items-center justify-center px-8 lg:px-16"
              >
                <div className="group glass card-hover relative flex w-full max-w-xl flex-col items-start gap-5 rounded-3xl p-10">
                  <span
                    aria-hidden="true"
                    className="text-accent/10 absolute right-8 top-6 font-heading text-9xl font-bold leading-none"
                  >
                    {step.number}
                  </span>
                  <span className="cta-gradient relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-xl transition-transform group-hover:scale-110">
                    <step.icon size={28} strokeWidth={2.25} />
                  </span>
                  <h3 className="text-text relative z-10 font-heading text-4xl font-bold">
                    {step.title}
                  </h3>
                  <p className="text-text-muted relative z-10 text-lg leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
