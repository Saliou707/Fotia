/**
 * Djomy Africa — Client Node.js (production-ready)
 * Basé sur les specs ATSS afrotools/afrotools
 *
 * Auth : HMAC-SHA256(clientId, clientSecret) → POST /v1/auth → Bearer token
 * Chaque requête authentifiée requiert :
 *   Authorization: Bearer {token}
 *   X-API-KEY: {clientId}:{hmacHex}
 *
 * Améliorations v2 :
 *  - URL lue depuis DJOMY_API_URL (prod vs sandbox)
 *  - Cache token in-memory avec TTL 50 min (évite re-auth à chaque requête)
 *  - Timeout AbortSignal 8s sur chaque call
 *  - Retry x2 sur échec auth
 *  - Logs structurés
 */

import crypto from 'crypto'

// ---- Env ---------------------------------------------------------------
const DJOMY_CLIENT_ID     = process.env.DJOMY_CLIENT_ID     || ''
const DJOMY_CLIENT_SECRET = process.env.DJOMY_CLIENT_SECRET || ''

// URL configurable : production = https://api.djomy.africa
//                   sandbox   = https://sandbox-api.djomy.africa
export const DJOMY_BASE_URL =
  process.env.DJOMY_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://api.djomy.africa'
    : 'https://sandbox-api.djomy.africa')

// ---- Types -------------------------------------------------------------

export type DjomyPaymentStatus =
  | 'CREATED' | 'PENDING' | 'REDIRECTED' | 'FAILED'
  | 'SUCCESS'  | 'CAPTURED' | 'CANCELLED' | 'TIMEOUT' | 'REFUNDED'

export type DjomyPaymentMethod = 'OM' | 'MOMO' | 'SOUTRA_MONEY' | 'PAYCARD' | 'CARD'

export interface DjomyResponse<T> {
  success: boolean
  message: string
  data: T
  error: { code: number; message: string; details: string; fieldsErrors: string[] } | null
  timestamp: string
  status: number
}

export interface DjomyGatewayData {
  transactionId: string
  status: DjomyPaymentStatus
  paidAmount: number
  paymentMethod: string
  merchantPaymentReference?: string
  redirectUrl: string
  paymentUrl?: string
  allowedPaymentMethods: string[]
  createdAt: string
  metadata: Record<string, unknown>
}

export interface DjomyVerifyData {
  transactionId: string
  status: DjomyPaymentStatus
  paidAmount: number
  receivedAmount: number
  fees: number
  paymentMethod: string
  payerIdentifier: string
  currency: string
  merchantPaymentReference: string
  createdAt: string
  providerReference: string
  allowedPaymentMethods: string[]
  metadata: Record<string, unknown>
}

export interface CreatePaymentGatewayInput {
  amount: number
  countryCode: string
  payerNumber: string
  allowedPaymentMethods?: DjomyPaymentMethod[]
  description?: string
  merchantPaymentReference?: string
  returnUrl?: string
  cancelUrl?: string
  metadata?: Record<string, string | number | boolean>
}

// ---- Token cache -------------------------------------------------------
// Cache in-memory du Bearer token (TTL 50 min — Djomy tokens durent ~60 min)
let _cachedToken: string | null = null
let _tokenExpiresAt = 0
const TOKEN_TTL_MS = 50 * 60 * 1000 // 50 minutes

// ---- Auth helpers ------------------------------------------------------

/**
 * Compute HMAC-SHA256(message, secret) → hex string
 */
function computeHmacHex(message: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(message).digest('hex')
}

/**
 * Build the X-API-KEY header value: clientId:hmacHex
 */
function buildApiKeyHeader(): string {
  if (!DJOMY_CLIENT_ID || !DJOMY_CLIENT_SECRET) {
    throw new Error('[Djomy] Missing env: DJOMY_CLIENT_ID or DJOMY_CLIENT_SECRET')
  }
  const sig = computeHmacHex(DJOMY_CLIENT_ID, DJOMY_CLIENT_SECRET)
  return `${DJOMY_CLIENT_ID}:${sig}`
}

/**
 * Fetch with timeout — rejects after `ms` milliseconds.
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  ms = 8000
): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), ms)
  try {
    return await fetch(url, { ...options, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Authenticate and retrieve a short-lived Bearer token.
 * Implements cache (TTL 50 min) and retry x2 on failure.
 */
export async function getDjomyAccessToken(retries = 2): Promise<string> {
  // Return cached token if still valid
  if (_cachedToken && Date.now() < _tokenExpiresAt) {
    return _cachedToken
  }

  const apiKey = buildApiKeyHeader()

  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      const res = await fetchWithTimeout(
        `${DJOMY_BASE_URL}/v1/auth`,
        {
          method: 'POST',
          headers: {
            'X-API-KEY': apiKey,
            'Content-Type': 'application/json',
          },
        },
        8000
      )

      if (!res.ok) {
        const text = await res.text()
        throw new Error(`Djomy auth HTTP ${res.status}: ${text}`)
      }

      const result = (await res.json()) as DjomyResponse<{ accessToken: string }>
      if (!result.success) {
        throw new Error(`Djomy auth error: ${result.message}`)
      }

      _cachedToken = result.data.accessToken
      _tokenExpiresAt = Date.now() + TOKEN_TTL_MS

      console.log(`[Djomy] ✅ Auth token obtained (attempt ${attempt})`)
      return _cachedToken

    } catch (err) {
      console.error(`[Djomy] Auth attempt ${attempt} failed:`, err)
      if (attempt > retries) throw err
      // Wait 500ms before retry
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  throw new Error('[Djomy] All auth attempts failed')
}

