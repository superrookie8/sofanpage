export interface RankingEntry {
	rank: number;
	nickname: string;
	score: number;
}

export interface RankingData {
	rankings: RankingEntry[];
	totalCount: number;
	myRank: number | null;
}

function toPositiveInteger(value: unknown): number | null {
	return typeof value === "number" &&
		Number.isInteger(value) &&
		value > 0
		? value
		: null;
}

function toNonNegativeNumber(value: unknown): number | null {
	return typeof value === "number" && Number.isFinite(value) && value >= 0
		? value
		: null;
}

function toNonNegativeInteger(value: unknown): number | null {
	return typeof value === "number" &&
		Number.isInteger(value) &&
		value >= 0
		? value
		: null;
}

/**
 * 랭킹 조회. 백엔드 응답이 배열일 수도 { rankings: [...] } 형태일 수도 있어
 * 두 경우를 모두 받아들이고, 키 이름도 방어적으로 읽는다.
 */
export async function fetchRanking(limit = 10): Promise<RankingData> {
	const response = await fetch(`/api/arcade/ranking?limit=${limit}`, {
		cache: "no-store",
	});
	if (!response.ok) {
		throw new Error("랭킹을 불러오지 못했습니다");
	}

	const data = await response.json();
	const candidateRows: unknown = Array.isArray(data)
		? data
		: data?.rankings;
	const rows: unknown[] = Array.isArray(candidateRows) ? candidateRows : [];
	const myRank = Array.isArray(data)
		? null
		: toPositiveInteger(data?.myRank);

	const rankings = rows
		.map((row): RankingEntry | null => {
			const record = (row ?? {}) as Record<string, unknown>;
			const rank = toPositiveInteger(record.rank);
			const nickname =
				typeof record.nickname === "string" ? record.nickname.trim() : "";
			const score = toNonNegativeNumber(record.bestScore);
			if (rank === null || !nickname || score === null) return null;
			return { rank, nickname, score };
		})
		.filter((entry): entry is RankingEntry => entry !== null)
		.sort((a, b) => a.rank - b.rank);
	const totalCount = Array.isArray(data)
		? rankings.length
		: toNonNegativeInteger(data?.totalCount) ?? rankings.length;

	return { rankings, totalCount, myRank };
}
