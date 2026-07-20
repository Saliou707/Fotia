-- ============================================================
-- Migration Fotia — Intégration Paiement Djomy (Production)
-- À exécuter dans Supabase Studio > SQL Editor
-- ============================================================

-- ── Table payments ──────────────────────────────────────────
-- Historique des paiements (succès, échecs)
create table if not exists payments (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references profiles(id) on delete cascade,
  subscription_id     uuid references subscriptions(id) on delete set null,
  amount              numeric(12, 2) not null,
  currency            text not null default 'GNF',
  provider            text not null default 'djomy',
  provider_reference  text,           -- merchantPaymentReference (ex: SUB_xxxx)
  provider_payment_id text,           -- transactionId Djomy
  status              text not null check (status in ('pending', 'success', 'failed', 'refunded')),
  created_at          timestamptz not null default now()
);

-- ── Table webhook_events ────────────────────────────────────
-- Idempotence : chaque webhook reçu est enregistré ici
-- Empêche le rejeu du même événement (doublons)
create table if not exists webhook_events (
  id           uuid primary key default gen_random_uuid(),
  provider     text not null,
  event_id     text not null,
  event_type   text not null,
  payload      jsonb,
  processed_at timestamptz not null default now(),
  -- Contrainte d'unicité pour bloquer le rejeu
  unique(provider, event_id)
);

-- ── Index de performance ────────────────────────────────────
create index if not exists idx_payments_user_id
  on payments(user_id);

create index if not exists idx_payments_provider_reference
  on payments(provider_reference);

create index if not exists idx_payments_provider_payment_id
  on payments(provider_payment_id);

create index if not exists idx_webhook_events_lookup
  on webhook_events(provider, event_id);

-- ── RLS (Row Level Security) ────────────────────────────────
-- Les paiements ne sont accessibles que par leur propriétaire
alter table payments enable row level security;

create policy "Utilisateur voit ses propres paiements"
  on payments for select
  using (auth.uid() = user_id);

-- Le service_role (admin) peut tout faire
create policy "Service role accès complet payments"
  on payments for all
  using (auth.role() = 'service_role');

-- Les webhook_events ne sont accessibles qu'en service_role (backend only)
alter table webhook_events enable row level security;

create policy "Service role accès complet webhook_events"
  on webhook_events for all
  using (auth.role() = 'service_role');

-- ── Vérification ───────────────────────────────────────────
-- Après exécution, vérifier avec :
--   select * from payments limit 5;
--   select * from webhook_events limit 5;
