import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import {
  FileText,
  MessageSquare,
  BarChart3,
  CreditCard,
  LogOut,
  Home,
} from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { AdminFloatingButton } from '@/components/AdminFloatingButton'
import { useAuth } from '@/lib/auth'
import { findPlan } from '@/lib/plans'
import { cn } from '@/lib/cn'

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Overview', end: true },
  { to: '/dashboard/content', icon: FileText, label: 'Content' },
  { to: '/dashboard/messages', icon: MessageSquare, label: 'Messages' },
  { to: '/dashboard/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/dashboard/billing', icon: CreditCard, label: 'Billing' },
]

export default function DashboardLayout() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()

  const plan = findPlan(profile?.plan ?? undefined)
  const businessName =
    profile?.business_name?.trim() ||
    user?.email?.split('@')[0] ||
    'Your business'

  async function handleSignOut() {
    await signOut()
    navigate('/', { replace: true })
  }

  return (
    <>
      <Helmet>
        <title>Dashboard — Elkie Web Studio</title>
      </Helmet>
      <div className="min-h-screen bg-bg text-text">
        <header className="border-card-border bg-bg-sec/40 border-b backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-8">
            <Link to="/dashboard" className="flex items-center gap-3">
              <span className="bg-bg-sec text-accent flex h-8 w-8 items-center justify-center rounded-lg font-heading text-sm font-bold">
                EW
              </span>
              <div>
                <p className="text-text-muted text-xs uppercase tracking-widest">
                  Business
                </p>
                <p className="font-heading max-w-[18ch] truncate text-sm font-semibold">
                  {businessName}
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-2">
              <span className="border-card-border text-text-muted hidden rounded-full border px-2 py-0.5 text-xs sm:inline-flex">
                {profile?.domain ? 'Live' : 'Draft'}
              </span>
              <span className="bg-accent-dim text-accent rounded-full px-2 py-0.5 text-xs">
                {plan?.name ?? 'No plan yet'}
              </span>
              <ThemeToggle />
              <button
                type="button"
                onClick={handleSignOut}
                aria-label="Sign out"
                title="Sign out"
                className="glass border-card-border text-text-muted hover:text-text flex h-9 w-9 items-center justify-center rounded-full border transition-colors"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 md:px-8">
          <aside className="hidden w-56 shrink-0 md:block">
            <nav aria-label="Dashboard" className="flex flex-col gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                      isActive
                        ? 'bg-accent-dim text-accent'
                        : 'text-text-muted hover:bg-card-bg hover:text-text',
                    )
                  }
                >
                  <item.icon size={16} />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </aside>
          <section className="min-w-0 flex-1">
            <Outlet />
          </section>
        </div>
        <AdminFloatingButton />
      </div>
    </>
  )
}
