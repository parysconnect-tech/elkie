# Supabase setup

When you're ready to switch from stub mode to real persistence (forms saving, page-views tracking, email notifications), follow these steps **once**.

Until you do this, **the site still works** — it just doesn't save anything to a database, and the form's "spam protection" is in stub mode (any submission passes). That's deliberate. Stub mode lets you keep developing without a Supabase account.

---

## 1. Create a Supabase project (3 minutes)

1. Go to <https://supabase.com>
2. Click **Start your project** → sign in with GitHub or Google
3. Click **New project**
   - **Name:** `elkie` (or whatever you like)
   - **Database password:** generate a strong one and **save it in a password manager**
   - **Region:** pick the closest to your customers (London or US-East-1 are good general choices)
4. Wait ~2 minutes for provisioning

---

## 2. Run the schema migration

1. In your project's left sidebar, click the **SQL Editor** icon (looks like `>_`)
2. Click **New query** (top right)
3. Open the file [`supabase/migrations/0001_initial_schema.sql`](./migrations/0001_initial_schema.sql) from this repo
4. Copy its **entire contents**
5. Paste into the SQL editor
6. Click **Run** (or press `Ctrl+Enter`)
7. Bottom of the screen should say **"Success. No rows returned."**

You just created 5 tables: `profiles`, `messages`, `page_views`, `themes`, `settings`. Each with proper Row-Level Security so only the right people see the right rows.

---

## 3. Paste keys into `.env.local`

1. In your project dashboard, click the **gear icon** (bottom-left) → **API**
2. You'll see two important values:
   - **Project URL** — looks like `https://abcdefgh.supabase.co`
   - **anon public** key — a long string starting with `eyJ…`
3. In your project root, copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
4. Fill in:
   ```env
   VITE_SUPABASE_URL=https://abcdefgh.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```
5. Restart the dev server (`npm run dev`)

You'll see `[supabase] stub mode` is **gone** from the console. The site is now saving real records.

---

## 4. Create your admin account

Right now everyone signing up gets `role: 'client'`. To make YOUR account an admin:

1. Go to `/signup` on your dev site and sign up with your real email
2. In Supabase dashboard → **Table editor** → `profiles`
3. Find your row (look up your `id` in `auth.users` if needed)
4. Edit the `role` cell → change `client` to `admin` → save
5. Now when you sign in, you can hit `/admin/*` routes and see the floating admin button

---

## 5. (Optional) Wire up email notifications

The `notify-new-lead` Edge Function sends an admin alert + a client confirmation whenever a new lead lands. To deploy it:

1. Sign up at <https://resend.com> (free tier: 100 emails/day, plenty for now)
2. **Verify a sending domain** (or use Resend's onboarding domain for testing)
3. Create an API key in Resend → copy it
4. Install the Supabase CLI:
   ```bash
   npm install -g supabase
   ```
5. Login:
   ```bash
   supabase login
   ```
6. Set the function's secrets (replace placeholders):
   ```bash
   supabase secrets set RESEND_API_KEY=re_abc... \
                       ADMIN_NOTIFICATION_EMAIL=you@elkie.com \
                       --project-ref YOUR-PROJECT-REF
   ```
7. Deploy the function:
   ```bash
   supabase functions deploy notify-new-lead --project-ref YOUR-PROJECT-REF
   ```

Find your `YOUR-PROJECT-REF` in your Supabase dashboard URL — it's the `abcdefgh` part of `https://supabase.com/dashboard/project/abcdefgh`.

---

## 6. (Optional) Wire up Cloudflare Turnstile (spam protection)

1. Sign up at <https://cloudflare.com> → Turnstile → Add a site
2. **Site key** (public) → paste into `.env.local` as `VITE_TURNSTILE_SITE_KEY`
3. **Secret key** → set as Edge Function secret:
   ```bash
   supabase secrets set TURNSTILE_SECRET_KEY=0x4A... --project-ref YOUR-PROJECT-REF
   ```
4. Redeploy:
   ```bash
   supabase functions deploy notify-new-lead --project-ref YOUR-PROJECT-REF
   ```

Now the form shows the real (invisible) Turnstile widget and the Edge Function verifies tokens before sending emails.

---

## 7. (Optional) Wire up Stripe Checkout (TEST mode)

Until you do this, the pricing "Select" buttons just route to the intake form. Once configured, they start a real Stripe Checkout.

1. Sign up at <https://stripe.com>. Stay in **Test mode** (toggle, top-right of the dashboard).
2. **Create products + prices** (Products → Add product). For each plan create a recurring price (monthly + yearly). Copy each `price_...` ID.
3. Add the **publishable key** to `.env.local`:
   ```env
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```
4. Set the **secret key + price IDs** as Edge Function secrets:
   ```bash
   supabase secrets set STRIPE_SECRET_KEY=sk_test_... \
     STRIPE_PRICE_STARTER_MONTHLY=price_... \
     STRIPE_PRICE_STARTER_ANNUAL=price_... \
     STRIPE_PRICE_CUSTOM_MONTHLY=price_... \
     STRIPE_PRICE_CUSTOM_ANNUAL=price_... \
     STRIPE_PRICE_PRO_MONTHLY=price_... \
     STRIPE_PRICE_PRO_ANNUAL=price_... \
     --project-ref YOUR-PROJECT-REF
   ```
5. Deploy the three Stripe functions:
   ```bash
   supabase functions deploy create-checkout-session --project-ref YOUR-PROJECT-REF
   supabase functions deploy create-portal-session   --project-ref YOUR-PROJECT-REF
   supabase functions deploy stripe-webhook --no-verify-jwt --project-ref YOUR-PROJECT-REF
   ```
6. In Stripe → Developers → Webhooks, add endpoint
   `https://YOUR-PROJECT-REF.supabase.co/functions/v1/stripe-webhook`,
   subscribe to `checkout.session.completed`, `customer.subscription.updated`,
   `customer.subscription.deleted`, then copy its signing secret:
   ```bash
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_... --project-ref YOUR-PROJECT-REF
   ```
7. Test with Stripe's test card `4242 4242 4242 4242`, any future expiry, any CVC.

**When you go live:** swap every `pk_test_`/`sk_test_` for `pk_live_`/`sk_live_`, create live products/prices, and re-set the secrets. That's the only change.

---

## Troubleshooting

**"Row-Level Security policy violation" when inserting messages**
You probably ran the SQL twice and the policies conflict. Drop and re-run from a clean state — Supabase's free tier makes this easy via "Reset database" in project settings.

**Edge Function returns 401**
Check that your Supabase anon key in `.env.local` matches the project you deployed the function to.

**Emails not arriving**
Resend free tier requires a verified sender domain OR using their onboarding domain. Check `resend.com/emails` for delivery logs.
