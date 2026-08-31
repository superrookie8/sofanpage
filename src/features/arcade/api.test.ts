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
							{ rank: 2, nickname: "나", bestScore: 1200 },
							{ rank: 1, nickname: "선두", bestScore: 1500 },
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
				{ rank: 1, nickname: "선두", score: 1500 },
				{ rank: 2, nickname: "나", score: 1200 },
			],
			totalCount: 25,
			myRank: 2,
		});
	});

	it("레거시 배열 응답도 익명 랭킹으로 처리한다", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(async () =>
				new Response(JSON.stringify([{ nickname: "팬", score: 10 }]), {
					status: 200,
				})
			)
		);

		await expect(fetchRanking()).resolves.toEqual({
			rankings: [{ rank: 1, nickname: "팬", score: 10 }],
			totalCount: 1,
			myRank: null,
		});
	});
});
