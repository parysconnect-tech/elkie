// ============================================================
// stripe-webhook — Supabase Edge Function (Deno)
//
// Keeps the `profiles` table in sync with Stripe. Listens for:
//   - checkout.session.completed       → set plan + stripe IDs
//   - customer.subscription.updated    → update plan
//   - customer.subscription.deleted    → clear plan (cancelled)
//
// Deploy (note: webhooks must skip JWT verification):
//   supabase functions deploy stripe-webhook --no-verify-jwt --project-ref YOUR-REF
//
// Then in Stripe dashboard → Developers → Webhooks, add an endpoint:
//   https://YOUR-REF.supabase.co/functions/v1/stripe-webhook
// and copy its signing secret into STRIPE_WEBHOOK_SECRET.
//
// Required secrets:
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (auto)
//   STRIPE_SECRET_KEY        sk_test_...
//   STRIPE_WEBHOOK_SECRET    whsec_...
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
const WEBHOOK_SECRET = env.get('STRIPE_WEBHOOK_SECRET')!
const supa = createClient(env.get('SUPABASE_URL')!, env.get('SUPABASE_SERVICE_ROLE_KEY')!)

// @ts-expect-error - Deno.serve global
Deno.serve(async (req: Request) => {
  const signature = req.headers.get('stripe-signature')
  if (!signature) return new Response('Missing signature', { status: 400 })

  const rawBody = await req.text()
  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(rawBody, signature, WEBHOOK_SECRET)
  } catch (e) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new Response(`Webhook signature failed: ${(e as any)?.message}`, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.client_reference_id || session.metadata?.user_id
        const plan = session.metadata?.plan
        if (userId) {
          await supa
            .from('profiles')
            .update({
              plan: plan ?? null,
              stripe_customer_id: session.customer as string,
              stripe_subscription_id: session.subscription as string,
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId)
        }
        break
      }
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        await supa
          .from('profiles')
          .update({ stripe_subscription_id: sub.id, updated_at: new Date().toISOString() })
          .eq('stripe_customer_id', sub.customer as string)
        break
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        await supa
          .from('profiles')
          .update({ stripe_subscription_id: null, updated_at: new Date().toISOString() })
          .eq('stripe_customer_id', sub.customer as string)
        break
      }
      default:
        // Unhandled event types are fine — just acknowledge.
        break
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('[stripe-webhook] handler error:', e)
    return new Response('Handler error', { status: 500 })
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
