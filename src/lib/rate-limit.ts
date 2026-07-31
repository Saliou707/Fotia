/**
 * Rate Limiter — Fotia
 *
 * Utilise Upstash Ratelimit si les variables d'env UPSTASH_REDIS_REST_URL/TOKEN
 * sont définies, sinon utilise un fallback in-memory (moins fiable en serverless).
 *
 * Usage :
 *   import { rateLimit } from '@/lib/rate-limit'
 *   const { success, remaining } = await rateLimit(identifier)
 *   if (!success) return NextResponse.json({ error: 'Trop de requêtes' }, 429)
 */

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import type { Duration } from '@upstash/ratelimit'

// ── Configuration ──────────────────────────────────────────────────────────

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN

const USE_UPSTASH = !!(UPSTASH_URL && UPSTASH_TOKEN)

interface RateLimitConfig {
  tokens: number
  window: Duration
}

const LIMITS: Record<string, RateLimitConfig> = {
  strict:   { tokens: 5,  window: '10 s' },
  moderate: { tokens: 30, window: '1 m' },
  relaxed:  { tokens: 100, window: '1 m' },
  webhook:  { tokens: 20,  window: '1 m' },
}

// ── In-memory fallback ─────────────────────────────────────────────────────
// Attention : en serverless (Vercel), chaque instance a sa propre mémoire.
// Ce fallback est utile pour le dev local et offre une protection partielle
// en prod. Pour une rate-limit fiable à grande échelle, configure Upstash.

export interface RateLimitResult {
  success: boolean
  remaining: number
  limit: number
  pending?: Promise<unknown>
}

interface BucketEntry {
  count: number
  resetAt: number
}

const buckets = new Map<string, BucketEntry>()

// Cleanup des buckets expirés (toutes les 5 minutes)
// Note : .unref() n'est pas disponible dans l'Edge Runtime,
// mais l'intervalle est inoffensif car il ne bloque pas l'arrêt du process.
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of buckets) {
      if (entry.resetAt < now) buckets.delete(key)
    }
  }, 5 * 60 * 1000)
}

/**
 * Rate limiter in-memory simple.
 */
async function inMemoryRateLimit(
  identifier: string,
  limit: number,
  windowMs: number
): Promise<{ success: boolean; remaining: number }> {
  const now = Date.now()
  const entry = buckets.get(identifier)

  if (!entry || entry.resetAt < now) {
    buckets.set(identifier, { count: 1, resetAt: now + windowMs })
    return { success: true, remaining: limit - 1 }
  }

  entry.count++
  const remaining = Math.max(0, limit - entry.count)
  const success = entry.count <= limit

  return { success, remaining }
}

// ── Upstash rate limiter ───────────────────────────────────────────────────

let upstashStrict: Ratelimit | null = null
let upstashModerate: Ratelimit | null = null
let upstashRelaxed: Ratelimit | null = null
let upstashWebhook: Ratelimit | null = null

if (USE_UPSTASH) {
  const redis = Redis.fromEnv()

  upstashStrict   = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(LIMITS.strict.tokens,   LIMITS.strict.window),  prefix: 'rl:strict' })
  upstashModerate = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(LIMITS.moderate.tokens,  LIMITS.moderate.window), prefix: 'rl:mod' })
  upstashRelaxed  = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(LIMITS.relaxed.tokens,   LIMITS.relaxed.window),  prefix: 'rl:relax' })
  upstashWebhook  = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(LIMITS.webhook.tokens,    LIMITS.webhook.window),  prefix: 'rl:webhook' })
}

// ── Public API ─────────────────────────────────────────────────────────────

function parseWindow(window: Duration): number {
  const str = window as string
  const [val, unit] = str.split(' ')
  const n = parseInt(val, 10)
  if (unit?.startsWith('s')) return n * 1000
  if (unit?.startsWith('m')) return n * 60 * 1000
  if (unit?.startsWith('h')) return n * 60 * 60 * 1000
  return n * 1000
}

/**
 * Vérifie la limite de débit pour un identifiant donné.
 *
 * @param identifier - IP, userId, ou token unique
 * @param level - Niveau de sévérité (strict, moderate, relaxed, webhook)
 */
export async function rateLimit(
  identifier: string,
  level: keyof typeof LIMITS = 'moderate'
): Promise<RateLimitResult> {
  const config = LIMITS[level]

  if (USE_UPSTASH) {
    const ratelimit: Record<string, Ratelimit | null> = {
      strict: upstashStrict,
      moderate: upstashModerate,
      relaxed: upstashRelaxed,
      webhook: upstashWebhook,
    }

    const rl = ratelimit[level]
    if (!rl) {
      return { success: true, remaining: config.tokens, limit: config.tokens }
    }

    const result = await rl.limit(identifier)
    return {
      success: result.success,
      remaining: result.remaining,
      limit: result.limit,
      pending: result.pending,
    }
  }

  // Fallback in-memory
  const windowMs = parseWindow(config.window)
  const result = await inMemoryRateLimit(identifier, config.tokens, windowMs)
  return {
    ...result,
    limit: config.tokens,
  }
}

/**
 * Extrait l'identifiant du client depuis une requête (IP + User-Agent).
 */
export function getRateLimitKey(request: Request): string {
  const ip =
    (request as any).ip ||
    (request as any).headers?.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    (request as any).headers?.get('x-real-ip') ||
    'unknown'

  const ua = (request as any).headers?.get('user-agent')?.slice(0, 50) || ''
  return `${ip}:${ua}`
}
