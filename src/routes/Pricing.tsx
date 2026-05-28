import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Check, ChevronDown, Sparkles } from 'lucide-react'
import { PLANS, type BillingCycle } from '@/lib/plans'
import { cn } from '@/lib/cn'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

const FAQ: { q: string; a: string }[] = [
  {
    q: 'Why so cheap?',
    a: 'We design and ship in a fraction of the usual time because we use a tight, opinionated stack and reuse smart components across every site. Most of our plans pay our bills the same way a subscription does — slowly. We bet on volume and long relationships, not big one-off invoices.',
  },
  {
    q: 'Do you have hidden fees?',
    a: "Nope. The setup fee is once-off. The monthly covers hosting, updates, security patches, and support. The only time you'd pay more is if you ask for changes beyond what your plan includes — and we'll always quote you upfront before doing anything.",
  },
  {
    q: 'How fast is 48 hours, really?',
    a: 'From the moment you send a complete brief. If you give us your business name, a paragraph about what you do, and any photos by Monday morning, your site is typically live by Wednesday morning. Bigger Pro Studio builds with 3 pages can take 72 hours.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. Cancel from your dashboard. No phone calls, no retention pitch. If you cancel within the first 14 days, you get a full refund on the setup fee — no questions asked.',
  },
  {
    q: 'Can I migrate my site somewhere else later?',
    a: "We don't lock you in. You can export your content as Markdown + images any time, take your custom domain with you, and we'll happily help you move. The site code stays ours, but you own everything you wrote and uploaded.",
  },
  {
    q: 'What if I outgrow my plan?',
    a: 'Upgrade in your dashboard with one click — pro-rated charges, no rebuild. We can also add custom features (online store, booking, multi-language) on top of any plan as an add-on.',
  },
]

