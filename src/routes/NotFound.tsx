import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

export default function NotFound() {
  return (
    <>
      <Helmet>
        <title>Not found — Elkie Web Studio</title>
      </Helmet>
      <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
        <div className="glass max-w-md rounded-2xl p-8 text-center">
          <h1 className="gradient-text mb-4 font-heading text-5xl font-bold">404</h1>
          <p className="text-text-muted mb-6">That page doesn’t exist (yet).</p>
          <Link
            to="/"
            className="cta-gradient cta-btn inline-block rounded-full px-6 py-3 font-medium text-white shadow-lg"
          >
            Back home →
          </Link>
        </div>
      </section>
    </>
  )
}
