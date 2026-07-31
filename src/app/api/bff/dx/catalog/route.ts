import { NextResponse } from 'next/server';
import { resolveCatalog } from '@/lib/dx/server';

// GET /api/bff/dx/catalog — the developer catalog (C-115 §4). DX distributes the
// SDKs, templates, certified capabilities (from SYSTEM/C-94), and guides. Proxies
// the backend DX catalog (identity-service) and returns source:'live'; falls back to
// the curated read-only catalog (source:'catalog') if the backend is unreachable, so
// the portal is never blank. Public, read-only — guides are summaries here (no code
// body; the /guide/[id] detail carries it). NEW-A: gateway URL is server-only.
export async function GET() {
  const { sdks, templates, capabilities, guides, source } = await resolveCatalog();
  return NextResponse.json(
    { source, sdks, templates, capabilities, guides },
    { headers: { 'Cache-Control': 'public, max-age=300' } },
  );
}
