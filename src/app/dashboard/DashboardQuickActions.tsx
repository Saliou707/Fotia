'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { BarChart3, Heart, Upload, Share2 } from 'lucide-react'

const ACTIONS = [
  { icon: BarChart3, label: 'Statistiques', href: '/dashboard/statistics', color: '#C8482E' },
  { icon: Heart, label: 'Favoris clients', href: '/dashboard/favorites', color: '#EC4899' },
  { icon: Upload, label: 'Importer des photos', href: '/dashboard/upload', color: '#F59E0B' },
  { icon: Share2, label: 'Toutes mes galeries', href: '/dashboard/galleries', color: '#3B82F6' },
]

export default function DashboardQuickActions() {
  return (
    <motion.div className="dash-actions"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      style={{ padding: '20px 36px', display: 'flex', gap: 10, overflowX: 'auto' }}
    >
      {ACTIONS.map((a, i) => (
        <Link key={a.label} href={a.href} style={{ textDecoration: 'none', flexShrink: 0 }}>
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.32 + i * 0.06 }}
            whileHover={{ y: -2, background: 'rgba(255,255,255,0.06)' }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            <a.icon size={14} color={a.color} />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#F2EDE4', whiteSpace: 'nowrap' }}>{a.label}</span>
          </motion.div>
        </Link>
      ))}
    </motion.div>
  )
}
