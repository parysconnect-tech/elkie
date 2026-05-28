// ============================================================
// notify-new-lead — Supabase Edge Function (Deno runtime)
//
// Triggered by the browser after a successful insert into `messages`.
//
// Responsibilities:
//   1. Verify the Cloudflare Turnstile token (if a secret is configured)
//   2. Look up the inserted message via service-role client
//   3. Send the admin a "new lead!" email via Resend
//   4. Send the lead a "we got your brief" confirmation via Resend
//
// Deploy with:
//   supabase functions deploy notify-new-lead --project-ref YOUR-REF
//
// Required env (set via Supabase dashboard → Edge Functions → Secrets):
//   SUPABASE_URL                  (auto)
//   SUPABASE_SERVICE_ROLE_KEY     (auto)
//   RESEND_API_KEY                (required for emails to send)
//   RESEND_FROM_EMAIL             (optional, default hello@elkie.com)
//   RESEND_FROM_NAME              (optional, default "Elkie Web Studio")
//   ADMIN_NOTIFICATION_EMAIL      (required for admin emails to land)
//   TURNSTILE_SECRET_KEY          (optional — if set, tokens are verified)
//   PUBLIC_SITE_URL               (optional, default https://elkie.com)
// ============================================================

// @ts-expect-error - Deno-style import for the Supabase Edge runtime
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// @ts-expect-error - Deno is global in the Edge runtime
const env = Deno.env

const SUPABASE_URL = env.get('SUPABASE_URL')!
const SERVICE_ROLE = env.get('SUPABASE_SERVICE_ROLE_KEY')!
const RESEND_API_KEY = env.get('RESEND_API_KEY')
const RESEND_FROM_EMAIL = env.get('RESEND_FROM_EMAIL') || 'hello@elkie.com'
const RESEND_FROM_NAME = env.get('RESEND_FROM_NAME') || 'Elkie Web Studio'
const ADMIN_EMAIL = env.get('ADMIN_NOTIFICATION_EMAIL')
const TURNSTILE_SECRET = env.get('TURNSTILE_SECRET_KEY')
const SITE_URL = env.get('PUBLIC_SITE_URL') || 'https://elkie.com'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, content-type',
}

// @ts-expect-error - Deno.serve is global in the Edge runtime
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }
  if (req.method !== 'POST') {
    return json({ ok: false, error: 'Method not allowed' }, 405)
  }

  let body: { messageId?: string; turnstileToken?: string | null }
  try {
    body = await req.json()
  } catch {
    return json({ ok: false, error: 'Invalid JSON body' }, 400)
  }
  const { messageId, turnstileToken } = body
  if (!messageId) return json({ ok: false, error: 'Missing messageId' }, 400)

  // Optional Turnstile server-side verification
  if (TURNSTILE_SECRET) {
    if (!turnstileToken) return json({ ok: false, error: 'Missing turnstile token' }, 400)
    const verifyRes = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ secret: TURNSTILE_SECRET, response: turnstileToken }),
      },
    )
    const verify = (await verifyRes.json()) as { success?: boolean }
    if (!verify.success) {
      return json({ ok: false, error: 'Spam check failed' }, 403)
    }
  }

  // Service-role client (bypasses RLS to read the message we just inserted)
  const supa = createClient(SUPABASE_URL, SERVICE_ROLE)
  const { data: msg, error: msgErr } = await supa
    .from('messages')
    .select('*')
    .eq('id', messageId)
    .single()

  if (msgErr || !msg) {
    return json({ ok: false, error: 'Message not found' }, 404)
  }

  // Mark verified now that we know the token is real
  if (TURNSTILE_SECRET) {
    await supa.from('messages').update({ turnstile_verified: true }).eq('id', messageId)
  }

  const featuresList = Array.isArray(msg.features)
    ? (msg.features as string[]).join(', ')
    : ''

  // Fire both emails in parallel; we don't block on either
  const tasks: Promise<unknown>[] = []

  if (RESEND_API_KEY && ADMIN_EMAIL) {
    tasks.push(
      sendEmail({
        to: ADMIN_EMAIL,
        subject: `New lead — ${msg.business_name || msg.email}`,
        html: `
          <h2 style="font-family: sans-serif; margin: 0 0 16px 0;">New lead on Elkie</h2>
          <table style="font-family: sans-serif; border-collapse: collapse;">
            <tr><td style="padding: 4px 12px 4px 0;"><strong>Business:</strong></td><td>${escape(msg.business_name) || '<em>not provided</em>'}</td></tr>
            <tr><td style="padding: 4px 12px 4px 0;"><strong>Email:</strong></td><td>${escape(msg.email)}</td></tr>
            <tr><td style="padding: 4px 12px 4px 0;"><strong>Category:</strong></td><td>${escape(msg.category) || '—'}</td></tr>
            <tr><td style="padding: 4px 12px 4px 0;"><strong>Plan:</strong></td><td>${escape(msg.plan) || '—'}</td></tr>
            <tr><td style="padding: 4px 12px 4px 0;"><strong>Domain:</strong></td><td>${escape(msg.domain) || '—'}</td></tr>
            <tr><td style="padding: 4px 12px 4px 0; vertical-align: top;"><strong>About:</strong></td><td>${escape(msg.about) || ''}</td></tr>
            <tr><td style="padding: 4px 12px 4px 0;"><strong>Features:</strong></td><td>${escape(featuresList) || '<em>none</em>'}</td></tr>
          </table>
          <p style="font-family: sans-serif; margin: 24px 0 0 0;">
            <a href="${SITE_URL}/admin/messages" style="color: #00E5CC;">Open in admin →</a>
          </p>
        `,
      }),
    )
  }

  if (RESEND_API_KEY) {
    tasks.push(
      sendEmail({
        to: msg.email,
        subject: 'We got your brief',
        html: `
          <div style="font-family: sans-serif; max-width: 480px;">
            <h2 style="margin: 0 0 16px 0;">Brief received!</h2>
            <p>Hi${msg.business_name ? ' ' + escape(msg.business_name) : ''} — thanks for sending us your brief.</p>
            <p>Our team is reviewing it now. You'll get a follow-up email from us within 24 hours with the first preview link.</p>
            <p>Talk soon,<br/>The Elkie team</p>
            <p style="color: #888; font-size: 12px; margin-top: 32px;">${SITE_URL}</p>
          </div>
        `,
      }),
    )
  }

  await Promise.allSettled(tasks)
  return json({ ok: true })
})

/* --------------------------------- helpers --------------------------------- */

async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  if (!RESEND_API_KEY) return
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `${RESEND_FROM_NAME} <${RESEND_FROM_EMAIL}>`,
      to,
      subject,
      html,
    }),
  })
  if (!res.ok) {
    // eslint-disable-next-line no-console
    console.error('[notify-new-lead] resend send failed:', await res.text())
  }
}

function escape(s: unknown): string {
  if (s == null) return ''
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  })
}
