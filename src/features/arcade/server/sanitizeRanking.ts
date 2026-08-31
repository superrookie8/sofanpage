interface SafeRankingEntry {
	rank: number;
	nickname: string;
	bestScore: number;
}

function isPositiveInteger(value: unknown): value is number {
	return typeof value === "number" && Number.isInteger(value) && value > 0;
}

function isNonNegativeNumber(value: unknown): value is number {
	return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function isNonNegativeInteger(value: unknown): value is number {
	return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

/**
 * 공개 랭킹 응답에는 화면에 필요한 필드만 남긴다.
 *
 * 백엔드 항목에는 userId와 profileImageUrl도 포함되므로 반드시 화이트리스트로
 * 새 객체를 만든다. 화면에서 임의 순위·닉네임·점수를 합성하지 않도록 세 필드가
 * 모두 유효한 행만 통과시킨다.
 */
function sanitizeEntry(entry: unknown): SafeRankingEntry | null {
	if (typeof entry !== "object" || entry === null) return null;

	const source = entry as Record<string, unknown>;
	const nickname =
		typeof source.nickname === "string" ? source.nickname.trim() : "";

	if (
		!isPositiveInteger(source.rank) ||
		!nickname ||
		!isNonNegativeNumber(source.bestScore)
	) {
		return null;
	}

	return {
		rank: source.rank,
		nickname,
		bestScore: source.bestScore,
	};
}

function sanitizeList(value: unknown): SafeRankingEntry[] {
	if (!Array.isArray(value)) return [];

	return value
		.map(sanitizeEntry)
		.filter((entry): entry is SafeRankingEntry => entry !== null);
}

export function sanitizeRankingResponse(data: unknown): unknown {
	if (Array.isArray(data)) return sanitizeList(data);

	if (typeof data !== "object" || data === null) {
		return { rankings: [], totalCount: 0, myRank: null };
	}

	const source = data as Record<string, unknown>;
	const received = Array.isArray(source.rankings) ? source.rankings.length : 0;
	const rankings = sanitizeList(source.rankings);
	const backendTotalCount = isNonNegativeInteger(source.totalCount)
		? source.totalCount
		: rankings.length;

	// totalCount는 이 페이지가 아니라 전체 인원이므로 페이지 길이로 덮지 않는다.
	// 다만 이번 페이지에서 걸러낸 만큼은 빼야 "N명 중"과 실제 목록이 어긋나지 않는다.
	// 다른 페이지에서 걸러질 항목까지는 알 수 없어 근사값이다.
	const dropped = received - rankings.length;

	return {
		rankings,
		totalCount: Math.max(rankings.length, backendTotalCount - dropped),
		myRank: isPositiveInteger(source.myRank) ? source.myRank : null,
	};
}
