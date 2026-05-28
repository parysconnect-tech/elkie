import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import { Archive, Check, Loader2, Mail, MessageSquare, X } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import {
  getClientMessages,
  updateClientMessageStatus,
} from '@/lib/clientQueries'
import type { AdminMessage } from '@/lib/adminQueries'
import { hasSupabase } from '@/lib/supabase'
import { cn } from '@/lib/cn'

export default function DashboardMessages() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<AdminMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<AdminMessage | null>(null)

  useEffect(() => {
    if (!user) return
    void getClientMessages(user.id).then((rows) => {
      setMessages(rows)
      setLoading(false)
    })
  }, [user])

  async function setStatus(id: string, status: AdminMessage['status']) {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)))
    if (selected?.id === id) setSelected((m) => (m ? { ...m, status } : m))
    await updateClientMessageStatus(id, status)
  }

  function open(msg: AdminMessage) {
    setSelected(msg)
    if (msg.status === 'new') void setStatus(msg.id, 'read')
  }

  const newCount = messages.filter((m) => m.status === 'new').length

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Messages — Elkie Web Studio</title>
      </Helmet>

      <header>
        <p className="text-text-muted text-xs uppercase tracking-[0.3em]">
          <span className="bg-accent-dim text-accent inline-flex items-center gap-1.5 rounded-full px-3 py-1">
            <MessageSquare size={10} /> Inbox
          </span>
        </p>
        <h1 className="text-text mt-4 font-heading text-3xl font-bold md:text-4xl">
          Your messages
        </h1>
        <p className="text-text-muted mt-2 text-sm">
          {messages.length} total · <span className="text-accent">{newCount} new</span> — from
          your site's contact form.
        </p>
      </header>

      {!hasSupabase() && (
        <div className="border-amber-500/30 bg-amber-500/10 text-amber-100/90 rounded-xl border px-4 py-3 text-xs">
          Dev stub mode — sample messages shown.
        </div>
      )}

      <div className="glass overflow-hidden rounded-2xl">
        {loading ? (
          <div className="text-text-muted flex items-center justify-center gap-2 py-16 text-sm">
            <Loader2 size={16} className="animate-spin" /> Loading…
          </div>
        ) : messages.length === 0 ? (
          <div className="text-text-muted py-16 text-center text-sm">
            No messages yet. They'll appear here when visitors use your contact form.
          </div>
        ) : (
          <ul className="divide-card-border divide-y">
            {messages.map((msg) => (
              <li key={msg.id}>
                <button
                  type="button"
                  onClick={() => open(msg)}
                  className="hover:bg-card-bg/50 flex w-full items-center gap-4 px-4 py-4 text-left transition-colors md:px-5"
                >
                  <span
                    className={cn(
                      'h-2 w-2 shrink-0 rounded-full',
                      msg.status === 'new'
                        ? 'bg-accent shadow-accent/15 shadow-[0_0_0_4px]'
                        : msg.status === 'replied'
                          ? 'bg-emerald-400'
                          : 'bg-text-muted/40',
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-text truncate text-sm font-semibold">{msg.email}</p>
                    <p className="text-text-muted truncate text-xs">{msg.about}</p>
                  </div>
                  <span className="text-text-muted shrink-0 text-xs">{timeAgo(msg.createdAt)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <>
            <motion.button
              type="button"
              onClick={() => setSelected(null)}
              aria-label="Close"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 cursor-default bg-black"
            />
            <motion.aside
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="bg-bg-sec border-card-border fixed right-0 top-0 z-50 flex h-screen w-full max-w-md flex-col border-l shadow-2xl"
            >
              <header className="border-card-border flex items-center justify-between border-b px-5 py-4">
                <div>
                  <p className="text-text-muted text-xs uppercase tracking-widest">Message from</p>
                  <p className="text-text font-heading text-sm font-semibold">{selected.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  aria-label="Close"
                  className="text-text-muted hover:text-text transition-colors"
                >
                  <X size={18} />
                </button>
              </header>
              <div className="flex-1 overflow-y-auto p-5">
                <p className="text-text-muted mb-3 text-xs uppercase tracking-widest">
                  {new Date(selected.createdAt).toLocaleString()}
                </p>
                <p className="text-text whitespace-pre-wrap text-sm leading-relaxed">
                  {selected.about}
                </p>
              </div>
              <footer className="border-card-border space-y-2 border-t p-4">
                <a
                  href={`mailto:${selected.email}`}
                  onClick={() => setStatus(selected.id, 'replied')}
                  className="cta-gradient cta-btn glow-border flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium text-white shadow-xl"
                >
                  <Mail size={14} /> Reply via email
                </a>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus(selected.id, 'replied')}
                    className="border-card-border text-text-muted hover:border-accent hover:text-accent inline-flex items-center justify-center gap-1.5 rounded-full border px-4 py-2 text-xs transition-colors"
                  >
                    <Check size={12} /> Mark replied
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus(selected.id, 'archived')}
                    className="border-card-border text-text-muted hover:border-accent hover:text-accent inline-flex items-center justify-center gap-1.5 rounded-full border px-4 py-2 text-xs transition-colors"
                  >
                    <Archive size={12} /> Archive
                  </button>
                </div>
              </footer>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
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
