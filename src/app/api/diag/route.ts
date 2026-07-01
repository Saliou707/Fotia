import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { S3Client, ListBucketsCommand, HeadBucketCommand, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'

interface DiagResult {
  ok: boolean
  message: string
  detail?: string
  ms?: number
}

async function checkSupabaseConnection(): Promise<DiagResult> {
  const t = Date.now()
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.from('galleries').select('id').limit(1)
    if (error) return { ok: false, message: 'Erreur requête Supabase', detail: error.message, ms: Date.now() - t }
    return { ok: true, message: 'Connexion Supabase OK', detail: `Table galleries accessible`, ms: Date.now() - t }
  } catch (e: unknown) {
    return { ok: false, message: 'Exception Supabase', detail: e instanceof Error ? e.message : String(e), ms: Date.now() - t }
  }
}

async function checkSupabaseTables(): Promise<DiagResult> {
  const t = Date.now()
  try {
    const supabase = await createClient()
    const tables = ['galleries', 'gallery_images', 'favorites', 'profiles']
    const results: string[] = []
    let allOk = true

    for (const table of tables) {
      const { error, count } = await supabase.from(table).select('*', { count: 'exact', head: true })
      if (error) {
        results.push(`❌ ${table}: ${error.message}`)
        allOk = false
      } else {
        results.push(`✅ ${table} (${count ?? 0} lignes)`)
      }
    }

    return {
      ok: allOk,
      message: allOk ? 'Toutes les tables existent' : 'Certaines tables manquantes',
      detail: results.join(' | '),
      ms: Date.now() - t,
    }
  } catch (e: unknown) {
    return { ok: false, message: 'Exception vérification tables', detail: e instanceof Error ? e.message : String(e), ms: Date.now() - t }
  }
}

async function checkSupabaseAuth(): Promise<DiagResult> {
  const t = Date.now()
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.getSession()
    if (error) return { ok: false, message: 'Erreur auth Supabase', detail: error.message, ms: Date.now() - t }
    return {
      ok: true,
      message: 'Système d\'authentification OK',
      detail: data.session ? `Session active: ${data.session.user.email}` : 'Aucune session active (normal)',
      ms: Date.now() - t,
    }
  } catch (e: unknown) {
    return { ok: false, message: 'Exception auth', detail: e instanceof Error ? e.message : String(e), ms: Date.now() - t }
  }
}

async function checkR2Connection(): Promise<DiagResult> {
  const t = Date.now()
  try {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
    const accessKey = process.env.R2_ACCESS_KEY_ID
    const secretKey = process.env.R2_SECRET_ACCESS_KEY
    const bucket = process.env.R2_BUCKET_NAME

    if (!accountId || !accessKey || !secretKey || !bucket) {
      return { ok: false, message: 'Variables R2 manquantes', detail: `ACCOUNT_ID:${!!accountId} KEY:${!!accessKey} SECRET:${!!secretKey} BUCKET:${!!bucket}`, ms: Date.now() - t }
    }

    const client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
    })

    await client.send(new HeadBucketCommand({ Bucket: bucket }))
    return { ok: true, message: `Bucket R2 "${bucket}" accessible`, detail: `Endpoint: ${accountId}.r2.cloudflarestorage.com`, ms: Date.now() - t }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    if (msg.includes('403') || msg.includes('Forbidden')) {
      return { ok: false, message: 'Accès R2 refusé (403)', detail: 'Vérifiez les permissions de la clé API R2', ms: Date.now() - t }
    }
    if (msg.includes('404') || msg.includes('NoSuchBucket')) {
      return { ok: false, message: 'Bucket R2 introuvable', detail: `Le bucket "${process.env.R2_BUCKET_NAME}" n'existe pas`, ms: Date.now() - t }
    }
    return { ok: false, message: 'Erreur connexion R2', detail: msg, ms: Date.now() - t }
  }
}

async function checkR2WriteRead(): Promise<DiagResult> {
  const t = Date.now()
  try {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID!
    const bucket = process.env.R2_BUCKET_NAME!
    const testKey = `__diag_test_${Date.now()}.txt`

    const client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID!, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY! },
    })

    // Write test
    await client.send(new PutObjectCommand({
      Bucket: bucket, Key: testKey,
      Body: 'fotia-diagnostic-test', ContentType: 'text/plain',
    }))

    // Check public URL
    const publicUrl = process.env.R2_PUBLIC_URL
    const testUrl = `${publicUrl}/${testKey}`

    // Delete test
    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: testKey }))

    return {
      ok: true,
      message: 'Lecture/Écriture R2 fonctionnelle',
      detail: `Fichier écrit et supprimé. URL publique: ${publicUrl}`,
      ms: Date.now() - t,
    }
  } catch (e: unknown) {
    return { ok: false, message: 'Erreur écriture R2', detail: e instanceof Error ? e.message : String(e), ms: Date.now() - t }
  }
}

async function checkR2PublicUrl(): Promise<DiagResult> {
  const t = Date.now()
  try {
    const publicUrl = process.env.R2_PUBLIC_URL
    const nextPublicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL

    if (!publicUrl) {
      return { ok: false, message: 'R2_PUBLIC_URL manquante', detail: 'Ajoutez R2_PUBLIC_URL dans .env.local', ms: Date.now() - t }
    }

    const checks: string[] = []
    checks.push(`R2_PUBLIC_URL: ${publicUrl}`)

    if (!nextPublicUrl) {
      checks.push('⚠️ NEXT_PUBLIC_R2_PUBLIC_URL manquante (nécessaire côté client)')
    } else {
      checks.push(`NEXT_PUBLIC_R2_PUBLIC_URL: ${nextPublicUrl}`)
    }

    return {
      ok: !!nextPublicUrl,
      message: nextPublicUrl ? 'URL publique R2 configurée' : 'NEXT_PUBLIC_R2_PUBLIC_URL manquante',
      detail: checks.join(' | '),
      ms: Date.now() - t,
    }
  } catch (e: unknown) {
    return { ok: false, message: 'Erreur vérification URL', detail: e instanceof Error ? e.message : String(e), ms: Date.now() - t }
  }
}

export async function GET() {
  const checks = await Promise.allSettled([
    checkSupabaseConnection(),
    checkSupabaseTables(),
    checkSupabaseAuth(),
    checkR2Connection(),
    checkR2WriteRead(),
    checkR2PublicUrl(),
  ])

  const labels = [
    'supabase_connection',
    'supabase_tables',
    'supabase_auth',
    'r2_connection',
    'r2_write_read',
    'r2_public_url',
  ]

  const results: Record<string, DiagResult> = {}
  checks.forEach((r, i) => {
    if (r.status === 'fulfilled') {
      results[labels[i]] = r.value
    } else {
      results[labels[i]] = { ok: false, message: 'Exception non gérée', detail: String(r.reason) }
    }
  })

  const allOk = Object.values(results).every(r => r.ok)
  const score = Object.values(results).filter(r => r.ok).length

  return NextResponse.json({
    status: allOk ? 'OK' : 'PARTIAL',
    score: `${score}/${Object.keys(results).length}`,
    timestamp: new Date().toISOString(),
    checks: results,
  }, { status: allOk ? 200 : 207 })
}
