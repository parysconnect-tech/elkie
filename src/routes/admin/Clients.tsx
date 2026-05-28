import { useEffect, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown,
  ExternalLink,
  Loader2,
  Mail,
  ShieldUser,
  Users,
} from 'lucide-react'
import { getClients, type AdminClient } from '@/lib/adminQueries'
import { hasSupabase } from '@/lib/supabase'
import { findPlan } from '@/lib/plans'
import { cn } from '@/lib/cn'

type StatusFilter = 'all' | AdminClient['status']

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'cancelled', label: 'Cancelled' },
]

export default function AdminClients() {
  const [clients, setClients] = useState<AdminClient[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    void getClients().then((rows) => {
      setClients(rows)
      setLoading(false)
    })
  }, [])

  const filtered = useMemo(() => {
    if (filter === 'all') return clients
    return clients.filter((c) => c.status === filter)
  }, [clients, filter])

  const mrrTotal = useMemo(
    () => clients.filter((c) => c.status === 'active').reduce((sum, c) => sum + c.mrrUsd, 0),
    [clients],
  )

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Clients — Elkie Web Studio</title>
      </Helmet>

      <header>
        <p className="text-text-muted text-xs uppercase tracking-[0.3em]">
          <span className="bg-accent-dim text-accent inline-flex items-center gap-1.5 rounded-full px-3 py-1">
            <Users size={10} /> Roster
          </span>
        </p>
        <h1 className="text-text mt-4 font-heading text-3xl font-bold md:text-4xl">
          Clients
        </h1>
        <p className="text-text-muted mt-2 text-sm">
          {clients.length} accounts · <span className="text-accent">${mrrTotal}/mo MRR</span>
        </p>
      </header>

      {!hasSupabase() && (
        <div className="border-amber-500/30 bg-amber-500/10 text-amber-100/90 rounded-xl border px-4 py-3 text-xs">
          Dev stub mode — clients listed below are samples.
        </div>
      )}

      {/* Filter chips */}
      <div className="flex flex-wrap items-center gap-2">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setFilter(opt.value)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs transition-colors',
              filter === opt.value
                ? 'border-accent bg-accent-dim text-accent'
                : 'border-card-border text-text-muted hover:border-accent/40 hover:text-text',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="glass overflow-hidden rounded-2xl">
        {loading ? (
          <div className="text-text-muted flex items-center justify-center gap-2 py-16 text-sm">
            <Loader2 size={16} className="animate-spin" /> Loading clients…
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-text-muted py-16 text-center text-sm">
            No clients match that filter.
          </div>
        ) : (
          <ul className="divide-card-border divide-y">
            {filtered.map((client) => {
              const open = expandedId === client.id
              const plan = findPlan(client.plan ?? undefined)
              return (
                <li key={client.id}>
                  <button
                    type="button"
                    onClick={() => setExpandedId(open ? null : client.id)}
                    aria-expanded={open}
                    className="hover:bg-card-bg/50 flex w-full items-center gap-4 px-4 py-4 text-left transition-colors md:px-5"
                  >
                    <span className="cta-gradient flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-heading text-xs font-bold text-white">
                      {initials(client.businessName ?? client.email ?? '?')}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-text truncate text-sm font-semibold">
                        {client.businessName ?? 'Unnamed'}
                      </p>
                      <p className="text-text-muted truncate text-xs">
                        {client.email ?? '—'}
                      </p>
                    </div>
                    <div className="hidden text-right text-xs sm:block">
                      <p className="text-text">{plan?.name ?? '—'}</p>
                      <p className="text-text-muted">
                        ${client.mrrUsd}/mo
                      </p>
                    </div>
                    <StatusPill status={client.status} />
                    <ChevronDown
                      size={16}
                      className={cn(
                        'text-text-muted transition-transform',
                        open && 'text-accent rotate-180',
                      )}
                    />
                  </button>
                  <AnimatePresence>
                    {open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="border-card-border bg-bg/40 grid gap-4 border-t px-4 py-5 md:grid-cols-2 md:px-5">
                          <Detail label="Business" value={client.businessName ?? '—'} />
                          <Detail label="Email" value={client.email ?? '—'} mono />
                          <Detail label="Plan" value={plan?.name ?? '—'} />
                          <Detail label="MRR" value={`$${client.mrrUsd}/mo`} />
                          <Detail
                            label="Domain"
                            value={
                              client.domain ? (
                                <a
                                  href={`https://${client.domain}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-accent inline-flex items-center gap-1 hover:underline"
                                >
                                  {client.domain} <ExternalLink size={11} />
                                </a>
                              ) : (
                                '—'
                              )
                            }
                          />
                          <Detail
                            label="Signed up"
                            value={new Date(client.createdAt).toLocaleDateString()}
                          />
                          <div className="md:col-span-2 flex flex-wrap gap-2 pt-2">
                            {client.email && (
                              <a
                                href={`mailto:${client.email}`}
                                className="border-card-border text-text-muted hover:border-accent hover:text-accent inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors"
                              >
                                <Mail size={12} /> Email
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                alert(
                                  'Impersonation lands in a future step — needs a service-role function to mint a one-time login token.',
                                )
                              }}
                              className="border-card-border text-text-muted hover:border-accent hover:text-accent inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors"
                            >
                              <ShieldUser size={12} /> Impersonate
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

function StatusPill({ status }: { status: AdminClient['status'] }) {
  const map: Record<AdminClient['status'], string> = {
    active: 'bg-emerald-500/20 text-emerald-300',
    paused: 'bg-amber-500/20 text-amber-300',
    cancelled: 'bg-text-muted/15 text-text-muted',
  }
  return (
    <span
      className={cn(
        'rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest',
        map[status],
      )}
    >
      {status}
    </span>
  )
}

function Detail({
  label,
  value,
  mono,
}: {
  label: string
  value: React.ReactNode
  mono?: boolean
}) {
  return (
    <div>
      <p className="text-text-muted text-xs uppercase tracking-widest">{label}</p>
      <p className={cn('text-text mt-1 text-sm', mono && 'font-mono text-xs')}>
        {value}
      </p>
    </div>
  )
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}
