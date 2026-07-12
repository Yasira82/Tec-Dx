// TEC DX — the Developer Platform catalog (C-115). DX is the "System of
// Construction": it distributes the SDKs, starter templates, certified
// capabilities, and guides that let anyone build on Pi/TEC. DX DISTRIBUTES;
// it does NOT certify capabilities (SYSTEM/C-94 does), enforce gateway security
// (tec-api-gateway), or own business logic (domain services) — C-115 §4.
// This is a curated, READ-ONLY catalog (a real registry/CLI lands in Phase 1+).

// ── SDKs (C-115 §4 — SDK distribution) ──────────────────────────────────────
export interface Sdk {
  id:       string;
  name:     string;      // npm package
  purpose:  string;
  install:  string;      // install command
  scope:    'server' | 'client' | 'ui' | 'browser';
}

export const SDKS: Sdk[] = [
  { id: 'tec-sdk',      name: '@yasser172/tec-sdk',  purpose: 'Server BFF SDK — typed, Zod-validated calls from API routes to the gateway (payment/auth/commerce).', install: 'npm i @yasser172/tec-sdk',  scope: 'server' },
  { id: 'tec-auth',     name: '@yasser172/tec-auth', purpose: 'Hub SSO hooks + cookie/session helpers (usePiAuth, getStoredUser, ssoRedirect).',                  install: 'npm i @yasser172/tec-auth', scope: 'client' },
  { id: 'tec-ui',       name: '@yasser172/tec-ui',   purpose: 'Shared design system — TEC_COLORS, GlobalNav, formatPi (inline-styled, Pi-Browser safe).',          install: 'npm i @yasser172/tec-ui',   scope: 'ui' },
  { id: 'tec-core-sdk', name: 'packages/tec-core-sdk', purpose: 'Browser Pi SDK hooks (usePiAuth, useTecWallet) for client components.',                            install: 'workspace package',          scope: 'browser' },
];

export const getSdk = (id: string): Sdk | null => SDKS.find((s) => s.id === id) ?? null;

// ── Starter templates (C-115 §4 — template library) ─────────────────────────
export interface Template {
  id:       string;
  name:     string;
  summary:  string;
  ships:    string[];    // what the scaffold includes
}

export const TEMPLATES: Template[] = [
  {
    id: 'tec-template-base',
    name: 'tec-template-base',
    summary: 'The golden starter for a new TEC/Pi app — clone, set your slug, deploy. Portal-ready.',
    ships: [
      'Hub SSO landing (open-redirect-safe) + token refresh',
      'Dual-mode Pi payment (ADR-007) + CSRF-in-middleware (C-12)',
      'BFF payment routes (create/approve/complete/resolve)',
      'PiRuntime (PAL) + circuit breaker · feature flags · structured logs',
      'Privacy/Terms legal pages · /api/health · CI policy guards',
    ],
  },
];

export const getTemplate = (id: string): Template | null => TEMPLATES.find((t) => t.id === id) ?? null;

// ── Certified capabilities (C-94, distributed by DX; certified by SYSTEM) ────
// DX PRESENTS the capabilities SYSTEM (C-110) certifies — it never certifies
// them itself (C-115 §4). Mirror of the System capability registry.
export type CapStatus = 'certified' | 'verified' | 'designed';

export interface Capability {
  id:     string;
  owner:  string;
  status: CapStatus;
  use:    string;   // how a builder consumes it
}

export const CAPABILITIES: Capability[] = [
  { id: 'payment',        owner: 'tec-payment-service',   status: 'certified', use: 'Accept Pi (U2A) via the dual-mode flow — createPaymentRecord → createU2APayment.' },
  { id: 'authentication', owner: 'tec-auth-service',      status: 'certified', use: 'Hub SSO — usePiAuth() + cookie session; never handle Pi tokens yourself.' },
  { id: 'asset-transfer', owner: 'tec-asset-service',     status: 'verified',  use: 'Provision/transfer an asset after a verified payment.' },
  { id: 'order-creation', owner: 'tec-commerce-service',  status: 'verified',  use: 'Create an order once payment is approved.' },
  { id: 'analytics-query', owner: 'tec-analytics-service', status: 'designed',  use: 'Read own-scope aggregates (eventual consistency).' },
];

export const CAP_STATUS_META: Record<CapStatus, { label: string; tone: 'good' | 'mid' }> = {
  certified: { label: 'Certified', tone: 'good' },
  verified:  { label: 'Verified',  tone: 'mid' },
  designed:  { label: 'Designed',  tone: 'mid' },
};

// ── Quickstart guides / code examples (C-115 §4 — docs) ─────────────────────
export interface Guide {
  id:      string;
  title:   string;
  blurb:   string;
  code:    string;
  lang:    string;
}

export const GUIDES: Guide[] = [
  {
    id: 'accept-pi',
    title: 'Accept a Pi payment (dual-mode)',
    blurb: 'The ADR-007 guard: Hub navigation → Mode 1 (Hub modal); standalone → Mode 2. Never touch window.Pi without the guard.',
    lang: 'ts',
    code:
`if (isHubNavigation() || !window.Pi || !piReady) {
  redirectToHubPayment({ amount, itemId, memo }); // Mode 1
  return;
}
const id = await createPaymentRecord(amount, itemId, memo); // Mode 2
const res = await createU2APayment(amount, memo, { item_id: itemId }, id);`,
  },
  {
    id: 'sso-login',
    title: 'Add Hub SSO login',
    blurb: 'SSO is cookie-based; the Hub signs the session. Read it with usePiAuth — never store tokens in localStorage.',
    lang: 'ts',
    code:
`const { user, isAuthenticated, isLoading } = usePiAuth();
// not signed in? bounce to the Hub:
ssoRedirect(HUB_URL, \`\${APP_URL}/app\`);`,
  },
  {
    id: 'set-source',
    title: 'Wire your app source + Pi key',
    blurb: 'Set APP_SOURCE to your slug (ONE place) and the matching PI_API_KEY_<SLUG> on payment-service — else Mode-2 approve fails with Pi 404 (KB C-12 §11).',
    lang: 'ts',
    code:
`// src/lib/app-source.ts
export const APP_SOURCE = 'yourslug';
// payment-service (Railway): PI_API_KEY_YOURSLUG = <your Pi app server key>`,
  },
];

export const getGuide = (id: string): Guide | null => GUIDES.find((g) => g.id === id) ?? null;
