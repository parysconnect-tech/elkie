import { useState, type FormEvent } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  ChevronDown,
  Crown,
  Handshake,
  Layers,
  Loader2,
  Megaphone,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { SectionEyebrow } from '@/components/sections/SectionEyebrow'
import { MagneticButton } from '@/components/hero/MagneticButton'
import { Turnstile } from '@/lib/turnstile'
import {
  submitPartnerApplication,
  type PartnerApplicationData,
  type PartnerExperience,
  type PartnerVolume,
} from '@/lib/partnerApplication'
import { cn } from '@/lib/cn'

const EXPERIENCE_OPTIONS: { value: PartnerExperience; label: string; sub: string }[] = [
  { value: 'newbie', label: 'Total beginner', sub: 'Never sold a website before' },
  { value: 'some-clients', label: 'A few clients', sub: 'I’ve closed a handful of deals' },
  { value: 'freelancer', label: 'Active freelancer', sub: 'I sell services online already' },
  { value: 'agency-owner', label: 'Agency owner', sub: 'I run a digital agency' },
  { value: 'other', label: 'Something else', sub: 'Tell us about it below' },
]

const VOLUME_OPTIONS: { value: PartnerVolume; label: string }[] = [
  { value: '1-2', label: '1–2 sites/mo' },
  { value: '3-5', label: '3–5 sites/mo' },
  { value: '6-10', label: '6–10 sites/mo' },
  { value: '10+', label: '10+ sites/mo' },
]

const COURSES = [
  {
    icon: Megaphone,
    title: 'Finding your first drop-service client',
    desc: 'Where to look, what to say, how to close. Free for partners.',
    badge: 'Free',
  },
  {
    icon: TrendingUp,
    title: 'Pricing and proposals that close',
    desc: 'Markup formulas, proposal templates, objection scripts.',
    badge: 'Free',
  },
  {
    icon: Users,
    title: 'Managing client relationships at scale',
    desc: 'Stay sane when you have 10+ active builds.',
    badge: 'Soon',
  },
  {
    icon: Crown,
    title: 'Scaling to $10k/mo with web services',
    desc: 'The systems and team you need to grow past a one-person op.',
    badge: 'Soon',
  },
]

const FAQ: { q: string; a: string }[] = [
  {
    q: 'Do I need to know how to code?',
    a: 'Not at all. Your job is to find clients and manage the relationship. We do every line of code, every design decision, every deploy.',
  },
  {
    q: 'How do I find clients?',
    a: "Our free starter course walks you through it. Most partners start with their own network — local businesses, family, friends with side hustles — and grow from there. You don't need to be an expert salesperson.",
  },
  {
    q: 'Do I need to be a registered company?',
    a: "Nope. You can be a one-person operation working under your own name. If you grow into a real business, we'll help you set up white-labelled invoices.",
  },
  {
    q: 'Can I use my own branding?',
    a: "Yes. White-label is included from day one — your client never has to know we exist. Proposals, email templates, and the client-facing dashboard can all carry your logo and colours.",
  },
  {
    q: "What's the catch?",
    a: 'No catch. We charge you our public Pro Studio rate ($149 setup + $19/mo) and you charge your client whatever you want. Most partners mark up 4–10x. We make money on volume; you make money on margin.',
  },
  {
    q: 'How long does delivery take?',
    a: 'Same 48-hour delivery your client would get going to us direct — except your client thinks YOU did it in 48 hours. Active partners get priority queue.',
  },
]

type FormState = PartnerApplicationData
const INITIAL: FormState = {
  fullName: '',
  email: '',
  country: '',
  experience: 'newbie',
  monthlyVolume: '1-2',
  why: '',
}

export default function Partners() {
  return (
    <>
      <Helmet>
        <title>Partner program — Elkie Web Studio</title>
        <meta
          name="description"
          content="Drop-service web design partnership. Sell websites at your price, we build them at ours. Keep the markup."
        />
      </Helmet>

      <Hero />
      <Explainer />
      <HowItWorks />
      <EarningsMath />
      <WhatYouGet />
      <CoursesPreview />
      <ApplyForm />
      <FaqSection />
    </>
  )
}

