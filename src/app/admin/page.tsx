import { formatBytes } from '@/lib/utils'
import AdminDashboardClient from './_components/DashboardClient'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

async function getDashboardData() {
  try {
    const cookieStore = await cookies()
    const cookieString = cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ')
    
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/admin/dashboard`,
      { 
        cache: 'no-store',
        headers: { Cookie: cookieString }
      }
    )
    if (!res.ok) return null
    return await res.json()
  } catch (err) {
    console.error('Error fetching dashboard data:', err)
    return null
  }
}

export default async function AdminDashboardPage() {
  const data = await getDashboardData()

  return <AdminDashboardClient data={data} />
}
