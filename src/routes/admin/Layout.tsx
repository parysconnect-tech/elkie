import { NavLink, Outlet } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { LayoutDashboard, Inbox, Users, BarChart3, Briefcase, Settings } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { cn } from '@/lib/cn'

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Overview', end: true },
  { to: '/admin/messages', icon: Inbox, label: 'Messages' },
  { to: '/admin/clients', icon: Users, label: 'Clients' },
  { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/admin/work', icon: Briefcase, label: 'Work' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
]

export default function AdminLayout() {
  return (
    <>
      <Helmet>
        <title>Admin — Elkie Web Studio</title>
      </Helmet>
      <div className="min-h-screen bg-bg text-text">
        <header className="border-b border-card-border bg-bg-sec/40 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-8">
            <div className="flex items-center gap-3">
              <span className="cta-gradient flex h-8 w-8 items-center justify-center rounded-lg font-heading text-sm font-bold text-white">
                EW
              </span>
              <div>
                <p className="text-xs uppercase tracking-widest text-text-muted">Elkie</p>
                <p className="font-heading text-sm font-semibold">Admin</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </header>

        <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 md:px-8">
          <aside className="hidden w-56 shrink-0 md:block">
            <nav aria-label="Admin" className="flex flex-col gap-1">
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
      </div>
    </>
  )
}
