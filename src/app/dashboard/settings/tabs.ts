import { User, Bell, Shield, CreditCard } from 'lucide-react'

export const TABS = [
  { id: 'profile',  label: 'Profil',        icon: User },
  { id: 'notifs',   label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Sécurité',      icon: Shield },
  { id: 'billing',  label: 'Abonnement',    icon: CreditCard },
] as const

export type TabId = typeof TABS[number]['id']
