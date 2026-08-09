-- ============================================================
-- Migration Fotia — Compteur de stockage atomique
--
-- RPC SECURITY DEFINER : ajuste profiles.storage_used_bytes de
-- façon atomique (GREATEST(0, ...)) en une seule instruction SQL.
-- Élimine la course lecture-modification-écriture des routes
-- d'upload (upload/confirm, upload/direct) et de suppression de
-- galerie (DELETE /api/galleries/[id]).
--
-- Sécurité :
--  - SECURITY DEFINER avec search_path figé (anti hijacking)
--  - Un utilisateur authentifié ne peut ajuster que SON compteur, et uniquement
--    en incrément (les décréments sont réservés au service_role — anti-bypass
--    de la limite de stockage du plan gratuit)
--  - Le service_role (auth.uid() = NULL) peut ajuster n'importe quel compte
--  - EXECUTE retiré de PUBLIC : ni anon ni les requêtes non authentifiées
-- ============================================================

create or replace function public.adjust_storage_used(
  user_id uuid,
  delta bigint
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Garde-fou : un utilisateur authentifié ne peut modifier que son propre compteur
  if auth.uid() is not null and auth.uid() <> user_id then
    raise exception 'Not allowed to modify another user''s storage counter';
  end if;

  -- Garde-fou anti-bypass : seuls les appels internes (service_role) peuvent
  -- décrémenter. Sans cela, un utilisateur pourrait zéroter son compteur et
  -- contourner la limite de stockage du plan gratuit.
  -- (les décréments doivent refléter une suppression réelle vérifiée côté serveur)
  if auth.role() <> 'service_role' and delta < 0 then
    raise exception 'Only service_role can decrement storage';
  end if;

  update public.profiles
  set storage_used_bytes = greatest(0, storage_used_bytes + delta),
      updated_at = now()
  where id = user_id;
end;
$$;

-- Fail-closed : retirer l'exécution par défaut (PUBLIC) avant d'accorder
revoke execute on function public.adjust_storage_used(uuid, bigint) from public;

grant execute on function public.adjust_storage_used(uuid, bigint) to authenticated;
grant execute on function public.adjust_storage_used(uuid, bigint) to service_role;

-- ── Vérification ───────────────────────────────────────────
-- Après exécution dans Supabase Studio > SQL Editor :
--   select adjust_storage_used(auth.uid(), 100);  -- doit marcher (utilisateur connecté)
--   select adjust_storage_used('autre-uuid', 100); -- doit lever une exception
