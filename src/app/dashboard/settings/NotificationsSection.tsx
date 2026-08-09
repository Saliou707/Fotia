'use client'

import { Bell } from 'lucide-react'
import { Card, SectionHeader, SettingRow, Toggle } from './ui'
import type { NotifKey } from './types'

interface NotificationsSectionProps {
  notifs: Record<NotifKey, boolean>
  onToggle: (key: NotifKey) => void
}

const ITEMS: { key: NotifKey; label: string; hint: string }[] = [
  { key: 'newFav', label: 'Nouveau favori client', hint: 'Un client ajoute une photo en favori' },
  { key: 'galleryView', label: 'Galerie vue', hint: "Quand quelqu'un ouvre votre galerie" },
  { key: 'download', label: 'Téléchargement', hint: 'Un client télécharge sa sélection' },
  { key: 'weekly', label: 'Résumé hebdomadaire', hint: 'Bilan de vos stats chaque lundi' },
]

export default function NotificationsSection({ notifs, onToggle }: NotificationsSectionProps) {
  return (
    <Card>
      <SectionHeader label="Préférences de notification" icon={Bell} />
      {ITEMS.map(({ key, label, hint }, i, arr) => (
        <SettingRow key={key} label={label} hint={hint} last={i === arr.length - 1}>
          <Toggle on={notifs[key]} onChange={() => onToggle(key)} />
        </SettingRow>
      ))}
    </Card>
  )
}
