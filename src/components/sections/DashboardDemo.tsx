import { motion } from 'framer-motion'
import {
  BarChart3,
  CreditCard,
  FileText,
  Inbox,
  LayoutDashboard,
  Palette,
  Check,
  TrendingUp,
} from 'lucide-react'
import { useLanguage } from '@/lib/language'
import { t } from '@/lib/translations'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { SectionEyebrow } from './SectionEyebrow'

/**
 * Visual mockup of the upcoming /dashboard. A floating 3D-ish card with
 * a fake sidebar, stat cards, and chart shape. For step 2 it tilts and
 * floats; step 3 will scrub the card as you scroll past.
 */
export function DashboardDemo() {
  const { lang } = useLanguage()
  const reduced = usePrefersReducedMotion()

  const navItems = [
    { icon: LayoutDashboard, label: 'Overview', active: true },
    { icon: Palette, label: 'Themes' },
    { icon: FileText, label: 'Content' },
    { icon: Inbox, label: 'Messages' },
    { icon: BarChart3, label: 'Analytics' },
    { icon: CreditCard, label: 'Billing' },
  ]

  const points = [t(lang, 'dashPoint1'), t(lang, 'dashPoint2'), t(lang, 'dashPoint3')]

  return (
    <section aria-labelledby="dash-heading" className="bg-bg-sec/30 px-4 py-24 md:py-32">
      <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-[1fr_1.2fr] md:gap-16">
        {/* Text side */}
        <div>
          <SectionEyebrow>{t(lang, 'dashEyebrow')}</SectionEyebrow>
          <motion.h2
            id="dash-heading"
            className="text-text mb-6 font-heading text-[clamp(2rem,4.5vw,3.5rem)] font-semibold leading-[1.1] tracking-tight"
            initial={reduced ? false : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {t(lang, 'dashTitle')}
          </motion.h2>
          <motion.p
            className="text-text-muted mb-8 text-lg leading-relaxed"
            initial={reduced ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            {t(lang, 'dashSub')}
          </motion.p>
          <ul className="space-y-3">
            {points.map((point, i) => (
              <motion.li
                key={point}
                className="text-text flex items-start gap-3"
                initial={reduced ? false : { opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
              >
                <span className="bg-accent-dim text-accent mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full">
                  <Check size={14} />
                </span>
                <span>{point}</span>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Mockup side */}
        <motion.div
          className="relative"
          initial={reduced ? false : { opacity: 0, y: 30, rotateY: -6 }}
          whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          style={{ perspective: 1400 }}
        >
          <motion.div
            className="anim-border p-1"
            animate={reduced ? undefined : { y: [0, -8, 0] }}
            transition={{ duration: 6, ease: 'easeInOut', repeat: Infinity }}
          >
            <div className="bg-bg-sec relative overflow-hidden rounded-[1.125rem]">
              {/* Top bar */}
              <div className="border-card-border flex items-center justify-between border-b px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="bg-accent flex h-6 w-6 items-center justify-center rounded font-heading text-[10px] font-bold text-black">
                    EW
                  </span>
                  <div>
                    <p className="text-text-muted text-[9px] uppercase tracking-widest">Business</p>
                    <p className="text-text text-xs font-semibold">Cape Bistro</p>
                  </div>
                </div>
                <span className="bg-accent-dim text-accent rounded-full px-2 py-0.5 text-[10px]">
                  Pro Studio
                </span>
              </div>

              <div className="flex">
                {/* Sidebar */}
                <aside className="border-card-border w-32 shrink-0 border-r p-3">
                  <ul className="space-y-1">
                    {navItems.map((item) => (
                      <li key={item.label}>
                        <span
                          className={
                            item.active
                              ? 'bg-accent-dim text-accent flex items-center gap-2 rounded px-2 py-1.5 text-[11px]'
                              : 'text-text-muted flex items-center gap-2 rounded px-2 py-1.5 text-[11px]'
                          }
                        >
                          <item.icon size={11} />
                          {item.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </aside>

                {/* Main panel */}
                <div className="flex-1 p-4">
                  {/* Stat cards */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Views (7d)', value: '1,284', delta: '+12%' },
                      { label: 'Messages', value: '23', delta: '+4' },
                      { label: 'Conv.', value: '3.1%', delta: '+0.6' },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="border-card-border rounded-lg border bg-bg/40 p-2"
                      >
                        <p className="text-text-muted text-[9px] uppercase tracking-wider">
                          {stat.label}
                        </p>
                        <p className="text-text font-heading text-lg font-bold">{stat.value}</p>
                        <p className="text-accent text-[9px]">
                          <TrendingUp size={9} className="inline" /> {stat.delta}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Chart placeholder */}
                  <div className="border-card-border mt-3 rounded-lg border bg-bg/40 p-3">
                    <p className="text-text-muted mb-2 text-[9px] uppercase tracking-wider">
                      Visitors · last 30 days
                    </p>
                    <svg viewBox="0 0 200 60" className="h-16 w-full">
                      <defs>
                        <linearGradient id="dashGrad" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.6" />
                          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M 0 45 Q 20 40 40 35 T 80 25 T 120 28 T 160 18 T 200 12 L 200 60 L 0 60 Z"
                        fill="url(#dashGrad)"
                      />
                      <path
                        d="M 0 45 Q 20 40 40 35 T 80 25 T 120 28 T 160 18 T 200 12"
                        fill="none"
                        stroke="var(--accent)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>

                  {/* Recent messages */}
                  <div className="mt-3 space-y-1.5">
                    <p className="text-text-muted text-[9px] uppercase tracking-wider">
                      Recent messages
                    </p>
                    {['Hello, do you cater?', 'Booking for Friday?', 'Vegan options?'].map(
                      (msg, i) => (
                        <div
                          key={i}
                          className="border-card-border flex items-center justify-between rounded border bg-bg/40 px-2 py-1.5"
                        >
                          <span className="text-text text-[10px]">{msg}</span>
                          <span className="bg-accent h-1.5 w-1.5 rounded-full" />
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Glow behind */}
          <div
            aria-hidden="true"
            className="from-accent/30 to-accent2/30 absolute -inset-10 -z-10 rounded-full bg-gradient-to-tr opacity-60 blur-3xl"
          />
        </motion.div>
      </div>
    </section>
  )
}
