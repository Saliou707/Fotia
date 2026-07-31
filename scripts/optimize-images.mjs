/**
 * Optimisation des images public/ (à exécuter : node scripts/optimize-images.mjs)
 * - Convertit les grosses photos en WebP (~max 1200px, qualité 72)
 * - Optimise logo.png en place (resize 400px, reste en PNG pour la transparence)
 */
import sharp from 'sharp'
import { existsSync, statSync, renameSync, rmSync } from 'node:fs'
import { join } from 'node:path'

const PUBLIC = join(process.cwd(), 'public')

const PHOTOS = [
  'media__1784566765630.jpg',
  'media__1784567428078.jpg',
  'media__1784567428152.jpg',
  'media__1784567428163.jpg',
  'concert_stage_photo_1784566103244.png',
  'corporate_gala_photo_1784566134178.png',
  'nightclub_party_photo_1784566118666.png',
  'wedding_reception_photo_1784566087301.png',
]

let totalBefore = 0
let totalAfter = 0

async function main() {
  console.log('→ Conversion photos → WebP...')
  for (const name of PHOTOS) {
    const src = join(PUBLIC, name)
    if (!existsSync(src)) {
      console.log(`  ⚠️ absent: ${name}`)
      continue
    }
    const out = join(PUBLIC, name.replace(/\.(jpg|jpeg|png)$/i, '.webp'))
    const before = statSync(src).size
    await sharp(src)
      .rotate()
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 72 })
      .toFile(out)
    const after = statSync(out).size
    totalBefore += before
    totalAfter += after
    console.log(`  ${name} → ${name.replace(/\.(jpg|png)$/i, '.webp')}  ${(before/1024).toFixed(0)} Ko → ${(after/1024).toFixed(0)} Ko`)
  }

  // Logo : optimise le PNG en place (conserve transparence, 400px suffit)
  const logoPath = join(PUBLIC, 'logo.png')
  if (existsSync(logoPath)) {
    const before = statSync(logoPath).size
    await sharp(logoPath)
      .resize({ width: 400, withoutEnlargement: true })
      .png({ compressionLevel: 9, palette: true })
      .toFile(join(PUBLIC, 'logo-opt.png'))
    const after = statSync(join(PUBLIC, 'logo-opt.png')).size
    // Remplace l'original par la version optimisée
    rmSync(logoPath)
    renameSync(join(PUBLIC, 'logo-opt.png'), logoPath)
    totalBefore += before
    totalAfter += after
    console.log(`  logo.png ${(before/1024).toFixed(0)} Ko → ${(after/1024).toFixed(0)} Ko (optimisé en place)`)
  }

  console.log(`\n✅ Terminé — ${(totalBefore/1024/1024).toFixed(2)} Mo → ${(totalAfter/1024/1024).toFixed(2)} Mo`)
}

main().catch((e) => { console.error(e); process.exit(1) })
