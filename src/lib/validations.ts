/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from 'zod'

// Schema pour la création et mise à jour d'une galerie
export const gallerySchema = z.object({
  title: z.string().min(2, { message: 'Le titre doit contenir au moins 2 caractères' }).max(120),
  description: z.string().max(1000).optional().nullable(),
  slug: z.string().min(3).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: "Slug invalide (minuscules, chiffres, tirets uniquement)" }).optional(),
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

// Schema pour la mise à jour d'une galerie (PATCH /api/galleries/:id)
// NB : le mot de passe n'est volontairement PAS accepté ici pour éviter de stocker
// un mot de passe en clair côté client.
export const galleryUpdateSchema = z.object({
  title: z.string().min(2, { message: 'Le titre doit contenir au moins 2 caractères' }).max(120).optional(),
  description: z.string().max(1000).nullable().optional(),
  slug: z.string().min(3).max(80).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: 'Slug invalide (minuscules, chiffres, tirets uniquement)' }).optional(),
  status: z.enum(['draft', 'active', 'archived']).optional(),
  is_password_protected: z.boolean().optional(),
  allow_downloads: z.boolean().optional(),
  allow_favorites: z.boolean().optional(),
  watermark_enabled: z.boolean().optional(),
}).refine(data => Object.keys(data).length > 0, { message: 'Aucun champ à mettre à jour' })

// Schema pour la mise à jour du profil (PATCH /api/profile)
export const profileSchema = z.object({
  // display_name accepte la chaîne vide : elle sera normalisée en null par la route
  display_name: z.string().max(80).nullable().optional(),
  phone: z.string().max(30).nullable().optional(),
  instagram: z.string().max(100).nullable().optional(),
  facebook: z.string().max(200).nullable().optional(),
  tiktok: z.string().max(100).nullable().optional(),
  website: z.string().max(300).nullable().optional(),
  bio: z.string().max(500).nullable().optional(),
  avatar_url: z.string().max(500).nullable().optional(),
  onboarding_completed: z.boolean().optional(),
}).refine(data => Object.keys(data).length > 0, { message: 'Aucun champ à mettre à jour' })

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
    const formattedError = result.error.issues.map((e: any) => `${(e.path || []).join('.')}: ${e.message}`).join(', ')
    return { success: false, error: formattedError }
  }
  return { success: true, data: result.data }
}
