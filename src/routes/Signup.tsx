import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  ShieldCheck,
} from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { hasSupabase } from '@/lib/supabase'
import { Turnstile } from '@/lib/turnstile'
import { cn } from '@/lib/cn'

type FormState = {
  businessName: string
  email: string
  password: string
  confirm: string
}

type Errors = Partial<Record<keyof FormState, string>>

const INITIAL: FormState = {
  businessName: '',
  email: '',
  password: '',
  confirm: '',
}

export default function Signup() {
  const { user, signUp } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState<FormState>(INITIAL)
  const [errors, setErrors] = useState<Errors>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState<string | null>(null)

  if (user) return <Navigate to="/dashboard" replace />

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((p) => ({ ...p, [key]: value }))
    setErrors((p) => ({ ...p, [key]: undefined }))
  }

  function validate(f: FormState): Errors {
    const next: Errors = {}
    if (!f.businessName.trim()) next.businessName = "What's your business called?"
    if (!f.email.trim()) next.email = 'We need an email to create your account.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email))
      next.email = "That email doesn't look right."
    if (!f.password) next.password = 'Pick a password.'
    else if (f.password.length < 8) next.password = 'At least 8 characters please.'
    if (f.confirm !== f.password) next.confirm = "Passwords don't match."
    return next
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setServerError(null)
    const v = validate(form)
    if (Object.keys(v).length > 0) {
      setErrors(v)
      return
    }
    if (!turnstileToken) {
      setServerError("Please wait a moment — we're still verifying you aren't a bot.")
      return
    }
    setSubmitting(true)
    const result = await signUp(
      form.email.trim(),
      form.password,
      form.businessName.trim(),
    )
    if (!result.ok) {
      setServerError(result.error)
      setSubmitting(false)
      return
    }
    if (result.requiresEmailConfirmation) {
      setEmailSent(form.email.trim())
      setSubmitting(false)
    } else {
      navigate('/dashboard', { replace: true })
    }
  }

  /* -------------------- "Check your email" success state -------------------- */
  if (emailSent) {
    return (
      <>
        <Helmet>
          <title>Verify your email — Elkie Web Studio</title>
        </Helmet>
        <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass w-full max-w-md rounded-2xl p-8 text-center"
          >
            <div className="bg-accent-dim mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full">
              <Mail className="text-accent" size={28} />
            </div>
            <h1 className="text-text mb-3 font-heading text-2xl font-semibold">
              Check your inbox
            </h1>
            <p className="text-text-muted mb-2 text-sm leading-relaxed">
              We sent a verification link to{' '}
              <span className="text-text font-semibold">{emailSent}</span>.
            </p>
            <p className="text-text-muted mb-6 text-sm leading-relaxed">
              Click the link in that email to finish signing up. You can then sign in.
            </p>
            <Link
              to="/login"
              className="cta-gradient cta-btn glow-border inline-block rounded-full px-6 py-3 text-sm font-medium text-white shadow-xl"
            >
              Go to sign in →
            </Link>
          </motion.div>
        </section>
      </>
    )
  }

  /* -------------------------------- form -------------------------------- */
  return (
    <>
      <Helmet>
        <title>Create your account — Elkie Web Studio</title>
      </Helmet>

      <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="glass w-full max-w-md rounded-2xl p-8"
        >
          <header className="mb-8 text-center">
            <p className="text-text-muted mb-3 text-xs uppercase tracking-[0.4em]">
              <span className="bg-accent-dim text-accent inline-flex items-center gap-1.5 rounded-full px-3 py-1">
                <span className="bg-accent block h-1.5 w-1.5 animate-pulse rounded-full" />
                One-time setup
              </span>
            </p>
            <h1 className="gradient-text font-heading text-3xl font-bold tracking-tight md:text-4xl">
              Create your account
            </h1>
            <p className="text-text-muted mt-2 text-sm">
              30 seconds. Your dashboard, your themes, your messages.
            </p>
          </header>

          {!hasSupabase() && (
            <div className="border-amber-500/30 bg-amber-500/10 mb-6 flex items-start gap-2 rounded-xl border px-4 py-3 text-xs">
              <ShieldCheck className="text-amber-400 mt-0.5 shrink-0" size={14} />
              <p className="text-amber-100/90">
                Supabase isn't configured yet — you're in <strong>dev stub mode</strong>.
                Sign-up will fake a session so you can keep developing.
              </p>
            </div>
          )}

          <form onSubmit={onSubmit} noValidate className="space-y-4">
            <Field
              label="Business name"
              hint="What your site will be called."
              error={errors.businessName}
              required
            >
              <input
                type="text"
                value={form.businessName}
                onChange={(e) => update('businessName', e.target.value)}
                placeholder="Cape Bistro"
                autoComplete="organization"
                className={inputClass(!!errors.businessName)}
              />
            </Field>

            <Field label="Email" error={errors.email} required>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update('email', e.target.value)}
                autoComplete="email"
                placeholder="you@yourbusiness.com"
                className={inputClass(!!errors.email)}
              />
            </Field>

            <Field
              label="Password"
              hint="At least 8 characters."
              error={errors.password}
              required
            >
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className={cn(inputClass(!!errors.password), 'pr-11')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="text-text-muted hover:text-text absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>

            <Field label="Confirm password" error={errors.confirm} required>
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.confirm}
                onChange={(e) => update('confirm', e.target.value)}
                autoComplete="new-password"
                placeholder="••••••••"
                className={inputClass(!!errors.confirm)}
              />
            </Field>

            <Turnstile
              onVerify={setTurnstileToken}
              onError={() => setTurnstileToken(null)}
            />

            {serverError && (
              <div className="border-red-500/40 bg-red-500/10 text-red-300 flex items-center gap-2 rounded-xl border px-3 py-2 text-xs">
                <AlertCircle size={14} />
                <span>{serverError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !turnstileToken}
              className="cta-gradient cta-btn glow-border mt-2 flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 font-medium text-white shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Creating your account…
                </>
              ) : (
                <>
                  <Check size={16} /> Create account
                </>
              )}
            </button>
          </form>

          <p className="text-text-muted mt-6 text-center text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-accent hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </section>
    </>
  )
}

function inputClass(hasError: boolean) {
  return cn(
    'bg-input-bg border-card-border text-text placeholder:text-text-muted/60 w-full rounded-xl border px-4 py-3 outline-none transition-colors focus:border-accent',
    hasError && 'border-red-500/60 focus:border-red-500',
  )
}

function Field({
  label,
  hint,
  error,
  required,
  children,
}: {
  label: string
  hint?: string
  error?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="text-text mb-1.5 flex items-center gap-1 text-sm font-medium">
        {label}
        {required && <span className="text-accent">*</span>}
      </label>
      {hint && !error && <p className="text-text-muted mb-1.5 text-xs">{hint}</p>}
      {children}
      {error && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-red-400">
          <AlertCircle size={12} />
          {error}
        </p>
      )}
    </div>
  )
}
