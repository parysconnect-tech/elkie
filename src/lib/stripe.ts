/**
 * Client-side Stripe helpers.
 *
 * Stripe Checkout sessions MUST be created server-side (the secret key
 * can never touch the browser), so these call Supabase Edge Functions:
 *   - create-checkout-session  → returns a Checkout URL to redirect to
 *   - create-portal-session    → returns a Billing Portal URL
 *
 * Stub mode (no Stripe publishable key, or no Supabase): every call
 * returns `{ ok: false, fallback: true }` so the UI can degrade
 * gracefully (e.g. route to the intake form instead).
 */

import type { PlanSlug, BillingCycle } from './plans'

const PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** True only when both Stripe and Supabase (which hosts the functions) are set up. */
export function isStripeConfigured(): boolean {
  return Boolean(PUBLISHABLE_KEY && SUPABASE_URL && ANON_KEY)
}

export type CheckoutResult =
  | { ok: true; url: string }
  | { ok: false; error: string; fallback?: boolean }

export async function startCheckout(
  plan: PlanSlug,
  cycle: BillingCycle,
  accessToken?: string,
): Promise<CheckoutResult> {
  if (!isStripeConfigured()) {
    return { ok: false, error: 'Stripe is not configured yet.', fallback: true }
  }
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken || ANON_KEY}`,
      },
      body: JSON.stringify({
        plan,
        cycle,
        successUrl: `${window.location.origin}/dashboard/billing?checkout=success`,
        cancelUrl: `${window.location.origin}/pricing?checkout=cancelled`,
      }),
    })
    const data = (await res.json()) as { url?: string; error?: string }
    if (!res.ok || !data.url) {
      return { ok: false, error: data.error || 'Could not start checkout.' }
    }
    return { ok: true, url: data.url }
  } catch {
    return { ok: false, error: 'Network error starting checkout.' }
  }
}

export async function openBillingPortal(accessToken?: string): Promise<CheckoutResult> {
  if (!isStripeConfigured()) {
    return { ok: false, error: 'Stripe is not configured yet.', fallback: true }
  }
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/create-portal-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken || ANON_KEY}`,
      },
      body: JSON.stringify({
        returnUrl: `${window.location.origin}/dashboard/billing`,
      }),
    })
    const data = (await res.json()) as { url?: string; error?: string }
    if (!res.ok || !data.url) {
      return { ok: false, error: data.error || 'Could not open billing portal.' }
    }
    return { ok: true, url: data.url }
  } catch {
    return { ok: false, error: 'Network error opening billing portal.' }
  }
}

/** Convenience: redirect the browser to a Stripe-hosted page. */
export function redirectTo(url: string) {
  window.location.href = url
}
