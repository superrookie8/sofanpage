/**
 * GA4 전송 계층.
 *
 * "무엇을 보내는가"(이벤트 정의)는 events.ts의 택소노미가 갖고,
 * 여기서는 "어떻게 보내는가"만 다룬다. 화면 코드는 이 파일을 직접 쓰지 않고
 * events.ts의 track()을 쓴다.
 */

/**
 * 비어 있으면 수집을 통째로 끈다. 로컬·프리뷰의 기본값이 그래서,
 * 개발 중 클릭이 운영 데이터에 섞이지 않는다.
 */
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";

export type GtagParamValue = string | number | boolean | undefined | null;
export type GtagParams = Record<string, GtagParamValue>;

declare global {
	interface Window {
		dataLayer?: unknown[];
		gtag?: (...args: unknown[]) => void;
	}
}

/** GA4 파라미터 값 상한. 넘기면 잘려서 들어가므로 미리 자른다. */
const MAX_VALUE_LENGTH = 100;

/**
 * 파라미터에 절대 들어가면 안 되는 키. 개인정보를 GA로 흘리면 되돌릴 수 없고
 * GA4 약관 위반이기도 하다. 타입으로 1차로 막고, 여기서 런타임으로 한 번 더 막는다.
 */
const FORBIDDEN_KEY_PATTERN =
	/(email|mail|passw|token|phone|mobile|birth|nickname|user_?name|real_?name|address)/i;

/**
 * undefined/null은 GA4에서 "(not set)"으로 잡혀 리포트를 더럽히므로 아예 뺀다.
 * 개인정보로 보이는 키는 값을 버리고 개발 중에만 시끄럽게 알린다.
 */
export function sanitizeParams(params: GtagParams): Record<string, string | number | boolean> {
	const result: Record<string, string | number | boolean> = {};

	for (const [key, value] of Object.entries(params)) {
		if (value === undefined || value === null || value === "") continue;

		if (FORBIDDEN_KEY_PATTERN.test(key)) {
			if (process.env.NODE_ENV !== "production") {
				console.error(
					`[analytics] 개인정보로 보이는 파라미터 "${key}"를 버렸습니다. 택소노미를 다시 보세요.`
				);
			}
			continue;
		}

		result[key] =
			typeof value === "string" ? value.slice(0, MAX_VALUE_LENGTH) : value;
	}

	return result;
}

export function isAnalyticsEnabled(): boolean {
	return GA_MEASUREMENT_ID !== "" && typeof window !== "undefined";
}

export function sendEvent(name: string, params: GtagParams = {}): void {
	const payload = sanitizeParams(params);

	if (!isAnalyticsEnabled()) {
		// 측정 ID가 없을 때도 개발자가 무엇이 찍혔을지 확인할 수 있게 남긴다.
		if (process.env.NODE_ENV === "development") {
			console.debug("[analytics]", name, payload);
		}
		return;
	}

	window.gtag?.("event", name, payload);
}

/**
 * SPA 라우트 이동용 page_view.
 *
 * 최초 로딩분은 gtag('config')가 알아서 보내므로 여기서 또 보내지 않는다.
 * (중복 집계 방지 — 호출부인 PageViewTracker가 첫 렌더를 건너뛴다.)
 */
export function sendPageView(path: string): void {
	if (!isAnalyticsEnabled()) return;

	window.gtag?.("event", "page_view", {
		page_path: path,
		page_location: window.location.href,
		page_title: document.title,
	});
}
