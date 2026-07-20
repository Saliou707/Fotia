/**
 * PaymentProvider — Interface abstraite multi-provider
 *
 * Permet de plugger d'autres fournisseurs de paiement (Stripe, Flutterwave, etc.)
 * sans modifier le code métier de Fotia.
 *
 * Usage :
 *   const provider = getPaymentProvider('djomy')
 *   const { checkoutUrl } = await provider.createCheckout(...)
 */

export type PaymentStatus = 'success' | 'failed' | 'pending' | 'cancelled' | 'refunded'
export type SupportedProvider = 'djomy'

// ---- Input / Output types -----------------------------------------------

export interface CreateCheckoutInput {
  amount: number
  currency: string
  countryCode: string
  payerPhone: string
  description: string
  merchantReference: string
  returnUrl: string
  cancelUrl: string
  metadata?: Record<string, string | number | boolean>
}

export interface CreateCheckoutOutput {
  /** URL vers laquelle rediriger l'utilisateur */
  checkoutUrl: string
  /** Identifiant de transaction côté provider */
  providerTransactionId: string
}

export interface VerifyPaymentOutput {
  status: PaymentStatus
  paidAmount: number
  currency: string
  providerTransactionId: string
}

// ---- Interface ----------------------------------------------------------

export interface IPaymentProvider {
  readonly name: SupportedProvider

  /**
   * Initier un paiement et retourner l'URL de redirection.
   */
  createCheckout(input: CreateCheckoutInput): Promise<CreateCheckoutOutput>

  /**
   * Vérifier l'état d'un paiement côté serveur.
   * Toujours appeler avant d'activer un abonnement.
   */
  verifyPayment(providerTransactionId: string): Promise<VerifyPaymentOutput>

  /**
   * Valider la signature d'un webhook entrant.
   * @param rawBody   Corps brut (string) de la requête HTTP
   * @param signature Valeur de l'en-tête de signature
   */
  verifyWebhookSignature(rawBody: string, signature: string): boolean
}

// ---- Djomy Provider -----------------------------------------------------

import {
  createDjomyGatewayPayment,
  verifyDjomyPayment,
  verifyDjomyWebhookSignature,
  type DjomyPaymentStatus,
} from '@/lib/djomy'

function mapDjomyStatus(s: DjomyPaymentStatus): PaymentStatus {
  switch (s) {
    case 'SUCCESS':
    case 'CAPTURED':
      return 'success'
    case 'FAILED':
    case 'TIMEOUT':
      return 'failed'
    case 'CANCELLED':
      return 'cancelled'
    case 'REFUNDED':
      return 'refunded'
    default:
      return 'pending'
  }
}

class DjomyProvider implements IPaymentProvider {
  readonly name: SupportedProvider = 'djomy'

  async createCheckout(input: CreateCheckoutInput): Promise<CreateCheckoutOutput> {
    const data = await createDjomyGatewayPayment({
      amount: input.amount,
      countryCode: input.countryCode,
      payerNumber: input.payerPhone,
      description: input.description,
      merchantPaymentReference: input.merchantReference,
      returnUrl: input.returnUrl,
      cancelUrl: input.cancelUrl,
      metadata: input.metadata,
    })

    const checkoutUrl = data.redirectUrl || data.paymentUrl
    if (!checkoutUrl) {
      throw new Error('[DjomyProvider] No checkout URL returned by Djomy')
    }

    return {
      checkoutUrl,
      providerTransactionId: data.transactionId,
    }
  }

  async verifyPayment(providerTransactionId: string): Promise<VerifyPaymentOutput> {
    const data = await verifyDjomyPayment(providerTransactionId)
    return {
      status: mapDjomyStatus(data.status),
      paidAmount: data.receivedAmount ?? data.paidAmount,
      currency: data.currency,
      providerTransactionId: data.transactionId,
    }
  }

  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    return verifyDjomyWebhookSignature(rawBody, signature)
  }
}

// ---- Factory ------------------------------------------------------------

const providers: Record<SupportedProvider, IPaymentProvider> = {
  djomy: new DjomyProvider(),
}

/**
 * Retourne le provider de paiement demandé.
 * Lance une erreur si le provider n'est pas supporté.
 */
export function getPaymentProvider(name: SupportedProvider): IPaymentProvider {
  const provider = providers[name]
  if (!provider) {
    throw new Error(`[PaymentProvider] Provider '${name}' not supported`)
  }
  return provider
}

/**
 * Provider par défaut (Djomy pour Fotia).
 */
export const defaultPaymentProvider: IPaymentProvider = providers.djomy
