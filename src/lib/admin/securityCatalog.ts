import type { AuditCheck } from './securityRuns';
export const categoryLabels: Record<string,string> = { authentication:'인증·권한', configuration:'환경 설정', frontend:'공개 사이트', data:'데이터', upload:'업로드', crawler:'기사 수집', deployment:'배포·운영', repository:'코드 저장소', storage:'데이터·이미지 저장소' };
export const checkTitles: Record<string,string> = {
 'repository-web-actions':'웹 저장소 최근 workflow 실행 상태', 'repository-api-actions':'API 저장소 최근 workflow 실행 상태',
 'repository-web-alerts':'웹 저장소 의존성 경고', 'repository-api-alerts':'API 저장소 의존성 경고',
 'crawler-workflow':'자동 기사 수집 예약 실행', 'crawler-data-freshness':'수집 기사 표본 현황',
 'storage-mongo':'MongoDB 표본 저장 현황', 'storage-r2':'이미지 버킷 읽기 접근', 'storage-gridfs':'GridFS 표본 저장 현황',
 'current-admin':'현재 관리자 권한', 'production-profile':'백엔드 운영 모드', 'frontend-origin':'공개 사이트 출처·CORS', 'startup-writes':'시작 시 데이터 초기화', 'jwt-key':'로그인 서명 키', 'crawler-key':'기사 등록 전용 키', 'exchange-key':'소셜 로그인 교환 키', 'database-connectivity':'데이터베이스 연결', 'administrator-count':'관리자 권한 부여 현황', 'article-unique-index':'기사 중복 방지 인덱스', 'upload-content-security':'업로드 콘텐츠 검사', 'import-policy':'기사 등록 정책', 'external-rate-limit':'외부 요청 횟수 제한', 'secret-rotation':'비밀 키 교체', 'storage-access':'저장소 접근 권한', 'backend-anonymous-boundary':'백엔드 비로그인 접근 차단', 'run-time-limit':'점검 실행 시간 제한', 'frontend-target':'점검 대상 설정', 'frontend-dns':'점검 대상 DNS', 'frontend-home':'공개 홈 응답', 'frontend-admin':'관리자 진입 응답', 'frontend-session':'비로그인 관리자 세션 응답', 'frontend-robots':'검색 로봇 정책 응답', 'frontend-sitemap':'사이트맵 응답', 'frontend-home-headers':'공개 홈 보안 헤더', 'frontend-admin-headers':'관리자 응답 보안 헤더', 'frontend-admin-privacy':'관리자 응답 검색·캐시 정책'
};
export function checkGuidance(check:AuditCheck):string {
 if (check.category==='repository') return '관측된 실행·경고 범위를 확인하세요. Actions 성공은 보안 CI 존재·운영 배포·DB 등록 완료를 보장하지 않습니다. 선택 토큰 미설정·권한 부족으로 미확인인 항목을 경고 0건으로 해석하지 마세요.';
 if (['crawler-workflow','crawler-data-freshness'].includes(check.id)) return '예약 실행 상태와 기사 표본은 별도 근거입니다. 표본을 전체 최신 수집 현황으로 해석하지 마세요. 실행별 DB 등록 영수증은 연계하지 않으므로 Actions 성공이나 review artifact만으로 신규 등록을 확정할 수 없습니다.';
 if (check.category==='storage') return '원문 근거의 읽기·샘플 범위를 확인하세요. 전체 용량·ACL·백업 복구까지 검증한 결과는 아닙니다.';
 if (!checkTitles[check.id]) return check.remediation;
 if (['jwt-key','crawler-key','exchange-key'].includes(check.id)) return '승인된 비밀 저장소에서 충분한 길이의 전용 키 설정을 확인하세요. 키 원문을 이 화면에 입력하지 마세요.';
 if (check.id.startsWith('frontend-')) return '아래 원문 관측 근거와 응답 상태를 확인한 뒤 해당 사이트의 배포·출처 설정을 검토하세요.';
 if (check.evidenceType==='manual-review') return '자동 실행으로 확인하지 않은 항목입니다. 격리된 테스트 결과와 운영 설정을 별도로 검토하세요.';
 if (check.category==='data') return '데이터베이스 연결·권한·기존 인덱스를 확인하세요. 변경은 승인된 운영 절차로 진행하세요.';
 return '아래 원문 근거를 확인하고 해당 인증·운영 설정을 검토하세요.';
}
export function orderedChecks(checks:AuditCheck[],category:string):AuditCheck[] {
 const rank={fail:0,warn:1,unknown:2,pass:3};
 return checks.filter(check=>!category||check.category===category).slice().sort((a,b)=>rank[a.status]-rank[b.status]);
}
