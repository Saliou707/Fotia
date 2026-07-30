import { requireAdmin } from '@/lib/admin'
import AdminSidebar from './_components/Sidebar'
import { ADMIN_CSS_VARS } from './_components/ui'

export const metadata = {
  title: 'Fotia — Admin',
  description: 'Espace administrateur Fotia',
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdmin()

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: ADMIN_CSS_VARS }} />
      <div
        className="min-h-screen"
        style={{ background: 'var(--bg-base)', color: 'var(--text-primary)', fontFamily: 'Inter, system-ui, sans-serif' }}
      >
        <AdminSidebar />
        <div className="lg:pl-64">
          <main className="min-h-screen p-5 lg:p-8 max-w-[1400px]">
            {children}
          </main>
        </div>
      </div>
    </>
  )
}
