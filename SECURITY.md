# 🔒 SECURITY.md — Checklist de sécurité Fotia

> **RÈGLE OBLIGATOIRE :** Toute modification du code de ce projet DOIT respecter
> cette checklist. La relire avant de commencer à coder, et vérifier chaque point
> avant de terminer une fonctionnalité.

**Stack :** Next.js (App Router) · Supabase (Auth + Postgres + RLS) · Djomy (paiement mobile) · R2 (storage) · Resend (email)

---

## 1. Authentification & Sessions

- [ ] Toujours utiliser `supabase.auth.getUser()` côté serveur pour vérifier une session — **jamais** seulement le cookie (`getUser()` est le seul appel qui rafraîchit et valide réellement le token).
- [ ] Le middleware (`src/lib/supabase/middleware.ts` → `updateSession`) protège toutes les routes `/dashboard` et les routes privées. Ne jamais contourner.
- [ ] Les cookies de session sont gérés avec `@supabase/ssr` (httpOnly, sameSite). Ne pas les exposer en JS.
- [ ] Le callback OAuth (`src/app/auth/callback/route.ts`) doit créer le `NextResponse.redirect()` **avant** `exchangeCodeForSession()` et attacher les cookies via `response.cookies.set()` — c'est le seul moyen de propager les cookies sur la redirection.
- [ ] Vérifier le `redirectTo` : il doit pointer vers `/auth/callback`, et l'URL doit être listée dans Supabase Dashboard → Authentication → URL Configuration → **Redirect URLs**.
- [ ] En cas de session expirée : rediriger proprement vers `/login` (pas de crash).

## 2. Routes API

- [ ] Chaque route API protégée appelle `supabase.auth.getUser()` (ou `requireAuth` / `requireAdmin`) **avant toute action**.
- [ ] Ne jamais exposer la clé `service_role` (bypass RLS) côté client. Elle est réservée à `src/lib/supabase/admin.ts`.
- [ ] Ne jamais retourner de données sensibles (email brut si non nécessaire, tokens, clés) dans les réponses.
- [ ] Routes admin : toujours utiliser `requireAdmin(roles)` + tracer avec `logAdminAction()`.
- [ ] Validation des payloads avec **Zod** (`src/lib/validations.ts`) — jamais de données brutes non validées.

## 3. Rate Limiting

- [ ] Utiliser `rateLimit(identifier, level)` de `src/lib/rate-limit.ts` sur :
  - Login / Signup / mot de passe oublié → `strict` (5 / 10 s)
  - Routes API générales → `moderate` (30 / 1 m)
  - Webhooks → `webhook` (20 / 1 m)
- [ ] Backend : **Upstash** si `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` définis, sinon fallback in-memory (dev local uniquement).
- [ ] Identifier par IP + User-Agent via `getRateLimitKey(request)`.
- [ ] Retourner un `429` avec un message clair en cas de dépassement.

## 4. Headers de sécurité

Déjà configurés dans `next.config.ts` → ne pas supprimer ni affaiblir :

- [ ] **Content-Security-Policy** (CSP) — whitelist des sources (supabase, djomy, r2, cdn)
- [ ] **X-Frame-Options: DENY** + `frame-ancestors 'none'` (anti-clickjacking)
- [ ] **X-Content-Type-Options: nosniff** (anti MIME-sniffing)
- [ ] **Referrer-Policy: strict-origin-when-cross-origin**
- [ ] **Permissions-Policy**: camera/microphone/geolocation/interest-cohort bloquées
- [ ] **Strict-Transport-Security** (HSTS) : `max-age=63072000; includeSubDomains; preload`
- [ ] `poweredByHeader: false` (cache Next.js)
- [ ] Toute nouvelle origine externe (nouvelle API, nouveau CDN) doit être ajoutée à la CSP **et** aux `remotePatterns` images.

## 5. CSRF

