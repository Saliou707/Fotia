import { Suspense } from 'react'
import BillingSuccessClient from './BillingSuccessClient'

export const dynamic = 'force-dynamic'

export default function BillingSuccessPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontFamily: 'var(--font-inter, Inter, sans-serif)' }}>
        Chargement...
      </div>
    }>
      <BillingSuccessClient />
    </Suspense>
  )
}
