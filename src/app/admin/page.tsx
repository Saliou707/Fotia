import AdminDashboardClient from './_components/DashboardClient'

export const dynamic = 'force-dynamic'

export default function AdminDashboardPage() {
  // Data fetched client-side in DashboardClient for reliable cookie handling
  return <AdminDashboardClient data={null} />
}
