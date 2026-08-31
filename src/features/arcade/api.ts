export interface RankingEntry {
	rank: number;
	nickname: string;
	score: number;
	isMe?: boolean;
}

function toNumber(value: unknown): number | null {
	return typeof value === "number" && Number.isFinite(value) ? value : null;
}

/**
 * 랭킹 조회. 백엔드 응답이 배열일 수도 { rankings: [...] } 형태일 수도 있어
 * 두 경우를 모두 받아들이고, 키 이름도 방어적으로 읽는다.
 */
export async function fetchRanking(limit = 10): Promise<RankingEntry[]> {
	const response = await fetch(`/api/arcade/ranking?limit=${limit}`, {
		cache: "no-store",
	});
	if (!response.ok) {
		throw new Error("랭킹을 불러오지 못했습니다");
	}

	const data = await response.json();
	const rows: unknown[] = Array.isArray(data)
		? data
		: data?.rankings ?? data?.ranking ?? data?.items ?? [];

	return rows
		.map((row, index) => {
			const record = (row ?? {}) as Record<string, unknown>;
			const score =
				toNumber(record.score) ?? toNumber(record.bestScore) ?? 0;
			const nickname =
				typeof record.nickname === "string"
					? record.nickname
					: typeof record.userName === "string"
					? record.userName
					: "익명";
			return {
				rank: toNumber(record.rank) ?? index + 1,
				nickname,
				score,
				isMe: record.isMe === true || record.isMine === true,
			};
		})
		.sort((a, b) => a.rank - b.rank);
}