/**
 * Invalidate the token cache (useful after 401 responses).
 */
export function invalidateDjomyToken(): void {
  _cachedToken = null
  _tokenExpiresAt = 0
}

/**
 * Build authenticated headers for any Djomy API call.
 * Both Authorization and X-API-KEY are required on every request.
 */
async function authHeaders(): Promise<Record<string, string>> {
  const [accessToken, apiKey] = await Promise.all([
    getDjomyAccessToken(),
    Promise.resolve(buildApiKeyHeader()),
  ])
  return {
    Authorization: `Bearer ${accessToken}`,
    'X-API-KEY': apiKey,
    'Content-Type': 'application/json',
  }
}

/**
 * Generic authenticated fetch with auto-retry on 401 (token refresh).
 */
async function djomyFetch(
  url: string,
  options: Omit<RequestInit, 'signal'>,
  retryOn401 = true
): Promise<Response> {
  const headers = await authHeaders()
  const res = await fetchWithTimeout(url, { ...options, headers }, 8000)

  // If 401, invalidate token and retry once
  if (res.status === 401 && retryOn401) {
    console.warn('[Djomy] 401 received, refreshing token and retrying...')
    invalidateDjomyToken()
    const freshHeaders = await authHeaders()
    return fetchWithTimeout(url, { ...options, headers: freshHeaders }, 8000)
  }

  return res
}

// ---- Payment gateway (redirect flow) -----------------------------------

/**
 * Create a gateway payment — the recommended integration path.
 * Djomy handles payment method selection and OTP on their portal.
 * → Redirect the user to data.redirectUrl immediately.
 */
export async function createDjomyGatewayPayment(
  input: CreatePaymentGatewayInput
): Promise<DjomyGatewayData> {
  const res = await djomyFetch(
    `${DJOMY_BASE_URL}/v1/payments/gateway`,
    {
      method: 'POST',
      body: JSON.stringify({
        amount: input.amount,
        countryCode: input.countryCode,
        payerNumber: input.payerNumber,
        ...(input.allowedPaymentMethods && { allowedPaymentMethods: input.allowedPaymentMethods }),
        ...(input.description && { description: input.description }),
        ...(input.merchantPaymentReference && { merchantPaymentReference: input.merchantPaymentReference }),
        ...(input.returnUrl && { returnUrl: input.returnUrl }),
        ...(input.cancelUrl && { cancelUrl: input.cancelUrl }),
        ...(input.metadata && { metadata: input.metadata }),
      }),
    }
  )

  const result = (await res.json()) as DjomyResponse<DjomyGatewayData>

  if (!result.success) {
    throw new Error(
      `[Djomy] create_payment_gateway error: ${result.error?.message ?? result.message}`
    )
  }

  console.log(`[Djomy] Payment created — transactionId: ${result.data.transactionId}`)
  return result.data
}

// ---- Verify payment ----------------------------------------------------

/**
 * Server-side verification — always call before fulfilling an order.
 * Only status === 'SUCCESS' means payment is confirmed.
 */
export async function verifyDjomyPayment(transactionId: string): Promise<DjomyVerifyData> {
  const res = await djomyFetch(
    `${DJOMY_BASE_URL}/v1/payments/${transactionId}/status`,
    { method: 'GET' }
  )

  const result = (await res.json()) as DjomyResponse<DjomyVerifyData>

  if (!result.success) {
    throw new Error(`[Djomy] verify_payment error: ${result.error?.message ?? result.message}`)
  }

  console.log(`[Djomy] Payment ${transactionId} status: ${result.data.status}`)
  return result.data
}

// ---- Webhook signature -------------------------------------------------

/**
 * Verify Djomy webhook signature.
 * Header format: X-Webhook-Signature: v1:<hex>
 * Algorithm: HMAC-SHA256(rawBody, DJOMY_WEBHOOK_SECRET)
 *
 * Uses DJOMY_WEBHOOK_SECRET if set, falls back to DJOMY_CLIENT_SECRET.
 */
export function verifyDjomyWebhookSignature(rawBody: string, signatureHeader: string): boolean {
  const secret = process.env.DJOMY_WEBHOOK_SECRET || DJOMY_CLIENT_SECRET
  if (!secret) {
    console.error('[Djomy Webhook] No webhook secret configured')
    return false
  }

  // Parse "v1:<hex>" format
  const match = signatureHeader.match(/^v1:([a-f0-9]+)$/i)
  if (!match) {
    console.error('[Djomy Webhook] Unexpected signature format:', signatureHeader)
    return false
  }

  const receivedHex = match[1]
  const expected = computeHmacHex(rawBody, secret)

  try {
    return crypto.timingSafeEqual(
      Buffer.from(receivedHex, 'hex'),
      Buffer.from(expected, 'hex')
    )
  } catch {
    // Buffer length mismatch = invalid signature
    return false
  }
}