/* ================================ HERO ================================ */

function Hero() {
  const reduced = usePrefersReducedMotion()
  return (
    <section className="relative overflow-hidden px-4 py-20 md:py-28">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 70% 30%, var(--accent-glow) 0%, transparent 55%)',
        }}
      />
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <p className="text-text-muted mb-5 text-xs uppercase tracking-[0.4em]">
          <span className="bg-accent-dim text-accent inline-flex items-center gap-1.5 rounded-full px-3 py-1">
            <span className="bg-accent block h-1.5 w-1.5 animate-pulse rounded-full" />
            Partner program
          </span>
        </p>
        <motion.h1
          className="gradient-text mb-6 font-heading text-[clamp(2.5rem,7vw,5.5rem)] font-bold leading-[1.05] tracking-tight"
          initial={reduced ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          We build it. You bill it. Keep the markup.
        </motion.h1>
        <motion.p
          className="text-text-muted mx-auto mb-10 max-w-2xl text-lg md:text-xl"
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
        >
          We&apos;re built for drop-servicers. You find the client, set your own
          price, and we deliver the site in 48 hours under your brand. Most
          partners pocket <strong className="text-text">$1,500+ per project</strong>.
        </motion.p>
        <motion.div
          className="flex flex-col items-center justify-center gap-3 sm:flex-row"
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <MagneticButton
            to="/partners#apply"
            className="cta-gradient glow-border px-8 py-4 text-white shadow-xl"
          >
            Apply to partner program →
          </MagneticButton>
          <a
            href="#how-it-works"
            className="glass cta-btn border-card-border text-text inline-flex items-center gap-2 rounded-full border px-8 py-4 font-medium transition-transform hover:scale-105"
          >
            How it works
          </a>
        </motion.div>
      </div>
    </section>
  )
}

/* =========================== DROP-SERVICE EXPLAINER =========================== */

