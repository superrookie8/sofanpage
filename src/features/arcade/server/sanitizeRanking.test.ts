import { describe, expect, it } from "vitest";
import { sanitizeRankingResponse } from "./sanitizeRanking";

describe("sanitizeRankingResponse", () => {
	it("userId와 profileImageUrl을 응답에서 제거한다", () => {
		const result = sanitizeRankingResponse({
			rankings: [
				{
					rank: 1,
					userId: "abc123",
					nickname: "테스터",
					profileImageUrl: "https://lh3.googleusercontent.com/a/xxx",
					bestScore: 16,
				},
			],
			totalCount: 1,
			myRank: null,
		}) as { rankings: Record<string, unknown>[]; totalCount: number };

		expect(Object.keys(result.rankings[0]).sort()).toEqual([
			"bestScore",
			"nickname",
			"rank",
		]);
		expect(JSON.stringify(result)).not.toContain("googleusercontent");
		expect(JSON.stringify(result)).not.toContain("abc123");
	});

	it("닉네임이 없거나 공백뿐이면 랭킹에서 제외한다", () => {
		const result = sanitizeRankingResponse({
			rankings: [
				{ rank: 1, nickname: "테스터", bestScore: 20 },
				{ rank: 2, nickname: "   ", bestScore: 15 },
				{ rank: 3, bestScore: 10 },
				{ rank: 4, nickname: null, bestScore: 5 },
			],
			totalCount: 4,
		}) as { rankings: { nickname: string }[]; totalCount: number };

		expect(result.rankings).toHaveLength(1);
		expect(result.rankings[0].nickname).toBe("테스터");
	});

	it("제외한 만큼 totalCount도 줄인다", () => {
		const result = sanitizeRankingResponse({
			rankings: [
				{ rank: 1, nickname: "A", bestScore: 20 },
				{ rank: 2, nickname: "", bestScore: 15 },
			],
			totalCount: 2,
		}) as { totalCount: number };

		expect(result.totalCount).toBe(1);
	});

	it("닉네임 앞뒤 공백을 정리한다", () => {
		const result = sanitizeRankingResponse({
			rankings: [{ rank: 1, nickname: "  팬  ", bestScore: 1 }],
		}) as { rankings: { nickname: string }[] };

		expect(result.rankings[0].nickname).toBe("팬");
	});

	it("배열 형태 응답도 처리한다", () => {
		const result = sanitizeRankingResponse([
			{ rank: 1, nickname: "A", userId: "u1", bestScore: 3 },
			{ rank: 2, nickname: " ", userId: "u2", bestScore: 2 },
		]) as Record<string, unknown>[];

		expect(result).toHaveLength(1);
		expect(result[0]).not.toHaveProperty("userId");
	});

	it("myRank가 객체면 동일하게 정리한다", () => {
		const result = sanitizeRankingResponse({
			rankings: [],
			myRank: { rank: 7, nickname: "나", userId: "me", bestScore: 5 },
		}) as { myRank: Record<string, unknown> };

		expect(result.myRank).not.toHaveProperty("userId");
		expect(result.myRank.nickname).toBe("나");
	});
});
