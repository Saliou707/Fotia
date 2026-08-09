export interface UpFile {
  id: string; file: File; name: string; sizeBytes: number
  preview: string; status: 'attente' | 'upload' | 'terminé' | 'erreur'
  progress: number
  /** Raison d'échec (format, taille, rate-limit, quota…) affichée à l'utilisateur */
  error?: string
}

// ─── Étape visuelle ──────────────────────────────────────────────────────────
export type Stage = 'idle' | 'uploading' | 'optimizing' | 'done'
