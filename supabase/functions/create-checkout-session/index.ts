// ============================================================
// create-checkout-session — Supabase Edge Function (Deno)
//
// Creates a Stripe Checkout Session (subscription mode) for a plan +
// billing cycle, and returns its URL for the browser to redirect to.
//
// Deploy:
//   supabase functions deploy create-checkout-session --project-ref YOUR-REF
//
// Required secrets (Supabase dashboard → Edge Functions → Secrets):
//   SUPABASE_URL                 (auto)
//   SUPABASE_SERVICE_ROLE_KEY    (auto)
//   STRIPE_SECRET_KEY            sk_test_... (use TEST keys for now)
//   STRIPE_PRICE_STARTER_MONTHLY price_...   (recurring price IDs)
//   STRIPE_PRICE_STARTER_ANNUAL  price_...
//   STRIPE_PRICE_CUSTOM_MONTHLY  price_...
//   STRIPE_PRICE_CUSTOM_ANNUAL   price_...
//   STRIPE_PRICE_PRO_MONTHLY     price_...
//   STRIPE_PRICE_PRO_ANNUAL      price_...
//   (optional one-time setup-fee prices)
//   STRIPE_PRICE_STARTER_SETUP   price_...
//   STRIPE_PRICE_CUSTOM_SETUP    price_...
//   STRIPE_PRICE_PRO_SETUP       price_...
//
// TODO(go-live): swap sk_test_ for sk_live_ and the live price IDs.
// ============================================================

// @ts-expect-error - Deno-style remote import in the Edge runtime
import Stripe from 'https://esm.sh/stripe@17?target=deno'
// @ts-expect-error - Deno-style remote import
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// @ts-expect-error - Deno global in the Edge runtime
const env = Deno.env
const STRIPE_SECRET_KEY = env.get('STRIPE_SECRET_KEY')!
const SUPABASE_URL = env.get('SUPABASE_URL')!
const SERVICE_ROLE = env.get('SUPABASE_SERVICE_ROLE_KEY')!

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2024-12-18.acacia' })

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, content-type',
}

type PlanSlug = 'starter' | 'custom' | 'pro' | 'demo'
type Cycle = 'monthly' | 'annual'

function recurringPriceId(plan: PlanSlug, cycle: Cycle): string | undefined {
  const key = `STRIPE_PRICE_${plan.toUpperCase()}_${cycle.toUpperCase()}`
  return env.get(key)
}
function setupPriceId(plan: PlanSlug): string | undefined {
  return env.get(`STRIPE_PRICE_${plan.toUpperCase()}_SETUP`)
}

// @ts-expect-error - Deno.serve is global in the Edge runtime
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  let body: {
    plan?: PlanSlug
    cycle?: Cycle
    successUrl?: string
    cancelUrl?: string
  }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid JSON' }, 400)
  }

  const { plan, cycle = 'monthly', successUrl, cancelUrl } = body
  if (!plan || plan === 'demo') {
    return json({ error: 'Pick a paid plan to check out.' }, 400)
  }
  const priceId = recurringPriceId(plan, cycle)
  if (!priceId) {
    return json({ error: `No Stripe price configured for ${plan}/${cycle}.` }, 400)
  }

  // Identify the signed-in user from their JWT (so we can attach the
  // Stripe customer to their profile). Anonymous checkout is allowed too.
  let userId: string | null = null
  let email: string | undefined
  const authHeader = req.headers.get('Authorization')
  if (authHeader) {
    const supa = createClient(SUPABASE_URL, SERVICE_ROLE)
    const token = authHeader.replace('Bearer ', '')
    const { data } = await supa.auth.getUser(token)
    if (data?.user) {
      userId = data.user.id
      email = data.user.email ?? undefined
    }
  }

  const lineItems: { price: string; quantity: number }[] = [{ price: priceId, quantity: 1 }]
  const setup = setupPriceId(plan)
  // Setup fee is a one-time charge added to the first invoice
  const addInvoiceItems = setup ? [{ price: setup, quantity: 1 }] : undefined

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: lineItems,
      subscription_data: addInvoiceItems ? { add_invoice_items: addInvoiceItems } : undefined,
      customer_email: email,
      client_reference_id: userId ?? undefined,
      metadata: { plan, cycle, user_id: userId ?? '' },
      success_url: successUrl || 'https://elkie.com/dashboard/billing?checkout=success',
      cancel_url: cancelUrl || 'https://elkie.com/pricing?checkout=cancelled',
      allow_promotion_codes: true,
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
