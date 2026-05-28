import { Routes, Route } from 'react-router-dom'
import { MarketingLayout } from '@/components/MarketingLayout'
import { RequireAuth, RequireAdmin } from '@/lib/auth'
import MarketingPage from '@/routes/MarketingPage'
import Start from '@/routes/Start'
import Pricing from '@/routes/Pricing'
import Work from '@/routes/Work'
import WorkDetail from '@/routes/WorkDetail'
import Success from '@/routes/Success'
import Login from '@/routes/Login'
import Signup from '@/routes/Signup'
import Partners from '@/routes/Partners'
import NotFound from '@/routes/NotFound'
import DashboardLayout from '@/routes/dashboard/Layout'
import DashboardOverview from '@/routes/dashboard/Overview'
import DashboardContent from '@/routes/dashboard/Content'
import DashboardMessages from '@/routes/dashboard/Messages'
import DashboardAnalytics from '@/routes/dashboard/Analytics'
import DashboardBilling from '@/routes/dashboard/Billing'
import AdminLayout from '@/routes/admin/Layout'
import AdminOverview from '@/routes/admin/Overview'
import AdminMessages from '@/routes/admin/Messages'
import AdminClients from '@/routes/admin/Clients'
import AdminAnalytics from '@/routes/admin/Analytics'
import AdminWork from '@/routes/admin/Work'
import AdminSettings from '@/routes/admin/Settings'

export default function App() {
  return (
    <Routes>
      <Route element={<MarketingLayout />}>
        <Route index element={<MarketingPage />} />
        <Route path="work" element={<Work />} />
        <Route path="work/:slug" element={<WorkDetail />} />
        <Route path="start" element={<Start />} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="success" element={<Success />} />
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="partners" element={<Partners />} />
      </Route>

      {/* Auth-only routes */}
      <Route element={<RequireAuth />}>
        <Route path="dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardOverview />} />
          <Route path="content" element={<DashboardContent />} />
          <Route path="messages" element={<DashboardMessages />} />
          <Route path="analytics" element={<DashboardAnalytics />} />
          <Route path="billing" element={<DashboardBilling />} />
        </Route>
      </Route>

      {/* Admin-only routes */}
      <Route element={<RequireAdmin />}>
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<AdminOverview />} />
          <Route path="messages" element={<AdminMessages />} />
          <Route path="clients" element={<AdminClients />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="work" element={<AdminWork />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
