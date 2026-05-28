import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { PROJECTS, PROJECT_CATEGORIES, type ProjectCategory } from '@/lib/projects'
import { cn } from '@/lib/cn'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

type Filter = 'All' | ProjectCategory

export default function Work() {
  const [filter, setFilter] = useState<Filter>('All')
  const reduced = usePrefersReducedMotion()

  const visible = useMemo(() => {
    if (filter === 'All') return PROJECTS
    return PROJECTS.filter((p) => p.category === filter)
  }, [filter])

  return (
    <>
      <Helmet>
        <title>Recent work — Elkie Web Studio</title>
        <meta
          name="description"
          content="A selection of recent websites we've built for small businesses across every category."
        />
      </Helmet>

      <section className="px-4 py-16 md:py-24">
        <div className="mx-auto max-w-6xl">
          <header className="mb-12 text-center">
            <p className="text-text-muted mb-3 text-xs uppercase tracking-[0.4em]">
              <span className="bg-accent-dim text-accent inline-flex items-center gap-1.5 rounded-full px-3 py-1">
                <span className="bg-accent block h-1.5 w-1.5 animate-pulse rounded-full" />
                Recent work
              </span>
            </p>
            <motion.h1
              className="gradient-text mb-4 font-heading text-[clamp(2.5rem,6vw,4.5rem)] font-bold tracking-tight"
              initial={reduced ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              Real businesses. Real websites.
            </motion.h1>
            <p className="text-text-muted mx-auto max-w-2xl text-lg">
              Every site we build is custom — no template-lock, no pre-made constraints. Here's
              a selection of recent launches across different industries to give you a feel.
            </p>
          </header>

          {/* Category filter */}
          <div className="mb-10 flex flex-wrap items-center justify-center gap-2">
            <FilterChip active={filter === 'All'} onClick={() => setFilter('All')}>
              All <span className="text-text-muted/70 ml-1 text-xs">{PROJECTS.length}</span>
            </FilterChip>
            {PROJECT_CATEGORIES.map((cat) => {
              const count = PROJECTS.filter((p) => p.category === cat).length
              return (
                <FilterChip
                  key={cat}
                  active={filter === cat}
                  onClick={() => setFilter(cat)}
                >
                  {cat} <span className="text-text-muted/70 ml-1 text-xs">{count}</span>
                </FilterChip>
              )
            })}
          </div>

          {/* Grid */}
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map((project, i) => (
              <motion.li
                key={project.slug}
                layout
                initial={reduced ? false : { opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  delay: reduced ? 0 : 0.04 * i,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <Link to={`/work/${project.slug}`} className="group block">
                  <div
                    className={cn(
                      'bg-gradient-to-br',
                      project.swatch,
                      'card-hover relative aspect-[3/4] overflow-hidden rounded-2xl shadow-xl',
                    )}
                  >
                    {/* Mock content lines suggesting a real site */}
                    <div className="absolute inset-0 flex flex-col justify-between p-6">
                      <span className="bg-white/40 inline-block h-1.5 w-10 rounded-full" />
                      <div className="space-y-2">
                        <div className="bg-white/30 h-2 w-12 rounded-full" />
                        <div className="bg-white/80 h-4 w-3/4 rounded-full" />
                        <div className="bg-white/40 h-2 w-1/2 rounded-full" />
                      </div>
                    </div>
                    {/* Soft overlay */}
                    <div className="from-black/0 to-black/40 absolute inset-0 bg-gradient-to-b" />
                    {/* Hover label */}
                    <div className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-center bg-black/50 py-3 text-sm font-medium text-white opacity-0 backdrop-blur-sm transition-all group-hover:translate-y-0 group-hover:opacity-100">
                      View case →
                    </div>
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

          {visible.length === 0 && (
            <p className="text-text-muted py-20 text-center">
              Nothing in that category yet — try another filter.
            </p>
          )}

          {/* Bottom CTA */}
          <div className="mt-20 text-center">
            <p className="text-text-muted mb-6">
              Like the vibe? Let's design yours from scratch.
            </p>
            <Link
              to="/start"
              className="cta-gradient cta-btn glow-border inline-block rounded-full px-8 py-4 font-medium text-white shadow-xl"
            >
              Start a brief →
            </Link>
          </div>

          <p className="text-text-muted/70 mt-12 text-center text-xs">
            {/* TODO: swap placeholder projects with real launched sites as they ship */}
            Showcase placeholders shown above. Real launches replace these as they go live.
          </p>
        </div>
      </section>
    </>
  )
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-4 py-1.5 text-sm transition-colors',
        active
          ? 'border-accent bg-accent-dim text-accent'
          : 'border-card-border text-text-muted hover:border-accent/40 hover:text-text',
      )}
    >
      {children}
    </button>
  )
}
