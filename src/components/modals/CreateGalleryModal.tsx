'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ElementType } from 'react'
import { X } from 'lucide-react'

interface CreateGalleryModalProps {
  open: boolean
  creating: boolean
  onClose: () => void
  onCreate: (title: string, clientName: string) => void
  // ── Visuel (config par page) ──
  icon: ElementType
  title: string
  titlePlaceholder: string
  submitLabel: string
  submitIcon: ElementType
  submitIconSize?: number
  previewIcon: ElementType
  previewColor: string
  spinnerKeyframe: string
  className?: string
  maxWidth?: number
  padding?: number
}

export default function CreateGalleryModal({
  open, creating, onClose, onCreate,
  icon: Icon, title: titleLabel, titlePlaceholder,
  submitLabel, submitIcon: SubmitIcon, submitIconSize = 14,
  previewIcon: PreviewIcon, previewColor,
  spinnerKeyframe, className, maxWidth = 460, padding = 32,
}: CreateGalleryModalProps) {
  const [title, setTitle] = useState('')
  const [clientName, setClientName] = useState('')

  const handleClose = () => {
    onClose()
  }

  const submit = () => onCreate(title, clientName)

  return (
    <AnimatePresence onExitComplete={() => { setTitle(''); setClientName('') }}>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(14px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={() => !creating && handleClose()}
        >
          <motion.div
            initial={{ scale: 0.93, y: 24, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.93, y: 12, opacity: 0 }}
            transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.35 }}
            onClick={e => e.stopPropagation()}
            className={className}
            style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding, width: '100%', maxWidth, position: 'relative', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.8)' }}
          >
            {/* Glow */}
            <div style={{ position: 'absolute', top: -60, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,72,46,0.12) 0%, transparent 70%)', filter: 'blur(30px)', pointerEvents: 'none' }} />

            {/* Close button */}
            <button onClick={() => !creating && handleClose()} style={{ position: 'absolute', top: 16, right: 16, width: 30, height: 30, borderRadius: 9, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#A09890', transition: 'all 0.2s' }} className="hover:bg-white/[0.1] hover:text-white">
              <X size={14} />
            </button>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
              <div style={{ width: 44, height: 44, borderRadius: 13, background: 'rgba(200,72,46,0.1)', border: '1px solid rgba(200,72,46,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={20} color="#C8482E" />
              </div>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.03em', margin: 0, color: '#F2EDE4' }}>{titleLabel}</h2>
                <p style={{ fontSize: 13, color: '#A09890', margin: 0, marginTop: 2 }}>Vous importerez vos photos à l&apos;étape suivante.</p>
              </div>
            </div>

            {/* Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 8, color: '#A09890', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Nom de la galerie <span style={{ color: '#C8482E' }}>*</span>
                </label>
                <input
                  autoFocus value={title} onChange={e => setTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()}
                  placeholder={titlePlaceholder}
                  style={{ width: '100%', padding: '13px 16px', borderRadius: 13, background: 'rgba(255,255,255,0.03)', border: `1.5px solid ${title ? 'rgba(200,72,46,0.45)' : 'rgba(255,255,255,0.08)'}`, color: '#F2EDE4', fontSize: 14.5, outline: 'none', boxSizing: 'border-box', transition: 'all 0.2s', fontFamily: 'inherit' }}
                  className="focus:bg-white/[0.02]"
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, display: 'block', marginBottom: 8, color: '#A09890', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Nom du client <span style={{ color: '#4A4A4A', fontWeight: 400 }}>(optionnel)</span>
                </label>
                <input
                  value={clientName} onChange={e => setClientName(e.target.value)} onKeyDown={e => e.key === 'Enter' && submit()}
                  placeholder="ex: Cabinet Aissatou Diallo"
                  style={{ width: '100%', padding: '13px 16px', borderRadius: 13, background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(255,255,255,0.08)', color: '#F2EDE4', fontSize: 14.5, outline: 'none', boxSizing: 'border-box', transition: 'all 0.2s', fontFamily: 'inherit' }}
                  className="focus:border-white/[0.15] focus:bg-white/[0.02]"
                />
              </div>
            </div>

            {/* Preview of final title */}
            {title && (
              <motion.div
                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                style={{ background: 'rgba(200,72,46,0.06)', border: '1px solid rgba(200,72,46,0.15)', borderRadius: 11, padding: '10px 14px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <PreviewIcon size={13} color={previewColor} />
                <span style={{ fontSize: 13, color: '#F2EDE4', fontWeight: 500 }}>
                  {clientName.trim() ? `${title.trim()} — ${clientName.trim()}` : title.trim()}
                </span>
              </motion.div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={handleClose} disabled={creating} style={{ flex: 1, padding: '13px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', color: '#A09890', border: '1px solid rgba(255,255,255,0.07)', fontWeight: 600, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit' }} className="hover:bg-white/[0.08]">
                Annuler
              </button>
              <motion.button
                onClick={submit} disabled={!title.trim() || creating}
                whileHover={title.trim() && !creating ? { scale: 1.03 } : {}}
                whileTap={title.trim() && !creating ? { scale: 0.97 } : {}}
                style={{ flex: 2, padding: '13px', borderRadius: 12, border: 'none', fontWeight: 700, fontSize: 14, cursor: title.trim() && !creating ? 'pointer' : 'not-allowed', background: title.trim() ? 'linear-gradient(135deg, #DF5438, #C8482E)' : 'rgba(255,255,255,0.06)', color: title.trim() ? '#fff' : '#4A4A4A', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: title.trim() ? '0 4px 16px rgba(200,72,46,0.3)' : 'none', transition: 'all 0.2s', fontFamily: 'inherit' }}
              >
                {creating ? (
                  <><div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.25)', borderTopColor: '#fff', animation: `${spinnerKeyframe} 0.8s linear infinite` }} /> Création…</>
                ) : (
                  <>{submitLabel} <SubmitIcon size={submitIconSize} /></>
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
