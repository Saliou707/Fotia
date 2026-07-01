-- ============================================================
-- FOTIA — PostgreSQL Schema
-- Run in Supabase SQL Editor
-- ============================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  display_name  TEXT,
  avatar_url    TEXT,
  facebook      TEXT,
  tiktok        TEXT,
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  plan          TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'studio')),
  storage_used_bytes BIGINT NOT NULL DEFAULT 0,
  gallery_count INT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- GALLERIES
-- ============================================================
CREATE TABLE IF NOT EXISTS galleries (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id               UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title                 TEXT NOT NULL,
  description           TEXT,
  slug                  TEXT NOT NULL UNIQUE,
  cover_image_url       TEXT,
  status                TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'archived')),
  is_password_protected BOOLEAN NOT NULL DEFAULT FALSE,
  password_hash         TEXT,
  allow_downloads       BOOLEAN NOT NULL DEFAULT TRUE,
  allow_favorites       BOOLEAN NOT NULL DEFAULT TRUE,
  watermark_enabled     BOOLEAN NOT NULL DEFAULT TRUE,
  view_count            INT NOT NULL DEFAULT 0,
  download_count        INT NOT NULL DEFAULT 0,
  favorite_count        INT NOT NULL DEFAULT 0,
  photo_count           INT NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_galleries_user_id ON galleries(user_id);
CREATE INDEX IF NOT EXISTS idx_galleries_slug ON galleries(slug);
CREATE INDEX IF NOT EXISTS idx_galleries_status ON galleries(status);

