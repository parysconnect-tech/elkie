import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { CheckCircle2, Share2 } from 'lucide-react'
import confetti from 'canvas-confetti'
import { readLastSubmission, type LeadData } from '@/lib/leadSubmission'
import {
  readLastPartnerApplication,
  type PartnerApplicationData,
} from '@/lib/partnerApplication'
import { findPlan } from '@/lib/plans'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

export default function Success() {
  const location = useLocation()
  const reduced = usePrefersReducedMotion()
  const state = location.state as { ref?: string; kind?: 'client' | 'partner' } | null
  const kind = state?.kind ?? 'client'
  const [submission, setSubmission] = useState<LeadData | null>(null)
  const [partnerApp, setPartnerApp] = useState<PartnerApplicationData | null>(null)
  const [copied, setCopied] = useState(false)

  // Read the last submission once on mount (whichever kind we came from)
  useEffect(() => {
    if (kind === 'partner') {
      setPartnerApp(readLastPartnerApplication())
    } else {
      setSubmission(readLastSubmission())
    }
  }, [kind])

  // Fire confetti on mount (unless reduced motion)
  useEffect(() => {
    if (reduced) return

    const colors = ['#00E5CC', '#6366F1', '#FF5C47', '#7C3AED', '#F0A500']
    const duration = 1800
    const end = Date.now() + duration

    const tick = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors,
        startVelocity: 45,
      })
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors,
        startVelocity: 45,
      })
      if (Date.now() < end) requestAnimationFrame(tick)
    }
    tick()
  }, [reduced])

  function onShare() {
    const url = 'https://elkie.com'
    if (typeof navigator.share === 'function') {
      navigator
        .share({
          title: 'Elkie Web Studio',
          text: 'They built my website in 48 hours. Worth a look.',
          url,
        })
        .catch(() => {
          /* user cancelled */
        })
    } else {
      void navigator.clipboard.writeText(url).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2500)
      })
    }
  }

  const plan = findPlan(submission?.plan)

  // Tailor headline + body to the submission kind
  const headline = kind === 'partner' ? 'Application received!' : 'Brief received!'
  const tabTitle =
    kind === 'partner'
      ? 'Application received — Elkie Web Studio'
      : 'Brief received — Elkie Web Studio'
  const subEmail = kind === 'partner' ? partnerApp?.email : submission?.email
  const subBodyClient =
    "We'll review it within 24 hours and email you the first preview link."
  const subBodyPartner =
    "We'll review your application and email you within 24–48 hours to set up your partner dashboard."

  return (
    <>
      <Helmet>
        <title>{tabTitle}</title>
      </Helmet>

      <section className="relative flex min-h-[80vh] items-center justify-center px-4 py-20">
        {/* Soft accent glow behind */}
        <div
          aria-hidden="true"
          className="from-accent/20 to-accent2/20 pointer-events-none absolute inset-0 bg-gradient-radial blur-3xl"
          style={{
            background:
              'radial-gradient(circle at 50% 40%, var(--accent-glow) 0%, transparent 60%)',
          }}
        />

        <div className="relative z-10 mx-auto w-full max-w-2xl text-center">
          <motion.div
            initial={reduced ? false : { opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="bg-accent-dim mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full"
          >
            <CheckCircle2 className="text-accent" size={42} strokeWidth={2} />
          </motion.div>

          <motion.h1
            className="gradient-text mb-3 font-heading text-[clamp(2.5rem,6vw,4rem)] font-bold tracking-tight"
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            {headline}
          </motion.h1>

          <motion.p
            className="text-text-muted mx-auto mb-10 max-w-lg text-lg"
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            {kind === 'partner' ? subBodyPartner : subBodyClient}
            {subEmail && (
              <>
                {' '}
                Check <span className="text-text font-semibold">{subEmail}</span>.
              </>
            )}
          </motion.p>

          {/* Client submission summary */}
          {kind === 'client' && submission && (
            <motion.dl
              initial={reduced ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="glass mx-auto mb-10 grid max-w-md grid-cols-1 gap-3 rounded-2xl p-6 text-left text-sm sm:grid-cols-2"
            >
              <SummaryRow label="Business" value={submission.businessName} />
              <SummaryRow label="Plan" value={plan?.name ?? submission.plan} />
              {submission.domain && <SummaryRow label="Domain" value={submission.domain} />}
              {submission.features.length > 0 && (
                <div className="col-span-full">
                  <dt className="text-text-muted text-xs uppercase tracking-widest">
                    Features
                  </dt>
                  <dd className="text-text mt-1">{submission.features.join(' · ')}</dd>
                </div>
              )}
              {state?.ref && (
                <SummaryRow
                  label="Reference"
                  value={<code className="text-accent text-xs">{state.ref}</code>}
                />
              )}
            </motion.dl>
          )}

          {/* Partner application summary */}
          {kind === 'partner' && partnerApp && (
            <motion.dl
              initial={reduced ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="glass mx-auto mb-10 grid max-w-md grid-cols-1 gap-3 rounded-2xl p-6 text-left text-sm sm:grid-cols-2"
            >
              <SummaryRow label="Name" value={partnerApp.fullName} />
              <SummaryRow label="Country" value={partnerApp.country} />
              <SummaryRow label="Experience" value={partnerApp.experience} />
              <SummaryRow label="Volume goal" value={`${partnerApp.monthlyVolume} / mo`} />
              {state?.ref && (
                <SummaryRow
                  label="Reference"
                  value={<code className="text-accent text-xs">{state.ref}</code>}
                />
              )}
            </motion.dl>
          )}

          <motion.div
            className="flex flex-col items-center justify-center gap-3 sm:flex-row"
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
          >
            <Link
              to="/"
              className="cta-gradient cta-btn glow-border rounded-full px-8 py-3 font-medium text-white shadow-xl"
            >
              Back home
            </Link>
            <button
              type="button"
              onClick={onShare}
              className="glass cta-btn border-card-border text-text inline-flex items-center gap-2 rounded-full border px-8 py-3 font-medium"
            >
              <Share2 size={16} />
              {copied ? 'Link copied!' : 'Share with a friend'}
            </button>
          </motion.div>
        </div>
      </section>
    </>
  )
}

function SummaryRow({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div>
      <dt className="text-text-muted text-xs uppercase tracking-widest">{label}</dt>
      <dd className="text-text mt-0.5 font-medium">{value}</dd>
    </div>
  )
}
