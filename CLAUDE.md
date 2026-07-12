# TEC DX — Claude Code Instructions

> ⚡ **SESSION START:** اقرأ `knowledge-base/C-02___CURRENT_STATE_.md` + **app charter
> `knowledge-base/C-115___DX_INSTITUTIONAL_CHARTER.md`** من `yasira82/tec-knowledge-base` (branch: `main`).

## What This App Is

**The Developer Platform** for the Pi economy (C-115) — the **System of
Construction**. DX answers one question:

```
"How do I build a Pi app easily?"
```

DX distributes the **SDKs, starter templates, certified capabilities, docs,
and guides** that let external builders, AI agents, and partner teams create
economic value on TEC/Pi. Without DX, TEC grows only as fast as one team builds;
with DX, 1000 builders create 1000 services — the platform becomes an economy.

Built from `tec-template-base` (Next.js 15 frontend).

**Current Phase: DX V0/V1 — Developer Portal (read-only).** Identity / domain /
slug / legal + a read-only portal: **SDK catalog** (@yasser172/*), **starter
templates**, **capability catalog** (mirrors SYSTEM's C-94 certified capabilities),
**copy-paste quickstart guides** (+ `/guide/[id]`), and **DX Builder Pro** (the Pi
Portal "Process a Transaction" gate). A real registry + API-key management + CLI
are Phase 1+. Not yet deployed.

---

## Pi App Identity

| Field | Value |
|-------|-------|
| **App** | TEC DX |
| **Domain** | `https://dx.tecosystem.app` |
| **Pi App ID** | ⏳ TBD — register at Pi Developer Portal · then Vercel `NEXT_PUBLIC_PI_APP_ID` |
| **APP_SOURCE slug** | `dx` (payment-service resolves `PI_API_KEY_DX`) |
| **PI_SANDBOX** | `false` (Mainnet) |

---

## DX-Specific Rules (C-115)

### The boundary — DX distributes; it does NOT certify or secure
DX **OWNS**: SDK distribution (@yasser172/tec-sdk · tec-auth · tec-ui), developer
docs + guides, API access management (keys/tiers/rate limits), the template library,
capability **distribution**, and the builder certification program. DX does **NOT OWN**:
- **Capability CERTIFICATION** → SYSTEM (C-110 / C-94). DX presents the certified list; it never certifies.
- **API Gateway security** → tec-api-gateway. **Builder code security review** → NX.
- **Capability business logic** → the domain services. **AI reasoning** → TEC AI (C-104).

### Distribution integrity
Only **certified** capabilities (from the C-94 registry) are distributed as usable.
The catalog is public read-only info; API-key issuance + rate-limit tiers are
governed (server-side), never client-trusted (P6). Identity from the session cookie.

**Reference of record:** `yasira82/tec-knowledge-base` —
`C-115___DX_INSTITUTIONAL_CHARTER.md` (charter) + `C-94` (capability registry) +
`C-12_Dual_Mode_Payment.md` (payment anti-regression) + `C-123` (session/cookies).

---

## Stack

- Next.js 15 App Router + TypeScript strict · React 18
- `@yasser172/tec-ui` (design system) · `@yasser172/tec-auth` · `@yasser172/tec-sdk`
- Vitest (unit) + Playwright (e2e) · Deployment: Vercel

---

## Architecture Rules (non-negotiable)

### CSRF — middleware ONLY (P2 single source of truth)
CSRF is enforced in **`middleware.ts`** and **nowhere else**: a request is trusted
if the double-submit token matches **OR** it is first-party (Origin host === Host /
`*.tecosystem.app`).
- ❌ **NEVER** add a CSRF check inside a route handler (`csrfCookie !== csrfHeader`
  → 403). It 403's legit Mode-2 payments in Pi Browser (drops `sameSite=None`
  cookies). The CI `payment-policy` job fails the build if you do. (KB C-12 §11)
- ✅ A route may *forward* `x-csrf-token` to a downstream call; it must never *validate* it.

### ADR-007 — Dual-mode payment (Pi foreign session)
Every buy handler MUST guard before touching `window.Pi`:
```typescript
const isHubNavigation = () =>
  document.referrer.toLowerCase().includes('hub.tecosystem.app');
if (isHubNavigation() || !(window as any).Pi || !piReady) {
  redirectToHubPayment(...);   // Mode 1: Hub modal → /hub?pay=1&...
  return;
}
// Mode 2: standalone — createPaymentRecord() then createU2APayment() (src/lib/pi-payment.ts)
```

### ADR-009 — Unified payment contract
`amount` is a **number**; gateway path is **`/api/payment/*`** (singular); the only
inter-service header is **`x-internal-key`** + `INTERNAL_SECRET`. Don't re-declare
payment Zod locally — shapes live in `@yasser172/tec-sdk`.

### Two-SDK boundary
```
Client components → src/lib-client/*  (browser state, Pi hooks)
API routes (BFF)  → @yasser172/tec-sdk via /api/bff/*  (server-only)
```

### Auth / cookies (LOCKED)
SSO via Hub cookies `tec_access_token`, `tec_csrf`, `tec_user`. Never localStorage.
Identity is derived from the `tec_user` cookie server-side — **never from the request body**.

---

## What's included

```
middleware.ts                              CSRF (double-submit OR Origin) + page guard
src/app/api/auth/sso-callback/route.ts     Hub SSO landing (open-redirect-safe)
src/app/api/auth/refresh/route.ts          token refresh
src/app/api/bff/payment/{create,approve,complete,resolve-incomplete}/route.ts
src/app/api/bff/items/route.ts             example domain route (copy this pattern)
src/app/api/health/route.ts                health endpoint (C-92/C-96) — fail-safe, public, never 500s
src/lib/pi-payment.ts                      createPaymentRecord + createU2APayment
src/lib/pi/PiRuntime.ts                    PAL — single choke-point for window.Pi.* (R1)
src/lib/pi/PiCircuitBreaker.ts             CLOSED→OPEN→HALF_OPEN (3 fails → 60s)
src/lib/flags.ts                           feature flags (NEXT_PUBLIC_FLAG_*) + useFlag
src/lib/observability/logger.ts            structured JSON logger (log.info/warn/error) — no silent failures (C-96)
src/lib/observability/reportError.ts       Sentry-ready error reporter (single swap-point)
src/app/privacy/page.tsx · terms/page.tsx  Pi Portal legal pages
src/styles/tec-design-tokens.css           import in app/layout.tsx
.github/workflows/ci.yml                   payment-policy + CSRF guard + lint/typecheck/test/build
```

**v2 (production-ready by default):** every new app ships
- `/api/health` — uniform C-92 signal (platform health runtime + observability scrape + SLO/runtime-evidence loop);
- structured `log` + `reportError` — use `log.error`/`reportError` in catch blocks (a silent error handler is an invisible failure, C-96; `reportError` is the one place to wire Sentry per app);
- `PiRuntime` (PAL) + `PiCircuitBreaker` — never call `window.Pi.*` directly; go through PiRuntime so an SDK change is a one-file fix (R1) and flapping is contained;
- `flags.ts` — feature flags from day one (`NEXT_PUBLIC_FLAG_<NAME>`);
- coverage gate — `npm run test:coverage` (add devDep `@vitest/coverage-v8`; 60% floor, raise as the app grows).

---

## New app setup checklist

```
□ package.json: set "name"
□ middleware.ts: adjust PROTECTED_ROUTES
□ sso-callback/route.ts: set ALLOWED_AUDIENCES + DEFAULT_REDIRECT to your domain
□ src/lib/pi-payment.ts + payment/create: set APP_SOURCE slug
□ privacy/page.tsx + terms/page.tsx: set APP / DOMAIN / governing law / contacts
□ Add ADR-007 isHubNavigation() guard to every buy handler
□ .env: API_GATEWAY_URL · INTERNAL_SECRET · SSO_SECRET · NEXT_PUBLIC_PI_APP_ID · PI_SANDBOX=false (prod)
□ Pi Developer Portal: register domain + App ID; set /privacy + /terms URLs
□ Verify a real Pi payment Mode 1 (via Hub) AND Mode 2 (standalone)
```

---

## What NOT To Do

- Do NOT validate CSRF in a route handler — middleware only (CI blocks it)
- Do NOT send `amount` as a string, or use `/payments` / `x-service-secret`
- Do NOT skip the ADR-007 `isHubNavigation()` guard before `window.Pi`
- Do NOT store tokens in localStorage; do NOT derive identity from the body
- Do NOT add `NEXT_PUBLIC_*` for internal service URLs or `INTERNAL_SECRET`
- Do NOT use an open `redirect` param without the same-origin guard (open redirect)

---

## Commit Convention

```
feat(scope):  new feature      fix(payment): payment flow fix (test carefully)
fix(scope):   bug fix          chore(scope): build/config
```

---

## Skills

Available via plugin — invoke automatically when the situation matches:

| Situation | Skill |
|-----------|-------|
| Writing new feature or fixing a bug → use TDD | `/tdd` |
| Bug, regression, or unexpected behavior | `/diagnose` |
| Writing or modifying tests | `/test-guard` |
| Writing or modifying BFF routes, payment handlers, or API contracts | `/clean-code-guard` |
| Updating docs, CLAUDE.md, or knowledge-base entries | `/docs-guard` |
| Planning a new feature or architectural decision | `/grill-with-docs` |
| Breaking down a roadmap item into GitHub Issues | `/to-issues` |
| Session is getting long or context is filling up | `/handoff` |
| Adding pre-commit hooks to this repo | `/setup-pre-commit` |
