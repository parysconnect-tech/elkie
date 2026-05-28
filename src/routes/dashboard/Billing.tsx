import { PagePlaceholder } from '@/components/PagePlaceholder'

export default function DashboardBilling() {
  return (
    <PagePlaceholder
      title="Billing"
      description="Current plan, next charge date, cancel button (opens Stripe portal)."
      step="step 9 + 10"
    />
  )
}
