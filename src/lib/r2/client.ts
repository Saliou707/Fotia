import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

function getR2Client() {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  })
}

const BUCKET = process.env.R2_BUCKET_NAME!
const PUBLIC_URL = process.env.R2_PUBLIC_URL || `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.dev`

// ---- List objects in bucket ----
export async function listImages(prefix: string): Promise<{ key: string; size: number }[]> {
  const client = getR2Client()
  const command = new ListObjectsV2Command({
    Bucket: BUCKET,
    Prefix: prefix,
  })

  const response = await client.send(command)
  return (response.Contents || []).map(obj => ({
    key: obj.Key || '',
    size: obj.Size || 0,
  }))
}

// Format: photos/{galleryTitle}/{imageId}.ext
// Using galleryTitle as folder makes R2 human-readable
export function buildImageKey(userId: string, galleryId: string, imageId: string, filename: string, galleryTitle?: string) {
  const ext = filename.split('.').pop() ?? 'jpg'
  const folder = galleryTitle ? slugToSafeFolder(galleryTitle) : galleryId
  return `photos/${folder}/${imageId}.${ext}`
}

export function buildThumbnailKey(userId: string, galleryId: string, imageId: string, galleryTitle?: string) {
  const folder = galleryTitle ? slugToSafeFolder(galleryTitle) : galleryId
  return `thumbnails/${folder}/${imageId}.webp`
}

// Sanitize slug to be safe as a folder name
function slugToSafeFolder(slug: string): string {
  return slug
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, '-') // replace unsafe chars with -
    .replace(/-+/g, '-')           // collapse multiple dashes
    .replace(/^-|-$/g, '')         // trim leading/trailing dashes
    .substring(0, 80)              // limit length
}

// ---- Public URL ----
export function getPublicUrl(key: string): string {
  return `${PUBLIC_URL}/${key}`
}

let cachedOffset = 0;
let hasCheckedTime = false;

async function getSigningDate(): Promise<Date> {
  if (!hasCheckedTime) {
    const urls = [
      'https://cloudflare.com',
      'https://www.google.com',
      'https://1.1.1.1'
    ]
    for (const url of urls) {
      try {
        const res = await fetch(url, { 
          method: 'HEAD', 
          cache: 'no-store',
          // Use standard AbortSignal.timeout to prevent long hangs (Node 18+)
          signal: AbortSignal.timeout(2000)
        })
        const dateHeader = res.headers.get('date')
        if (dateHeader) {
          const serverTime = new Date(dateHeader).getTime()
          const localTime = Date.now()
          cachedOffset = serverTime - localTime
          hasCheckedTime = true
          break
        }
      } catch (e: any) {
        console.warn(`[R2] Failed to check clock skew against ${url}:`, e.message || e)
      }
    }
  }
  return new Date(Date.now() + cachedOffset)
}

// ---- Presigned upload URL ----
export async function createPresignedUploadUrl(key: string, contentType: string, expiresIn = 3600): Promise<string> {
  const client = getR2Client()
  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
  })
  const signingDate = await getSigningDate()
  return getSignedUrl(client, command, { expiresIn, signingDate })
}

// ---- Presigned download URL (for private files) ----
export async function createPresignedDownloadUrl(key: string, expiresIn = 3600, filename?: string): Promise<string> {
  const client = getR2Client()
  const params: any = {
    Bucket: BUCKET,
    Key: key,
  }
  
  if (filename) {
    const cleanName = filename.replace(/[^a-zA-Z0-9.\-_ ]/g, '')
    params.ResponseContentDisposition = `attachment; filename="${cleanName}"`
  }
  
  const command = new GetObjectCommand(params)
  const signingDate = await getSigningDate()
  return getSignedUrl(client, command, { expiresIn, signingDate })
}

// ---- Delete object ----
export async function deleteObject(key: string): Promise<void> {
  const client = getR2Client()
  await client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }))
}

// ---- Upload buffer directly (server-side) ----
export async function uploadBuffer(
  key: string,
  buffer: Buffer,
  contentType: string
): Promise<void> {
  const client = getR2Client()
  await client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    })
  )
}

// ---- Download object directly (server-side) ----
export async function downloadObject(key: string): Promise<Buffer> {
  const client = getR2Client()
  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: key,
  })
  const response = await client.send(command)
  if (!response.Body) {
    throw new Error('No body in response')
  }
  const bytes = await response.Body.transformToByteArray()
  return Buffer.from(bytes)
}

