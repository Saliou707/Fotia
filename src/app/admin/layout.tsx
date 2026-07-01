import { requireAdmin } from '@/lib/admin'
import AdminSidebar from './_components/Sidebar'

export const metadata = {
  title: 'Fotia — Admin',
  description: 'Espace administrateur Fotia',
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Server-side guard — redirects non-admins before anything renders
  await requireAdmin()

  return (
    <div
      className="min-h-screen"
      style={{ background: '#0B0B0B', color: '#F7F7F5', fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      <AdminSidebar />

      {/* Main content */}
      <div className="lg:pl-60">
        <main className="min-h-screen p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
