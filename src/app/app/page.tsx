'use client';

// TEC DX — the Developer Platform (C-115). "How do I build on Pi?" DX distributes
// the SDKs, starter templates, certified capabilities (from SYSTEM/C-94), and
// guides that let anyone build on Pi/TEC. DX distributes — it never certifies
// capabilities (SYSTEM does), enforces gateway security, or owns business logic
// (C-115 §4). This V1 is a curated read-only catalog served by /api/bff/dx/catalog;
// a real registry + CLI + API-key management land in Phase 1+.
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePiAuth } from '@yasser172/tec-auth';
import { TEC_COLORS } from '@yasser172/tec-ui';
import { DxPro } from './components/DxPro';
import {
  SDKS, TEMPLATES, CAPABILITIES, CAP_STATUS_META, GUIDES,
} from '@/lib/dx/catalog';

export default function DxHome() {
  const { user, isLoading } = usePiAuth();
  const name = user?.piUsername ? `@${user.piUsername}` : 'builder';

  const [copied, setCopied] = useState('');
  const copy = (text: string, id: string) => {
    try { void navigator.clipboard?.writeText(text); setCopied(id); setTimeout(() => setCopied(''), 1200); } catch { /* clipboard blocked */ }
  };
  // Warm the BFF (serves the same catalog; a real registry later). Non-blocking.
  useEffect(() => { void fetch('/api/bff/dx/catalog', { credentials: 'include' }).catch(() => {}); }, []);

  const card: React.CSSProperties = {
    background: TEC_COLORS.surface, border: `1px solid ${TEC_COLORS.gold}22`,
    borderRadius: 12, padding: 14,
  };
  const codeBox: React.CSSProperties = {
    background: '#0a0a12', border: `1px solid ${TEC_COLORS.gold}22`, borderRadius: 8,
    padding: '10px 12px', marginTop: 8, fontSize: 12, color: '#d7d7e0', overflowX: 'auto',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', whiteSpace: 'pre',
  };
  const toneColor = (tone: 'good' | 'mid') => tone === 'good' ? TEC_COLORS.success : TEC_COLORS.gold;

  return (
    <main style={{ minHeight: '100vh', background: TEC_COLORS.bg, color: TEC_COLORS.text, padding: '32px 22px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: 780, margin: '0 auto' }}>
        <header>
          <div style={{ fontSize: 12, letterSpacing: 1, color: TEC_COLORS.subtext, textTransform: 'uppercase' }}>TEC DX · Developer Platform</div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: TEC_COLORS.gold, margin: '6px 0 0' }}>
            {isLoading ? 'Build on Pi' : `Build on Pi, ${name}`}
          </h1>
          <p style={{ fontSize: 14, color: TEC_COLORS.subtext, margin: '6px 0 0', lineHeight: 1.6 }}>
            The developer platform for the Pi economy — SDKs, a Portal-ready starter
            template, certified capabilities, and copy-paste guides. Ship a compliant
            Pi app in an afternoon (C-115).
          </p>
        </header>

        {/* Builder Pro — real Pi U2A payment (service subscription). */}
        <DxPro />

        {/* SDKs */}
        <section style={{ marginTop: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: TEC_COLORS.text, margin: 0 }}>SDKs</h2>
          <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
            {SDKS.map((s) => (
              <div key={s.id} style={card}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 800, color: TEC_COLORS.text }}>{s.name}</span>
                  <span style={{ fontSize: 10, fontWeight: 700, color: TEC_COLORS.gold, border: `1px solid ${TEC_COLORS.gold}44`, borderRadius: 999, padding: '2px 8px' }}>{s.scope}</span>
                </div>
                <div style={{ fontSize: 12, color: TEC_COLORS.subtext, marginTop: 5, lineHeight: 1.5 }}>{s.purpose}</div>
                <div style={codeBox} onClick={() => copy(s.install, s.id)} role="button" title="Copy">
                  {s.install}  {copied === s.id ? '✓ copied' : ''}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Starter templates */}
        <section style={{ marginTop: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: TEC_COLORS.text, margin: 0 }}>Starter templates</h2>
          <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
            {TEMPLATES.map((t) => (
              <div key={t.id} style={card}>
                <div style={{ fontSize: 13, fontWeight: 800, color: TEC_COLORS.gold }}>{t.name}</div>
                <div style={{ fontSize: 12, color: TEC_COLORS.subtext, marginTop: 5, lineHeight: 1.5 }}>{t.summary}</div>
                <ul style={{ margin: '8px 0 0', paddingLeft: 16 }}>
                  {t.ships.map((x) => <li key={x} style={{ fontSize: 12, color: TEC_COLORS.subtext, lineHeight: 1.7 }}>{x}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Certified capabilities */}
        <section style={{ marginTop: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: TEC_COLORS.text, margin: 0 }}>Capabilities <span style={{ fontSize: 12, color: TEC_COLORS.subtext, fontWeight: 600 }}>(certified by SYSTEM · C-94)</span></h2>
          <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
            {CAPABILITIES.map((c) => {
              const st = CAP_STATUS_META[c.status];
              return (
                <div key={c.id} style={card}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: TEC_COLORS.text }}>{c.id}</span>
                    <span style={{ fontSize: 10, fontWeight: 800, whiteSpace: 'nowrap', color: toneColor(st.tone), border: `1px solid ${toneColor(st.tone)}55`, borderRadius: 999, padding: '2px 8px' }}>{st.label}</span>
                  </div>
                  <div style={{ fontSize: 11, color: TEC_COLORS.gold, marginTop: 3 }}>owner: {c.owner}</div>
                  <div style={{ fontSize: 12, color: TEC_COLORS.subtext, marginTop: 5, lineHeight: 1.5 }}>{c.use}</div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Quickstart guides */}
        <section style={{ marginTop: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: TEC_COLORS.text, margin: 0 }}>Quickstart</h2>
          <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
            {GUIDES.map((g) => (
              <Link key={g.id} href={`/guide/${g.id}`} style={{ ...card, display: 'block', textDecoration: 'none' }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: TEC_COLORS.text }}>{g.title} →</div>
                <div style={{ fontSize: 12, color: TEC_COLORS.subtext, marginTop: 5, lineHeight: 1.5 }}>{g.blurb}</div>
              </Link>
            ))}
          </div>
        </section>

        <p style={{ fontSize: 11, color: TEC_COLORS.subtext, margin: '24px 0 0', lineHeight: 1.5 }}>
          DX distributes; it does NOT certify capabilities (→ SYSTEM/C-94), enforce
          gateway security (→ tec-api-gateway), or own capability business logic
          (→ domain services) — C-115 §4. Builder code security review → NX.
        </p>
      </div>
    </main>
  );
}
