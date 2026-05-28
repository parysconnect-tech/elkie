import { useEffect, useRef, useState } from 'react'
import { ShieldCheck } from 'lucide-react'

/**
 * Cloudflare Turnstile widget — invisible CAPTCHA on the lead form + signup.
 *
 * Stub mode (no VITE_TURNSTILE_SITE_KEY): renders a small "spam protection
 * is in stub mode" pill and auto-fires onVerify with a placeholder token
 * so the form is still submittable in local dev.
 *
 * Real mode (key present): loads Cloudflare's script and renders the
 * widget. Token is passed to onVerify. Server-side token verification
 * lives in the notify-new-lead Edge Function.
 */

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string
      reset: (widgetId: string) => void
      remove: (widgetId: string) => void
    }
  }
}

type Props = {
  onVerify: (token: string) => void
  onError?: () => void
}

export function Turnstile({ onVerify, onError }: Props) {
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const widgetIdRef = useRef<string | null>(null)
  const [ready, setReady] = useState(false)

  // Stub mode: short auto-verify
  useEffect(() => {
    if (SITE_KEY) return
    const t = window.setTimeout(() => onVerify('stub-token'), 300)
    return () => window.clearTimeout(t)
  }, [onVerify])

  // Load Cloudflare's script once
  useEffect(() => {
    if (!SITE_KEY) return
    if (window.turnstile) {
      setReady(true)
      return
    }
    const existing = document.querySelector(
      'script[src*="challenges.cloudflare.com/turnstile"]',
    )
    if (existing) {
      existing.addEventListener('load', () => setReady(true), { once: true })
      return
    }
    const script = document.createElement('script')
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
    script.async = true
    script.defer = true
    script.onload = () => setReady(true)
    document.head.appendChild(script)
  }, [])

  // Render widget once script is ready
  useEffect(() => {
    if (!SITE_KEY || !ready || !window.turnstile || !wrapperRef.current) return
    widgetIdRef.current = window.turnstile.render(wrapperRef.current, {
      sitekey: SITE_KEY,
      callback: (token: string) => onVerify(token),
      'error-callback': () => onError?.(),
      theme: 'auto',
      size: 'flexible',
    })
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current)
        } catch {
          /* ignore */
        }
        widgetIdRef.current = null
      }
    }
  }, [ready, onVerify, onError])

  if (!SITE_KEY) {
    return (
      <div className="border-card-border bg-card-bg flex items-center gap-3 rounded-xl border px-4 py-3 text-xs">
        <ShieldCheck className="text-accent shrink-0" size={16} />
        <span className="text-text-muted">
          Spam protection: <span className="text-text">stub mode</span> — wire{' '}
          <code className="text-text bg-bg/40 rounded px-1.5 py-0.5">
            VITE_TURNSTILE_SITE_KEY
          </code>{' '}
          to activate Cloudflare Turnstile.
        </span>
      </div>
    )
  }

  return <div ref={wrapperRef} className="mx-auto" />
}
