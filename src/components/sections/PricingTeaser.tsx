import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Check, Sparkles } from 'lucide-react'
import { useLanguage } from '@/lib/language'
import { t } from '@/lib/translations'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { SectionEyebrow } from './SectionEyebrow'
import { cn } from '@/lib/cn'
import { PLANS } from '@/lib/plans'

// Use the first 3 features of each plan as a tight teaser.
const TIERS = PLANS.map((p) => ({
  slug: p.slug,
  name: p.name,
  tag: p.tag,
  setup: `$${p.setupUsd}`,
  monthly: p.freeDemo ? '—' : `$${p.monthlyUsd}`,
  features: p.features.slice(0, 3),
  popular: p.popular,
  freeDemo: p.freeDemo,
}))

export function PricingTeaser() {
  const { lang } = useLanguage()
  const reduced = usePrefersReducedMotion()

  return (
    <section aria-labelledby="pricing-heading" className="px-4 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <SectionEyebrow>{t(lang, 'pricingEyebrow')}</SectionEyebrow>
          <motion.h2
            id="pricing-heading"
            className="text-text mb-4 font-heading text-[clamp(2rem,5vw,3.75rem)] font-semibold tracking-tight"
            initial={reduced ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {t(lang, 'pricingTitle')}
          </motion.h2>
          <motion.p
            className="text-text-muted mx-auto max-w-2xl text-lg"
            initial={reduced ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            {t(lang, 'pricingSub')}
          </motion.p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {TIERS.map((tier, i) => (
            <motion.div
              key={tier.slug}
              initial={reduced ? false : { opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7, delay: 0.08 * i, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                'relative flex flex-col rounded-2xl p-7',
                tier.popular
                  ? 'anim-border z-10 md:scale-[1.04]'
                  : 'glass card-hover',
              )}
            >
              {tier.popular && (
                <span className="bg-accent absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full px-3 py-1 text-xs font-medium text-black shadow-lg">
                  <Sparkles size={12} /> {t(lang, 'pricingMostPopular')}
                </span>
              )}

              <h3 className="text-text font-heading text-xl font-semibold">{tier.name}</h3>
              <p className="text-text-muted mb-6 text-sm">{tier.tag}</p>

              <div className="mb-6">
                {tier.freeDemo ? (
                  <p className="text-text font-heading text-4xl font-bold">{tier.setup}</p>
                ) : (
                  <>
                    <p className="text-text font-heading text-4xl font-bold">
                      {tier.setup}
                      <span className="text-text-muted ml-2 text-sm font-normal">
                        {t(lang, 'pricingOnceOff')}
                      </span>
                    </p>
                    <p className="text-text-muted mt-1 text-sm">
                      then <span className="text-text font-semibold">{tier.monthly}</span>
                      {t(lang, 'pricingPerMonth')}
                    </p>
                  </>
                )}
              </div>

              <ul className="mb-8 flex-1 space-y-2">
                {tier.features.map((f) => (
                  <li key={f} className="text-text-muted flex items-start gap-2 text-sm">
                    <Check size={14} className="text-accent mt-1 flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/pricing"
                className={cn(
                  'cta-btn block rounded-full px-5 py-3 text-center text-sm font-medium',
                  tier.popular
                    ? 'cta-gradient glow-border text-white shadow-xl'
                    : 'border-card-border text-text hover:border-accent hover:text-accent border',
                )}
              >
                {t(lang, 'pricingSelect')}
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/pricing"
            className="text-text-muted hover:text-accent inline-block text-sm transition-colors"
          >
            {t(lang, 'pricingSeeAll')}
          </Link>
        </div>
      </div>
    </section>
  )
}
