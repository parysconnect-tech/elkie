import { Link, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, ExternalLink, Monitor, Smartphone } from 'lucide-react'
import { useState } from 'react'
import { findProject, type Project } from '@/lib/projects'
import { cn } from '@/lib/cn'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

export default function WorkDetail() {
  const { slug } = useParams<{ slug: string }>()
  const project = findProject(slug)
  const reduced = usePrefersReducedMotion()
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop')

  if (!project) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-text mb-4 font-heading text-3xl font-semibold">
            Project not found
          </h1>
          <p className="text-text-muted mb-6">That project isn't in our showcase yet.</p>
          <Link
            to="/work"
            className="cta-gradient cta-btn inline-block rounded-full px-6 py-3 text-sm font-medium text-white shadow-lg"
          >
            Back to work
          </Link>
        </div>
      </section>
    )
  }

  return (
    <>
      <Helmet>
        <title>{`${project.client} — recent work — Elkie Web Studio`}</title>
        <meta name="description" content={project.description} />
      </Helmet>

      <section className="px-4 py-12 md:py-16">
        <div className="mx-auto max-w-6xl">
          {/* Breadcrumb */}
          <Link
            to="/work"
            className="text-text-muted hover:text-accent mb-8 inline-flex items-center gap-1.5 text-sm transition-colors"
          >
            <ArrowLeft size={14} /> All work
          </Link>

          {/* Header */}
          <div className="mb-10 grid items-end gap-6 md:grid-cols-[1fr_auto]">
            <div>
              <p className="text-text-muted mb-3 text-xs uppercase tracking-[0.4em]">
                {project.industry} · {project.launchedAt}
              </p>
              <motion.h1
                className="text-text mb-3 font-heading text-[clamp(2.5rem,6vw,4.5rem)] font-bold tracking-tight"
                initial={reduced ? false : { opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                {project.client}
              </motion.h1>
              <p className="text-text-muted max-w-xl text-lg leading-relaxed">
                {project.description}
              </p>
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent mt-4 inline-flex items-center gap-1.5 text-sm hover:underline"
                >
                  Visit live site <ExternalLink size={12} />
                </a>
              )}
            </div>

            {/* Device toggle */}
            <div className="bg-card-bg border-card-border inline-flex shrink-0 items-center gap-1 rounded-full border p-1">
              <DeviceButton
                active={device === 'desktop'}
                onClick={() => setDevice('desktop')}
              >
                <Monitor size={14} />
                <span className="hidden sm:inline">Desktop</span>
              </DeviceButton>
              <DeviceButton active={device === 'mobile'} onClick={() => setDevice('mobile')}>
                <Smartphone size={14} />
                <span className="hidden sm:inline">Mobile</span>
              </DeviceButton>
            </div>
          </div>

          {/* Preview frame */}
          <motion.div
            key={device}
            className="relative mx-auto"
            initial={reduced ? false : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {device === 'desktop' ? (
              <DesktopFrame project={project} />
            ) : (
              <MobileFrame project={project} />
            )}

            <div
              aria-hidden="true"
              className="from-accent/20 to-accent2/20 absolute -inset-12 -z-10 rounded-full bg-gradient-to-tr opacity-50 blur-3xl"
            />
          </motion.div>

          <p className="text-text-muted/70 mt-6 text-center text-xs">
            {/* TODO: swap placeholder for real screenshots once the project is launched */}
            Stylised preview — real screenshots replace this once the site is live.
          </p>

          {/* CTAs */}
          <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/start"
              className="cta-gradient cta-btn glow-border inline-flex items-center gap-2 rounded-full px-8 py-4 font-medium text-white shadow-xl"
            >
              Brief us on yours <ArrowRight size={16} />
            </Link>
            <Link
              to="/work"
              className="glass cta-btn border-card-border text-text inline-flex items-center gap-2 rounded-full border px-8 py-4 font-medium"
            >
              See other projects
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

/* ----------------------------- preview frames ---------------------------- */

function DesktopFrame({ project }: { project: Project }) {
  const url = project.liveUrl
    ? project.liveUrl.replace(/^https?:\/\//, '')
    : `${project.slug}.example.com`
  return (
    <div className="border-card-border bg-bg-sec mx-auto w-full max-w-5xl overflow-hidden rounded-xl border shadow-2xl">
      <div className="border-card-border bg-bg-sec border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="bg-red-500/70 h-3 w-3 rounded-full" />
          <span className="bg-amber-400/70 h-3 w-3 rounded-full" />
          <span className="bg-emerald-500/70 h-3 w-3 rounded-full" />
          <span className="bg-bg text-text-muted ml-3 flex-1 truncate rounded-md px-3 py-1 text-xs">
            https://{url}
          </span>
        </div>
      </div>
      <ProjectMockHero project={project} />
    </div>
  )
}

function MobileFrame({ project }: { project: Project }) {
  const url = project.liveUrl
    ? project.liveUrl.replace(/^https?:\/\//, '')
    : `${project.slug}.example.com`
  return (
    <div className="border-card-border bg-bg-sec mx-auto w-full max-w-xs overflow-hidden rounded-[2.5rem] border-4 p-2 shadow-2xl">
      <div className="bg-bg-sec overflow-hidden rounded-[2rem]">
        <div className="border-card-border bg-bg-sec border-b px-4 py-3 text-center text-xs">
          <span className="text-text-muted truncate">{url}</span>
        </div>
        <ProjectMockHero project={project} compact />
      </div>
    </div>
  )
}

function ProjectMockHero({ project, compact }: { project: Project; compact?: boolean }) {
  return (
    <div
      className={cn(
        'relative bg-gradient-to-br',
        project.swatch,
        compact ? 'min-h-[520px]' : 'min-h-[480px] md:min-h-[640px]',
      )}
    >
      {/* Nav row */}
      <div
        className={cn(
          'flex items-center justify-between px-5 py-4 text-white/90',
          compact ? 'text-[10px]' : 'text-xs',
        )}
      >
        <span className={cn('font-bold', compact ? 'text-sm' : 'text-base')}>
          {project.client}.
        </span>
        <span className="hidden gap-4 sm:flex">
          <span>Menu</span>
          <span>About</span>
          <span>Contact</span>
        </span>
        <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-medium backdrop-blur">
          {project.sampleCta}
        </span>
      </div>

      {/* Hero body */}
      <div
        className={cn(
          'flex flex-col items-start justify-center px-6',
          compact ? 'pb-12 pt-16' : 'pb-16 pt-20 md:px-12',
        )}
      >
        <span
          className={cn(
            'mb-3 inline-block rounded-full bg-white/20 px-3 py-1 font-medium text-white/90 backdrop-blur',
            compact ? 'text-[10px]' : 'text-xs',
          )}
        >
          {project.category}
        </span>
        <h2
          className={cn(
            'font-bold leading-[1.05] text-white drop-shadow-lg',
            project.headingFont === 'serif' ? 'font-heading' : 'font-body',
            compact ? 'text-3xl' : 'text-4xl md:text-6xl',
          )}
          style={{
            fontFamily: project.headingFont === 'serif' ? 'Georgia, serif' : undefined,
          }}
        >
          {project.sampleHeadline}
        </h2>
        <p
          className={cn(
            'mt-4 max-w-md text-white/90',
            compact ? 'text-sm' : 'text-lg md:text-xl',
          )}
        >
          {project.sampleSub}
        </p>
        <button
          type="button"
          className={cn(
            'mt-8 rounded-full bg-white px-6 py-3 font-medium text-black shadow-lg transition-transform hover:scale-105',
            compact ? 'text-sm' : 'text-base',
          )}
        >
          {project.sampleCta} →
        </button>
      </div>

      {/* Content cards */}
      <div
        className={cn(
          'border-t border-white/20 bg-black/20 backdrop-blur-sm',
          compact ? 'p-5' : 'p-10 md:p-12',
        )}
      >
        <div className={cn('grid gap-4', compact ? 'grid-cols-2' : 'grid-cols-3')}>
          {Array.from({ length: compact ? 2 : 3 }).map((_, i) => (
            <div key={i} className="rounded-lg bg-white/15 p-3 backdrop-blur">
              <div className="mb-2 h-1.5 w-10 rounded-full bg-white/40" />
              <div className="mb-1 h-2 w-3/4 rounded-full bg-white/80" />
              <div className="h-1.5 w-1/2 rounded-full bg-white/50" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function DeviceButton({
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
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-colors',
        active ? 'cta-gradient text-white shadow' : 'text-text-muted hover:text-text',
      )}
    >
      {children}
    </button>
  )
}
