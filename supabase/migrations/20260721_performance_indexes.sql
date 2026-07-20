-- ============================================================
-- Migration Fotia — Index de performance et d'optimisation (2026-07-21)
-- À exécuter dans Supabase Studio > SQL Editor
-- ============================================================

-- Index sur le tri des galeries par utilisateur et date de création
CREATE INDEX IF NOT EXISTS idx_galleries_user_created 
  ON galleries(user_id, created_at DESC);

-- Index sur l'ordre d'affichage des images dans une galerie
CREATE INDEX IF NOT EXISTS idx_gallery_images_gallery_order 
  ON gallery_images(gallery_id, display_order ASC);

-- Index sur la date d'ajout des images dans une galerie
CREATE INDEX IF NOT EXISTS idx_gallery_images_gallery_created 
  ON gallery_images(gallery_id, created_at DESC);

-- Index sur l'historique des vues par galerie et date
CREATE INDEX IF NOT EXISTS idx_gallery_views_gallery_created 
  ON gallery_views(gallery_id, created_at DESC);

-- Index sur les favoris par galerie et date
CREATE INDEX IF NOT EXISTS idx_favorites_gallery_created 
  ON favorites(gallery_id, created_at DESC);

-- Index sur le statut des abonnements par utilisateur
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status 
  ON subscriptions(user_id, status);

-- Index sur la date de paiement par utilisateur
CREATE INDEX IF NOT EXISTS idx_payments_user_created 
  ON payments(user_id, created_at DESC);
