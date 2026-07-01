'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, CreditCard, DollarSign,
  Image, HardDrive, Settings, ChevronRight, Activity,
  LogOut, Menu, X
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/users', label: 'Utilisateurs', icon: Users },
  { href: '/admin/subscriptions', label: 'Abonnements', icon: CreditCard },
  { href: '/admin/payments', label: 'Paiements', icon: DollarSign },
  { href: '/admin/galleries', label: 'Galeries', icon: Image },
  { href: '/admin/storage', label: 'Stockage', icon: HardDrive },
  { href: '/admin/settings', label: 'Paramètres', icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (item: typeof navItems[0]) => {
    if (item.exact) return pathname === item.href
    return pathname.startsWith(item.href)
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#C8482E] flex items-center justify-center">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-white font-bold text-sm tracking-tight">Fotia</span>
            <span className="block text-[10px] text-white/40 uppercase tracking-widest">Admin</span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                active
                  ? 'bg-[#C8482E]/10 text-[#C8482E]'
                  : 'text-white/50 hover:text-white/90 hover:bg-white/5'
              }`}
            >
              <item.icon className={`w-4 h-4 flex-shrink-0 transition-colors ${active ? 'text-[#C8482E]' : 'text-white/40 group-hover:text-white/70'}`} />
              <span>{item.label}</span>
              {active && <ChevronRight className="ml-auto w-3 h-3 text-[#C8482E]/60" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-white/5">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/40 hover:text-white/70 hover:bg-white/5 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Retour au Dashboard</span>
        </Link>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-[#111111] border border-white/10 text-white/70 lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — mobile slide-in */}
      <aside className={`fixed top-0 left-0 h-full w-60 bg-[#111111] border-r border-white/5 z-40 transform transition-transform duration-200 lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <SidebarContent />
      </aside>
    </>
  )
}

