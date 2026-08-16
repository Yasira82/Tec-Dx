'use client';

// TEC DX — the Developer Platform (C-115). "How do I build on Pi?" DX distributes
// the SDKs, starter templates, certified capabilities (from SYSTEM/C-94), and
// guides that let anyone build on Pi/TEC. DX distributes — it never certifies
// capabilities (SYSTEM does), enforces gateway security, or owns business logic
// (C-115 §4). App shell: Build / Capabilities / Guides / Settings bottom nav.
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePiAuth } from '@yasser172/tec-auth';
import { useMe } from '@/lib-client/hooks/useMe';
import { useTranslation } from '@/lib/i18n';
import { TEC_COLORS } from '@yasser172/tec-ui';
import { DxPro } from './components/DxPro';
import { BottomNav, type DxTab } from './components/BottomNav';
import { SettingsView } from './components/SettingsView';
import {
  SDKS, TEMPLATES, CAPABILITIES, CAP_STATUS_META, GUIDES,
  type Sdk, type Template, type Capability, type Guide,
} from '@/lib/dx/catalog';

type GuideSummary = Pick<Guide, 'id' | 'title' | 'blurb' | 'lang'>;

export default function DxHome() {
  const { user, isLoading } = usePiAuth();
  const me = useMe(); // server-resolved Pi username (Pi Browser hides tec_user from client JS — C-123 §3)
  const { t } = useTranslation();
  const [tab, setTab] = useState<DxTab>('build');

  const piName = me.username ?? user?.piUsername ?? null;
  const name = piName ? `@${piName}` : 'builder';

  const [copied, setCopied] = useState('');
  const copy = (text: string, id: string) => {
    try { void navigator.clipboard?.writeText(text); setCopied(id); setTimeout(() => setCopied(''), 1200); } catch { /* clipboard blocked */ }
  };

  // The developer catalog — live from the backend DX catalog, or the curated
  // fallback so the portal is never blank. Guides are summaries (no code body here).
  const [sdks,         setSdks]         = useState<Sdk[]>(SDKS);
  const [templates,    setTemplates]    = useState<Template[]>(TEMPLATES);
  const [capabilities, setCapabilities] = useState<Capability[]>(CAPABILITIES);
  const [guides,       setGuides]       = useState<GuideSummary[]>(GUIDES.map(({ id, title, blurb, lang }) => ({ id, title, blurb, lang })));
  useEffect(() => {
    let alive = true;
    fetch('/api/bff/dx/catalog', { credentials: 'include', cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!alive || !d) return;
        if (Array.isArray(d.sdks))         setSdks(d.sdks as Sdk[]);
        if (Array.isArray(d.templates))    setTemplates(d.templates as Template[]);
        if (Array.isArray(d.capabilities)) setCapabilities(d.capabilities as Capability[]);
        if (Array.isArray(d.guides))       setGuides(d.guides as GuideSummary[]);
      })
      .catch(() => { /* keep the curated catalog */ });
    return () => { alive = false; };
  }, []);

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

  const title =
    tab === 'capabilities' ? t.dx.nav.capabilities
    : tab === 'guides' ? t.dx.nav.guides
    : tab === 'settings' ? t.dx.nav.settings
    : (isLoading ? t.dx.welcome : t.dx.welcomeName.replace('{name}', name));

  return (
    <main style={{ minHeight: '100vh', background: TEC_COLORS.bg, color: TEC_COLORS.text, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '32px 22px calc(96px + env(safe-area-inset-bottom))' }}>
        <header>
          <div style={{ fontSize: 12, letterSpacing: 1, color: TEC_COLORS.subtext, textTransform: 'uppercase' }}>{t.dx.brand}</div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: TEC_COLORS.gold, margin: '6px 0 0' }}>{title}</h1>
          {tab === 'build' && (
            <p style={{ fontSize: 14, color: TEC_COLORS.subtext, margin: '6px 0 0', lineHeight: 1.6 }}>{t.dx.subtitle}</p>
          )}
        </header>

        {tab === 'build' && (
          <>
            {/* Builder Pro — real Pi U2A payment (service subscription). */}
            <DxPro />

            {/* SDKs */}
            <section style={{ marginTop: 28 }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: TEC_COLORS.text, margin: 0 }}>{t.dx.sdks}</h2>
              <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
                {sdks.map((sd) => (
                  <div key={sd.id} style={card}>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: TEC_COLORS.text }}>{sd.name}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: TEC_COLORS.gold, border: `1px solid ${TEC_COLORS.gold}44`, borderRadius: 999, padding: '2px 8px' }}>{sd.scope}</span>
                    </div>
                    <div style={{ fontSize: 12, color: TEC_COLORS.subtext, marginTop: 5, lineHeight: 1.5 }}>{sd.purpose}</div>
                    <div style={codeBox} onClick={() => copy(sd.install, sd.id)} role="button" title="Copy">
                      {sd.install}  {copied === sd.id ? '✓ copied' : ''}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Starter templates */}
            <section style={{ marginTop: 28 }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: TEC_COLORS.text, margin: 0 }}>{t.dx.templates}</h2>
              <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
                {templates.map((tp) => (
                  <div key={tp.id} style={card}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: TEC_COLORS.gold }}>{tp.name}</div>
                    <div style={{ fontSize: 12, color: TEC_COLORS.subtext, marginTop: 5, lineHeight: 1.5 }}>{tp.summary}</div>
                    <ul style={{ margin: '8px 0 0', paddingLeft: 16 }}>
                      {tp.ships.map((x) => <li key={x} style={{ fontSize: 12, color: TEC_COLORS.subtext, lineHeight: 1.7 }}>{x}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            <p style={{ fontSize: 11, color: TEC_COLORS.subtext, margin: '24px 0 0', lineHeight: 1.5 }}>{t.dx.footer}</p>
          </>
        )}

        {tab === 'capabilities' && (
          /* Certified capabilities */
          <section style={{ marginTop: 8 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: TEC_COLORS.text, margin: 0 }}>{t.dx.capabilities} <span style={{ fontSize: 12, color: TEC_COLORS.subtext, fontWeight: 600 }}>{t.dx.certified}</span></h2>
            <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
              {capabilities.map((c) => {
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
        )}

        {tab === 'guides' && (
          /* Quickstart guides */
          <section style={{ marginTop: 8 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: TEC_COLORS.text, margin: 0 }}>{t.dx.quickstart}</h2>
            <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
              {guides.map((g) => (
                <Link key={g.id} href={`/guide/${g.id}`} style={{ ...card, display: 'block', textDecoration: 'none' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: TEC_COLORS.text }}>{g.title} →</div>
                  <div style={{ fontSize: 12, color: TEC_COLORS.subtext, marginTop: 5, lineHeight: 1.5 }}>{g.blurb}</div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {tab === 'settings' && <SettingsView />}
      </div>

      <BottomNav active={tab} onSelect={setTab} />
    </main>
  );
}
