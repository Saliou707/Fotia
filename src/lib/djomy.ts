/**
 * Djomy Africa — Client Node.js (sandbox)
 * Basé sur les specs ATSS afrotools/afrotools
 *
 * Auth : HMAC-SHA256(clientId, clientSecret) → POST /v1/auth → Bearer token
 * Chaque requête authentifiée requiert :
 *   Authorization: Bearer {token}
 *   X-API-KEY: {clientId}:{hmacHex}
 */

import crypto from 'crypto'

// ---- Env ---------------------------------------------------------------
const DJOMY_CLIENT_ID     = process.env.DJOMY_CLIENT_ID     || ''
const DJOMY_CLIENT_SECRET = process.env.DJOMY_CLIENT_SECRET || ''

// Sandbox uniquement — remplacer par https://api.djomy.africa en production
export const DJOMY_BASE_URL = 'https://sandbox-api.djomy.africa'

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

// ---- Auth helpers ------------------------------------------------------

/**
 * Compute HMAC-SHA256(message, secret) → hex string (Node.js crypto)
 */
function computeHmacHex(message: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(message).digest('hex')
}

/**
 * Build the X-API-KEY header value: clientId:hmacHex
 */
function buildApiKeyHeader(): string {
  if (!DJOMY_CLIENT_ID || !DJOMY_CLIENT_SECRET) {
    throw new Error('Missing env: DJOMY_CLIENT_ID or DJOMY_CLIENT_SECRET')
  }
  const sig = computeHmacHex(DJOMY_CLIENT_ID, DJOMY_CLIENT_SECRET)
  return `${DJOMY_CLIENT_ID}:${sig}`
}

/**
 * Authenticate and retrieve a short-lived Bearer token.
 * Per spec: POST /v1/auth with X-API-KEY header (no body needed).
 */
export async function getDjomyAccessToken(): Promise<string> {
  const apiKey = buildApiKeyHeader()

  const res = await fetch(`${DJOMY_BASE_URL}/v1/auth`, {
    method: 'POST',
    headers: {
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json',
    },
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Djomy auth failed (${res.status}): ${text}`)
  }

  const result = (await res.json()) as DjomyResponse<{ accessToken: string }>
  if (!result.success) {
    throw new Error(`Djomy auth error: ${result.message}`)
  }

  return result.data.accessToken
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

// ---- Payment gateway (redirect flow) -----------------------------------

/**
 * Create a gateway payment — the recommended integration path.
 * Djomy handles payment method selection and OTP on their portal.
 * → Redirect the user to data.redirectUrl immediately.
 */
export async function createDjomyGatewayPayment(
  input: CreatePaymentGatewayInput
): Promise<DjomyGatewayData> {
  const headers = await authHeaders()

  const res = await fetch(`${DJOMY_BASE_URL}/v1/payments/gateway`, {
    method: 'POST',
    headers,
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
  })

  const result = (await res.json()) as DjomyResponse<DjomyGatewayData>

  if (!result.success) {
    throw new Error(
      `Djomy create_payment_gateway error: ${result.error?.message ?? result.message}`
    )
  }

  return result.data
}

// ---- Verify payment ----------------------------------------------------

/**
 * Server-side verification — always call before fulfilling an order.
 * Only status === 'SUCCESS' means payment is confirmed.
 */
export async function verifyDjomyPayment(transactionId: string): Promise<DjomyVerifyData> {
  const headers = await authHeaders()

  const res = await fetch(`${DJOMY_BASE_URL}/v1/payments/${transactionId}/status`, {
    method: 'GET',
    headers,
  })

  const result = (await res.json()) as DjomyResponse<DjomyVerifyData>

  if (!result.success) {
    throw new Error(`Djomy verify_payment error: ${result.error?.message ?? result.message}`)
  }

  return result.data
}

// ---- Webhook signature -------------------------------------------------

/**
 * Verify Djomy webhook signature.
 * Header format: X-Webhook-Signature: v1:<hex>
 * Algorithm: HMAC-SHA256(rawBody, DJOMY_CLIENT_SECRET)
 */
export function verifyDjomyWebhookSignature(rawBody: string, signatureHeader: string): boolean {
  const secret = process.env.DJOMY_WEBHOOK_SECRET || DJOMY_CLIENT_SECRET
  if (!secret) return false

  // Parse "v1:<hex>" format
  const match = signatureHeader.match(/^v1:([a-f0-9]+)$/i)
  if (!match) return false

  const receivedHex = match[1]
  const expected = computeHmacHex(rawBody, secret)
  return crypto.timingSafeEqual(Buffer.from(receivedHex, 'hex'), Buffer.from(expected, 'hex'))
}
