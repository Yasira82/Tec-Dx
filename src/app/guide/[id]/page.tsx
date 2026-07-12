// TEC DX — quickstart guide detail (C-115). A single copy-paste developer guide
// with a runnable snippet. Read-only docs; DX distributes knowledge, it never
// certifies capabilities or owns the underlying business logic (C-115 §4).
import Link from 'next/link';
import type { Metadata } from 'next';
import { TEC_COLORS } from '@yasser172/tec-ui';
import { getGuide, GUIDES } from '@/lib/dx/catalog';

export function generateStaticParams() {
  return GUIDES.map((g) => ({ id: g.id }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
): Promise<Metadata> {
  const { id } = await params;
  const g = getGuide(id);
  return {
    title:       g ? `${g.title} — TEC DX` : 'TEC DX — Guide',
    description: g ? g.blurb : 'A TEC DX developer guide (C-115).',
  };
}

export default async function GuidePage(
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const g = getGuide(id);

  const wrap: React.CSSProperties = {
    minHeight: '100vh', background: TEC_COLORS.bg, color: TEC_COLORS.text,
    padding: '32px 22px', fontFamily: 'system-ui, -apple-system, sans-serif',
  };
  const inner: React.CSSProperties = { maxWidth: 680, margin: '0 auto' };

  if (!g) {
    return (
      <main style={wrap}>
        <div style={inner}>
          <Link href="/app" style={{ fontSize: 13, color: TEC_COLORS.gold, textDecoration: 'none' }}>← Developer Platform</Link>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: TEC_COLORS.text, marginTop: 16 }}>Guide not found</h1>
          <p style={{ fontSize: 13, color: TEC_COLORS.subtext }}>No guide <code>{id}</code> in the catalog.</p>
        </div>
      </main>
    );
  }

  return (
    <main style={wrap}>
      <div style={inner}>
        <Link href="/app" style={{ fontSize: 13, color: TEC_COLORS.gold, textDecoration: 'none' }}>← Developer Platform</Link>

        <div style={{ marginTop: 16, fontSize: 12, letterSpacing: 1, color: TEC_COLORS.subtext, textTransform: 'uppercase' }}>Quickstart · {g.lang}</div>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: TEC_COLORS.gold, margin: '4px 0 0' }}>{g.title}</h1>
        <p style={{ fontSize: 14, color: TEC_COLORS.subtext, margin: '12px 0 0', lineHeight: 1.6 }}>{g.blurb}</p>

        <pre style={{ background: '#0a0a12', border: `1px solid ${TEC_COLORS.gold}22`, borderRadius: 10, padding: 16, marginTop: 18, overflowX: 'auto', fontSize: 12.5, lineHeight: 1.6, color: '#d7d7e0', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' }}>
          <code>{g.code}</code>
        </pre>

        <p style={{ fontSize: 11, color: TEC_COLORS.subtext, margin: '20px 0 0', lineHeight: 1.5 }}>
          Full anti-regression rules live in the knowledge base (C-12 dual-mode payment,
          C-123 session/cookies). Set your <code>APP_SOURCE</code> in one place and the
          matching <code>PI_API_KEY_&lt;SLUG&gt;</code> on payment-service, else Mode-2
          approve fails with Pi 404 (C-12 §11).
        </p>
      </div>
    </main>
  );
}
