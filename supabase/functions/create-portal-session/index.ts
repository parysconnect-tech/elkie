// ============================================================
// create-portal-session — Supabase Edge Function (Deno)
//
// Opens the Stripe Billing Portal for the signed-in client so they can
// update their card, download invoices, or cancel their subscription.
//
// Deploy:
//   supabase functions deploy create-portal-session --project-ref YOUR-REF
//
// Required secrets:
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (auto)
//   STRIPE_SECRET_KEY  sk_test_...
// ============================================================

// @ts-expect-error - Deno remote import
import Stripe from 'https://esm.sh/stripe@17?target=deno'
// @ts-expect-error - Deno remote import
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// @ts-expect-error - Deno global
const env = Deno.env
const stripe = new Stripe(env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-12-18.acacia',
})
const SUPABASE_URL = env.get('SUPABASE_URL')!
const SERVICE_ROLE = env.get('SUPABASE_SERVICE_ROLE_KEY')!

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, content-type',
}

// @ts-expect-error - Deno.serve global
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return json({ error: 'Not authenticated' }, 401)

  let returnUrl = 'https://elkie.com/dashboard/billing'
  try {
    const body = await req.json()
    if (body?.returnUrl) returnUrl = body.returnUrl
  } catch {
    /* no body is fine */
  }

  const supa = createClient(SUPABASE_URL, SERVICE_ROLE)
  const token = authHeader.replace('Bearer ', '')
  const { data: userData } = await supa.auth.getUser(token)
  if (!userData?.user) return json({ error: 'Not authenticated' }, 401)

  // Look up the customer's Stripe ID from their profile
  const { data: profile } = await supa
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', userData.user.id)
    .single()

  if (!profile?.stripe_customer_id) {
    return json({ error: 'No billing account yet — subscribe to a plan first.' }, 400)
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: returnUrl,
    })
    return json({ url: session.url })
  } catch (e) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return json({ error: (e as any)?.message || 'Stripe error' }, 500)
  }
})

function json(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  })
}
