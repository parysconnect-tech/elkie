/**
 * Partner program application flow — for drop-servicers applying via /partners.
 *
 * Same shape as `leadSubmission.ts` (stub / real modes) but lands in
 * the messages table with `lead_type='partner'`.
 */

import { hasSupabase, supabase } from './supabase'

export type PartnerExperience =
  | 'newbie'
  | 'some-clients'
  | 'freelancer'
  | 'agency-owner'
  | 'other'

export type PartnerVolume = '1-2' | '3-5' | '6-10' | '10+'

export type PartnerApplicationData = {
  fullName: string
  email: string
  country: string
  experience: PartnerExperience
  monthlyVolume: PartnerVolume
  why: string
}

export type PartnerSubmitResult =
  | { ok: true; ref: string }
  | { ok: false; error: string }

const STORAGE_KEY = 'elkie-last-partner-application'

export async function submitPartnerApplication(
  data: PartnerApplicationData,
  turnstileToken: string | null,
): Promise<PartnerSubmitResult> {
  // -------------------------------------------------------------------
  // Stub mode
  // -------------------------------------------------------------------
  if (!hasSupabase() || !supabase) {
    // eslint-disable-next-line no-console
    console.log('[partner-application] stub mode — would submit:', data, {
      turnstileToken,
    })
    await new Promise((r) => setTimeout(r, 900))
    safeStash(data)
    return { ok: true, ref: 'demo-partner-' + Date.now().toString(36) }
  }

  // -------------------------------------------------------------------
  // Real mode
  // -------------------------------------------------------------------
  const { data: inserted, error } = await supabase
    .from('messages')
    .insert({
      client_id: null,
      lead_type: 'partner',
      business_name: data.fullName,
      email: data.email,
      about: data.why,
      metadata: {
        country: data.country,
        experience: data.experience,
        monthlyVolume: data.monthlyVolume,
      },
      status: 'new',
      turnstile_verified: !!turnstileToken,
    })
    .select()
    .single()

  if (error || !inserted) {
    // eslint-disable-next-line no-console
    console.error('[partner-application] supabase error:', error)
    return {
      ok: false,
      error: "Sorry — we couldn't submit your application. Please try again.",
    }
  }

  safeStash(data)

  // Fire-and-forget notification (reuses the same Edge Function)
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
    }),
  }).catch((e) => {
    // eslint-disable-next-line no-console
    console.warn('[partner-application] notify failed (non-fatal):', e)
  })

  return { ok: true, ref: inserted.id }
}

/* ------------------------- storage helpers ------------------------- */

function safeStash(data: PartnerApplicationData) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    /* private mode — ignore */
  }
}

export function readLastPartnerApplication(): PartnerApplicationData | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as PartnerApplicationData
  } catch {
    return null
  }
}
