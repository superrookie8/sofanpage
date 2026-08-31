import { resolveBackendApiUrl } from "./backendApi";

/**
 * 서버(BFF) → 백엔드 API 호출용. 서버에서만 import 한다.
 *
 * baseURL은 요청 시점에 계산한다. 모듈 로드 시점에 상수로 만들면 환경변수 누락이
 * 앱 부팅 전체를 막고, 값이 클라이언트 번들에 인라인될 여지도 생긴다.
 */
export function createServerAxiosConfig() {
	return {
		baseURL: resolveBackendApiUrl(),
		headers: {
			"Content-Type": "application/json",
		},
	};
}
