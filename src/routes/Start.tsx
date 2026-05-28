import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { AlertCircle, Check, Loader2, Upload } from 'lucide-react'
import { PLANS, type PlanSlug } from '@/lib/plans'
import { submitLead, type LeadData } from '@/lib/leadSubmission'
import { Turnstile } from '@/lib/turnstile'
import { cn } from '@/lib/cn'

const CATEGORIES = [
  'Restaurant',
  'Retail',
  'Services',
  'Portfolio',
  'Non-profit',
  'Other',
] as const

const FEATURE_OPTIONS = [
  'About page',
  'Contact form',
  'Photo gallery',
  'Booking widget',
  'Pricing page',
  'Testimonials',
  'Blog',
  'Location map',
] as const

type FormState = {
  businessName: string
  email: string
  category: string
  about: string
  features: string[]
  plan: PlanSlug
  domain: string
  inspiration: string
}

type FieldErrors = Partial<Record<keyof FormState, string>>

const INITIAL: FormState = {
  businessName: '',
  email: '',
  category: '',
  about: '',
  features: [],
  plan: 'pro',
  domain: '',
  inspiration: '',
}

function validate(form: FormState): FieldErrors {
  const errors: FieldErrors = {}
  if (!form.businessName.trim()) errors.businessName = 'Tell us your business name.'
  if (!form.email.trim()) errors.email = 'We need an email to send you the demo.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errors.email = "That doesn't look like a valid email."
  if (!form.category) errors.category = 'Pick the closest category.'
  if (!form.about.trim()) errors.about = 'A sentence or two is plenty.'
  else if (form.about.trim().length < 20)
    errors.about = 'A little more detail helps us nail the vibe (min 20 characters).'
  if (!form.plan) errors.plan = 'Pick a starting plan — you can change later.'
  return errors
}

