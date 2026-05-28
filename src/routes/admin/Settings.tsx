import { useEffect, useState, type ReactNode } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import {
  Bell,
  Check,
  CreditCard,
  Globe,
  Loader2,
  Mail,
  MessageCircle,
  Save,
  ShieldCheck,
} from 'lucide-react'
import { getSettings, updateSettings, type AppSettings } from '@/lib/adminQueries'
import { LANGS, LANG_LABELS, type Lang } from '@/lib/language'
import { hasSupabase } from '@/lib/supabase'
import { cn } from '@/lib/cn'

const ENV_VARS = {
  stripe: [
    'VITE_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
  ],
  turnstile: ['VITE_TURNSTILE_SITE_KEY', 'TURNSTILE_SECRET_KEY'],
  resend: ['RESEND_API_KEY'],
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<AppSettings>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void getSettings().then((s) => {
      setSettings(s)
      setLoading(false)
    })
  }, [])

  function update<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    setSettings((s) => ({ ...s, [key]: value }))
  }

  if (loading) {
    return (
      <div className="text-text-muted flex items-center justify-center gap-2 py-16 text-sm">
        <Loader2 size={16} className="animate-spin" /> Loading settings…
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Settings — Elkie Web Studio</title>
      </Helmet>

      <header>
        <p className="text-text-muted text-xs uppercase tracking-[0.3em]">
          <span className="bg-accent-dim text-accent inline-flex items-center gap-1.5 rounded-full px-3 py-1">
            <ShieldCheck size={10} /> Config
          </span>
        </p>
        <h1 className="text-text mt-4 font-heading text-3xl font-bold md:text-4xl">
          Settings
        </h1>
        <p className="text-text-muted mt-2 text-sm">
          Tune the integrations, sender details, and notification preferences for the
          whole platform.
        </p>
      </header>

      {!hasSupabase() && (
        <div className="border-amber-500/30 bg-amber-500/10 text-amber-100/90 rounded-xl border px-4 py-3 text-xs">
          Dev stub mode — settings are stored locally in your browser and won't reach the
          Supabase <code>settings</code> table until keys are configured.
        </div>
      )}

      {/* Business */}
      <Section
        icon={MessageCircle}
        title="Business"
        description="Where customers reach you outside the app."
        patchKeys={['whatsapp_number', 'default_language']}
        settings={settings}
      >
        <Field label="WhatsApp number" hint="Including country code, no spaces. E.g. 27609734831">
          <input
            type="tel"
            value={settings.whatsapp_number ?? ''}
            onChange={(e) => update('whatsapp_number', e.target.value)}
            placeholder="27609734831"
            className={inputClass}
          />
        </Field>
        <Field label="Default language" hint="What new visitors see if they don't pick.">
          <select
            value={settings.default_language ?? 'en'}
            onChange={(e) => update('default_language', e.target.value as Lang)}
            className={inputClass}
          >
            {LANGS.map((l) => (
              <option key={l} value={l}>
                {LANG_LABELS[l]}
              </option>
            ))}
          </select>
        </Field>
      </Section>

      {/* Email / Resend */}
      <Section
        icon={Mail}
        title="Email (Resend)"
        description="Outbound transactional email. Wire your Resend API key as a Supabase Edge Function secret."
        patchKeys={['resend_from_email', 'resend_from_name', 'admin_notification_email']}
        settings={settings}
      >
        <Field label="Sender email" hint="Must be on a domain you've verified in Resend.">
          <input
            type="email"
            value={settings.resend_from_email ?? ''}
            onChange={(e) => update('resend_from_email', e.target.value)}
            placeholder="hello@elkie.com"
            className={inputClass}
          />
        </Field>
        <Field label="Sender name" hint="Friendly display name in the recipient's inbox.">
          <input
            type="text"
            value={settings.resend_from_name ?? ''}
            onChange={(e) => update('resend_from_name', e.target.value)}
            placeholder="Elkie Web Studio"
            className={inputClass}
          />
        </Field>
        <Field
          label="Admin notification email"
          hint="Where new-lead alerts get sent. Usually you."
        >
          <input
            type="email"
            value={settings.admin_notification_email ?? ''}
            onChange={(e) => update('admin_notification_email', e.target.value)}
            placeholder="you@elkie.com"
            className={inputClass}
          />
        </Field>
        <EnvVarList vars={ENV_VARS.resend} note="Set in Supabase Edge Function secrets." />
      </Section>

      {/* Stripe */}
      <Section
        icon={CreditCard}
        title="Stripe"
        description="Payments are read from .env — never stored in the database."
        patchKeys={[]}
        settings={settings}
        readOnly
      >
        <EnvVarList
          vars={ENV_VARS.stripe}
          note="Set in your .env.local and on the deploy host. Step 10 wires up Checkout."
        />
      </Section>

      {/* Spam protection */}
      <Section
        icon={ShieldCheck}
        title="Spam protection (Cloudflare Turnstile)"
        description="Invisible CAPTCHA on the lead form and signup."
        patchKeys={[]}
        settings={settings}
        readOnly
      >
        <EnvVarList vars={ENV_VARS.turnstile} note="Stub mode is active when these are blank." />
      </Section>

      {/* Analytics */}
      <Section
        icon={Globe}
        title="Analytics"
        description="In-house analytics live in the page_views table. Google Analytics is optional."
        patchKeys={['ga_measurement_id']}
        settings={settings}
      >
        <Field
          label="Google Analytics Measurement ID"
          hint="Optional. Format: G-XXXXXXXXXX. Leave blank to skip GA."
        >
          <input
            type="text"
            value={settings.ga_measurement_id ?? ''}
            onChange={(e) => update('ga_measurement_id', e.target.value)}
            placeholder="G-XXXXXXXXXX"
            className={inputClass}
          />
        </Field>
      </Section>

      {/* Notifications */}
      <Section
        icon={Bell}
        title="Notifications"
        description="When should we email you about activity on elkie.com?"
        patchKeys={['admin_notify_new_lead', 'admin_notify_new_signup', 'admin_notify_new_payment']}
        settings={settings}
      >
        <Toggle
          label="New lead arrived"
          checked={!!settings.admin_notify_new_lead}
          onChange={(v) => update('admin_notify_new_lead', v)}
        />
        <Toggle
          label="New client signup"
          checked={!!settings.admin_notify_new_signup}
          onChange={(v) => update('admin_notify_new_signup', v)}
        />
        <Toggle
          label="New payment processed"
          checked={!!settings.admin_notify_new_payment}
          onChange={(v) => update('admin_notify_new_payment', v)}
        />
      </Section>
    </div>
  )
}

