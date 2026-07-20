export const APP_NAME = 'Fotia'
const APP_URL = Deno.env.get('NEXT_PUBLIC_APP_URL') || 'https://myfotia.com'
const SUPPORT_EMAIL = 'support@myfotia.com'

const baseTemplate = (content: string, preheader: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${APP_NAME}</title>
</head>
<body style="margin:0;padding:0;font-family:'Helvetica Neue',Arial,sans-serif;background:#f5f5f5;">
  <span style="display:none !important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;line-height:0;overflow:hidden;mso-hide:all">${preheader}</span>
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#C8482E,#A93821);padding:40px 32px;text-align:center;">
      <h1 style="margin:0;font-size:28px;font-weight:800;color:#fff;letter-spacing:-0.5px;">
        ${APP_NAME}
      </h1>
    </div>

    <!-- Body -->
    <div style="padding:32px;">
      ${content}
    </div>

    <!-- Footer -->
    <div style="padding:20px 32px;border-top:1px solid #f0f0f0;text-align:center;">
      <p style="margin:0 0 8px;font-size:12px;color:#888;">
        Besoin d'aide ? Contactez-nous à <a href="mailto:${SUPPORT_EMAIL}" style="color:#C8482E;">${SUPPORT_EMAIL}</a>
      </p>
      <p style="margin:0;font-size:12px;color:#aaa;">
        © ${new Date().getFullYear()} ${APP_NAME}. Tous droits réservés.
      </p>
    </div>
  </div>
</body>
</html>
`

export function getWelcomeEmail(userName: string) {
  const content = `
    <p style="font-size:16px;color:#333;margin:0 0 20px;">Bonjour <strong>${userName}</strong>,</p>
    <p style="font-size:15px;color:#555;line-height:1.6;margin:0 0 24px;">
      Bienvenue sur ${APP_NAME} ! Votre compte a été créé avec succès. 
      Commencez dès maintenant à créer vos premières galeries et partager vos photos avec vos clients.
    </p>
    <div style="text-align:center;">
      <a href="${APP_URL}/dashboard"
         style="display:inline-block;background:#C8482E;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:14px 32px;border-radius:99px;">
        Accéder à mon tableau de bord
      </a>
    </div>
  `
  return {
    subject: `Bienvenue sur ${APP_NAME} ! 🎉`,
    html: baseTemplate(content, `Bienvenue sur ${APP_NAME} !`)
  }
}

export function getVerifyEmail(link: string) {
  const content = `
    <h2 style="margin:0 0 20px;font-size:20px;color:#333;text-align:center;">Vérification de votre adresse e-mail</h2>
    <p style="font-size:15px;color:#555;line-height:1.6;margin:0 0 24px;text-align:center;">
      Merci de vous être inscrit sur ${APP_NAME}. Veuillez cliquer sur le bouton ci-dessous pour vérifier votre adresse e-mail et activer votre compte.
    </p>
    <div style="text-align:center;">
      <a href="${link}"
         style="display:inline-block;background:#C8482E;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:14px 32px;border-radius:99px;">
        Vérifier mon e-mail
      </a>
    </div>
    <p style="font-size:13px;color:#888;margin:24px 0 0;text-align:center;">
      Si vous n'avez pas créé ce compte, vous pouvez ignorer cet e-mail.
    </p>
  `
  return {
    subject: `Vérifiez votre adresse e-mail pour ${APP_NAME}`,
    html: baseTemplate(content, 'Confirmez votre adresse e-mail')
  }
}

export function getResetPasswordEmail(link: string) {
  const content = `
    <h2 style="margin:0 0 20px;font-size:20px;color:#333;text-align:center;">Réinitialisation de mot de passe</h2>
    <p style="font-size:15px;color:#555;line-height:1.6;margin:0 0 24px;text-align:center;">
      Vous avez demandé à réinitialiser votre mot de passe pour votre compte ${APP_NAME}. Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe.
    </p>
    <div style="text-align:center;">
      <a href="${link}"
         style="display:inline-block;background:#333;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:14px 32px;border-radius:99px;">
        Réinitialiser mon mot de passe
      </a>
    </div>
    <p style="font-size:13px;color:#888;margin:24px 0 0;text-align:center;">
      Ce lien expirera dans 24 heures. Si vous n'avez pas fait cette demande, vous pouvez ignorer cet e-mail en toute sécurité.
    </p>
  `
  return {
    subject: `Réinitialisation de votre mot de passe ${APP_NAME}`,
    html: baseTemplate(content, 'Demande de réinitialisation de mot de passe')
  }
}

export function getPaymentSuccessEmail(userName: string, plan: string, amount: number, currency: string, expiresAt: string) {
  const formattedExpiry = new Date(expiresAt).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric'
  })
  const formattedAmount = new Intl.NumberFormat('fr-FR').format(amount)
  
  const content = `
    <p style="font-size:16px;color:#333;margin:0 0 20px;">Bonjour <strong>${userName}</strong>,</p>
    <p style="font-size:15px;color:#555;line-height:1.6;margin:0 0 24px;">
      Votre paiement a été confirmé avec succès ! Votre abonnement <strong>${plan.toUpperCase()}</strong> est maintenant actif.
    </p>
    <div style="background:#f8f9fa;border-radius:12px;padding:20px;margin:0 0 24px;">
      <table style="width:100%;border-collapse:collapse;font-size:14px;color:#555;">
        <tr>
          <td style="padding:8px 0;">Plan</td>
          <td style="padding:8px 0;text-align:right;font-weight:700;color:#333;">Premium ${plan.toUpperCase()}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;border-top:1px solid #e5e5e5;">Montant</td>
          <td style="padding:8px 0;border-top:1px solid #e5e5e5;text-align:right;font-weight:700;color:#333;">${formattedAmount} ${currency}</td>
        </tr>
        <tr>
          <td style="padding:8px 0;border-top:1px solid #e5e5e5;">Valable jusqu'au</td>
          <td style="padding:8px 0;border-top:1px solid #e5e5e5;text-align:right;font-weight:700;color:#333;">${formattedExpiry}</td>
        </tr>
      </table>
    </div>
    <p style="font-size:14px;color:#888;line-height:1.5;margin:0 0 24px;">
      Vous pouvez maintenant profiter de toutes les fonctionnalités Premium.
    </p>
    <div style="text-align:center;">
      <a href="${APP_URL}/dashboard"
         style="display:inline-block;background:#C8482E;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:14px 32px;border-radius:99px;">
        Accéder à mon compte
      </a>
    </div>
  `
  return {
    subject: `✅ Paiement confirmé — ${APP_NAME} Premium ${plan.toUpperCase()}`,
    html: baseTemplate(content, 'Votre reçu de paiement')
  }
}

export function getPremiumUpgradeEmail(userName: string, plan: string) {
  const content = `
    <h2 style="margin:0 0 20px;font-size:20px;color:#333;text-align:center;">Bienvenue chez les Pros ! 🚀</h2>
    <p style="font-size:16px;color:#333;margin:0 0 20px;">Félicitations <strong>${userName}</strong>,</p>
    <p style="font-size:15px;color:#555;line-height:1.6;margin:0 0 24px;">
      Votre compte vient d'être mis à niveau vers le plan <strong>Premium ${plan.toUpperCase()}</strong>. Vous avez désormais accès à de nouvelles fonctionnalités exclusives :
    </p>
    <ul style="font-size:15px;color:#555;line-height:1.6;margin:0 0 24px;padding-left:20px;">
      <li style="margin-bottom:8px;">Galeries illimitées</li>
      <li style="margin-bottom:8px;">Stockage étendu (jusqu'à 100Go pour Pro)</li>
      <li style="margin-bottom:8px;">Protection par mot de passe et plus de limites de photos</li>
    </ul>
    <div style="text-align:center;">
      <a href="${APP_URL}/dashboard"
         style="display:inline-block;background:#C8482E;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:14px 32px;border-radius:99px;">
        Découvrir mes avantages
      </a>
    </div>
  `
  return {
    subject: `Votre compte ${APP_NAME} est maintenant Premium ${plan.toUpperCase()} !`,
    html: baseTemplate(content, 'Bienvenue chez les Pros !')
  }
}
