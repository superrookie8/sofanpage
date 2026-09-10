export type AuditCheck = {
    id: string;
    category: string;
    title: string;
    status: 'pass' | 'warn' | 'fail' | 'unknown';
    evidenceType: 'configuration' | 'runtime-http' | 'database-read' | 'manual-review' | 'provider-api';
    evidence: string;
    remediation: string;
    checkedAt: string;
    durationMs: number;
    observedStatus?: number;
};
export type AuditRun = {
    id: string;
    schemaVersion: 1;
    startedAt: string;
    finishedAt: string;
    durationMs: number;
    environment: {
        backendMode: 'production' | 'non-production' | 'unknown';
        frontendTarget: 'https-configured' | 'loopback-development' | 'unknown';
    };
    summary: Record<AuditCheck['status'], number>;
    checks: AuditCheck[];
    expiresAt: string;
};
export const auditStatusLabels = { pass: '통과', warn: '확인 필요', fail: '조치 필요', unknown: '미확인' };
export function auditError(status: number): string {
    if (status === 404 || status === 405)
        return '현재 백엔드가 보안 점검 이력 API를 지원하지 않거나 요청한 이력이 없습니다.';
    if (status === 429)
        return '점검이 진행 중이거나 대기 시간이 남아 있습니다. 잠시 후 다시 시도하세요.';
    if (status === 503)
        return '점검 저장소를 사용할 수 없습니다. 기존 이력은 유지됩니다.';
    if (status === 401)
        return '로그인을 다시 확인해주세요.';
    if (status === 403)
        return '관리자 권한이 필요합니다.';
    return '보안 점검 요청에 실패했습니다. 기존 이력은 유지됩니다.';
}
