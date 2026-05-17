/** 서버(BFF) → 백엔드 API 호출용 */
export const axiosConfig = {
	baseURL: process.env.NEXT_PUBLIC_BACKAPI_URL,
	headers: {
		"Content-Type": "application/json",
	},
};

/**
 * 브라우저(클라이언트)용 — baseURL 없음 → 같은 도메인의 /api/* (Next.js Route) 호출
 * BACKAPI_URL을 baseURL로 쓰면 상용 도메인에서 CORS로 ERR_NETWORK 발생
 */
export const clientAxiosConfig = {
	headers: {
		"Content-Type": "application/json",
	},
};
