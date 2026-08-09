'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Camera } from 'lucide-react'
import Skeleton from './Skeleton'
import RankingRow from './RankingRow'
import type { Gallery } from './types'

interface RankingPanelProps {
  loading: boolean
  galleries: Gallery[]
}

export default function RankingPanel({ loading, galleries }: RankingPanelProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(200,72,46,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={16} color="#C8482E" />
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#FFF', margin: 0 }}>Palmarès des Galeries</h2>
        </div>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, overflow: 'hidden', backdropFilter: 'blur(10px)' }}>
        {loading ? (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} h={64} />)}
          </div>
        ) : galleries.length === 0 ? (
          <div style={{ padding: '80px 24px', textAlign: 'center' }}>
            <Camera size={42} color="rgba(255,255,255,0.1)" style={{ margin: '0 auto 16px' }} />
            <div style={{ color: '#A09890', fontSize: 15 }}>Aucune donnée correspondante.</div>
          </div>
        ) : (
          galleries.slice(0, 10).map((g, i) => (
            <RankingRow key={g.id} title={g.title} views={g.view_count ?? 0} favorites={g.favorite_count ?? 0} rank={i} />
          ))
        )}
      </div>
    </motion.div>
  )
}
