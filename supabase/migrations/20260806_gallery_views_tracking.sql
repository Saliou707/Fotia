-- ============================================================
-- Migration : Tracking des vues de galeries en temps réel
-- ============================================================

-- 1. Créer la table gallery_views si elle n'existe pas encore
CREATE TABLE IF NOT EXISTS gallery_views (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  gallery_id  uuid NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
  client_token text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Contrainte d'unicité : 1 vue max par client_token et par galerie (par session)
ALTER TABLE gallery_views
  DROP CONSTRAINT IF EXISTS gallery_views_gallery_client_unique;
ALTER TABLE gallery_views
  ADD CONSTRAINT gallery_views_gallery_client_unique
    UNIQUE (gallery_id, client_token);

-- 2. Index pour accélerer les requêtes analytics
CREATE INDEX IF NOT EXISTS idx_gallery_views_gallery_created
  ON gallery_views(gallery_id, created_at DESC);

-- 3. RLS : la table est en lecture publique (pas d'auth nécessaire pour insérer une vue)
ALTER TABLE gallery_views ENABLE ROW LEVEL SECURITY;

-- Permettre à tout le monde d'insérer une vue (les clients n'ont pas de compte)
DROP POLICY IF EXISTS "Allow anonymous view inserts" ON gallery_views;
CREATE POLICY "Allow anonymous view inserts" ON gallery_views
  FOR INSERT WITH CHECK (true);

-- Permettre au propriétaire de la galerie de lire SES vues
DROP POLICY IF EXISTS "Gallery owner can read views" ON gallery_views;
CREATE POLICY "Gallery owner can read views" ON gallery_views
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM galleries
      WHERE galleries.id = gallery_views.gallery_id
        AND galleries.user_id = auth.uid()
    )
  );

-- 4. Fonction RPC pour incrémenter view_count et insérer la vue atomiquement
CREATE OR REPLACE FUNCTION increment_gallery_view_count(gallery_id_param uuid, client_token_param text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Essaye d'insérer la vue. Si le client_token existe déjà pour cette galerie,
  -- la contrainte UNIQUE empêche le doublon silencieusement (ON CONFLICT DO NOTHING).
  INSERT INTO gallery_views (gallery_id, client_token)
  VALUES (gallery_id_param, client_token_param)
  ON CONFLICT (gallery_id, client_token) DO NOTHING;

  -- Incrémente le compteur uniquement si l'insertion a réussi (affected rows > 0)
  IF FOUND THEN
    UPDATE galleries
    SET view_count = COALESCE(view_count, 0) + 1
    WHERE id = gallery_id_param;
  END IF;
END;
$$;
