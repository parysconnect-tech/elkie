import { Link, NavLink, useNavigate } from 'react-router-dom'
import { LogOut, User as UserIcon } from 'lucide-react'
import { useLanguage } from '@/lib/language'
import { t } from '@/lib/translations'
import { useAuth } from '@/lib/auth'
import { ThemeToggle } from './ThemeToggle'
import { LanguageToggle } from './LanguageToggle'
import { cn } from '@/lib/cn'

export function Header() {
  const { lang } = useLanguage()
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const links = [
    { to: '/work', label: t(lang, 'navWork') },
    { to: '/pricing', label: t(lang, 'navPricing') },
    { to: '/start', label: t(lang, 'navStart') },
  ]

  async function handleSignOut() {
    await signOut()
    navigate('/', { replace: true })
  }

  return (
    <header className="fixed left-0 right-0 top-0 z-30 backdrop-blur-md" style={{ background: 'var(--nav-bg)' }}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-8">
        <Link to="/" aria-label="Elkie home" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-bg-sec font-heading text-sm font-bold text-accent">
            EW
          </span>
          <span className="font-heading text-lg font-semibold text-text">Elkie</span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                cn(
                  'rounded-full px-4 py-2 text-sm transition-colors',
                  isActive
                    ? 'text-accent'
                    : 'text-text-muted hover:text-text',
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
          {user ? (
            <>
              <Link
                to={profile?.role === 'admin' ? '/admin' : '/dashboard'}
                className="hidden items-center gap-2 rounded-full border border-card-border px-3 py-1.5 text-sm text-text transition-colors hover:border-accent hover:text-accent md:inline-flex"
                title={profile?.business_name || user.email || 'Dashboard'}
              >
                <UserIcon size={14} />
                <span className="max-w-[10ch] truncate">
                  {profile?.business_name || user.email?.split('@')[0]}
                </span>
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                aria-label="Sign out"
                title="Sign out"
                className="glass hidden h-9 w-9 items-center justify-center rounded-full text-text transition-transform hover:scale-105 md:flex"
              >
                <LogOut size={14} />
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="hidden rounded-full border border-card-border px-4 py-1.5 text-sm text-text transition-colors hover:border-accent hover:text-accent md:block"
            >
              {t(lang, 'navLogin')}
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