-- ============================================================
-- GALLERY IMAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS gallery_images (
  id                UUID PRIMARY KEY,
  gallery_id        UUID NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
  user_id           UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  r2_key            TEXT NOT NULL,
  r2_thumbnail_key  TEXT,
  original_filename TEXT NOT NULL,
  content_type      TEXT NOT NULL DEFAULT 'image/jpeg',
  file_size_bytes   BIGINT NOT NULL DEFAULT 0,
  width             INT,
  height            INT,
  display_order     INT NOT NULL DEFAULT 0,
  caption           TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gallery_images_gallery_id ON gallery_images(gallery_id);
CREATE INDEX IF NOT EXISTS idx_gallery_images_user_id ON gallery_images(user_id);
CREATE INDEX IF NOT EXISTS idx_gallery_images_order ON gallery_images(gallery_id, display_order);

-- ============================================================
-- FAVORITES
-- ============================================================
CREATE TABLE IF NOT EXISTS favorites (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gallery_id    UUID NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
  image_id      UUID NOT NULL REFERENCES gallery_images(id) ON DELETE CASCADE,
  client_token  TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (gallery_id, image_id, client_token)
);

CREATE INDEX IF NOT EXISTS idx_favorites_gallery_id ON favorites(gallery_id);
CREATE INDEX IF NOT EXISTS idx_favorites_image_id ON favorites(image_id);
CREATE INDEX IF NOT EXISTS idx_favorites_client_token ON favorites(client_token);

-- ============================================================
-- GALLERY VIEWS
-- ============================================================
CREATE TABLE IF NOT EXISTS gallery_views (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gallery_id    UUID NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
  client_token  TEXT,
  ip_hash       TEXT,
  user_agent    TEXT,
  referrer      TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gallery_views_gallery_id ON gallery_views(gallery_id);
CREATE INDEX IF NOT EXISTS idx_gallery_views_created_at ON gallery_views(created_at);

-- ============================================================
-- DOWNLOADS
-- ============================================================
CREATE TABLE IF NOT EXISTS downloads (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gallery_id    UUID NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
  image_id      UUID REFERENCES gallery_images(id) ON DELETE SET NULL,
  client_token  TEXT,
  quality       TEXT NOT NULL DEFAULT 'compressed' CHECK (quality IN ('compressed', 'original')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_downloads_gallery_id ON downloads(gallery_id);

-- ============================================================
-- SHARE LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS share_logs (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gallery_id  UUID NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
  platform    TEXT NOT NULL DEFAULT 'whatsapp',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_share_logs_gallery_id ON share_logs(gallery_id);

-- ============================================================
-- HELPER FUNCTIONS (counters)
-- ============================================================

CREATE OR REPLACE FUNCTION increment_gallery_photo_count(gallery_id_param UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE galleries SET photo_count = photo_count + 1, updated_at = NOW()
  WHERE id = gallery_id_param;
END;
$$;

CREATE OR REPLACE FUNCTION decrement_gallery_photo_count(gallery_id_param UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE galleries SET photo_count = GREATEST(0, photo_count - 1), updated_at = NOW()
  WHERE id = gallery_id_param;
END;
$$;

CREATE OR REPLACE FUNCTION increment_gallery_favorite_count(gallery_id_param UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE galleries SET favorite_count = favorite_count + 1 WHERE id = gallery_id_param;
END;
$$;

CREATE OR REPLACE FUNCTION decrement_gallery_favorite_count(gallery_id_param UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE galleries SET favorite_count = GREATEST(0, favorite_count - 1) WHERE id = gallery_id_param;
END;
$$;

CREATE OR REPLACE FUNCTION increment_gallery_download_count(gallery_id_param UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE galleries SET download_count = download_count + 1 WHERE id = gallery_id_param;
END;
$$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Galleries
ALTER TABLE galleries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Photographers manage own galleries" ON galleries
  USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view active galleries" ON galleries
  FOR SELECT USING (status = 'active');

-- Gallery images
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Photographers manage own images" ON gallery_images
  USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view images in active galleries" ON gallery_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM galleries g WHERE g.id = gallery_id AND g.status = 'active'
    )
  );

-- Favorites
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can manage favorites" ON favorites
  FOR ALL USING (true);

-- Gallery views
ALTER TABLE gallery_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert views" ON gallery_views
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Photographers can view own gallery views" ON gallery_views
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM galleries g WHERE g.id = gallery_id AND g.user_id = auth.uid())
  );

-- Downloads
ALTER TABLE downloads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert downloads" ON downloads
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Photographers can view own downloads" ON downloads
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM galleries g WHERE g.id = gallery_id AND g.user_id = auth.uid())
  );

-- Share logs
ALTER TABLE share_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert share logs" ON share_logs
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Photographers can view own share logs" ON share_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM galleries g WHERE g.id = gallery_id AND g.user_id = auth.uid())
  );

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER galleries_updated_at BEFORE UPDATE ON galleries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER gallery_images_updated_at BEFORE UPDATE ON gallery_images
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- SUPABASE REALTIME CONFIGURATION
-- ============================================================

-- Add specific tables to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE favorites;
ALTER PUBLICATION supabase_realtime ADD TABLE downloads;
ALTER PUBLICATION supabase_realtime ADD TABLE gallery_views;
ALTER PUBLICATION supabase_realtime ADD TABLE galleries;

-- ============================================================
-- SUBSCRIPTIONS & PAYMENTS (SaaS)
-- ============================================================

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('free', 'pro')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'expired', 'canceled', 'failed')),
  billing_cycle TEXT DEFAULT 'monthly',
  provider TEXT DEFAULT 'djomy',
  provider_subscription_id TEXT,
  provider_payment_id TEXT,
  provider_reference TEXT UNIQUE,
  started_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_provider_reference ON subscriptions(provider_reference);

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'XOF',
  provider TEXT DEFAULT 'djomy',
  provider_reference TEXT UNIQUE,
  provider_payment_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'success', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_subscription_id ON payments(subscription_id);

-- RLS for Subscriptions & Payments
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own subscriptions" ON subscriptions FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own payments" ON payments FOR SELECT USING (auth.uid() = user_id);

CREATE TRIGGER subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- ADMIN RBAC & LOGS
-- ============================================================

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'support')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);

CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_logs(admin_id);

-- RLS for Admin
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view admin_users" ON admin_users FOR SELECT USING (
  EXISTS (SELECT 1 FROM admin_users a WHERE a.user_id = auth.uid())
);

ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view admin_logs" ON admin_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM admin_users a WHERE a.user_id = auth.uid())
);
