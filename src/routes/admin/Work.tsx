import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import {
  Briefcase,
  Eye,
  EyeOff,
  Loader2,
  Plus,
  Star,
  StarOff,
} from 'lucide-react'
import { getProjects, updateProject, type AdminProject } from '@/lib/adminQueries'
import { hasSupabase } from '@/lib/supabase'
import { cn } from '@/lib/cn'

export default function AdminWork() {
  const [projects, setProjects] = useState<AdminProject[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    void getProjects().then((rows) => {
      setProjects(rows)
      setLoading(false)
    })
  }, [])

  async function toggleFeatured(slug: string, featured: boolean) {
    setProjects((prev) =>
      prev.map((p) => (p.slug === slug ? { ...p, featured } : p)),
    )
    await updateProject(slug, { featured })
  }

  async function toggleActive(slug: string, active: boolean) {
    setProjects((prev) =>
      prev.map((p) => (p.slug === slug ? { ...p, active } : p)),
    )
    await updateProject(slug, { active })
  }

  const featuredCount = projects.filter((p) => p.featured).length
  const activeCount = projects.filter((p) => p.active).length

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Work showcase — Elkie Web Studio</title>
      </Helmet>

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-text-muted text-xs uppercase tracking-[0.3em]">
            <span className="bg-accent-dim text-accent inline-flex items-center gap-1.5 rounded-full px-3 py-1">
              <Briefcase size={10} /> Portfolio
            </span>
          </p>
          <h1 className="text-text mt-4 font-heading text-3xl font-bold md:text-4xl">
            Work showcase
          </h1>
          <p className="text-text-muted mt-2 text-sm">
            {projects.length} projects · {activeCount} visible ·{' '}
            <span className="text-accent">{featuredCount} featured</span>
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            alert(
              'Add-project form lands in step 11 (when real launched-site screenshots replace the placeholders).',
            )
          }
          className="cta-gradient cta-btn glow-border inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white shadow-xl"
        >
          <Plus size={14} /> Add project
        </button>
      </header>

      {!hasSupabase() && (
        <div className="border-amber-500/30 bg-amber-500/10 text-amber-100/90 rounded-xl border px-4 py-3 text-xs">
          Dev stub mode — toggles update locally but won't persist. Real persistence lights
          up when Supabase is configured.
        </div>
      )}

      {/* Projects grid */}
      {loading ? (
        <div className="text-text-muted flex items-center justify-center gap-2 py-16 text-sm">
          <Loader2 size={16} className="animate-spin" /> Loading projects…
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {projects.map((project, i) => (
            <motion.article
              key={project.slug}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.04 * i, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                'glass card-hover overflow-hidden rounded-2xl transition-all',
                !project.active && 'opacity-60',
              )}
            >
              {/* Swatch thumbnail */}
              <div
                className={cn(
                  'relative aspect-[16/9] bg-gradient-to-br',
                  project.swatch ?? 'from-zinc-700 to-zinc-900',
                )}
              >
                <div className="from-black/0 to-black/40 absolute inset-0 bg-gradient-to-b" />
                {project.featured && (
                  <span className="bg-accent absolute left-3 top-3 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium text-black shadow">
                    <Star size={10} fill="currentColor" /> Featured
                  </span>
                )}
                {!project.active && (
                  <span className="border-card-border text-text-muted bg-bg/70 absolute right-3 top-3 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] backdrop-blur">
                    <EyeOff size={10} /> Hidden
                  </span>
                )}
              </div>

              {/* Body */}
              <div className="p-5">
                <p className="text-text-muted text-xs uppercase tracking-widest">
                  {project.industry ?? project.category ?? '—'}
                  {project.launchedAt && <> · {project.launchedAt}</>}
                </p>
                <h3 className="text-text mt-1 font-heading text-lg font-semibold">
                  {project.client}
                </h3>
                {project.description && (
                  <p className="text-text-muted mt-2 line-clamp-2 text-sm">
                    {project.description}
                  </p>
                )}

                {/* Actions */}
                <div className="border-card-border mt-4 flex items-center justify-between gap-2 border-t pt-3">
                  <button
                    type="button"
                    onClick={() => toggleFeatured(project.slug, !project.featured)}
                    aria-pressed={project.featured}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors',
                      project.featured
                        ? 'border-accent bg-accent-dim text-accent'
                        : 'border-card-border text-text-muted hover:border-accent/40 hover:text-text',
                    )}
                  >
                    {project.featured ? <Star size={12} /> : <StarOff size={12} />}
                    Featured
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleActive(project.slug, !project.active)}
                    aria-pressed={!project.active}
                    className="border-card-border text-text-muted hover:border-accent hover:text-accent inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors"
                  >
                    {project.active ? <EyeOff size={12} /> : <Eye size={12} />}
                    {project.active ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </div>
  )
}
