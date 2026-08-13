-- ============================================================
-- EMAIL LOGS : création de la table + déduplication des envois
-- ============================================================
-- NB : la table n'existait que dans schema.sql (jamais appliqué en
-- production) → on la crée ici pour que la migration soit autonome.
-- La déduplication : le webhook Djomy et la page /billing/success peuvent
-- tous deux invoquer send-email pour la même transaction. La colonne
-- provider_payment_id + la contrainte unique permettent à l'edge function
-- de ne réserver et envoyer qu'une seule fois par (email_type, user_id,
-- transaction).

CREATE TABLE IF NOT EXISTS public.email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    email_type TEXT NOT NULL,
    to_email TEXT NOT NULL,
    status TEXT NOT NULL, -- 'success', 'error', 'pending', 'sending'
    provider TEXT DEFAULT 'resend',
    error_message TEXT,
    provider_payment_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
-- Idempotent : la table a pu être créée manuellement dans le dashboard
DROP POLICY IF EXISTS "Admins can view email_logs" ON public.email_logs;
CREATE POLICY "Admins can view email_logs" ON public.email_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM admin_users a WHERE a.user_id = auth.uid())
);

-- Index unique non partiel : les NULL (emails sans transaction, envois
-- historiques) restent distincts en Postgres, donc rien n'est affecté.
CREATE UNIQUE INDEX IF NOT EXISTS idx_email_logs_dedup
  ON public.email_logs (email_type, user_id, provider_payment_id);
