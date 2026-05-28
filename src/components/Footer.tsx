import { Link } from 'react-router-dom'
import { useLanguage } from '@/lib/language'
import { t } from '@/lib/translations'

export function Footer() {
  const { lang } = useLanguage()
  return (
    <footer className="border-t border-card-border bg-bg-sec/40 py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-4 md:flex-row md:items-center md:px-8">
        <div>
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-bg-sec font-heading text-sm font-bold text-accent">
              EW
            </span>
            <span className="font-heading text-lg font-semibold text-text">Elkie</span>
          </Link>
          <p className="mt-2 text-sm text-text-muted">{t(lang, 'footerTagline')}</p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-4 text-sm text-text-muted">
          <Link to="/work" className="hover:text-accent">
            Work
          </Link>
          <Link to="/pricing" className="hover:text-accent">
            Pricing
          </Link>
          <Link to="/start" className="hover:text-accent">
            Start
          </Link>
          <Link to="/partners" className="hover:text-accent">
            Partners
          </Link>
          <Link to="/login" className="hover:text-accent">
            Login
          </Link>
        </nav>
        <p className="text-xs text-text-muted">{t(lang, 'footerCopy')}</p>
      </div>
    </footer>
  )
}
