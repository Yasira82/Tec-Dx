import { NextResponse } from 'next/server';
import { SDKS, TEMPLATES, CAPABILITIES, GUIDES } from '@/lib/dx/catalog';

// GET /api/bff/dx/catalog — the developer catalog (C-115 §4). DX distributes the
// SDKs, templates, certified capabilities (from SYSTEM/C-94), and guides. This V1
// serves the curated read-only catalog (source:'sample'); when a real registry
// exists (capabilities proxied from SYSTEM + a package/CLI index), this route
// proxies it and returns source:'live' with the same shape. Public, read-only.
export function GET() {
  return NextResponse.json(
    {
      source:       'sample',
      sdks:         SDKS,
      templates:    TEMPLATES,
      capabilities: CAPABILITIES,
      guides:       GUIDES.map(({ id, title, blurb, lang }) => ({ id, title, blurb, lang })),
    },
    { headers: { 'Cache-Control': 'public, max-age=300' } },
  );
}
