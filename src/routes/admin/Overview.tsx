import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Briefcase,
  CreditCard,
  Eye,
  Handshake,
  Inbox,
  Settings,
  Sparkles,
  TrendingUp,
  UserPlus,
  Users,
} from 'lucide-react'
import {
  getAdminStats,
  getRecentActivity,
  type ActivityEvent,
  type AdminStats,
} from '@/lib/adminQueries'
import { hasSupabase } from '@/lib/supabase'
import { findPlan } from '@/lib/plans'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { cn } from '@/lib/cn'

export default function AdminOverview() {
  const reduced = usePrefersReducedMotion()
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [activity, setActivity] = useState<ActivityEvent[]>([])

  useEffect(() => {
    void getAdminStats().then(setStats)
    void getRecentActivity(8).then(setActivity)
  }, [])

  return (
    <div className="space-y-8">
      <Helmet>
        <title>Admin overview — Elkie Web Studio</title>
      </Helmet>

      <header>
        <p className="text-text-muted text-xs uppercase tracking-[0.3em]">
          <span className="bg-accent-dim text-accent inline-flex items-center gap-1.5 rounded-full px-3 py-1">
            <Sparkles size={10} /> Mission control
          </span>
        </p>
        <h1 className="text-text mt-4 font-heading text-3xl font-bold md:text-4xl">
          Overview
        </h1>
        <p className="text-text-muted mt-2 max-w-xl text-sm md:text-base">
          Every lead, every client, every page view — all in one place.
        </p>
      </header>

      {!hasSupabase() && (
        <div className="border-amber-500/30 bg-amber-500/10 text-amber-100/90 rounded-xl border px-4 py-3 text-xs">
          You're in <strong>dev stub mode</strong> — these numbers are mocked. Paste your
          Supabase keys into <code>.env.local</code> to see real data.
        </div>
      )}

      {/* Stat cards */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Inbox}
          label="Leads (30d)"
          value={stats ? String(stats.leads30d) : '…'}
          delta="+12%"
          reduced={reduced}
          delay={0}
        />
        <StatCard
          icon={Users}
          label="Active clients"
          value={stats ? String(stats.activeClients) : '…'}
          delta="+3"
          reduced={reduced}
          delay={0.05}
        />
        <StatCard
          icon={CreditCard}
          label="MRR"
          value={stats ? `$${stats.mrrUsd}` : '…'}
          delta="+$78"
          reduced={reduced}
          delay={0.1}
        />
        <StatCard
          icon={Eye}
          label="Views (7d)"
          value={stats ? formatNumber(stats.pageViews7d) : '…'}
          delta="+8%"
          reduced={reduced}
          delay={0.15}
        />
      </section>

      {/* Activity feed */}
      <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="glass rounded-2xl p-6">
          <header className="mb-4 flex items-center justify-between">
            <h2 className="text-text font-heading text-lg font-semibold">
              Recent activity
            </h2>
            <Link
              to="/admin/messages"
              className="text-text-muted hover:text-accent text-xs transition-colors"
            >
              View all →
            </Link>
          </header>
          {activity.length === 0 ? (
            <p className="text-text-muted py-8 text-center text-sm">
              Loading recent events…
            </p>
          ) : (
            <ol className="divide-card-border divide-y">
              {activity.map((event, i) => (
                <motion.li
                  key={event.id}
                  initial={reduced ? false : { opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 * i, duration: 0.4 }}
                >
                  <Link
                    to={event.href || '/admin/messages'}
                    className="hover:bg-card-bg/50 -mx-2 flex items-center gap-3 rounded-lg px-2 py-3 transition-colors"
                  >
                    <ActivityIcon type={event.type} />
                    <div className="min-w-0 flex-1">
                      <p className="text-text truncate text-sm font-medium">
                        {activityHeadline(event)}
                      </p>
                      {event.email && (
                        <p className="text-text-muted truncate text-xs">
                          {event.email}
                          {event.plan && (
                            <>
                              {' · '}
                              <span className="text-accent">
                                {findPlan(event.plan)?.name || event.plan}
                              </span>
                            </>
                          )}
                        </p>
                      )}
                    </div>
                    <span className="text-text-muted shrink-0 text-xs">
                      {timeAgo(event.createdAt)}
                    </span>
                  </Link>
                </motion.li>
              ))}
            </ol>
          )}
        </div>

        {/* Quick links */}
        <div className="space-y-3">
          <h2 className="text-text-muted text-xs uppercase tracking-[0.3em]">
            Quick links
          </h2>
          {QUICK_LINKS.map((q) => (
            <Link
              key={q.to}
              to={q.to}
              className="glass card-hover group flex items-center gap-3 rounded-xl p-4 transition-colors"
            >
              <span className="cta-gradient flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white shadow">
                <q.icon size={16} strokeWidth={2.25} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-text text-sm font-semibold">{q.label}</p>
                <p className="text-text-muted truncate text-xs">{q.sub}</p>
              </div>
              <ArrowRight
                size={14}
                className="text-text-muted group-hover:text-accent transition-colors"
              />
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

/* ============================== bits ============================== */

const QUICK_LINKS = [
  { to: '/admin/messages', icon: Inbox, label: 'Lead inbox', sub: 'Form submissions, realtime' },
  { to: '/admin/clients', icon: Users, label: 'Clients', sub: 'Active accounts and plans' },
  { to: '/admin/analytics', icon: BarChart3, label: 'Analytics', sub: 'Page views, sources, funnel' },
  { to: '/admin/work', icon: Briefcase, label: 'Work showcase', sub: 'Manage the /work portfolio' },
  { to: '/admin/settings', icon: Settings, label: 'Settings', sub: 'WhatsApp, email, keys' },
]

function StatCard({
  icon: Icon,
  label,
  value,
  delta,
  reduced,
  delay,
}: {
  icon: typeof Inbox
  label: string
  value: string
  delta: string
  reduced: boolean
  delay: number
}) {
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className="glass card-hover relative overflow-hidden rounded-2xl p-5"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="bg-accent-dim text-accent flex h-9 w-9 items-center justify-center rounded-lg">
          <Icon size={16} />
        </span>
        <span className="text-accent inline-flex items-center gap-0.5 rounded-full text-xs">
          <TrendingUp size={11} /> {delta}
        </span>
      </div>
      <p className="text-text-muted text-xs uppercase tracking-widest">{label}</p>
      <p className="text-text mt-1 font-heading text-3xl font-bold">{value}</p>
    </motion.div>
  )
}

function ActivityIcon({ type }: { type: ActivityEvent['type'] }) {
  const map: Record<ActivityEvent['type'], { icon: typeof Inbox; tone: string }> = {
    new_lead: { icon: Inbox, tone: 'bg-accent-dim text-accent' },
    new_partner: { icon: Handshake, tone: 'bg-violet-500/20 text-violet-300' },
    new_signup: { icon: UserPlus, tone: 'bg-emerald-500/20 text-emerald-300' },
    plan_upgrade: { icon: ArrowUpRight, tone: 'bg-amber-500/20 text-amber-300' },
  }
  const { icon: Icon, tone } = map[type]
  return (
    <span
      className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
        tone,
      )}
    >
      <Icon size={14} />
    </span>
  )
}

function activityHeadline(event: ActivityEvent): string {
  switch (event.type) {
    case 'new_lead':
      return `New lead — ${event.who}`
    case 'new_partner':
      return `Partner application — ${event.who}`
    case 'new_signup':
      return `New client signup — ${event.who}`
    case 'plan_upgrade':
      return `Plan upgrade — ${event.who}`
  }
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString()
}

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}
