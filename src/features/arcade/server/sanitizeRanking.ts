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
	const rankings = sanitizeList(source.rankings);
	const backendTotalCount = isNonNegativeInteger(source.totalCount)
		? source.totalCount
		: rankings.length;

	return {
		rankings,
		totalCount: Math.max(rankings.length, backendTotalCount),
		myRank: isPositiveInteger(source.myRank) ? source.myRank : null,
	};
}
