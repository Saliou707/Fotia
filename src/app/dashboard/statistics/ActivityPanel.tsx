'use client'

import { motion } from 'framer-motion'
import { Activity, Eye, Heart, Clock } from 'lucide-react'
import Skeleton from './Skeleton'
import { timeAgo } from './utils'
import type { TimelineEvent } from './types'

interface ActivityPanelProps {
  loading: boolean
  events: TimelineEvent[]
}

export default function ActivityPanel({ loading, events }: ActivityPanelProps) {
  return (
    <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.3 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Activity size={16} color="#A09890" />
        </div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#FFF', margin: 0 }}>Activité en direct</h2>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '24px', backdropFilter: 'blur(10px)' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} h={48} />)}
          </div>
        ) : events.length === 0 ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: '#A09890', fontSize: 14 }}>Aucune activité récente.</div>
        ) : (
          <div className="timeline" style={{ display: 'flex', flexDirection: 'column' }}>
            {events.map((evt, i) => {
              const isView = evt.type === 'view';
              const IconComp = isView ? Eye : Heart;
              const color = isView ? '#F59E0B' : '#EC4899';

              return (
                <motion.div key={evt.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  style={{ display: 'flex', gap: 16, position: 'relative', paddingBottom: i === events.length - 1 ? 0 : 24 }}
                >
                  {/* Ligne verticale */}
                  {i !== events.length - 1 && (
                    <div style={{ position: 'absolute', left: 15, top: 32, bottom: 0, width: 2, background: 'rgba(255,255,255,0.05)', borderRadius: 2 }} />
                  )}

                  {/* Icone */}
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${color}1A`, border: `1px solid ${color}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 2 }}>
                    <IconComp size={14} color={color} fill={isView ? 'none' : color} />
                  </div>

                  {/* Contenu */}
                  <div style={{ paddingTop: 6, flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, color: '#FFF', fontWeight: 500, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
                      {isView ? 'Nouvelle vue sur' : 'Nouveau coup de cœur sur'}
                      <span style={{ color: color, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>
                        {evt.gallery_title}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: '#A09890', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={11} /> {timeAgo(evt.created_at)}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </motion.div>
  )
}