export default function Start() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [form, setForm] = useState<FormState>(() => ({
    ...INITIAL,
    plan: (params.get('plan') as PlanSlug) || INITIAL.plan,
  }))
  const [files, setFiles] = useState<File[]>([])
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)

  // Sync from query params (e.g. if user lands here from /pricing)
  useEffect(() => {
    const planParam = params.get('plan')
    setForm((prev) => ({
      ...prev,
      plan: (planParam as PlanSlug) || prev.plan,
    }))
  }, [params])

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  function toggleFeature(feature: string) {
    setForm((prev) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature],
    }))
  }

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    const list = Array.from(e.target.files ?? [])
    setFiles(list)
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setServerError(null)
    const fieldErrors = validate(form)
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors)
      // Scroll to first invalid field
      const firstKey = Object.keys(fieldErrors)[0]
      document.getElementById(`field-${firstKey}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
      return
    }

    if (!turnstileToken) {
      setServerError("Please wait a moment — we're still verifying you aren't a bot.")
      return
    }

    setSubmitting(true)
    const payload: LeadData = {
      businessName: form.businessName.trim(),
      email: form.email.trim(),
      category: form.category,
      about: form.about.trim(),
      features: form.features,
      plan: form.plan,
      domain: form.domain.trim(),
      inspiration: form.inspiration.trim(),
      uploads: files.map((f) => ({ name: f.name, size: f.size, type: f.type })),
    }

    const result = await submitLead(payload, turnstileToken)
    if (!result.ok) {
      setServerError(result.error)
      setSubmitting(false)
      return
    }

    navigate('/success', { state: { ref: result.ref } })
  }

  const showDomainField = form.plan !== 'starter' && form.plan !== 'demo'

  return (
    <>
      <Helmet>
        <title>Describe your vision — Elkie Web Studio</title>
        <meta
          name="description"
          content="Tell us about your business in five minutes. We'll build your site in 48 hours."
        />
      </Helmet>

      <section className="px-4 py-16 md:py-24">
        <div className="mx-auto max-w-3xl">
          <header className="mb-12 text-center">
            <p className="text-text-muted mb-3 text-xs uppercase tracking-[0.4em]">
              <span className="bg-accent-dim text-accent inline-flex items-center gap-1.5 rounded-full px-3 py-1">
                <span className="bg-accent block h-1.5 w-1.5 animate-pulse rounded-full" />
                Five-minute brief
              </span>
            </p>
            <h1 className="gradient-text mb-3 font-heading text-[clamp(2rem,6vw,4rem)] font-bold tracking-tight">
              Describe your vision
            </h1>
            <p className="text-text-muted mx-auto max-w-xl text-lg">
              The more you tell us, the closer the first draft. No detail is too small.
            </p>
          </header>

          <motion.form
            onSubmit={onSubmit}
            noValidate
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-8"
          >
            {/* Business name */}
            <FormRow
              id="field-businessName"
              label="Business name"
              error={errors.businessName}
              required
            >
              <input
                type="text"
                value={form.businessName}
                onChange={(e) => update('businessName', e.target.value)}
                placeholder="e.g. Cape Bistro"
                className={inputClass(!!errors.businessName)}
                autoComplete="organization"
              />
            </FormRow>

            {/* Email */}
            <FormRow
              id="field-email"
              label="Your email"
              hint="We'll send the demo link here within 24 hours."
              error={errors.email}
              required
            >
              <input
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                placeholder="you@yourbiz.com"
                className={inputClass(!!errors.email)}
                autoComplete="email"
              />
            </FormRow>

            {/* Category */}
            <FormRow
              id="field-category"
              label="Business category"
              error={errors.category}
              required
            >
              <select
                value={form.category}
                onChange={(e) => update('category', e.target.value)}
                className={inputClass(!!errors.category)}
              >
                <option value="">Pick the closest match…</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </FormRow>

            {/* About */}
            <FormRow
              id="field-about"
              label="About your business"
              hint="Who do you serve? What makes you different?"
              error={errors.about}
              required
            >
              <textarea
                value={form.about}
                onChange={(e) => update('about', e.target.value)}
                rows={5}
                placeholder="A small neighbourhood bistro serving locally-sourced food, six days a week. Our regulars come for the lasagne…"
                className={inputClass(!!errors.about)}
              />
            </FormRow>

            {/* Features */}
            <FormRow
              id="field-features"
              label="What do you want on the site?"
              hint="Tick as many as apply."
            >
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {FEATURE_OPTIONS.map((feature) => {
                  const active = form.features.includes(feature)
                  return (
                    <button
                      type="button"
                      key={feature}
                      onClick={() => toggleFeature(feature)}
                      className={cn(
                        'cta-btn flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition-colors',
                        active
                          ? 'border-accent bg-accent-dim text-accent'
                          : 'border-card-border text-text-muted hover:border-accent/40 hover:text-text',
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border',
                          active ? 'border-accent bg-accent text-bg' : 'border-card-border',
                        )}
                      >
                        {active && <Check size={11} strokeWidth={3} />}
                      </span>
                      <span className="truncate">{feature}</span>
                    </button>
                  )
                })}
              </div>
            </FormRow>

            {/* Plan */}
            <FormRow
              id="field-plan"
              label="Pick a starting plan"
              hint="You can upgrade or cancel anytime."
              error={errors.plan}
              required
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {PLANS.map((plan) => {
                  const active = form.plan === plan.slug
                  return (
                    <button
                      type="button"
                      key={plan.slug}
                      onClick={() => update('plan', plan.slug)}
                      className={cn(
                        'cta-btn flex flex-col items-start rounded-xl border p-4 text-left transition-colors',
                        active
                          ? 'border-accent bg-accent-dim'
                          : 'border-card-border hover:border-accent/40',
                      )}
                    >
                      <div className="flex w-full items-center justify-between">
                        <span
                          className={cn(
                            'font-heading text-base font-semibold',
                            active ? 'text-accent' : 'text-text',
                          )}
                        >
                          {plan.name}
                        </span>
                        {plan.popular && (
                          <span className="bg-accent rounded-full px-2 py-0.5 text-[10px] font-medium text-black">
                            Popular
                          </span>
                        )}
                      </div>
                      <span className="text-text-muted mt-0.5 text-xs">{plan.tag}</span>
                      <span className="text-text mt-2 text-sm font-medium">
                        {plan.freeDemo
                          ? 'Free demo'
                          : `$${plan.setupUsd} setup · $${plan.monthlyUsd}/mo`}
                      </span>
                    </button>
                  )
                })}
              </div>
            </FormRow>

            {/* Domain (only for paid plans with custom domain) */}
            {showDomainField && (
              <FormRow
                id="field-domain"
                label="Preferred domain"
                hint="Something like yourbiz.com — we'll check availability."
              >
                <input
                  type="text"
                  value={form.domain}
                  onChange={(e) => update('domain', e.target.value)}
                  placeholder="yourbiz.com"
                  className={inputClass(false)}
                  autoComplete="off"
                />
              </FormRow>
            )}

            {/* Inspiration */}
            <FormRow
              id="field-inspiration"
              label="Any sites you love?"
              hint="Optional — paste links or names of sites whose look or feel you'd like us to channel."
            >
              <textarea
                value={form.inspiration}
                onChange={(e) => update('inspiration', e.target.value)}
                rows={3}
                placeholder="Stripe, Linear, that bistro down the street — anything that catches your eye."
                className={inputClass(false)}
              />
            </FormRow>

            {/* File upload */}
            <FormRow
              id="field-uploads"
              label="Upload photos or a logo"
              hint="Optional — drag and drop, or click to browse. Step 5 wires up real storage; for now we just record the filenames."
            >
              <label
                htmlFor="uploads"
                className="border-card-border hover:border-accent/40 text-text-muted hover:text-text flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-8 transition-colors"
              >
                <Upload size={20} />
                <span className="text-sm">
                  {files.length === 0
                    ? 'Drop files here or click to browse'
                    : `${files.length} file${files.length === 1 ? '' : 's'} ready`}
                </span>
                <input
                  id="uploads"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={onFileChange}
                  className="hidden"
                />
              </label>
              {files.length > 0 && (
                <ul className="text-text-muted mt-3 space-y-1 text-xs">
                  {files.map((f) => (
                    <li key={f.name} className="flex items-center justify-between gap-2">
                      <span className="truncate">{f.name}</span>
                      <span>{(f.size / 1024).toFixed(0)} KB</span>
                    </li>
                  ))}
                </ul>
              )}
            </FormRow>

            {/* Spam protection */}
            <Turnstile onVerify={setTurnstileToken} onError={() => setTurnstileToken(null)} />

            {/* Submit */}
            {serverError && (
              <div className="border-red-500/40 bg-red-500/10 text-red-300 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm">
                <AlertCircle size={16} />
                <span>{serverError}</span>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting || !turnstileToken}
                className="cta-gradient cta-btn glow-border flex w-full items-center justify-center gap-2 rounded-full px-8 py-4 font-medium text-white shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Sending your brief…
                  </>
                ) : (
                  <>Send the brief →</>
                )}
              </button>
              <p className="text-text-muted mt-3 text-center text-xs">
                Protected from spam · No charge · Reply within 24h
              </p>
            </div>
          </motion.form>
        </div>
      </section>
    </>
  )
}

/* --------------------------- subcomponents --------------------------- */

function inputClass(hasError: boolean) {
  return cn(
    'bg-input-bg border-card-border text-text placeholder:text-text-muted/60 w-full rounded-xl border px-4 py-3 outline-none transition-colors focus:border-accent',
    hasError && 'border-red-500/60 focus:border-red-500',
  )
}

type RowProps = {
  id: string
  label: string
  hint?: string
  error?: string
  required?: boolean
  children: React.ReactNode
}

function FormRow({ id, label, hint, error, required, children }: RowProps) {
  return (
    <div id={id}>
      <label className="text-text mb-2 flex items-center gap-1 text-sm font-medium">
        {label}
        {required && <span className="text-accent">*</span>}
      </label>
      {hint && !error && <p className="text-text-muted mb-2 text-xs">{hint}</p>}
      {children}
      {error && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-red-400">
          <AlertCircle size={12} />
          {error}
        </p>
      )}
    </div>
  )
}
