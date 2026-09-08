import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, expect, it, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
const backend = vi.hoisted(() => vi.fn());
vi.mock('./backend', () => ({ adminBackendFetch: backend }));
import { GET, POST } from '@/app/api/admin/security/runs/route';
import { RunResult } from '@/components/admin/SecurityDashboard';
import { auditError, type AuditRun } from './securityRuns';
import { deploymentChecks } from './security';
afterEach(() => { vi.clearAllMocks(); vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
it('rejects cross-origin and arbitrary report input before backend calls', async () => {
    vi.stubEnv('ADMIN_APP_ORIGIN', 'https://supersohee.com');
    for (const [origin, body, status] of [['https://foreign.example', '{}', 403], ['https://supersohee.com', '{"target":"https://arbitrary.example"}', 400]] as const) {
        expect((await POST(new NextRequest('https://supersohee.com/api/admin/security/runs', { method: 'POST', headers: { origin }, body }))).status).toBe(status);
    }
    expect(backend).not.toHaveBeenCalled();
});
it.each([401, 403, 429, 503])('preserves backend denial or failure %i', async (status) => {
    vi.stubEnv('ADMIN_APP_ORIGIN', 'https://supersohee.com');
    backend.mockResolvedValue(NextResponse.json({ message: 'denied' }, { status }));
    expect((await POST(new NextRequest('https://supersohee.com/api/admin/security/runs', { method: 'POST', headers: { origin: 'https://supersohee.com' } }))).status).toBe(status);
    expect(backend).toHaveBeenCalledWith('/api/admin/security/runs', expect.objectContaining({ method: 'POST' }));
});
it('validates history limits and requests bounded history', async () => {
    expect((await GET(new NextRequest('https://supersohee.com/api/admin/security/runs?limit=21'))).status).toBe(400);
    expect(backend).not.toHaveBeenCalled();
    backend.mockResolvedValue(NextResponse.json({ runs: [] }));
    await GET(new NextRequest('https://supersohee.com/api/admin/security/runs'));
    expect(backend).toHaveBeenCalledWith('/api/admin/security/runs?limit=20');
});
it('renders unknown, loopback scope, evidence and remediation without raw report dump', () => {
    vi.stubGlobal('React', React);
    const run: AuditRun = { id: 'run', schemaVersion: 1, startedAt: '2026-09-08T00:00:00Z', finishedAt: '2026-09-08T00:00:01Z', durationMs: 1000, expiresAt: '2026-10-08T00:00:00Z', environment: { backendMode: 'non-production', frontendTarget: 'loopback-development' }, summary: { pass: 0, warn: 0, fail: 0, unknown: 1 }, checks: [{ id: 'manual', category: 'deployment', title: '배포 확인', status: 'unknown', evidenceType: 'manual-review', evidence: '검증하지 않았습니다.', remediation: '운영 환경에서 확인하세요.', checkedAt: '2026-09-08T00:00:01Z', durationMs: 0 }] };
    const html = renderToStaticMarkup(<RunResult run={run}/>);
    for (const value of ['미확인', '로컬 개발 대상', '수동 검토', '검증하지 않았습니다.', '운영 환경에서 확인하세요.'])
        expect(html).toContain(value);
    expect(html).not.toContain('schemaVersion');
});
it('does not claim production mode alone proves session safety and explains unavailable history', () => {
    expect(deploymentChecks({ NODE_ENV: 'production' }).find(c => c.id === 'admin_session')?.status).toBe('warn');
    expect(auditError(404)).toContain('지원하지 않');
    expect(auditError(503)).toContain('기존 이력은 유지');
});
it('rejects an oversized body without relying on Content-Length', async () => {
    vi.stubEnv('ADMIN_APP_ORIGIN', 'https://supersohee.com');
    const response = await POST(new NextRequest('https://supersohee.com/api/admin/security/runs', { method: 'POST', headers: { origin: 'https://supersohee.com' }, body: ' '.repeat(1025) }));
    expect(response.status).toBe(413);
    expect(backend).not.toHaveBeenCalled();
});

it('prioritizes action items and filters categories without discarding unknown results', async () => {
    const { orderedChecks, checkTitles } = await import('./securityCatalog');
    const checks = [{id:'p',status:'pass',category:'data'}, {id:'u',status:'unknown',category:'data'}, {id:'w',status:'warn',category:'frontend'}, {id:'f',status:'fail',category:'data'}] as AuditRun['checks'];
    expect(orderedChecks(checks,'').map(item=>item.id)).toEqual(['f','w','u','p']);
    expect(orderedChecks(checks,'data').map(item=>item.id)).toEqual(['f','u','p']);
    expect(checkTitles['frontend-admin-privacy']).toBe('관리자 응답 검색·캐시 정책');
});
