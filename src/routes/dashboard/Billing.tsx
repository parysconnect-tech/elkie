import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import {
  ArrowUpRight,
  Check,
  CreditCard,
  ExternalLink,
  FileText,
  Sparkles,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/lib/auth'
import { findPlan, PLANS } from '@/lib/plans'
import { hasSupabase } from '@/lib/supabase'

export default function DashboardBilling() {
  const { profile } = useAuth()
  const plan = findPlan(profile?.plan ?? undefined) ?? PLANS[0]!
  const isActive = !!profile?.stripe_subscription_id || !hasSupabase()

  // Fake next-charge date 30 days out for the demo
  const nextCharge = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(
    undefined,
    { year: 'numeric', month: 'long', day: 'numeric' },
  )

  function openPortal() {
    // TODO(step-10): redirect to Stripe Customer Portal session
    alert(
      'Stripe billing portal opens here once Checkout is wired up (step 10). It lets you update card, download invoices, or cancel.',
    )
  }

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Billing — Elkie Web Studio</title>
      </Helmet>

      <header>
        <p className="text-text-muted text-xs uppercase tracking-[0.3em]">
          <span className="bg-accent-dim text-accent inline-flex items-center gap-1.5 rounded-full px-3 py-1">
            <CreditCard size={10} /> Billing
          </span>
        </p>
        <h1 className="text-text mt-4 font-heading text-3xl font-bold md:text-4xl">
          Your plan
        </h1>
        <p className="text-text-muted mt-2 text-sm">
          Manage your subscription, payment method, and invoices.
        </p>
      </header>

      {!hasSupabase() && (
        <div className="border-amber-500/30 bg-amber-500/10 text-amber-100/90 rounded-xl border px-4 py-3 text-xs">
          Dev stub mode — billing is illustrative. Real Stripe wiring lands in step 10.
        </div>
      )}

      {/* Current plan card */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="anim-border p-1"
      >
        <div className="bg-bg-sec rounded-[1.125rem] p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-text font-heading text-2xl font-bold">{plan.name}</h2>
                {plan.popular && (
                  <span className="bg-accent rounded-full px-2 py-0.5 text-[10px] font-medium text-black">
                    <Sparkles size={10} className="mb-0.5 mr-0.5 inline" />
                    Popular
                  </span>
                )}
              </div>
              <p className="text-text-muted mt-1 text-sm">{plan.tag}</p>
            </div>
            <span
              className={
                isActive
                  ? 'bg-emerald-500/20 text-emerald-300 rounded-full px-3 py-1 text-xs font-medium'
                  : 'bg-amber-500/20 text-amber-300 rounded-full px-3 py-1 text-xs font-medium'
              }
            >
              {isActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div className="border-card-border mt-6 grid gap-4 border-t pt-6 sm:grid-cols-3">
            <Stat label="Monthly" value={plan.freeDemo ? '—' : `$${plan.monthlyUsd}/mo`} />
            <Stat label="Next charge" value={plan.freeDemo ? '—' : nextCharge} />
            <Stat label="Setup fee" value={`$${plan.setupUsd} (paid)`} />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={openPortal}
              className="cta-gradient cta-btn inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white shadow"
            >
              <CreditCard size={14} /> Manage payment & invoices
            </button>
            <Link
              to="/pricing"
              className="border-card-border text-text hover:border-accent hover:text-accent inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm transition-colors"
            >
              <ArrowUpRight size={14} /> Change plan
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Included features */}
      <section className="glass rounded-2xl p-6">
        <h2 className="text-text mb-4 font-heading text-lg font-semibold">
          What's included
        </h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {plan.features.map((f) => (
            <li key={f} className="text-text-muted flex items-start gap-2 text-sm">
              <Check size={14} className="text-accent mt-0.5 flex-shrink-0" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Invoices (placeholder) */}
      <section className="glass rounded-2xl p-6">
        <h2 className="text-text mb-4 font-heading text-lg font-semibold">Invoices</h2>
        <div className="text-text-muted flex flex-col items-center gap-2 py-8 text-center text-sm">
          <FileText size={20} />
          <p>
            Your invoices will appear here once billing is live.{' '}
            <button
              type="button"
              onClick={openPortal}
              className="text-accent inline-flex items-center gap-1 hover:underline"
            >
              Open billing portal <ExternalLink size={11} />
            </button>
          </p>
        </div>
      </section>

      <p className="text-text-muted/70 text-center text-xs">
        Need to cancel? You can do it anytime from the billing portal — no phone calls, no
        retention pitch.
      </p>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-text-muted text-xs uppercase tracking-widest">{label}</p>
      <p className="text-text mt-1 font-heading text-lg font-semibold">{value}</p>
    </div>
  )
}
