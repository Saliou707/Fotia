'use client'

import { motion } from 'framer-motion'
import { Eye, Heart } from 'lucide-react'
import { fmtNum } from './utils'

interface RankingRowProps {
  title: string
  views: number
  favorites: number
  rank: number
}

export default function RankingRow({ title, views, favorites, rank }: RankingRowProps) {
  const isTop3 = rank < 3;
  const badgeColors = ['#E8B33D', '#94A3B8', '#B45309']; // Or, Argent, Bronze
  const badgeColor = isTop3 ? badgeColors[rank] : '#6C665F';
  const badgeBg = isTop3 ? `${badgeColor}1A` : 'rgba(255,255,255,0.04)';
  const badgeBorder = isTop3 ? `${badgeColor}4D` : 'rgba(255,255,255,0.08)';

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: rank * 0.04 }}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)',
        transition: 'background 0.2s', gap: 16
      }}
      className="ranking-row"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8, flexShrink: 0,
          background: badgeBg, border: `1px solid ${badgeBorder}`, color: badgeColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 800
        }}>
          {rank + 1}
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#F2EDE4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {title}
        </div>
      </div>

      <div className="ranking-stats" style={{ display: 'flex', alignItems: 'center', gap: 20, flexShrink: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#F2EDE4' }}>{fmtNum(views)}</span>
          <span style={{ fontSize: 10, color: '#A09890', display: 'flex', alignItems: 'center', gap: 3 }}><Eye size={9} /> vues</span>
        </div>
        <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.1)' }} className="ranking-divider" />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: 46 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#F2EDE4' }}>{fmtNum(favorites)}</span>
          <span style={{ fontSize: 10, color: '#A09890', display: 'flex', alignItems: 'center', gap: 3 }}><Heart size={9} /> favs</span>
        </div>
      </div>
    </motion.div>
  )
}