function Explainer() {
  const reduced = usePrefersReducedMotion()
  return (
    <section className="px-4 py-20 md:py-24">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <SectionEyebrow>What is drop servicing?</SectionEyebrow>
          <motion.h2
            className="text-text mb-6 font-heading text-[clamp(2rem,4.5vw,3.25rem)] font-semibold tracking-tight"
            initial={reduced ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            It&apos;s dropshipping &mdash; for services.
          </motion.h2>
          <motion.p
            className="text-text-muted mx-auto max-w-3xl text-lg leading-relaxed"
            initial={reduced ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            You find a small business that needs a website. You charge them
            whatever the market will bear &mdash; usually $1,500 to $3,000. You
            outsource the actual design and build to a studio (that&apos;s us)
            at our public rate. You keep every dollar of difference.
          </motion.p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: Handshake,
              title: 'You sell',
              desc: 'You quote, contract, and bill the client at whatever price you want.',
            },
            {
              icon: Layers,
              title: 'We build',
              desc: 'You forward us the brief. We design, code, deploy — all in 48 hours.',
            },
            {
              icon: Sparkles,
              title: 'You keep the markup',
              desc: 'The gap between what you charged and what we cost is yours. Every time.',
            },
          ].map((card, i) => (
            <motion.div
              key={card.title}
              className="glass card-hover rounded-2xl p-6"
              initial={reduced ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: 0.1 * i, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="cta-gradient mb-4 flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-lg">
                <card.icon size={20} strokeWidth={2.25} />
              </span>
              <h3 className="text-text mb-2 font-heading text-xl font-semibold">
                {card.title}
              </h3>
              <p className="text-text-muted leading-relaxed">{card.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ============================== HOW IT WORKS ============================== */

function HowItWorks() {
  const reduced = usePrefersReducedMotion()
  const steps = [
    {
      n: '01',
      title: 'Sign up (free)',
      desc: 'Apply via the form below. We approve most partners within 24h.',
    },
    {
      n: '02',
      title: 'Bring us a brief',
      desc: "Forward us your client's requirements via your private partner dashboard.",
    },
    {
      n: '03',
      title: 'We deliver. You bill.',
      desc: 'Site lives in 48 hours. You invoice your client whatever you charged them.',
    },
  ]
  return (
    <section id="how-it-works" className="bg-bg-sec/30 px-4 py-20 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <SectionEyebrow>How it works</SectionEyebrow>
          <motion.h2
            className="text-text font-heading text-[clamp(2rem,4.5vw,3.25rem)] font-semibold tracking-tight"
            initial={reduced ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            Three steps. No surprises.
          </motion.h2>
        </div>
        <ol className="grid gap-6 md:grid-cols-3">
          {steps.map((step, i) => (
            <motion.li
              key={step.n}
              initial={reduced ? false : { opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: 0.1 * i, ease: [0.22, 1, 0.36, 1] }}
              className="glass card-hover relative flex flex-col gap-3 rounded-2xl p-8"
            >
              <span
                aria-hidden="true"
                className="text-accent/10 absolute right-6 top-4 font-heading text-6xl font-bold leading-none"
              >
                {step.n}
              </span>
              <h3 className="text-text relative z-10 font-heading text-2xl font-semibold">
                {step.title}
              </h3>
              <p className="text-text-muted relative z-10 leading-relaxed">{step.desc}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  )
}

/* ============================ EARNINGS MATH ============================ */

function EarningsMath() {
  const reduced = usePrefersReducedMotion()
  return (
    <section className="px-4 py-24 md:py-32">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <SectionEyebrow>The math</SectionEyebrow>
          <motion.h2
            className="text-text font-heading text-[clamp(2rem,4.5vw,3.25rem)] font-semibold tracking-tight"
            initial={reduced ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            What you actually make.
          </motion.h2>
        </div>

        {/* Per-site math */}
        <motion.div
          className="anim-border mx-auto mb-10 max-w-2xl p-1"
          initial={reduced ? false : { opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="bg-bg-sec rounded-[1.125rem] p-8">
            <p className="text-text-muted mb-6 text-center text-xs uppercase tracking-[0.3em]">
              One website, end-to-end
            </p>
            <div className="space-y-4">
              <MathRow label="Your client pays you" value="$2,000" sub="Your invoice, your branding" />
              <MathRow
                label="You pay Elkie (Pro Studio)"
                value="−$149 setup + $19/mo"
                sub="Our public price, no partner haggling needed"
              />
              <div className="border-card-border border-t pt-4">
                <MathRow
                  label="You keep"
                  value="$1,800+"
                  sub="Per project. Every time."
                  emphasis
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Volume scenarios */}
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { sites: 3, monthly: '$5,400', label: 'Side hustle' },
            { sites: 5, monthly: '$9,000', label: 'Replacing your day job' },
            { sites: 10, monthly: '$18,000', label: 'Real agency income' },
          ].map((row, i) => (
            <motion.div
              key={row.sites}
              className="glass card-hover rounded-2xl p-6 text-center"
              initial={reduced ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: 0.08 * i }}
            >
              <p className="text-text-muted text-xs uppercase tracking-[0.2em]">
                {row.sites} sites / mo
              </p>
              <p className="gradient-text mt-2 font-heading text-4xl font-bold">
                {row.monthly}
              </p>
              <p className="text-text-muted mt-1 text-sm">{row.label}</p>
            </motion.div>
          ))}
        </div>
        <p className="text-text-muted/70 mt-6 text-center text-xs">
          {/* TODO: Add a disclaimer if you want to be cautious — "earnings vary, no guarantees" etc. */}
          Numbers assume a $2,000 average sale and standard Pro Studio rate. Real earnings depend on
          what you charge.
        </p>
      </div>
    </section>
  )
}

function MathRow({
  label,
  value,
  sub,
  emphasis,
}: {
  label: string
  value: string
  sub?: string
  emphasis?: boolean
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-4">
      <div>
        <p className={cn('font-medium', emphasis ? 'text-text text-lg' : 'text-text-muted')}>
          {label}
        </p>
        {sub && <p className="text-text-muted/70 text-xs">{sub}</p>}
      </div>
      <p
        className={cn(
          'font-heading font-bold',
          emphasis ? 'gradient-text text-4xl' : 'text-text text-2xl',
        )}
      >
        {value}
      </p>
    </div>
  )
}

/* ============================== WHAT YOU GET ============================== */

function WhatYouGet() {
  const reduced = usePrefersReducedMotion()
  const items = [
    {
      icon: Layers,
      title: 'Your own partner dashboard',
      desc: 'A private control room with your active projects, leads, briefs, invoices, and white-labelled client portals.',
    },
    {
      icon: TrendingUp,
      title: 'Lead pipeline manager',
      desc: 'Track every prospect from cold email to signed contract. We also share excess elkie.com leads with active partners.',
    },
    {
      icon: BookOpen,
      title: 'Free training courses',
      desc: 'Sales, pricing, client management, scaling. Built specifically for drop-servicers, not "general business gurus".',
    },
    {
      icon: BadgeCheck,
      title: 'White-label everything',
      desc: "Your branding on every client-facing email, proposal, and dashboard. They'll never know we exist.",
    },
    {
      icon: Crown,
      title: 'Priority delivery',
      desc: 'Active partners jump the queue. Same 48-hour promise, but with first pick on our calendar.',
    },
    {
      icon: Sparkles,
      title: 'Wholesale-friendly pricing',
      desc: 'You always pay our standard public rate — no haggling, no surprises. Lock in your margins on day one.',
    },
  ]
  return (
    <section className="bg-bg-sec/30 px-4 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <SectionEyebrow>What you get</SectionEyebrow>
          <motion.h2
            className="text-text font-heading text-[clamp(2rem,4.5vw,3.25rem)] font-semibold tracking-tight"
            initial={reduced ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            Everything you need to run a web agency.
          </motion.h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <motion.div
              key={item.title}
              className="glass card-hover flex flex-col gap-3 rounded-2xl p-6"
              initial={reduced ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: 0.05 * i, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="cta-gradient flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-lg">
                <item.icon size={20} strokeWidth={2.25} />
              </span>
              <h3 className="text-text font-heading text-lg font-semibold">{item.title}</h3>
              <p className="text-text-muted text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ============================ FREE COURSES =========================== */

function CoursesPreview() {
  const reduced = usePrefersReducedMotion()
  return (
    <section className="px-4 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <SectionEyebrow>The course library</SectionEyebrow>
          <motion.h2
            className="text-text mb-3 font-heading text-[clamp(2rem,4.5vw,3.25rem)] font-semibold tracking-tight"
            initial={reduced ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            Free training, built for drop-servicers.
          </motion.h2>
          <motion.p
            className="text-text-muted mx-auto max-w-2xl"
            initial={reduced ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            No fluff, no "Lambo lifestyle" guru content. Just the exact stuff active partners are doing.
          </motion.p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {COURSES.map((c, i) => (
            <motion.div
              key={c.title}
              className="glass card-hover flex items-start gap-4 rounded-2xl p-6"
              initial={reduced ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: 0.05 * i, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="cta-gradient flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white shadow-lg">
                <c.icon size={20} strokeWidth={2.25} />
              </span>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-text font-heading text-lg font-semibold">{c.title}</h3>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest',
                      c.badge === 'Free'
                        ? 'bg-accent-dim text-accent'
                        : 'border-card-border text-text-muted border',
                    )}
                  >
                    {c.badge}
                  </span>
                </div>
                <p className="text-text-muted mt-1 text-sm leading-relaxed">{c.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* =============================== APPLY FORM =============================== */

function ApplyForm() {
  const navigate = useNavigate()
  const [form, setForm] = useState<FormState>(INITIAL)
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const reduced = usePrefersReducedMotion()

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  function validate(f: FormState): typeof errors {
    const next: typeof errors = {}
    if (!f.fullName.trim()) next.fullName = 'What should we call you?'
    if (!f.email.trim()) next.email = 'We need an email to reply to.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email))
      next.email = "That doesn't look like a valid email."
    if (!f.country.trim()) next.country = 'Tell us where you’re based.'
    if (!f.why.trim()) next.why = 'A sentence is plenty.'
    else if (f.why.trim().length < 20)
      next.why = 'A little more context helps us match you to the right partner tier.'
    return next
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setServerError(null)
    const v = validate(form)
    if (Object.keys(v).length > 0) {
      setErrors(v)
      const firstKey = Object.keys(v)[0]
      document.getElementById(`partner-field-${firstKey}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
      return
    }
    if (!turnstileToken) {
      setServerError("Please wait — we're still verifying you aren't a bot.")
      return
    }
    setSubmitting(true)
    const result = await submitPartnerApplication(
      {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        country: form.country.trim(),
        experience: form.experience,
        monthlyVolume: form.monthlyVolume,
        why: form.why.trim(),
      },
      turnstileToken,
    )
    if (!result.ok) {
      setServerError(result.error)
      setSubmitting(false)
      return
    }
    navigate('/success', { state: { ref: result.ref, kind: 'partner' } })
  }

  return (
    <section id="apply" className="bg-bg-sec/30 scroll-mt-24 px-4 py-24 md:py-32">
      <div className="mx-auto max-w-2xl">
        <div className="mb-10 text-center">
          <SectionEyebrow>Apply</SectionEyebrow>
          <motion.h2
            className="text-text mb-3 font-heading text-[clamp(2rem,4.5vw,3.25rem)] font-semibold tracking-tight"
            initial={reduced ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            Let&apos;s talk.
          </motion.h2>
          <motion.p
            className="text-text-muted"
            initial={reduced ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            We read every application. Approved partners hear back within 24–48 hours.
          </motion.p>
        </div>

        <motion.form
          onSubmit={onSubmit}
          noValidate
          className="space-y-6"
          initial={reduced ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <Row id="partner-field-fullName" label="Your name" error={errors.fullName} required>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => update('fullName', e.target.value)}
              placeholder="Alex Rivera"
              className={inputClass(!!errors.fullName)}
              autoComplete="name"
            />
          </Row>

          <Row id="partner-field-email" label="Your email" error={errors.email} required>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              placeholder="alex@yourside.com"
              className={inputClass(!!errors.email)}
              autoComplete="email"
            />
          </Row>

          <Row id="partner-field-country" label="Country / region" error={errors.country} required>
            <input
              type="text"
              value={form.country}
              onChange={(e) => update('country', e.target.value)}
              placeholder="e.g. United States, Spain, Brazil…"
              className={inputClass(!!errors.country)}
            />
          </Row>

          <Row id="partner-field-experience" label="How would you describe yourself?">
            <div className="grid gap-2 sm:grid-cols-2">
              {EXPERIENCE_OPTIONS.map((opt) => {
                const active = form.experience === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => update('experience', opt.value)}
                    className={cn(
                      'cta-btn flex flex-col items-start rounded-xl border p-3 text-left transition-colors',
                      active
                        ? 'border-accent bg-accent-dim'
                        : 'border-card-border hover:border-accent/40',
                    )}
                  >
                    <span
                      className={cn(
                        'text-sm font-semibold',
                        active ? 'text-accent' : 'text-text',
                      )}
                    >
                      {opt.label}
                    </span>
                    <span className="text-text-muted text-xs">{opt.sub}</span>
                  </button>
                )
              })}
            </div>
          </Row>

          <Row id="partner-field-monthlyVolume" label="Realistically, how many sites a month?">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {VOLUME_OPTIONS.map((opt) => {
                const active = form.monthlyVolume === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => update('monthlyVolume', opt.value)}
                    className={cn(
                      'cta-btn rounded-xl border px-3 py-2.5 text-sm transition-colors',
                      active
                        ? 'border-accent bg-accent-dim text-accent'
                        : 'border-card-border text-text-muted hover:border-accent/40 hover:text-text',
                    )}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </Row>

          <Row
            id="partner-field-why"
            label="Why do you want to partner with Elkie?"
            hint="One paragraph is perfect. Tell us your plan or your story."
            error={errors.why}
            required
          >
            <textarea
              value={form.why}
              onChange={(e) => update('why', e.target.value)}
              rows={5}
              placeholder="I run a small Instagram agency in Madrid and my clients keep asking me for websites. Would love to add this without learning to code…"
              className={inputClass(!!errors.why)}
            />
          </Row>

          <Turnstile onVerify={setTurnstileToken} onError={() => setTurnstileToken(null)} />

          {serverError && (
            <div className="border-red-500/40 bg-red-500/10 text-red-300 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm">
              <AlertCircle size={16} />
              <span>{serverError}</span>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={submitting || !turnstileToken}
              className="cta-gradient cta-btn glow-border flex w-full items-center justify-center gap-2 rounded-full px-8 py-4 font-medium text-white shadow-xl disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Submitting your application…
                </>
              ) : (
                <>
                  Apply to partner program <ArrowRight size={16} />
                </>
              )}
            </button>
            <p className="text-text-muted mt-3 text-center text-xs">
              Free to apply · No commitment · We reply within 24–48h
            </p>
          </div>
        </motion.form>
      </div>
    </section>
  )
}

function inputClass(hasError: boolean) {
  return cn(
    'bg-input-bg border-card-border text-text placeholder:text-text-muted/60 w-full rounded-xl border px-4 py-3 outline-none transition-colors focus:border-accent',
    hasError && 'border-red-500/60 focus:border-red-500',
  )
}

function Row({
  id,
  label,
  hint,
  error,
  required,
  children,
}: {
  id: string
  label: string
  hint?: string
  error?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div id={id}>
      <label className="text-text mb-2 flex items-center gap-1 text-sm font-medium">
        {label}
        {required && <span className="text-accent">*</span>}
      </label>
      {hint && !error && <p className="text-text-muted mb-2 text-xs">{hint}</p>}
      {children}
      {error && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-red-400">
          <AlertCircle size={12} />
          {error}
        </p>
      )}
    </div>
  )
}

/* ================================ FAQ ================================ */

function FaqSection() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section className="px-4 py-24 md:py-32">
      <div className="mx-auto max-w-3xl">
        <div className="mb-12 text-center">
          <h2 className="text-text mb-3 font-heading text-3xl font-semibold md:text-4xl">
            Common questions.
          </h2>
          <p className="text-text-muted">
            Still on the fence? Apply anyway — there&apos;s no commitment.
          </p>
        </div>
        <ul className="divide-card-border glass divide-y rounded-2xl">
          {FAQ.map((item, i) => {
            const isOpen = open === i
            return (
              <li key={item.q}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span
                    className={cn(
                      'font-heading text-base font-semibold md:text-lg',
                      isOpen ? 'text-accent' : 'text-text',
                    )}
                  >
                    {item.q}
                  </span>
                  <ChevronDown
                    size={18}
                    className={cn(
                      'text-text-muted shrink-0 transition-transform',
                      isOpen && 'text-accent rotate-180',
                    )}
                  />
                </button>
                <motion.div
                  initial={false}
                  animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="text-text-muted px-6 pb-5 text-sm leading-relaxed md:text-base">
                    {item.a}
                  </p>
                </motion.div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
