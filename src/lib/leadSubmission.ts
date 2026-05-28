/**
 * Lead submission flow.
 *
 * Real mode (when Supabase URL + anon key are set):
 *   1. Insert a row into `messages` with `client_id: null` (= elkie.com lead)
 *   2. Fire the `notify-new-lead` Edge Function (admin + client emails)
 *   3. Return the inserted row's id as the "ref"
 *
 * Stub mode (no Supabase keys yet):
 *   - Log to console, simulate latency, stash payload in sessionStorage
 *   - Return a synthetic ref so /success still has something to show
 *
 * Turnstile token verification happens server-side in the Edge Function
 * via Cloudflare's siteverify endpoint. The browser passes the token along.
 */

import { hasSupabase, supabase } from './supabase'

export type LeadData = {
  businessName: string
  email: string
  category: string
  about: string
  features: string[]
  plan: string
  domain: string
  /** Optional — sites the client referenced as inspiration */
  inspiration: string
  uploads: { name: string; size: number; type: string }[]
}

export type LeadSubmitResult =
  | { ok: true; ref: string }
  | { ok: false; error: string }

const STORAGE_KEY = 'elkie-last-submission'

export async function submitLead(
  data: LeadData,
  turnstileToken: string | null,
): Promise<LeadSubmitResult> {
  // -------------------------------------------------------------------
  // Stub mode
  // -------------------------------------------------------------------
  if (!hasSupabase() || !supabase) {
    // eslint-disable-next-line no-console
    console.log('[lead-submission] stub mode — would submit:', data, {
      turnstileToken,
    })
    await new Promise((r) => setTimeout(r, 900))
    safeStash(data)
    return { ok: true, ref: 'demo-' + Date.now().toString(36) }
  }

  // -------------------------------------------------------------------
  // Real mode
  // -------------------------------------------------------------------
  const { data: inserted, error } = await supabase
    .from('messages')
    .insert({
      client_id: null, // elkie.com lead, not from a client's site
      lead_type: 'client',
      business_name: data.businessName,
      email: data.email,
      category: data.category,
      about: data.about,
      features: data.features,
      plan: data.plan,
      domain: data.domain || null,
      metadata: data.inspiration ? { inspiration: data.inspiration } : {},
      status: 'new',
      turnstile_verified: !!turnstileToken,
    })
    .select()
    .single()

  if (error || !inserted) {
    // eslint-disable-next-line no-console
    console.error('[lead-submission] supabase error:', error)
    return {
      ok: false,
      error: "Sorry — we couldn't save your brief. Please try again.",
    }
  }

  safeStash(data)

  // Fire-and-forget Edge Function notification.
  // If the function isn't deployed yet, this just logs a warning and
  // the lead still lands in the database for manual follow-up.
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string
  void fetch(`${supabaseUrl}/functions/v1/notify-new-lead`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${anonKey}`,
    },
    body: JSON.stringify({
      messageId: inserted.id,
      turnstileToken,
      uploads: data.uploads,
    }),
  }).catch((e) => {
    // eslint-disable-next-line no-console
    console.warn('[lead-submission] notify-new-lead failed (non-fatal):', e)
  })

  return { ok: true, ref: inserted.id }
}

/* ------------------------- storage helpers ------------------------- */

function safeStash(data: LeadData) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    /* private mode — ignore */
  }
}

export function readLastSubmission(): LeadData | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as LeadData
  } catch {
    return null
  }
}

export function clearLastSubmission() {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}
