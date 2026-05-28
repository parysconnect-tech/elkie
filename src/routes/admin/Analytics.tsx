import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Activity } from 'lucide-react'
import { getAnalytics, type AnalyticsSummary } from '@/lib/adminQueries'
import { hasSupabase } from '@/lib/supabase'
import { TrafficView } from '@/components/TrafficView'
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
        <RangeSelector range={range} onChange={setRange} />
      </header>

      {!hasSupabase() && (
        <div className="border-amber-500/30 bg-amber-500/10 text-amber-100/90 rounded-xl border px-4 py-3 text-xs">
          Dev stub mode — these numbers are synthesised so the layout exists.
        </div>
      )}

      <TrafficView data={data} chartTitle={`Visitors · last ${range} days`} />
    </div>
  )
}

export function RangeSelector({
  range,
  onChange,
}: {
  range: 7 | 30 | 90
  onChange: (r: 7 | 30 | 90) => void
}) {
  return (
    <div className="bg-card-bg border-card-border inline-flex items-center gap-1 rounded-full border p-1">
      {RANGES.map((r) => (
        <button
          key={r.value}
          type="button"
          onClick={() => onChange(r.value)}
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
  )
}
