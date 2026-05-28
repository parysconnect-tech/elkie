import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Activity, Eye, Globe, TrendingUp, Users } from 'lucide-react'
import { getAnalytics, type AnalyticsSummary } from '@/lib/adminQueries'
import { hasSupabase } from '@/lib/supabase'
import { cn } from '@/lib/cn'

const RANGES: { value: 7 | 30 | 90; label: string }[] = [
  { value: 7, label: '7 days' },
  { value: 30, label: '30 days' },
  { value: 90, label: '90 days' },
]

export default function AdminAnalytics() {
  const [range, setRange] = useState<7 | 30 | 90>(30)
  const [data, setData] = useState<AnalyticsSummary | null>(null)

  useEffect(() => {
    void getAnalytics(range).then(setData)
  }, [range])

  const peak = data?.dailyViews.reduce((max, d) => Math.max(max, d.views), 0) ?? 0

  return (
    <div className="space-y-8">
      <Helmet>
        <title>Analytics — Elkie Web Studio</title>
      </Helmet>

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-text-muted text-xs uppercase tracking-[0.3em]">
            <span className="bg-accent-dim text-accent inline-flex items-center gap-1.5 rounded-full px-3 py-1">
              <Activity size={10} /> Traffic
            </span>
          </p>
          <h1 className="text-text mt-4 font-heading text-3xl font-bold md:text-4xl">
            Analytics
          </h1>
          <p className="text-text-muted mt-2 text-sm">
            Page views, sources, and top pages across elkie.com.
          </p>
        </div>
        <div className="bg-card-bg border-card-border inline-flex items-center gap-1 rounded-full border p-1">
          {RANGES.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setRange(r.value)}
              className={cn(
                'rounded-full px-4 py-1.5 text-xs transition-colors',
                range === r.value
                  ? 'cta-gradient text-white shadow'
                  : 'text-text-muted hover:text-text',
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </header>

      {!hasSupabase() && (
        <div className="border-amber-500/30 bg-amber-500/10 text-amber-100/90 rounded-xl border px-4 py-3 text-xs">
          Dev stub mode — these numbers are synthesised so the layout exists.
        </div>
      )}

      {/* Top-line numbers */}
      <section className="grid gap-4 sm:grid-cols-3">
        <BigNumber
          icon={Eye}
          label="Page views"
          value={data ? data.totalViews.toLocaleString() : '…'}
        />
        <BigNumber
          icon={Users}
          label="Unique sessions"
          value={data ? data.uniqueSessions.toLocaleString() : '…'}
        />
        <BigNumber
          icon={TrendingUp}
          label="Peak day"
          value={peak ? peak.toLocaleString() : '…'}
        />
      </section>

      {/* Chart */}
      <section className="glass rounded-2xl p-6">
        <header className="mb-4 flex items-center justify-between">
          <h2 className="text-text font-heading text-lg font-semibold">
            Visitors · last {range} days
          </h2>
        </header>
        <div className="h-64 w-full">
          {data && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.dailyViews} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="vGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tickFormatter={(v: string) => formatShortDate(v)}
                  tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                  stroke="var(--card-border)"
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                  stroke="var(--card-border)"
                  tickLine={false}
                  axisLine={false}
                  width={40}
                />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-sec)',
                    border: '1px solid var(--card-border)',
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  labelFormatter={(v) => formatLongDate(String(v))}
                  formatter={(value) => [Number(value).toLocaleString(), 'views']}
                />
                <Area
                  type="monotone"
                  dataKey="views"
                  stroke="var(--accent)"
                  strokeWidth={2}
                  fill="url(#vGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* Top pages + referrers */}
      <section className="grid gap-6 lg:grid-cols-2">
        <RankedList
          title="Top pages"
          icon={Eye}
          items={data?.topPages.map((p) => ({ label: p.path, value: p.views })) ?? []}
          unit="views"
        />
        <RankedList
          title="Top referrers"
          icon={Globe}
          items={
            data?.topReferrers.map((r) => ({ label: r.referrer, value: r.visits })) ?? []
          }
          unit="visits"
        />
      </section>
    </div>
  )
}

function BigNumber({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Eye
  label: string
  value: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="glass card-hover rounded-2xl p-5"
    >
      <span className="bg-accent-dim text-accent flex h-9 w-9 items-center justify-center rounded-lg">
        <Icon size={16} />
      </span>
      <p className="text-text-muted mt-3 text-xs uppercase tracking-widest">{label}</p>
      <p className="text-text mt-1 font-heading text-3xl font-bold">{value}</p>
    </motion.div>
  )
}

function RankedList({
  title,
  icon: Icon,
  items,
  unit,
}: {
  title: string
  icon: typeof Eye
  items: { label: string; value: number }[]
  unit: string
}) {
  const max = items.reduce((m, i) => Math.max(m, i.value), 0) || 1
  return (
    <div className="glass rounded-2xl p-6">
      <header className="mb-4 flex items-center gap-2">
        <span className="bg-accent-dim text-accent flex h-7 w-7 items-center justify-center rounded-lg">
          <Icon size={13} />
        </span>
        <h2 className="text-text font-heading text-base font-semibold">{title}</h2>
      </header>
      <ol className="space-y-3">
        {items.map((item) => (
          <li key={item.label}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-text truncate text-sm">{item.label}</span>
              <span className="text-text-muted shrink-0 text-xs">
                {item.value.toLocaleString()} {unit}
              </span>
            </div>
            <div className="bg-card-bg/50 mt-1.5 h-1.5 overflow-hidden rounded-full">
              <div
                className="bg-accent h-full rounded-full"
                style={{ width: `${(item.value / max) * 100}%` }}
              />
            </div>
          </li>
        ))}
        {items.length === 0 && (
          <li className="text-text-muted py-4 text-center text-sm">
            No data yet.
          </li>
        )}
      </ol>
    </div>
  )
}

function formatShortDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getDate()}/${d.getMonth() + 1}`
}

function formatLongDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}