export default function Pricing() {
  const [cycle, setCycle] = useState<BillingCycle>('monthly')
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const reduced = usePrefersReducedMotion()

  return (
    <>
      <Helmet>
        <title>Pricing — Elkie Web Studio</title>
        <meta
          name="description"
          content="Four simple plans, all in USD. Starter, Custom Domain, Pro Studio, or a free demo."
        />
      </Helmet>

      <section className="px-4 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          {/* Header */}
          <div className="mb-12 text-center">
            <p className="text-text-muted mb-4 text-xs uppercase tracking-[0.4em]">
              <span className="bg-accent-dim text-accent inline-flex items-center gap-1.5 rounded-full px-3 py-1">
                <span className="bg-accent block h-1.5 w-1.5 animate-pulse rounded-full" />
                Simple pricing
              </span>
            </p>
            <motion.h1
              className="gradient-text mb-4 font-heading text-[clamp(2.5rem,6vw,4.5rem)] font-bold tracking-tight"
              initial={reduced ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              Pricing that fits today.
            </motion.h1>
            <p className="text-text-muted mx-auto mb-10 max-w-2xl text-lg">
              All plans include hosting, mobile-first design, SSL, and unlimited support.
              No setup fees beyond what's listed. Cancel anytime.
            </p>

            {/* Billing toggle */}
            <div className="bg-card-bg border-card-border inline-flex items-center gap-1 rounded-full border p-1">
              <CycleButton active={cycle === 'monthly'} onClick={() => setCycle('monthly')}>
                Pay monthly
              </CycleButton>
              <CycleButton active={cycle === 'annual'} onClick={() => setCycle('annual')}>
                <span className="flex items-center gap-2">
                  Pay annually
                  <span className="bg-accent rounded-full px-1.5 py-0.5 text-[10px] font-medium text-black">
                    −20%
                  </span>
                </span>
              </CycleButton>
            </div>
          </div>

          {/* Tiers */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {PLANS.map((plan, i) => {
              const effectiveMonthly =
                cycle === 'annual' && plan.monthlyAnnualUsd != null
                  ? plan.monthlyAnnualUsd
                  : plan.monthlyUsd

              return (
                <motion.div
                  key={plan.slug}
                  initial={reduced ? false : { opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.6, delay: 0.08 * i, ease: [0.22, 1, 0.36, 1] }}
                  className={cn(
                    'relative flex flex-col rounded-2xl p-7',
                    plan.popular ? 'anim-border z-10 md:scale-[1.02]' : 'glass card-hover',
                  )}
                >
                  {plan.popular && (
                    <span className="bg-accent absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full px-3 py-1 text-xs font-medium text-black shadow-lg">
                      <Sparkles size={12} /> Most popular
                    </span>
                  )}

                  <h2 className="text-text font-heading text-xl font-semibold">{plan.name}</h2>
                  <p className="text-text-muted mb-6 text-sm">{plan.tag}</p>

                  <div className="mb-6">
                    {plan.freeDemo ? (
                      <p className="text-text font-heading text-4xl font-bold">$0</p>
                    ) : (
                      <>
                        <p className="text-text font-heading text-4xl font-bold">
                          ${plan.setupUsd}
                          <span className="text-text-muted ml-2 text-sm font-normal">
                            setup
                          </span>
                        </p>
                        <p className="text-text-muted mt-1 text-sm">
                          then <span className="text-text font-semibold">${effectiveMonthly}</span>/mo
                          {cycle === 'annual' && plan.monthlyAnnualUsd != null && (
                            <span className="text-accent ml-1.5 text-xs">
                              (${effectiveMonthly * 12} billed yearly)
                            </span>
                          )}
                        </p>
                      </>
                    )}
                  </div>

                  <ul className="mb-8 flex-1 space-y-2">
                    {plan.features.map((f) => (
                      <li key={f} className="text-text-muted flex items-start gap-2 text-sm">
                        <Check size={14} className="text-accent mt-1 flex-shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    to={
                      plan.freeDemo
                        ? '/start?plan=demo'
                        : `/start?plan=${plan.slug}`
                    }
                    className={cn(
                      'cta-btn block rounded-full px-5 py-3 text-center text-sm font-medium',
                      plan.popular
                        ? 'cta-gradient glow-border text-white shadow-xl'
                        : 'border-card-border text-text hover:border-accent hover:text-accent border',
                    )}
                  >
                    {plan.freeDemo ? 'Request demo' : 'Select plan'}
                  </Link>
                </motion.div>
              )
            })}
          </div>

          <p className="text-text-muted mt-12 text-center text-sm">
            {/* TODO(step-10): replace Select buttons with Stripe Checkout once keys are in .env */}
            Payment processing wires up in step 10 — for now Select takes you to the intake form
            with your plan pre-filled.
          </p>

          {/* FAQ */}
          <div className="mt-24">
            <div className="mb-10 text-center">
              <h2 className="text-text mb-3 font-heading text-3xl font-semibold md:text-4xl">
                Questions, answered.
              </h2>
              <p className="text-text-muted">
                Don't see what you're looking for?{' '}
                <Link to="/start" className="text-accent hover:underline">
                  Ask in the brief
                </Link>
                .
              </p>
            </div>
            <ul className="divide-card-border glass divide-y rounded-2xl">
              {FAQ.map((item, i) => {
                const open = openFaq === i
                return (
                  <li key={item.q}>
                    <button
                      type="button"
                      aria-expanded={open}
                      onClick={() => setOpenFaq(open ? null : i)}
                      className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                    >
                      <span
                        className={cn(
                          'font-heading text-base font-semibold md:text-lg',
                          open ? 'text-accent' : 'text-text',
                        )}
                      >
                        {item.q}
                      </span>
                      <ChevronDown
                        size={18}
                        className={cn(
                          'text-text-muted shrink-0 transition-transform',
                          open && 'text-accent rotate-180',
                        )}
                      />
                    </button>
                    <motion.div
                      initial={false}
                      animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="text-text-muted px-6 pb-5 text-sm leading-relaxed md:text-base">
                        {item.a}
                      </p>
                    </motion.div>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </section>
    </>
  )
}

function CycleButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full px-4 py-2 text-sm transition-all',
        active ? 'cta-gradient text-white shadow' : 'text-text-muted hover:text-text',
      )}
    >
      {children}
    </button>
  )
}
