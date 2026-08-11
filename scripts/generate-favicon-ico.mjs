// Génère src/app/favicon.ico (multi-tailles 16/32/48/64 px) depuis public/favicon.png.
// La convention de fichier Next.js app/favicon.ico génère automatiquement
// <link rel="icon" href="/favicon.ico" sizes="any" /> dans le <head>.
// Les ICO modernes acceptent des images PNG embarquées (Windows Vista+ et tous les
// navigateurs actuels) — sharp ne sait pas exporter en .ico, on assemble donc le
// conteneur ICO manuellement (ICONDIR + ICONDIRENTRY + données PNG).
import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(import.meta.dirname, '..')
const SOURCE = path.join(ROOT, 'public', 'favicon.png')
const OUTPUT = path.join(ROOT, 'src', 'app', 'favicon.ico')
const SIZES = [16, 32, 48, 64]

if (!fs.existsSync(SOURCE)) {
  console.error(`Source introuvable : ${SOURCE}`)
  process.exit(1)
}

// 1. Génère un PNG par taille
// ensureAlpha() → PNG RGBA obligatoire : le décodeur ICO de Next.js (sharp/libvips)
// rejette les PNG RGB embarqués dans un .ico (« The PNG is not in RGBA format! »).
const pngs = []
for (const size of SIZES) {
  pngs.push(await sharp(SOURCE).resize(size, size).ensureAlpha().png().toBuffer())
}

// 2. Assemble le conteneur ICO
const count = pngs.length
const header = Buffer.alloc(6)
header.writeUInt16LE(0, 0) // reserved
header.writeUInt16LE(1, 2) // type = 1 (icône)
header.writeUInt16LE(count, 4) // nombre d'images

const entries = []
const dataParts = []
let offset = 6 + 16 * count

pngs.forEach((png, i) => {
  const size = SIZES[i]
  const entry = Buffer.alloc(16)
  entry.writeUInt8(size >= 256 ? 0 : size, 0) // largeur (0 = 256)
  entry.writeUInt8(size >= 256 ? 0 : size, 1) // hauteur
  entry.writeUInt8(0, 2) // palette
  entry.writeUInt8(0, 3) // réservé
  entry.writeUInt16LE(1, 4) // plans
  entry.writeUInt16LE(32, 6) // bits par pixel
  entry.writeUInt32LE(png.length, 8) // taille des données
  entry.writeUInt32LE(offset, 12) // offset dans le fichier
  entries.push(entry)
  dataParts.push(png)
  offset += png.length
})

fs.writeFileSync(OUTPUT, Buffer.concat([header, ...entries, ...dataParts]))

// 3. Vérification : relit le fichier et affiche les entrées
const ico = fs.readFileSync(OUTPUT)
const n = ico.readUInt16LE(4)
console.log(`✅ ${OUTPUT} généré (${(ico.length / 1024).toFixed(1)} Ko, ${n} image(s)) :`)
for (let i = 0; i < n; i++) {
  const e = ico.slice(6 + i * 16, 6 + (i + 1) * 16)
  console.log(`   ${e.readUInt8(0) || 256}x${e.readUInt8(1) || 256}px — ${e.readUInt32LE(8)} octets`)
}
