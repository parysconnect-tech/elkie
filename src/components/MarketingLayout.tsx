import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'
import { WhatsAppButton } from './WhatsAppButton'
import { AdminFloatingButton } from './AdminFloatingButton'
import { ScrollProgress } from './ScrollProgress'
import { usePageViewTracking } from '@/hooks/usePageViewTracking'

export function MarketingLayout() {
  // Logs every public-site nav into the `page_views` table (or no-ops in stub mode).
  usePageViewTracking()

  return (
    <div className="min-h-screen bg-bg text-text">
      <ScrollProgress />
      <Header />
      <main className="pt-16">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
      <AdminFloatingButton />
    </div>
  )
}
