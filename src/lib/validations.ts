import { z } from 'zod'

// Schema pour la création et mise à jour d'une galerie
export const gallerySchema = z.object({
  title: z.string().min(2, { message: 'Le titre doit contenir au moins 2 caractères' }).max(120),
  description: z.string().max(1000).optional().nullable(),
  is_password_protected: z.boolean().optional().default(false),
  password: z.string().min(4, { message: 'Le mot de passe doit faire au moins 4 caractères' }).optional().nullable(),
  allow_downloads: z.boolean().optional().default(true),
  allow_favorites: z.boolean().optional().default(true),
  watermark_enabled: z.boolean().optional().default(true),
})

// Schema pour la demande d'upload d'image
export const imageUploadSchema = z.object({
  galleryId: z.string().uuid({ message: 'ID de galerie invalide' }),
  filename: z.string().min(1, { message: 'Le nom de fichier est requis' }),
  contentType: z.string().regex(/^image\/(jpeg|png|webp|heic|avif)$/i, { message: 'Format d\'image non supporté' }),
  fileSizeBytes: z.number().positive().max(50 * 1024 * 1024, { message: 'Taille maximale 50MB' }),
})

// Schema pour la gestion des favoris par les clients
export const favoriteSchema = z.object({
  galleryId: z.string().uuid({ message: 'ID de galerie invalide' }),
  imageId: z.string().uuid({ message: 'ID d\'image invalide' }),
  clientToken: z.string().min(1, { message: 'Jeton client requis' }),
})

// Schema pour l'authentification (connexion / inscription)
export const authSchema = z.object({
  email: z.string().email({ message: 'Adresse email invalide' }),
  password: z.string().min(6, { message: 'Le mot de passe doit faire au moins 6 caractères' }),
})

// Utilitaire de validation générique pour les APIs Next.js
export function validatePayload<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data)
  if (!result.success) {
    const formattedError = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ')
    return { success: false, error: formattedError }
  }
  return { success: true, data: result.data }
}
