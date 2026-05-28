import type { ReactNode } from 'react'
import { Helmet } from 'react-helmet-async'

type Props = {
  title: string
  description?: string
  step?: string
  children?: ReactNode
}

/**
 * Temporary placeholder used while routes are being built out.
 * Each placeholder also sets the per-route <title> via react-helmet-async
 * so the SEO meta-tag plumbing is exercised from day one.
 */
export function PagePlaceholder({ title, description, step, children }: Props) {
  return (
    <>
      <Helmet>
        <title>{title} — Elkie Web Studio</title>
        {description && <meta name="description" content={description} />}
      </Helmet>
      <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
        <div className="glass max-w-xl rounded-2xl p-8 text-center">
          <h1 className="gradient-text mb-4 font-heading text-4xl font-semibold">{title}</h1>
          {description && <p className="text-text-muted mb-6">{description}</p>}
          {step && (
            <p className="text-text-muted/70 mb-2 text-xs uppercase tracking-widest">
              Lands in {step}
            </p>
          )}
          {children}
        </div>
      </section>
    </>
  )
}