/* ============================== building blocks ============================== */

function Section({
  icon: Icon,
  title,
  description,
  patchKeys,
  settings,
  readOnly,
  children,
}: {
  icon: typeof Mail
  title: string
  description: string
  patchKeys: (keyof AppSettings)[]
  settings: AppSettings
  readOnly?: boolean
  children: ReactNode
}) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSave() {
    setError(null)
    setSaving(true)
    const patch = Object.fromEntries(
      patchKeys.map((k) => [k, settings[k]]),
    ) as Partial<AppSettings>
    const res = await updateSettings(patch)
    setSaving(false)
    if (!res.ok) {
      setError(res.error)
      return
    }
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="glass rounded-2xl p-6"
    >
      <header className="mb-4 flex items-start gap-3">
        <span className="cta-gradient flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white shadow">
          <Icon size={16} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-text font-heading text-lg font-semibold">{title}</h2>
          <p className="text-text-muted text-sm">{description}</p>
        </div>
      </header>

      <div className="space-y-4">{children}</div>

      {!readOnly && (
        <footer className="border-card-border mt-5 flex items-center justify-end gap-3 border-t pt-4">
          {error && (
            <span className="text-xs text-red-400">{error}</span>
          )}
          {saved && (
            <span className="text-accent inline-flex items-center gap-1 text-xs">
              <Check size={12} /> Saved
            </span>
          )}
          <button
            type="button"
            disabled={saving}
            onClick={onSave}
            className="cta-gradient cta-btn inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-medium text-white shadow disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? (
              <>
                <Loader2 size={12} className="animate-spin" /> Saving…
              </>
            ) : (
              <>
                <Save size={12} /> Save
              </>
            )}
          </button>
        </footer>
      )}
    </motion.section>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <div>
      <label className="text-text mb-1.5 block text-sm font-medium">{label}</label>
      {hint && <p className="text-text-muted mb-1.5 text-xs">{hint}</p>}
      {children}
    </div>
  )
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-center justify-between">
      <span className="text-text text-sm">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
          checked ? 'cta-gradient' : 'bg-card-bg border-card-border border',
        )}
      >
        <span
          className={cn(
            'block h-4 w-4 rounded-full bg-white shadow-sm transition-transform',
            checked ? 'translate-x-6' : 'translate-x-1',
          )}
        />
      </button>
    </label>
  )
}

function EnvVarList({ vars, note }: { vars: string[]; note: string }) {
  return (
    <div className="border-card-border bg-bg/40 rounded-xl border p-4">
      <p className="text-text-muted mb-3 text-xs">{note}</p>
      <ul className="space-y-1.5">
        {vars.map((v) => (
          <li
            key={v}
            className="text-text-muted flex items-center justify-between text-xs"
          >
            <code className="text-text font-mono">{v}</code>
            <span className="text-text-muted/70">
              {import.meta.env[v] ? (
                <span className="text-accent inline-flex items-center gap-1">
                  <Check size={10} /> set
                </span>
              ) : (
                <span>not set</span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

const inputClass =
  'bg-input-bg border-card-border text-text placeholder:text-text-muted/60 w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-colors focus:border-accent'
