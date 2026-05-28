/**
 * Plan metadata for /pricing, the marketing-page pricing teaser, and the
 * Stripe Checkout wiring (step 10).
 *
 * Prices are intentionally in whole-dollar USD — friendly to US buyers
 * while paying healthier than the old ZAR pricing once converted.
 */

export type PlanSlug = 'starter' | 'custom' | 'pro' | 'demo'

export type Plan = {
  slug: PlanSlug
  name: string
  tag: string
  setupUsd: number
  /** Monthly subscription in USD; 0 for the free demo */
  monthlyUsd: number
  /** Discounted monthly when billed annually (20% off, rounded). Null for demo. */
  monthlyAnnualUsd: number | null
  /** Detailed list of what's included */
  features: string[]
  popular?: boolean
  freeDemo?: boolean
  /** TODO(step-10): replace with real Stripe price IDs from .env */
  stripePriceMonthlyEnv?: string
  stripePriceAnnualEnv?: string
}

export const PLANS: Plan[] = [
  {
    slug: 'starter',
    name: 'Starter',
    tag: 'Simple & affordable',
    setupUsd: 49,
    monthlyUsd: 5,
    monthlyAnnualUsd: 4,
    features: [
      '1-page website',
      'Hosted on yourbiz.elkie.com',
      'Custom design built from your brief',
      'Mobile-first responsive design',
      'SSL + uptime monitoring',
      'Email support',
    ],
    stripePriceMonthlyEnv: 'VITE_STRIPE_PRICE_STARTER_MONTHLY',
    stripePriceAnnualEnv: 'VITE_STRIPE_PRICE_STARTER_ANNUAL',
  },
  {
    slug: 'custom',
    name: 'Custom Domain',
    tag: 'Your own .com',
    setupUsd: 79,
    monthlyUsd: 9,
    monthlyAnnualUsd: 7,
    features: [
      'Everything in Starter',
      'Your own custom domain',
      'Custom email address (1 inbox)',
      'Premium design treatment',
      'Priority support',
    ],
    stripePriceMonthlyEnv: 'VITE_STRIPE_PRICE_CUSTOM_MONTHLY',
    stripePriceAnnualEnv: 'VITE_STRIPE_PRICE_CUSTOM_ANNUAL',
  },
  {
    slug: 'pro',
    name: 'Pro Studio',
    tag: 'Everything you need',
    setupUsd: 149,
    monthlyUsd: 19,
    monthlyAnnualUsd: 15,
    features: [
      '3-page website',
      'Custom domain + custom email (3 inboxes)',
      'Google Maps + Analytics built-in',
      'Personal client dashboard',
      '2 content edits per month included',
      'Hosting + security + bug fixes covered',
      'Bespoke design with unlimited revisions',
    ],
    popular: true,
    stripePriceMonthlyEnv: 'VITE_STRIPE_PRICE_PRO_MONTHLY',
    stripePriceAnnualEnv: 'VITE_STRIPE_PRICE_PRO_ANNUAL',
  },
  {
    slug: 'demo',
    name: 'Free Demo',
    tag: 'See it before you pay',
    setupUsd: 0,
    monthlyUsd: 0,
    monthlyAnnualUsd: null,
    features: [
      'We build a demo version for free',
      'You review it — no payment yet',
      'Love it? Upgrade to any paid plan',
      "Don't love it? No commitment",
    ],
    freeDemo: true,
  },
]

export function findPlan(slug: PlanSlug | string | undefined): Plan | undefined {
  return PLANS.find((p) => p.slug === slug)
}

export type BillingCycle = 'monthly' | 'annual'

/** Convenience: annual savings vs paying monthly for a year. */
export function annualSavings(plan: Plan): number {
  if (plan.monthlyAnnualUsd == null) return 0
  return (plan.monthlyUsd - plan.monthlyAnnualUsd) * 12
}
