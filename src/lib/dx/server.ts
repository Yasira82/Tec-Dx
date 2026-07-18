import {
  SDKS, TEMPLATES, CAPABILITIES, GUIDES, getGuide,
  type Sdk, type Template, type Capability, type CapStatus, type Guide,
} from './catalog';

// Server-only DX backend access (C-115). Calls the real DX developer catalog
// (identity-service) via the gateway with the inter-service key, and maps the
// backend rows to the frontend shape. READ-ONLY (C-115 §4): DX distributes, it never
// certifies — no write call here. Everything degrades to the curated catalog so the
// portal is never blank / never 500s. NEW-A: the gateway URL is server-only
// (API_GATEWAY_URL).
const GW = process.env.API_GATEWAY_URL ?? '';

const gwHeaders = () => ({
  'Content-Type': 'application/json',
  'x-request-id': crypto.randomUUID(),
  ...(process.env.INTERNAL_SECRET && { 'x-internal-key': process.env.INTERNAL_SECRET }),
});

export function sdkFromBackend(s: Record<string, unknown>): Sdk {
  return {
    id:      String(s.sdk_id ?? ''),
    name:    String(s.name ?? ''),
    purpose: String(s.purpose ?? ''),
    install: String(s.install ?? ''),
    scope:   String(s.scope ?? 'server').toLowerCase() as Sdk['scope'],
  };
}

export function templateFromBackend(t: Record<string, unknown>): Template {
  return {
    id:      String(t.template_id ?? ''),
    name:    String(t.name ?? ''),
    summary: String(t.summary ?? ''),
    ships:   Array.isArray(t.ships) ? (t.ships as unknown[]).map(String) : [],
  };
}

export function capabilityFromBackend(c: Record<string, unknown>): Capability {
  return {
    id:     String(c.cap_id ?? ''),
    owner:  String(c.owner ?? ''),
    status: String(c.status ?? 'designed').toLowerCase() as CapStatus,
    use:    String(c.use ?? ''),
  };
}

// A guide summary from the catalog (no code body — the detail endpoint carries it).
export type GuideSummary = Pick<Guide, 'id' | 'title' | 'blurb' | 'lang'>;
export function guideSummaryFromBackend(g: Record<string, unknown>): GuideSummary {
  return {
    id:    String(g.guide_id ?? ''),
    title: String(g.title ?? ''),
    blurb: String(g.blurb ?? ''),
    lang:  String(g.lang ?? 'ts'),
  };
}

export function guideFromBackend(g: Record<string, unknown>): Guide {
  return { ...guideSummaryFromBackend(g), code: String(g.code ?? '') };
}

export interface ResolvedCatalog {
  sdks:         Sdk[];
  templates:    Template[];
  capabilities: Capability[];
  guides:       GuideSummary[];
  source:       'live' | 'sample';
}

// The whole developer catalog — live backend first, curated catalog as fallback.
export async function resolveCatalog(): Promise<ResolvedCatalog> {
  const sampleGuides = GUIDES.map(({ id, title, blurb, lang }) => ({ id, title, blurb, lang }));
  if (GW) {
    try {
      const res = await fetch(`${GW}/api/identity/dx/catalog`, { headers: gwHeaders(), cache: 'no-store' });
      if (res.ok) {
        const data = (await res.json().catch(() => null))?.data;
        if (data && Array.isArray(data.sdks)) {
          return {
            sdks:         (data.sdks as Record<string, unknown>[]).map(sdkFromBackend),
            templates:    (data.templates as Record<string, unknown>[] ?? []).map(templateFromBackend),
            capabilities: (data.capabilities as Record<string, unknown>[] ?? []).map(capabilityFromBackend),
            guides:       (data.guides as Record<string, unknown>[] ?? []).map(guideSummaryFromBackend),
            source:       'live',
          };
        }
      }
    } catch { /* fall through to the curated catalog */ }
  }
  return { sdks: SDKS, templates: TEMPLATES, capabilities: CAPABILITIES, guides: sampleGuides, source: 'sample' };
}

export interface ResolvedGuide { guide: Guide | null; source: 'live' | 'sample'; }

// One guide (with code) by id — live backend first, sample fallback. A live 404 is
// authoritative (guide: null, source: 'live').
export async function resolveGuide(id: string): Promise<ResolvedGuide> {
  if (GW) {
    try {
      const res = await fetch(`${GW}/api/identity/dx/guide/${encodeURIComponent(id)}`, {
        headers: gwHeaders(), cache: 'no-store',
      });
      if (res.ok) {
        const g = (await res.json().catch(() => null))?.data?.guide;
        if (g) return { guide: guideFromBackend(g as Record<string, unknown>), source: 'live' };
      }
      if (res.status === 404) return { guide: null, source: 'live' };
    } catch { /* fall through to the curated catalog */ }
  }
  return { guide: getGuide(id), source: 'sample' };
}
