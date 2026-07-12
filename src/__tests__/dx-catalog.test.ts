import { describe, it, expect } from 'vitest';
import {
  SDKS, TEMPLATES, CAPABILITIES, CAP_STATUS_META, GUIDES,
  getSdk, getTemplate, getGuide,
} from '@/lib/dx/catalog';

describe('TEC DX — developer catalog (C-115, read-only)', () => {
  it('distributes the core @yasser172/* SDKs with install commands', () => {
    for (const id of ['tec-sdk', 'tec-auth', 'tec-ui']) {
      const s = getSdk(id);
      expect(s, id).toBeTruthy();
      expect(s!.install.length).toBeGreaterThan(0);
      expect(s!.name.length).toBeGreaterThan(0);
    }
  });

  it('getSdk fails closed for an unknown id', () => {
    expect(getSdk('nope')).toBeNull();
  });

  it('ships the golden starter template with its included features', () => {
    const t = getTemplate('tec-template-base');
    expect(t).toBeTruthy();
    expect(t!.ships.length).toBeGreaterThanOrEqual(3);
    // The template must advertise the two non-negotiables: payment + SSO.
    const blob = t!.ships.join(' ').toLowerCase();
    expect(blob).toContain('payment');
    expect(blob).toContain('sso');
  });

  it('capabilities mirror the C-94 registry with a valid certification status', () => {
    const wanted = ['payment', 'authentication'];
    for (const id of wanted) {
      const c = CAPABILITIES.find((x) => x.id === id);
      expect(c, id).toBeTruthy();
      expect(CAP_STATUS_META[c!.status]).toBeTruthy();
      expect(c!.owner.startsWith('tec-')).toBe(true);
    }
    // payment + authentication are the certified backbone.
    expect(CAPABILITIES.find((c) => c.id === 'payment')?.status).toBe('certified');
    expect(CAPABILITIES.find((c) => c.id === 'authentication')?.status).toBe('certified');
  });

  it('every guide has a runnable snippet + a lang + resolves by id', () => {
    for (const g of GUIDES) {
      expect(g.code.trim().length).toBeGreaterThan(0);
      expect(g.lang.length).toBeGreaterThan(0);
      expect(getGuide(g.id)?.title).toBe(g.title);
    }
    expect(getGuide('nope')).toBeNull();
  });

  it('the accept-pi guide keeps the ADR-007 guard (anti-regression teaching)', () => {
    const g = getGuide('accept-pi');
    expect(g).toBeTruthy();
    expect(g!.code).toContain('isHubNavigation');
    expect(g!.code).toContain('createU2APayment');
  });
});
