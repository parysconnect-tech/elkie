import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BarChart3,
  CreditCard,
  ExternalLink,
  FileText,
  MessageSquare,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { findPlan } from '@/lib/plans'
import { hasSupabase } from '@/lib/supabase'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

export default function DashboardOverview() {
  const { user, profile } = useAuth()
  const reduced = usePrefersReducedMotion()
  const plan = findPlan(profile?.plan ?? undefined)

  const greetingName =
    profile?.business_name?.trim() ||
    user?.email?.split('@')[0] ||
    'there'

  const cards = [
    {
      title: 'Edit your site copy',
      desc: 'Update your business name, tagline, about, hours, and contact info.',
      to: '/dashboard/content',
      icon: FileText,
    },
    {
      title: 'Read your messages',
      desc: 'Every contact-form submission from your site lands here.',
      to: '/dashboard/messages',
      icon: MessageSquare,
    },
    {
      title: 'See your traffic',
      desc: 'Page views, sources, devices — the last 7 and 30 days.',
      to: '/dashboard/analytics',
      icon: BarChart3,
    },
    {
      title: 'Manage billing',
      desc: 'View your plan, next charge, or upgrade.',
      to: '/dashboard/billing',
      icon: CreditCard,
    },
  ]

  return (
    <div className="space-y-8">
      {/* Greeting card */}
      <motion.section
        initial={reduced ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="anim-border p-1"
      >
        <div className="bg-bg-sec rounded-[1.125rem] p-6 md:p-8">
          <p className="text-text-muted text-xs uppercase tracking-[0.3em]">
            <span className="bg-accent-dim text-accent inline-flex items-center gap-1.5 rounded-full px-3 py-1">
              <Sparkles size={10} /> Welcome back
            </span>
          </p>
          <h1 className="text-text mt-4 font-heading text-3xl font-bold md:text-4xl">
            Hi, {greetingName} 👋
          </h1>
          <p className="text-text-muted mt-2 max-w-xl text-sm leading-relaxed md:text-base">
            This is your personal dashboard. Edit your site, read messages, watch your
            traffic, manage your plan — all from here.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
            <span className="bg-accent-dim text-accent rounded-full px-3 py-1 text-xs font-medium">
              {plan?.name ?? 'No plan yet'}
            </span>
            {profile?.domain ? (
              <a
                href={`https://${profile.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-muted hover:text-accent inline-flex items-center gap-1 text-xs transition-colors"
              >
                {profile.domain} <ExternalLink size={11} />
              </a>
            ) : (
              <span className="text-text-muted text-xs">No domain yet</span>
            )}
          </div>
        </div>
      </motion.section>

      {/* Stub mode notice */}
      {!hasSupabase() && (
        <div className="border-amber-500/30 bg-amber-500/10 text-amber-100/90 rounded-xl border px-4 py-3 text-xs">
          You're in <strong>dev stub mode</strong> — Supabase isn't configured.
          The data here is mocked; real persistence lights up the moment you paste
          your project keys into <code>.env.local</code>.
        </div>
      )}

      {/* Quick links */}
      <section>
        <h2 className="text-text-muted mb-4 text-xs uppercase tracking-[0.3em]">
          Quick links
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {cards.map((card, i) => (
            <motion.div
              key={card.to}
              initial={reduced ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.05 * i,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <Link
                to={card.to}
                className="glass card-hover group flex items-start gap-4 rounded-2xl p-5 transition-colors"
              >
                <span className="cta-gradient flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-lg">
                  <card.icon size={18} strokeWidth={2.25} />
                </span>
                <div className="flex-1">
                  <h3 className="text-text font-heading text-base font-semibold">
                    {card.title}
                  </h3>
                  <p className="text-text-muted mt-0.5 text-sm leading-relaxed">
                    {card.desc}
                  </p>
                </div>
                <span className="text-text-muted group-hover:text-accent flex h-9 w-9 shrink-0 items-center justify-center transition-colors">
                  <ArrowRight size={16} />
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}
