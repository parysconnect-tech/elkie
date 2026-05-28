import { useEffect, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Archive,
  ArrowLeft,
  Check,
  ExternalLink,
  Inbox,
  Loader2,
  Mail,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react'
import {
  getMessages,
  subscribeToNewMessages,
  updateMessageStatus,
  type AdminMessage,
  type MessageFilter,
} from '@/lib/adminQueries'
import { hasSupabase } from '@/lib/supabase'
import { findPlan } from '@/lib/plans'
import { cn } from '@/lib/cn'

const STATUS_OPTIONS: { value: NonNullable<MessageFilter['status']>; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'read', label: 'Read' },
  { value: 'replied', label: 'Replied' },
  { value: 'archived', label: 'Archived' },
]

const LEAD_TYPE_OPTIONS: {
  value: NonNullable<MessageFilter['leadType']>
  label: string
}[] = [
  { value: 'all', label: 'Everything' },
  { value: 'client', label: 'Client leads' },
  { value: 'partner', label: 'Partner applications' },
]

export default function AdminMessages() {
  const [filter, setFilter] = useState<MessageFilter>({ status: 'all', leadType: 'all' })
  const [messages, setMessages] = useState<AdminMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<AdminMessage | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    setLoading(true)
    void getMessages(filter).then((rows) => {
      setMessages(rows)
      setLoading(false)
    })
  }, [filter])

  // Realtime: prepend new inserts
  useEffect(() => {
    const unsub = subscribeToNewMessages((row) => {
      setMessages((prev) => [row, ...prev])
    })
    return unsub
  }, [])

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return messages
    return messages.filter((m) =>
      [m.businessName, m.email, m.about, m.category]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(term)),
    )
  }, [messages, search])

  async function setStatus(id: string, status: AdminMessage['status']) {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status } : m)),
    )
    if (selected?.id === id) {
      setSelected((m) => (m ? { ...m, status } : m))
    }
    await updateMessageStatus(id, status)
  }

  async function openDetail(msg: AdminMessage) {
    setSelected(msg)
    if (msg.status === 'new') {
      void setStatus(msg.id, 'read')
    }
  }

  const counts = useMemo(() => {
    return {
      total: messages.length,
      new: messages.filter((m) => m.status === 'new').length,
    }
  }, [messages])

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Lead inbox — Elkie Web Studio</title>
      </Helmet>

      <header>
        <p className="text-text-muted text-xs uppercase tracking-[0.3em]">
          <span className="bg-accent-dim text-accent inline-flex items-center gap-1.5 rounded-full px-3 py-1">
            <Inbox size={10} /> Lead inbox
          </span>
        </p>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-text font-heading text-3xl font-bold md:text-4xl">
              Messages
            </h1>
            <p className="text-text-muted mt-2 text-sm">
              {counts.total} total · <span className="text-accent">{counts.new} new</span>
            </p>
          </div>
          {hasSupabase() && (
            <div className="text-text-muted inline-flex items-center gap-1.5 text-xs">
              <span className="bg-emerald-500 inline-block h-1.5 w-1.5 animate-pulse rounded-full" />
              Realtime: live
            </div>
          )}
        </div>
      </header>

      {!hasSupabase() && (
        <div className="border-amber-500/30 bg-amber-500/10 text-amber-100/90 rounded-xl border px-4 py-3 text-xs">
          You're in <strong>dev stub mode</strong> — the messages below are samples. They
          mark as read and update status correctly, but nothing's actually persisted.
        </div>
      )}

      {/* Filters */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-text-muted mr-1 text-xs uppercase tracking-widest">
            Status
          </span>
          {STATUS_OPTIONS.map((opt) => (
            <FilterChip
              key={opt.value}
              active={filter.status === opt.value}
              onClick={() => setFilter((f) => ({ ...f, status: opt.value }))}
            >
              {opt.label}
            </FilterChip>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-text-muted mr-1 text-xs uppercase tracking-widest">
            Type
          </span>
          {LEAD_TYPE_OPTIONS.map((opt) => (
            <FilterChip
              key={opt.value}
              active={filter.leadType === opt.value}
              onClick={() => setFilter((f) => ({ ...f, leadType: opt.value }))}
            >
              {opt.label}
            </FilterChip>
          ))}
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, content…"
            className="bg-input-bg border-card-border text-text placeholder:text-text-muted/60 ml-auto w-full max-w-xs rounded-full border px-4 py-1.5 text-sm outline-none transition-colors focus:border-accent"
          />
        </div>
      </div>

      {/* Table */}
      <div className="glass overflow-hidden rounded-2xl">
        {loading ? (
          <div className="text-text-muted flex items-center justify-center gap-2 py-16 text-sm">
            <Loader2 size={16} className="animate-spin" />
            Loading messages…
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-text-muted py-16 text-center text-sm">
            No messages match those filters.
          </div>
        ) : (
          <ul className="divide-card-border divide-y">
            {filtered.map((msg) => (
              <li key={msg.id}>
                <button
                  type="button"
                  onClick={() => openDetail(msg)}
                  className="hover:bg-card-bg/50 flex w-full items-center gap-4 px-4 py-3 text-left transition-colors md:px-5"
                >
                  <StatusDot status={msg.status} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <p className="text-text truncate text-sm font-semibold">
                        {msg.businessName || msg.email}
                      </p>
                      <LeadTypeBadge type={msg.leadType} />
                      {msg.plan && (
                        <span className="text-text-muted text-xs">
                          · {findPlan(msg.plan)?.name || msg.plan}
                        </span>
                      )}
                    </div>
                    <p className="text-text-muted truncate text-xs">
                      {msg.email} · {msg.about?.slice(0, 80) || 'No description'}
                    </p>
                  </div>
                  <div className="text-text-muted shrink-0 text-right text-xs">
                    <p>{timeAgo(msg.createdAt)}</p>
                    <p className="mt-0.5 capitalize">{msg.status}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Slide-in detail drawer */}
      <AnimatePresence>
        {selected && (
          <DetailDrawer
            message={selected}
            onClose={() => setSelected(null)}
            onSetStatus={(s) => setStatus(selected.id, s)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

/* ============================== detail drawer ============================== */

function DetailDrawer({
  message,
  onClose,
  onSetStatus,
}: {
  message: AdminMessage
  onClose: () => void
  onSetStatus: (status: AdminMessage['status']) => void
}) {
  const plan = findPlan(message.plan ?? undefined)
  const meta = message.metadata as Record<string, unknown>

  // Build a mailto link prefilled for the reply
  const mailto = `mailto:${encodeURIComponent(message.email)}?subject=${encodeURIComponent(
    `Re: your Elkie brief${message.businessName ? ' — ' + message.businessName : ''}`,
  )}&body=${encodeURIComponent(
    `Hi ${message.businessName || ''}\n\nThanks for the brief! We had a look and …\n\n— Elkie`,
  )}`

  return (
    <>
      {/* Backdrop */}
      <motion.button
        type="button"
        onClick={onClose}
        aria-label="Close detail"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 cursor-default bg-black"
      />
      {/* Panel */}
      <motion.aside
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="bg-bg-sec border-card-border fixed right-0 top-0 z-50 flex h-screen w-full max-w-md flex-col border-l shadow-2xl"
      >
        <header className="border-card-border flex items-center justify-between border-b px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="text-text-muted hover:text-text flex items-center gap-1.5 text-sm transition-colors md:hidden"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <div className="hidden md:block">
            <p className="text-text-muted text-xs uppercase tracking-widest">Message</p>
            <p className="text-text font-heading text-sm font-semibold">
              {message.businessName || message.email}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-text-muted hover:text-text transition-colors"
          >
            <X size={18} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="mb-5">
            <p className="text-text-muted mb-2 text-xs uppercase tracking-widest">
              {timeAgo(message.createdAt)} · {new Date(message.createdAt).toLocaleString()}
            </p>
            <h2 className="text-text font-heading text-2xl font-bold">
              {message.businessName || message.email}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <LeadTypeBadge type={message.leadType} />
              <StatusBadge status={message.status} />
              {message.turnstileVerified && (
                <span className="text-text-muted inline-flex items-center gap-1 text-xs">
                  <ShieldCheck size={11} /> Verified
                </span>
              )}
            </div>
          </div>

          <dl className="space-y-4 text-sm">
            <DetailRow label="Email" value={message.email} mono />
            {message.category && <DetailRow label="Category" value={message.category} />}
            {plan && <DetailRow label="Plan interest" value={plan.name} />}
            {message.domain && <DetailRow label="Domain wanted" value={message.domain} mono />}
            {message.about && (
              <DetailRow label="About" value={message.about} multiline />
            )}
            {message.features.length > 0 && (
              <DetailRow label="Features" value={message.features.join(' · ')} />
            )}
            {/* Partner metadata */}
            {message.leadType === 'partner' && (
              <>
                {typeof meta.country === 'string' && (
                  <DetailRow label="Country" value={meta.country} />
                )}
                {typeof meta.experience === 'string' && (
                  <DetailRow label="Experience" value={String(meta.experience)} />
                )}
                {typeof meta.monthlyVolume === 'string' && (
                  <DetailRow label="Monthly volume" value={String(meta.monthlyVolume)} />
                )}
              </>
            )}
            {/* Client metadata */}
            {typeof meta.inspiration === 'string' && meta.inspiration && (
              <DetailRow label="Inspiration" value={String(meta.inspiration)} multiline />
            )}
            <DetailRow
              label="Reference"
              value={<code className="text-accent text-xs">{message.id}</code>}
            />
          </dl>
        </div>

        {/* Action bar */}
        <footer className="border-card-border space-y-2 border-t p-4">
          <a
            href={mailto}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onSetStatus('replied')}
            className="cta-gradient cta-btn glow-border flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium text-white shadow-xl"
          >
            <Mail size={14} /> Reply via email <ExternalLink size={12} />
          </a>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onSetStatus('replied')}
              className="border-card-border text-text-muted hover:border-accent hover:text-accent inline-flex items-center justify-center gap-1.5 rounded-full border px-4 py-2 text-xs transition-colors"
            >
              <Check size={12} /> Mark replied
            </button>
            <button
              type="button"
              onClick={() => onSetStatus('archived')}
              className="border-card-border text-text-muted hover:border-accent hover:text-accent inline-flex items-center justify-center gap-1.5 rounded-full border px-4 py-2 text-xs transition-colors"
            >
              <Archive size={12} /> Archive
            </button>
          </div>
        </footer>
      </motion.aside>
    </>
  )
}

/* ============================== misc ============================== */

function DetailRow({
  label,
  value,
  mono,
  multiline,
}: {
  label: string
  value: React.ReactNode
  mono?: boolean
  multiline?: boolean
}) {
  return (
    <div>
      <dt className="text-text-muted text-xs uppercase tracking-widest">{label}</dt>
      <dd
        className={cn(
          'text-text mt-1',
          mono && 'font-mono text-xs',
          multiline && 'text-sm leading-relaxed',
        )}
      >
        {value}
      </dd>
    </div>
  )
}

function StatusDot({ status }: { status: AdminMessage['status'] }) {
  const colorMap: Record<AdminMessage['status'], string> = {
    new: 'bg-accent shadow-[0_0_0_4px] shadow-accent/15',
    read: 'bg-text-muted/40',
    replied: 'bg-emerald-400',
    archived: 'bg-text-muted/20',
  }
  return (
    <span
      aria-hidden="true"
      className={cn('h-2 w-2 shrink-0 rounded-full', colorMap[status])}
    />
  )
}

function StatusBadge({ status }: { status: AdminMessage['status'] }) {
  const colorMap: Record<AdminMessage['status'], string> = {
    new: 'bg-accent-dim text-accent',
    read: 'bg-card-bg text-text-muted',
    replied: 'bg-emerald-500/20 text-emerald-300',
    archived: 'bg-card-bg text-text-muted/70',
  }
  return (
    <span
      className={cn(
        'rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest',
        colorMap[status],
      )}
    >
      {status}
    </span>
  )
}

function LeadTypeBadge({ type }: { type: AdminMessage['leadType'] }) {
  const map: Record<AdminMessage['leadType'], { label: string; tone: string; icon: typeof Inbox }> = {
    client: { label: 'Client', tone: 'border-card-border text-text-muted', icon: Inbox },
    partner: { label: 'Partner', tone: 'border-violet-500/30 text-violet-300', icon: Sparkles },
    contact: { label: 'Contact', tone: 'border-card-border text-text-muted', icon: Inbox },
  }
  const { label, tone } = map[type]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-widest',
        tone,
      )}
    >
      {label}
    </span>
  )
}

function FilterChip({
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
        'rounded-full border px-3 py-1 text-xs transition-colors',
        active
          ? 'border-accent bg-accent-dim text-accent'
          : 'border-card-border text-text-muted hover:border-accent/40 hover:text-text',
      )}
    >
      {children}
    </button>
  )
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
