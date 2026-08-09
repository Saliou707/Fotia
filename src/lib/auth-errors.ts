/**
 * Traduction des messages d'erreur Supabase Auth en français.
 *
 * Les erreurs remontées par `supabase.auth.*` sont des messages anglais
 * (ex: « User already registered »). Ce helper les traduit pour que toutes
 * les pages (login, signup, forgot-password, reset-password) affichent des
 * messages 100 % français — au lieu de laisser passer le texte brut anglais.
 *
 * Règles :
 *  - Correspondance par motif (regex) insensible à la casse pour couvrir
 *    les variantes de libellés selon la version de Supabase.
 *  - Si le message contient déjà des accents français, il est considéré
 *    comme déjà traduit et renvoyé tel quel (aucune double traduction).
 *  - Sinon, message générique français en dernier recours.
 */

const AUTH_ERROR_MAP: Array<{
  pattern: RegExp
  french: string | ((m: RegExpMatchArray) => string)
}> = [
  // Connexion
  {
    pattern: /invalid login credentials/i,
    french:
      'Email ou mot de passe incorrect. Si vous avez utilisé Google pour vous inscrire, cliquez sur « Continuer avec Google ».',
  },
  {
    pattern: /email not confirmed/i,
    french: 'Veuillez confirmer votre adresse email avant de vous connecter.',
  },
  {
    pattern: /user already registered/i,
    french: 'Un compte existe déjà avec cette adresse email.',
  },
  {
    pattern: /password should be at least (\d+) characters/i,
    french: (m: RegExpMatchArray) =>
      `Le mot de passe doit contenir au moins ${m[1]} caractères.`,
  },
  {
    pattern: /new password should be different from the old password/i,
    french: 'Le nouveau mot de passe doit être différent de l’ancien.',
  },
  {
    pattern: /invalid email|unable to validate email address/i,
    french: 'Adresse email invalide. Vérifiez le format (ex : nom@exemple.com).',
  },
  {
    pattern: /user not found|no user found/i,
    french: 'Aucun compte trouvé avec cette adresse email.',
  },
  {
    pattern: /signup not allowed|signups? (are )?disabled|new users? not allowed/i,
    french: 'La création de compte est temporairement désactivée. Réessayez plus tard.',
  },
  {
    pattern: /email rate limit exceeded|too many requests|request was throttled|try again in (\d+) seconds/i,
    french:
      'Trop de tentatives. Veuillez patienter quelques minutes avant de réessayer.',
  },
  {
    pattern: /for security purposes, you can only request this after/i,
    french:
      'Trop de demandes. Veuillez patienter une minute avant de réessayer.',
  },
  {
    pattern: /token has expired or is invalid|invalid or expired|link.*expired|recovery.*invalid/i,
    french: 'Ce lien est invalide ou a expiré. Veuillez en demander un nouveau.',
  },
  {
    pattern: /session.*expired|jwt expired|auth session missing/i,
    french: 'Votre session a expiré. Veuillez vous reconnecter.',
  },
  {
    pattern: /provider is not enabled|email provider.*not.*enabled|oauth.*not.*enabled/i,
    french: 'Cette méthode de connexion n’est pas disponible pour le moment.',
  },
  {
    pattern: /database error saving new user|error creating user|failed to create user/i,
    french: 'Erreur lors de la création du compte. Veuillez réessayer.',
  },
  {
    pattern: /invalid.*refresh token|refresh token not found|invalid grant/i,
    french: 'Votre session a expiré. Veuillez vous reconnecter.',
  },
  {
    pattern: /unable to fetch user|user not found in database/i,
    french: 'Impossible de récupérer votre compte. Veuillez réessayer.',
  },
  {
    pattern: /already.*confirmed|email.*already.*confirm/i,
    french: 'Cette adresse email a déjà été confirmée.',
  },
]

/**
 * Détecte si une chaîne est déjà en français.
 * Méthode : caractères accentués français OU mots français fréquents sans
 * accent (ex. « Galerie introuvable. », « Le titre est requis. ») — permet
 * de laisser passer nos propres messages déjà traduits sans les écraser.
 */
const FRENCH_WORDS = /(erreur|galerie|veuillez|réessayer|réessayez|introuvable|requis|manquant|dépassé|autorisé|invalide|téléchargement|favori|sélectionné|abonnement|paiement|création|suppression|compte|mot de passe)/i

function looksFrench(message: string): boolean {
  if (/[àâäéèêëîïôöùûüçœ]/i.test(message)) return true
  return FRENCH_WORDS.test(message)
}

/**
 * Traduit un message d'erreur Supabase Auth en français.
 * Renvoie toujours un message lisible par l'utilisateur.
 */
export function translateAuthError(message: string | null | undefined): string {
  const raw = (message ?? '').trim()

  if (!raw) {
    return 'Une erreur est survenue. Veuillez réessayer.'
  }

  // Déjà en français (accents présents) → on le garde tel quel.
  if (looksFrench(raw)) {
    return raw
  }

  for (const entry of AUTH_ERROR_MAP) {
    const match = raw.match(entry.pattern)
    if (match) {
      return typeof entry.french === 'function'
        ? entry.french(match)
        : entry.french
    }
  }

  // Dernier recours : message générique français (on ne laisse jamais
  // transparaître un message brut anglais).
  return 'Une erreur est survenue. Veuillez réessayer.'
}
