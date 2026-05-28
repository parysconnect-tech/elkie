import { Link, useLocation } from 'react-router-dom'
import { Shield } from 'lucide-react'
import { useAuth } from '@/lib/auth'

/**
 * Floating "Admin Dashboard" launcher — bottom-left, mirror of the
 * WhatsApp button bottom-right. Only visible to authenticated admins,
 * and hidden when you're already inside /admin/* to avoid the chrome.
 */
export function AdminFloatingButton() {
  const { profile } = useAuth()
  const location = useLocation()
  const isAdmin = profile?.role === 'admin'
  const onAdminRoute = location.pathname.startsWith('/admin')

  if (!isAdmin || onAdminRoute) return null

  return (
    <Link
      to="/admin"
      aria-label="Open admin dashboard"
      title="Admin Dashboard"
      className="cta-gradient fixed bottom-6 left-6 z-40 flex h-14 w-14 animate-pulse-glow items-center justify-center rounded-full text-white shadow-xl transition-transform hover:scale-110"
    >
      <Shield size={24} />
    </Link>
  )
}
