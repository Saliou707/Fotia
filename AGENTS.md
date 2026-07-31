<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:security-rules -->
# 🔒 Security Rules (MANDATORY)

Read `SECURITY.md` at the project root **before writing any code** and follow
its checklist on every change. Key rules:

- Auth: always `supabase.auth.getUser()` server-side, never trust the cookie alone.
- API routes: protect with auth + rate limiting (`src/lib/rate-limit.ts`) + CSRF check (`src/lib/csrf.ts` on POST/PUT/DELETE).
- Never expose `SUPABASE_SERVICE_ROLE_KEY` client-side.
- Validate all inputs with Zod (`src/lib/validations.ts`).
- Never weaken security headers in `next.config.ts` (CSP, HSTS, X-Frame-Options...).
- No `Access-Control-Allow-Origin: *`; match exact hostnames only.
- Tokens: `crypto.randomUUID()` / `nanoid()`, never `Math.random()`.
- Webhooks: verify HMAC signature + idempotence (anti-replay).
- New tables MUST have Row Level Security enabled.
- Never commit secrets; update `.env.example` for new env vars.

Full checklist: see `SECURITY.md`.
<!-- END:security-rules -->
