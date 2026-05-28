import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useLanguage } from '@/lib/language'
import { t } from '@/lib/translations'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { SectionEyebrow } from './SectionEyebrow'
import { PROJECTS } from '@/lib/projects'

/**
 * Horizontal-scrolling "Recent work" showcase on the marketing page.
 * Replaces the old "Theme Gallery preview" section now that we've
 * dropped the starter-themes concept in favour of a custom-everything
 * positioning.
 */
export function RecentWork() {
  const { lang } = useLanguage()
  const reduced = usePrefersReducedMotion()

  return (
    <section aria-labelledby="recent-work-heading" className="overflow-hidden px-4 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 flex flex-col items-start justify-between gap-6 md:mb-16 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <SectionEyebrow>{t(lang, 'workEyebrow')}</SectionEyebrow>
            <motion.h2
              id="recent-work-heading"
              className="text-text mb-4 font-heading text-[clamp(2rem,4.5vw,3.5rem)] font-semibold leading-[1.1] tracking-tight"
              initial={reduced ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              {t(lang, 'workTitle')}
            </motion.h2>
            <motion.p
              className="text-text-muted text-lg"
              initial={reduced ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.7, delay: 0.1 }}
            >
              {t(lang, 'workSub')}
            </motion.p>
          </div>
          <Link
            to="/work"
            className="border-card-border text-text hover:border-accent hover:text-accent inline-flex shrink-0 items-center gap-1 rounded-full border px-5 py-2 text-sm transition-colors"
          >
            {t(lang, 'workCta')}
          </Link>
        </div>
      </div>

      {/* Edge-bleed horizontal scroller */}
      <div className="-mx-4 overflow-x-auto px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <ul className="mx-auto flex max-w-none gap-5 px-4 md:px-12 lg:px-24">
          {PROJECTS.map((project, i) => (
            <motion.li
              key={project.slug}
              initial={reduced ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: 0.04 * i, ease: [0.22, 1, 0.36, 1] }}
              className="shrink-0"
            >
              <Link
                to={`/work/${project.slug}`}
                className="group block w-[72vw] max-w-[320px] sm:w-[300px]"
              >
                <div
                  className={`bg-gradient-to-br ${project.swatch} card-hover relative aspect-[3/4] overflow-hidden rounded-2xl shadow-xl`}
                >
                  <div className="absolute inset-0 flex flex-col justify-end p-6">
                    <div className="space-y-2">
                      <div className="bg-white/30 h-2 w-12 rounded-full" />
                      <div className="bg-white/80 h-4 w-3/4 rounded-full" />
                      <div className="bg-white/40 h-2 w-1/2 rounded-full" />
                    </div>
                  </div>
                  <div className="from-black/0 to-black/40 absolute inset-0 bg-gradient-to-b" />
                </div>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-text font-heading text-lg font-semibold">
                      {project.client}
                    </p>
                    <p className="text-text-muted truncate text-xs uppercase tracking-[0.2em]">
                      {project.industry} · {project.launchedAt}
                    </p>
                  </div>
                  <span className="text-text-muted group-hover:text-accent flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors">
                    <ArrowRight size={16} />
                  </span>
                </div>
              </Link>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  )
}
