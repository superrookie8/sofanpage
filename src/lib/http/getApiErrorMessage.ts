import { isAxiosError } from "axios";

/** axios / BFF 응답에서 message 필드 추출 */
export function getApiErrorMessage(
	error: unknown,
	fallback = "요청 처리 중 오류가 발생했습니다."
): string {
	if (isAxiosError(error)) {
		const data = error.response?.data;
		if (data && typeof data === "object" && "message" in data) {
			const message = (data as { message?: unknown }).message;
			if (typeof message === "string" && message.trim()) {
				return message;
			}
		}
		if (typeof data === "string" && data.trim()) {
			return data;
		}
	}

	if (error instanceof Error && error.message.trim()) {
		return error.message;
	}

	return fallback;
}