- [ ] Toute route `POST` / `PUT` / `DELETE` sensible doit appeler `verifyOrigin(request)` de `src/lib/csrf.ts`.
- [ ] `verifyOrigin` retourne `null` si OK, une `NextResponse` d'erreur (400/403) sinon.
- [ ] Les requêtes sans Origin (curl, cron, server-to-server) sont acceptées — c'est voulu.

## 6. CORS

- [ ] **Jamais `Access-Control-Allow-Origin: *`** en production.
- [ ] Utiliser une liste de domaines explicites (`https://myfotia.com`, `localhost:3000`, etc.).
- [ ] Comparer sur le **hostname exact** (ou `endsWith('.myfotia.com')` pour les sous-domaines) — jamais de `startsWith()` sur l'URL complète (risque de prefix-match attack).

## 7. Webhooks (Djomy)

- [ ] Vérifier la signature HMAC (`X-Webhook-Signature`) avec le secret `DJOMY_WEBHOOK_SECRET` avant tout traitement.
- [ ] Idempotence : enregistrer chaque `eventId` dans `webhook_events` (anti-rejeu).
- [ ] Vérifier le paiement côté serveur (status `success`) avant d'activer un abonnement.
- [ ] Ne pas re-traiter un abonnement déjà actif (guard).
- [ ] Rate limité via le niveau `webhook`.

## 8. Validation des entrées

- [ ] Tout payload utilisateur passe par un schéma **Zod** (`src/lib/validations.ts`).
- [ ] Uploads : vérifier le `contentType` (whitelist `image/jpeg|png|webp|heic|avif`), limiter la taille (`bodySizeLimit` déjà à 50mb).
- [ ] Nettoyer/valider les paramètres d'URL (slug, id, next, etc.).

## 9. Secrets & Variables d'environnement

- [ ] **Jamais** de secret dans le code source ou les commits (`.env.local` est dans `.gitignore`).
- [ ] Les clés sensibles passent par les variables d'env de l'hébergeur (Vercel Dashboard → Settings → Environment Variables).
- [ ] Mettre à jour `.env.example` quand on ajoute une variable.
- [ ] `NEXT_PUBLIC_*` = public (browser) · sans préfixe = serveur uniquement.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` uniquement côté serveur, jamais exposée, **jamais de fallback vers la clé anon** (RLS ne renverrait qu'un sous-ensemble des données → risque de suppression massive). La route `src/app/api/cron/cleanup-r2/route.ts` est corrigée : elle exige `CRON_SECRET` (fail-closed, comparaison timing-safe) et la `service_role` sans fallback.

## 10. Cryptographie & Tokens

- [ ] Tokens client : `crypto.randomUUID()` ou `nanoid()` — **jamais** `Math.random()`.
- [ ] Hachage des mots de passe : délégué à Supabase Auth (jamais de hash maison).
- [ ] Webhooks / signatures : HMAC-SHA256 avec secret.

## 11. Base de données (RLS)

- [ ] Chaque table a ses politiques **Row Level Security** (voir `schema.sql`).
- [ ] Le client utilisateur (anon) ne peut lire/écrire que ses propres données (`auth.uid()`).
- [ ] Le `service_role` (bypass RLS) est réservé aux opérations admin/serveur.
- [ ] Toute nouvelle table DOIT avoir ses politiques RLS activées (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`).

## 12. Checklist de validation finale

Avant de considérer une fonctionnalité terminée :

- [ ] `npx tsc --noEmit` passe sans erreur.
- [ ] `npm run lint` passe sans erreur (si configuré).
- [ ] Toutes les routes sensibles sont protégées (auth + rate limit + CSRF si POST).
- [ ] Aucun secret ajouté dans le code.
- [ ] Aucune console.log de données sensibles en production.
- [ ] Les nouveaux domaines externes sont dans la CSP + remotePatterns.

---

**À vérifier périodiquement en production :**
- [ ] [securityheaders.com](https://securityheaders.com) sur `https://myfotia.com` → grade A minimum.
- [ ] Rate limiting effectif (Upstash configuré dans Vercel).
- [ ] Pas de clé exposée dans le JS bundle (DevTools → Sources).
