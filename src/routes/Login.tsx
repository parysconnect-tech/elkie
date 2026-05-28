import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { AlertCircle, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { hasSupabase } from '@/lib/supabase'
import { cn } from '@/lib/cn'

export default function Login() {
  const { user, profile, signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Already signed in? Bounce to the right dashboard.
  if (user) {
    const destination = profile?.role === 'admin' ? '/admin' : '/dashboard'
    return <Navigate to={destination} replace />
  }

  const fromPath =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ??
    null

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    if (!email.trim()) {
      setError('Email is required.')
      return
    }
    if (!password) {
      setError('Password is required.')
      return
    }
    setSubmitting(true)
    const result = await signIn(email.trim(), password)
    if (!result.ok) {
      setError(result.error)
      setSubmitting(false)
      return
    }
    // The auth context updates on signIn — useEffect on session/profile
    // will re-render us out via the early redirect above, but be explicit
    // about where to land too in case of unconfirmed users.
    navigate(fromPath ?? '/dashboard', { replace: true })
  }

  return (
    <>
      <Helmet>
        <title>Sign in — Elkie Web Studio</title>
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
                Welcome back
              </span>
            </p>
            <h1 className="gradient-text font-heading text-3xl font-bold tracking-tight md:text-4xl">
              Sign in
            </h1>
            <p className="text-text-muted mt-2 text-sm">
              Pick up where you left off in your dashboard.
            </p>
          </header>

          {!hasSupabase() && (
            <div className="border-amber-500/30 bg-amber-500/10 mb-6 flex items-start gap-2 rounded-xl border px-4 py-3 text-xs">
              <ShieldCheck className="text-amber-400 mt-0.5 shrink-0" size={14} />
              <p className="text-amber-100/90">
                Supabase isn't configured yet — you're in <strong>dev stub mode</strong>.
                Any credentials work and you'll land in the dashboard as a fake admin.
              </p>
            </div>
          )}

          <form onSubmit={onSubmit} noValidate className="space-y-4">
            <div>
              <label className="text-text mb-1.5 block text-sm font-medium">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="you@yourbusiness.com"
                className={inputClass(false)}
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-baseline justify-between">
                <label className="text-text text-sm font-medium">Password</label>
                <Link
                  to="#"
                  className="text-text-muted hover:text-accent text-xs transition-colors"
                  onClick={(e) => {
                    e.preventDefault()
                    setError('Password reset lands in a future step.')
                  }}
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={cn(inputClass(false), 'pr-11')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="text-text-muted hover:text-text absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="border-red-500/40 bg-red-500/10 text-red-300 flex items-center gap-2 rounded-xl border px-3 py-2 text-xs">
                <AlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="cta-gradient cta-btn glow-border mt-2 flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 font-medium text-white shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Signing you in…
                </>
              ) : (
                <>Sign in →</>
              )}
            </button>
          </form>

          <p className="text-text-muted mt-6 text-center text-sm">
            Don't have an account?{' '}
            <Link to="/signup" className="text-accent hover:underline">
              Create one
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
