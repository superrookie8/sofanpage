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

	// totalCount는 전체 인원이고 rankings는 한 페이지다. 페이지 길이로 덮으면
	// "5명 중"처럼 총계가 잘린다.
	it("페이지네이션된 응답의 전체 인원은 유지한다", () => {
		const page = Array.from({ length: 5 }, (_, index) => ({
			rank: index + 1,
			nickname: `팬${index}`,
			bestScore: 10 - index,
		}));

		expect(
			(sanitizeRankingResponse({ rankings: page, totalCount: 100 }) as {
				totalCount: number;
			}).totalCount
		).toBe(100);

		// 그 페이지에서 하나를 걸러내면 전체에서도 하나를 뺀다.
		expect(
			(sanitizeRankingResponse({
				rankings: [...page, { rank: 6, nickname: " ", bestScore: 4 }],
				totalCount: 100,
			}) as { totalCount: number }).totalCount
		).toBe(99);
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

	// 백엔드 RankingResponse.myRank는 Integer다. 객체가 오면 계약 위반이므로
	// 화면에 합성한 값을 흘리지 않고 null로 떨어뜨린다.
	it("myRank는 양의 정수만 통과시킨다", () => {
		const of = (myRank: unknown) =>
			(sanitizeRankingResponse({ rankings: [], myRank }) as { myRank: unknown })
				.myRank;

		expect(of(7)).toBe(7);
		expect(of(null)).toBeNull();
		expect(of(0)).toBeNull();
		expect(of(-1)).toBeNull();
		expect(of("7")).toBeNull();
		expect(of({ rank: 7, nickname: "나", userId: "me" })).toBeNull();
	});
});
