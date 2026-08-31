/**
 * 브라우저(클라이언트)용 — baseURL 없음 → 같은 도메인의 /api/* (Next.js Route) 호출
 * BACKAPI_URL을 baseURL로 쓰면 상용 도메인에서 CORS로 ERR_NETWORK 발생
 *
 * 서버(BFF) → 백엔드 호출 설정은 백엔드 origin을 담고 있어 클라이언트 번들에
 * 인라인되면 안 되므로 `@/lib/server/http/serverAxiosConfig`에 따로 둔다.
 */
export const clientAxiosConfig = {
	headers: {
		"Content-Type": "application/json",
	},
};
