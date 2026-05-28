import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Activity } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { getClientAnalytics } from '@/lib/clientQueries'
import type { AnalyticsSummary } from '@/lib/adminQueries'
import { hasSupabase } from '@/lib/supabase'
import { TrafficView } from '@/components/TrafficView'
import { RangeSelector } from '@/routes/admin/Analytics'

export default function DashboardAnalytics() {
  const { user } = useAuth()
  const [range, setRange] = useState<7 | 30 | 90>(30)
  const [data, setData] = useState<AnalyticsSummary | null>(null)

  useEffect(() => {
    if (!user) return
    void getClientAnalytics(user.id, range).then(setData)
  }, [user, range])

  return (
    <div className="space-y-8">
      <Helmet>
        <title>Your traffic — Elkie Web Studio</title>
      </Helmet>

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-text-muted text-xs uppercase tracking-[0.3em]">
            <span className="bg-accent-dim text-accent inline-flex items-center gap-1.5 rounded-full px-3 py-1">
              <Activity size={10} /> Your traffic
            </span>
          </p>
          <h1 className="text-text mt-4 font-heading text-3xl font-bold md:text-4xl">
            Analytics
          </h1>
          <p className="text-text-muted mt-2 text-sm">
            How many people visit your site, where they come from, and what they look at.
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
