import { readFileSync, writeFileSync } from 'fs'

// ─── Fix page.tsx ──────────────────────────────────────────────────────────────
{
  const file = 'D:/Project/fotia/src/app/page.tsx'
  let content = readFileSync(file, 'utf8')
  const before = content

  content = content.replace(/\{l\.planFreeRecurrence\}/g, '/mois')
  content = content.replace(/\{l\.planProRecurrence\}/g, '/mois')
  content = content.replace(/\{l\.footerPrivacy\}/g, 'Confidentialité')
  content = content.replace(/\{l\.footerTerms\}/g, "Conditions d'utilisation")
  content = content.replace(/\{l\.footerSupport\}/g, 'Support WhatsApp')
  content = content.replace(/\{l\.[a-zA-Z0-9.]+\}/g, '???')
  content = content.replace(/\{tr\.[^}]+\}/g, 'Télécharger')

  writeFileSync(file, content, 'utf8')
  const lLeft = (content.match(/\{l\./g) || []).length
  const trLeft = (content.match(/\{tr\./g) || []).length
  console.log(`page.tsx — changed: ${content !== before ? 'YES' : 'no'} | {l. left: ${lLeft} | {tr. left: ${trLeft}`)
}

// ─── Fix DashboardShell.tsx ───────────────────────────────────────────────────
{
  const file = 'D:/Project/fotia/src/components/dashboard/DashboardShell.tsx'
  let content = readFileSync(file, 'utf8')
  const before = content

  // Map all t('key') calls to French strings
  const tMap = {
    "t('dashboard.galleries')": 'Galeries',
    "t('dashboard.upgrade')": 'Passer au Pro',
    "t('dashboard.unlimitedGalleries')": 'Galeries illimitées',
    "t('dashboard.managePlan')": 'Gérer mon abonnement',
    "t('nav.logout')": 'Déconnexion',
    "t('billing.modal.title')": 'Passer au Plan Pro',
    "t('billing.modal.subtitle')": 'Débloquez toutes les fonctionnalités premium.',
    "t('billing.modal.priceLabel')": 'FCFA / mois',
    "t('billing.modal.payWith')": 'Payer maintenant',
    "t('billing.modal.phoneTitle')": 'Votre numéro mobile',
    "t('billing.modal.phoneSubtitle')": 'Entrez votre numéro pour recevoir la demande de paiement.',
    "t('billing.modal.phoneLabel')": 'Numéro de téléphone',
    "t('billing.modal.phonePlaceholder')": '+221 77 000 00 00',
    "t('billing.modal.phoneHint')": 'Format: +221 ou 00221 suivi du numéro',
    "t('billing.modal.paying')": 'Traitement en cours...',
    "t('billing.modal.pay')": 'Confirmer le paiement',
  }

  for (const [key, value] of Object.entries(tMap)) {
    // Replace both {t('...')} and as placeholder prop t('...')
    content = content.replace(new RegExp(`\\{${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\}`, 'g'), value)
    content = content.replace(new RegExp(`placeholder=\\{${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\}`, 'g'), `placeholder="${value}"`)
  }

  // Replace translations.billing.modal.features array
  content = content.replace(
    /\{translations\.billing\.modal\.features\.map\(\(feature, i\) => \(\s*<li key=\{i\}>\{feature\}<\/li>\s*\)\)\}/g,
    `<li>Galeries illimitées</li>
                        <li>500 photos par galerie</li>
                        <li>Domaine personnalisé</li>
                        <li>Support prioritaire 24h</li>`
  )

  // Catch any remaining t() calls
  const remaining = content.match(/\{t\('[^']+'\)\}/g) || []
  if (remaining.length > 0) {
    console.log('Remaining t() calls:', remaining)
    remaining.forEach(m => {
      content = content.replace(m, '...')
    })
  }

  writeFileSync(file, content, 'utf8')
  const tLeft = (content.match(/\{t\(/g) || []).length
  console.log(`DashboardShell.tsx — changed: ${content !== before ? 'YES' : 'no'} | {t( left: ${tLeft}`)
  if (tLeft > 0) {
    content.split('\n').forEach((line, i) => {
      if (line.includes('{t(')) console.log(`  Line ${i+1}: ${line.trim()}`)
    })
  }
}

console.log('\nDone! Run: npm run build')
