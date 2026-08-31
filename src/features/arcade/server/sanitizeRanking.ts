/**
 * 공개 랭킹 응답을 클라이언트로 넘기기 전에 정리한다.
 *
 * 이 엔드포인트는 비로그인에도 열려 있으므로 BFF에서 두 가지를 강제한다.
 *
 * 1. 개인정보 제거 — 백엔드는 항목마다 userId와 profileImageUrl(구글 계정
 *    사진 URL)까지 실어 보낸다. 화면은 순위·닉네임·점수만 쓰므로 나머지는
 *    응답 자체에서 떨어뜨린다.
 * 2. 닉네임 없는 항목 제외 — 로그인했더라도 닉네임을 정하지 않은 사용자는
 *    랭킹에 노출하지 않는다. 클라이언트에도 같은 필터가 있지만, 여기서
 *    걸러야 해당 사용자의 정보가 브라우저까지 가지 않는다.
 */
const ALLOWED_KEYS = ["rank", "nickname", "bestScore", "score"] as const;

function hasNickname(entry: Record<string, unknown>): boolean {
	return (
		typeof entry.nickname === "string" && entry.nickname.trim().length > 0
	);
}

function pickEntry(entry: unknown): Record<string, unknown> | null {
	if (typeof entry !== "object" || entry === null) return null;
	const source = entry as Record<string, unknown>;
	if (!hasNickname(source)) return null;

	const result: Record<string, unknown> = {};
	for (const key of ALLOWED_KEYS) {
		if (key in source) result[key] = source[key];
	}
	result.nickname = (source.nickname as string).trim();
	return result;
}

function sanitizeList(value: unknown[]): Record<string, unknown>[] {
	return value
		.map(pickEntry)
		.filter((entry): entry is Record<string, unknown> => entry !== null);
}

export function sanitizeRankingResponse(data: unknown): unknown {
	if (Array.isArray(data)) {
		return sanitizeList(data);
	}
	if (typeof data !== "object" || data === null) return data;

	const source = data as Record<string, unknown>;
	const result: Record<string, unknown> = {};
	let dropped = 0;

	for (const [key, value] of Object.entries(source)) {
		if (Array.isArray(value)) {
			const kept = sanitizeList(value);
			dropped += value.length - kept.length;
			result[key] = kept;
		} else if (key === "myRank" && typeof value === "object" && value !== null) {
			result[key] = pickEntry(value);
		} else {
			result[key] = value;
		}
	}

	// 제외한 만큼 총계도 줄여 실제 노출 목록과 어긋나지 않게 한다.
	if (dropped > 0 && typeof result.totalCount === "number") {
		result.totalCount = Math.max(0, result.totalCount - dropped);
	}

	return result;
}
