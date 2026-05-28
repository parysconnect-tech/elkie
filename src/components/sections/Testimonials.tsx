import { motion } from 'framer-motion'
import { useLanguage } from '@/lib/language'
import { t } from '@/lib/translations'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { SectionEyebrow } from './SectionEyebrow'

/**
 * Three vertically-scrolling columns at different speeds (parallax feel).
 * Each card is duplicated so the animation loops seamlessly.
 *
 * TODO: replace placeholders with real testimonials once we have some.
 */

type Quote = {
  quote: string
  name: string
  role: string
  initials: string
}

// TODO: replace with real testimonials
const QUOTES: Quote[] = [
  {
    quote:
      'Said goodbye to my old agency. Elkie shipped the site in two days and the leads started the same week.',
    name: 'Marisol R.',
    role: 'Owner, Café Madroño',
    initials: 'MR',
  },
  {
    quote:
      'I described our gym in five minutes. They sent back something better than I could have briefed.',
    name: 'Thomas K.',
    role: 'Founder, Iron & Oak Gym',
    initials: 'TK',
  },
  {
    quote:
      'Honestly the dashboard is the best part. I update the menu myself now without calling anyone.',
    name: 'Léa B.',
    role: 'Pastry chef, Maison Léa',
    initials: 'LB',
  },
  {
    quote:
      'We were quoted four months by an agency. Elkie did it in two days for a fraction of the budget.',
    name: 'Daniel O.',
    role: 'Director, Verde Properties',
    initials: 'DO',
  },
  {
    quote:
      'The themes saved us. Picked Bistro, edited the copy, live the same week. Zero stress.',
    name: 'Sofia P.',
    role: 'Owner, Casa Sofia',
    initials: 'SP',
  },
  {
    quote:
      'Best money I have spent on the business. Bookings up 40% in the first month.',
    name: 'James W.',
    role: 'Personal trainer, JW Coaching',
    initials: 'JW',
  },
  {
    quote:
      'Looks more expensive than it cost. People keep asking who built it.',
    name: 'Amara N.',
    role: 'Photographer, Amara Studio',
    initials: 'AN',
  },
  {
    quote:
      'The 48-hour promise is real. I sent the form on a Monday and we were live Wednesday morning.',
    name: 'Henri G.',
    role: 'Owner, Atelier Henri',
    initials: 'HG',
  },
  {
    quote:
      'Switching plans was instant. Started on Starter, upgraded to Pro when the orders came in.',
    name: 'Priya S.',
    role: 'Founder, Priya Bakes',
    initials: 'PS',
  },
]

function QuoteCard({ q }: { q: Quote }) {
  return (
    <figure className="glass shrink-0 rounded-2xl p-6">
      <blockquote className="text-text mb-5 text-base leading-relaxed">
        &ldquo;{q.quote}&rdquo;
      </blockquote>
      <figcaption className="flex items-center gap-3">
        <span className="cta-gradient flex h-9 w-9 items-center justify-center rounded-full font-heading text-xs font-bold text-white">
          {q.initials}
        </span>
        <div>
          <p className="text-text text-sm font-semibold">{q.name}</p>
          <p className="text-text-muted text-xs">{q.role}</p>
        </div>
      </figcaption>
    </figure>
  )
}

function ScrollColumn({
  quotes,
  duration,
  direction = 'up',
  className = '',
}: {
  quotes: Quote[]
  duration: number
  direction?: 'up' | 'down'
  className?: string
}) {
  const reduced = usePrefersReducedMotion()
  // Triple the list for a seamless loop
  const loop = [...quotes, ...quotes, ...quotes]
  const startY = direction === 'up' ? '0%' : '-66.6%'
  const endY = direction === 'up' ? '-66.6%' : '0%'

  return (
    <div className={`relative h-[600px] overflow-hidden ${className}`}>
      <motion.div
        className="flex flex-col gap-4"
        initial={{ y: startY }}
        animate={reduced ? { y: startY } : { y: [startY, endY] }}
        transition={{ duration, ease: 'linear', repeat: Infinity }}
      >
        {loop.map((q, i) => (
          <QuoteCard key={i} q={q} />
        ))}
      </motion.div>
      {/* Fade gradients top + bottom */}
      <div className="from-bg pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b to-transparent" />
      <div className="from-bg pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t to-transparent" />
    </div>
  )
}

export function Testimonials() {
  const { lang } = useLanguage()
  const reduced = usePrefersReducedMotion()

  const cols = [
    { quotes: [QUOTES[0]!, QUOTES[3]!, QUOTES[6]!], duration: 40, direction: 'up' as const },
    { quotes: [QUOTES[1]!, QUOTES[4]!, QUOTES[7]!], duration: 55, direction: 'down' as const },
    { quotes: [QUOTES[2]!, QUOTES[5]!, QUOTES[8]!], duration: 48, direction: 'up' as const },
  ]

  return (
    <section
      aria-labelledby="testimonials-heading"
      className="bg-bg-sec/30 px-4 py-24 md:py-32"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <SectionEyebrow>{t(lang, 'testimonialsEyebrow')}</SectionEyebrow>
          <motion.h2
            id="testimonials-heading"
            className="text-text mb-4 font-heading text-[clamp(2rem,5vw,3.75rem)] font-semibold tracking-tight"
            initial={reduced ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {t(lang, 'testimonialsTitle')}
          </motion.h2>
          <motion.p
            className="text-text-muted mx-auto max-w-2xl text-lg"
            initial={reduced ? false : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            {t(lang, 'testimonialsSub')}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cols.map((col, i) => (
            <ScrollColumn key={i} {...col} className={i === 2 ? 'hidden lg:block' : i === 1 ? 'hidden sm:block' : ''} />
          ))}
        </div>
      </div>
    </section>
  )
}
