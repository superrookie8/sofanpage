import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchRanking } from "./api";

afterEach(() => {
	vi.unstubAllGlobals();
});

describe("fetchRanking", () => {
	it("백엔드의 top-level myRank를 보존하고 bestScore를 점수로 정규화한다", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(async () =>
				new Response(
					JSON.stringify({
						rankings: [
							{ rank: 2, nickname: "테스트 사용자 B", bestScore: 1200 },
							{ rank: 1, nickname: "테스트 사용자 A", bestScore: 1500 },
						],
						totalCount: 25,
						myRank: 2,
					}),
					{ status: 200, headers: { "Content-Type": "application/json" } }
				)
			)
		);

		await expect(fetchRanking(10)).resolves.toEqual({
			rankings: [
				{ rank: 1, nickname: "테스트 사용자 A", score: 1500 },
				{ rank: 2, nickname: "테스트 사용자 B", score: 1200 },
			],
			totalCount: 25,
			myRank: 2,
		});
	});

	it("유효 필드가 없는 행을 합성하지 않고 제거한다", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(async () =>
				new Response(
					JSON.stringify({
						rankings: [
							{ nickname: "테스트 사용자 C", bestScore: 10 },
							{ rank: 1, nickname: " ", bestScore: 10 },
							{ rank: 2, nickname: "테스트 사용자 D" },
							{ rank: 3, nickname: "테스트 사용자 E", bestScore: -1 },
						],
						totalCount: 4,
						myRank: 0,
					}),
					{ status: 200 }
				)
			)
		);

		await expect(fetchRanking()).resolves.toEqual({
			rankings: [],
			totalCount: 4,
			myRank: null,
		});
	});

	it("rank와 myRank는 양의 정수만 허용하고 nickname 공백을 정리한다", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(async () =>
				new Response(
					JSON.stringify({
						rankings: [
							{
								rank: 1,
								nickname: "  테스트 사용자 A  ",
								bestScore: 10.5,
							},
							{ rank: 1.5, nickname: "테스트 사용자 B", bestScore: 20 },
						],
						myRank: 1.5,
					}),
					{ status: 200 }
				)
			)
		);

		await expect(fetchRanking()).resolves.toEqual({
			rankings: [{ rank: 1, nickname: "테스트 사용자 A", score: 10.5 }],
			totalCount: 1,
			myRank: null,
		});
	});
});
