import type { SupabaseClient } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

/**
 * Abonnement — logique métier centralisée (échéances & renouvellement).
 *
 * Règle d'échéance :
 *   nouvelle échéance = max(aujourd'hui, échéance actuelle) + 1 mois
 *
 * Ceci garantit :
 *   - un renouvellement anticipé prolonge la période restante (pas de perte de jours) ;
 *   - un abonnement expiré (ou un nouvel abonnement) repart d'aujourd'hui.
 */

/** Durée d'une période d'abonnement (mensuelle). */
export const SUBSCRIPTION_PERIOD_MONTHS = 1

/**
 * Ajoute `months` mois calendaires à une date, en clampant au dernier jour
 * du mois cible (ex : 31 janvier + 1 mois = 28/29 février, et non 3 mars).
 */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date)
  const day = result.getDate()
  result.setDate(1)
  result.setMonth(result.getMonth() + months)
  const lastDayOfTargetMonth = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate()
  result.setDate(Math.min(day, lastDayOfTargetMonth))
  return result
}

/**
 * Calcule la prochaine date d'expiration d'un abonnement mensuel.
 *
 * @param currentExpiresAt - Échéance actuelle (null si nouvel abonnement).
 * @param now              - Date de référence (par défaut : maintenant).
 */
export function computeExpiryDate(
  currentExpiresAt: string | Date | null | undefined,
  now: Date = new Date()
): Date {
  let base = now
  if (currentExpiresAt) {
    const parsed = new Date(currentExpiresAt)
    // On ne prolonge que depuis une échéance encore dans le futur
    if (!Number.isNaN(parsed.getTime()) && parsed > now) {
      base = parsed
    }
  }
  return addMonths(base, SUBSCRIPTION_PERIOD_MONTHS)
}

/**
 * Récupère l'échéance de l'abonnement actif le plus récent de l'utilisateur
 * (hors `excludeSubscriptionId` si fourni). Sert de base au calcul de
 * renouvellement : la nouvelle période s'ajoute à la période en cours.
 */
export async function fetchActiveSubscriptionExpiry(
  supabase: SupabaseClient,
  userId: string,
  excludeSubscriptionId?: string
): Promise<string | null> {
  let query = supabase
    .from('subscriptions')
    .select('expires_at')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('expires_at', { ascending: false })
    .limit(1)

  if (excludeSubscriptionId) {
    query = query.neq('id', excludeSubscriptionId)
  }

  const { data } = await query.maybeSingle()
  return data?.expires_at ?? null
}

/**
 * Expire les autres abonnements actifs de l'utilisateur pour garantir un seul
 * abonnement actif à la fois (le nouveau prend le relais au renouvellement).
 * Non bloquant — les erreurs sont seulement loggées.
 *
 * NB : doit être appelé avec un client disposant des droits d'écriture
 * (admin/service_role) : la RLS ne permet pas aux utilisateurs de mettre à
 * jour leurs propres subscriptions.
 */
export async function expireSupersededSubscriptions(
  supabase: SupabaseClient,
  userId: string,
  keepSubscriptionId: string
): Promise<void> {
  const { error } = await supabase
    .from('subscriptions')
    .update({ status: 'expired', updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('status', 'active')
    .neq('id', keepSubscriptionId)

  if (error) {
    logger.warn('[Subscription] Failed to expire superseded subscriptions:', error.message)
  }
}
