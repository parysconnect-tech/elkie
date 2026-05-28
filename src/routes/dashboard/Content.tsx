import { useEffect, useState, type FormEvent } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { Check, FileText, Loader2, Save } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { getSiteContent, saveSiteContent, type SiteContent } from '@/lib/clientQueries'
import { hasSupabase } from '@/lib/supabase'

export default function DashboardContent() {
  const { user } = useAuth()
  const [content, setContent] = useState<SiteContent | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    void getSiteContent(user.id).then((c) => {
      setContent(c)
      setLoading(false)
    })
  }, [user])

  function update<K extends keyof SiteContent>(key: K, value: SiteContent[K]) {
    setContent((c) => (c ? { ...c, [key]: value } : c))
    setSaved(false)
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!user || !content) return
    setError(null)
    setSaving(true)
    const res = await saveSiteContent(user.id, content)
    setSaving(false)
    if (!res.ok) {
      setError(res.error)
      return
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading || !content) {
    return (
      <div className="text-text-muted flex items-center justify-center gap-2 py-16 text-sm">
        <Loader2 size={16} className="animate-spin" /> Loading your content…
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Edit content — Elkie Web Studio</title>
      </Helmet>

      <header>
        <p className="text-text-muted text-xs uppercase tracking-[0.3em]">
          <span className="bg-accent-dim text-accent inline-flex items-center gap-1.5 rounded-full px-3 py-1">
            <FileText size={10} /> Your content
          </span>
        </p>
        <h1 className="text-text mt-4 font-heading text-3xl font-bold md:text-4xl">
          Edit your site
        </h1>
        <p className="text-text-muted mt-2 text-sm">
          Change any text on your site here. We push updates live within a few minutes.
        </p>
      </header>

      {!hasSupabase() && (
        <div className="border-amber-500/30 bg-amber-500/10 text-amber-100/90 rounded-xl border px-4 py-3 text-xs">
          Dev stub mode — changes save to your browser only until Supabase is configured.
        </div>
      )}

      <motion.form
        onSubmit={onSubmit}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="glass space-y-5 rounded-2xl p-6 md:p-8"
      >
        <Field label="Business name">
          <input
            type="text"
            value={content.businessName}
            onChange={(e) => update('businessName', e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="Tagline" hint="The one-liner under your business name.">
          <input
            type="text"
            value={content.tagline}
            onChange={(e) => update('tagline', e.target.value)}
            placeholder="Slow-cooked. Locally sourced."
            className={inputClass}
          />
        </Field>

        <Field label="About" hint="A short paragraph about your business.">
          <textarea
            value={content.about}
            onChange={(e) => update('about', e.target.value)}
            rows={4}
            className={inputClass}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Contact email">
            <input
              type="email"
              value={content.contactEmail}
              onChange={(e) => update('contactEmail', e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Contact phone">
            <input
              type="tel"
              value={content.contactPhone}
              onChange={(e) => update('contactPhone', e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Address">
          <input
            type="text"
            value={content.address}
            onChange={(e) => update('address', e.target.value)}
            className={inputClass}
          />
        </Field>

        <Field label="Opening hours" hint="One line per day, or however you like.">
          <textarea
            value={content.hours}
            onChange={(e) => update('hours', e.target.value)}
            rows={3}
            className={inputClass}
          />
        </Field>

        <footer className="border-card-border flex items-center justify-end gap-3 border-t pt-5">
          {error && <span className="text-xs text-red-400">{error}</span>}
          {saved && (
            <span className="text-accent inline-flex items-center gap-1 text-xs">
              <Check size={12} /> Saved
            </span>
          )}
          <button
            type="submit"
            disabled={saving}
            className="cta-gradient cta-btn glow-border inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-white shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Saving…
              </>
            ) : (
              <>
                <Save size={14} /> Save changes
              </>
            )}
          </button>
        </footer>
      </motion.form>
    </div>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="text-text mb-1.5 block text-sm font-medium">{label}</label>
      {hint && <p className="text-text-muted mb-1.5 text-xs">{hint}</p>}
      {children}
    </div>
  )
}

const inputClass =
  'bg-input-bg border-card-border text-text placeholder:text-text-muted/60 w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors focus:border-accent'
