import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchInternationalResults } from "./api";
import InternationalResultCard from "./components/internationalResultCard";
import InternationalResultsSection from "./components/internationalResultsSection";
import {
	formatCompetitionDate,
	internationalResultsViewReducer,
	paginateInternationalResults,
	safeSourceUrl,
	visibleInternationalResults,
} from "./presentation";
import type { InternationalResult } from "./types";

function result(
	overrides: Partial<InternationalResult> = {}
): InternationalResult {
	return {
		id: "wbl-asia-2025",
		competitionKey: "wbl-asia",
		competitionName: "FIBA WBL Asia",
		editionLabel: "2025",
		category: "CLUB",
		status: "FINAL",
		participationStatus: "CONFIRMED",
		startDate: "2025-09-23",
		endDate: "2025-09-28",
		location: "중국 둥관",
		teamName: "BNK 썸",
		teamResult: "3위",
		teamRecord: "2승 2패",
		gamesPlayed: 4,
		minutesPerGame: "25.5",
		pointsPerGame: 18.5,
		reboundsPerGame: 2.5,
		assistsPerGame: 2,
		stealsPerGame: 1.8,
		fieldGoalPercent: 45.6,
		threePointPercent: 42.5,
		freeThrowPercent: 83.3,
		highlight: "3위 결정전 30득점",
		statsUpdatedThrough: null,
		sources: [
			{ label: "FIBA 기록", url: "https://www.fiba.basketball/results", type: "OFFICIAL" },
		],
		published: true,
		displayOrder: 2,
		createdAt: "2026-09-09T00:00:00Z",
		updatedAt: "2026-09-09T00:00:00Z",
		...overrides,
	};
}

beforeEach(() => vi.stubGlobal("React", React));
afterEach(() => vi.unstubAllGlobals());

describe("international results public data", () => {
	it("fetches through the public BFF and rejects malformed responses", async () => {
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(JSON.stringify([result()]), { status: 200 })
		);
		vi.stubGlobal("fetch", fetchMock);

		await expect(fetchInternationalResults()).resolves.toHaveLength(1);
		expect(fetchMock).toHaveBeenCalledWith(
			"/api/international-results",
			expect.objectContaining({ method: "GET", cache: "no-store" })
		);

		fetchMock.mockResolvedValueOnce(
			new Response(JSON.stringify({ results: [] }), { status: 200 })
		);
		await expect(fetchInternationalResults()).rejects.toThrow("응답 형식");
	});

	it("keeps only published entries in the selected category and uses display order", () => {
		const rows = [
			result({ id: "hidden", published: false, displayOrder: 0 }),
			result({ id: "second", displayOrder: 2 }),
			result({ id: "first", displayOrder: 1 }),
			result({ id: "national", category: "NATIONAL_TEAM", displayOrder: 0 }),
		];

		expect(visibleInternationalResults(rows, "CLUB").map((row) => row.id)).toEqual([
			"first",
			"second",
		]);
	});

	it("renders result, core averages, highlight, and safe official links", () => {
		const html = renderToStaticMarkup(
			React.createElement(InternationalResultCard, {
				result: result({
					sources: [
						{ label: "공식 기록", url: "https://example.com/boxscore", type: "OFFICIAL" },
						{ label: "잘못된 링크", url: "javascript:alert(1)", type: "SECONDARY" },
					],
				}),
			})
		);

		expect(html).toContain("FIBA WBL Asia");
		expect(html).toContain("3위 · 2승 2패");
		expect(html).toContain("18.5");
		expect(html).toContain("3위 결정전 30득점");
		expect(html).toContain("https://example.com/boxscore");
		expect(html).not.toContain("javascript:");
	});

	it("labels an unconfirmed scheduled event without showing empty averages", () => {
		const html = renderToStaticMarkup(
			React.createElement(InternationalResultCard, {
				result: result({
					status: "SCHEDULED",
					participationStatus: "UNCONFIRMED",
					gamesPlayed: null,
					pointsPerGame: null,
				}),
			})
		);

		expect(html).toContain("예정");
		expect(html).toContain("명단 확인 전");
		expect(html).not.toContain("대회 평균 기록");
		expect(formatCompetitionDate("2026-09-17", "2026-09-26")).toBe(
			"2026.9.17. – 2026.9.26."
		);
		expect(safeSourceUrl("mailto:test@example.com")).toBeNull();
	});

	it("paginates nine results as 4, 4, and 1", () => {
		const rows = Array.from({ length: 9 }, (_, index) =>
			result({ id: `result-${index + 1}` })
		);

		expect(paginateInternationalResults(rows, 1).map((row) => row.id)).toEqual([
			"result-1",
			"result-2",
			"result-3",
			"result-4",
		]);
		expect(paginateInternationalResults(rows, 2)).toHaveLength(4);
		expect(paginateInternationalResults(rows, 3).map((row) => row.id)).toEqual([
			"result-9",
		]);
	});

	it("resets to page one whenever the category filter changes", () => {
		expect(
			internationalResultsViewReducer(
				{ filter: "ALL", page: 3 },
				{ type: "FILTER", filter: "NATIONAL_TEAM" }
			)
		).toEqual({ filter: "NATIONAL_TEAM", page: 1 });
	});

	it.each([
		{ count: 9, navigation: true, label: "1 / 3" },
		{ count: 4, navigation: false, label: "1 / 1" },
	])(
		"renders the first four of $count results and shows navigation only when needed",
		({ count, navigation, label }) => {
			const client = new QueryClient({
				defaultOptions: { queries: { retry: false } },
			});
			client.setQueryData(
				["international-results", "public"],
				Array.from({ length: count }, (_, index) =>
					result({
						id: `page-result-${index + 1}`,
						competitionName: `국제대회 ${index + 1}`,
						displayOrder: index + 1,
					})
				)
			);

			const html = renderToStaticMarkup(
				React.createElement(
					QueryClientProvider,
					{ client },
					React.createElement(InternationalResultsSection)
				)
			);

			expect(html).toContain("국제대회 1");
			expect(html).toContain("국제대회 4");
			expect(html).not.toContain("국제대회 5");
			expect(html.includes('aria-label="국제대회 기록 페이지"')).toBe(
				navigation
			);
		if (navigation) {
				expect(html).toContain(label);
				expect(html).toContain(
					'aria-label="이전 국제대회 기록 페이지" disabled=""'
				);
		} else {
				expect(html).not.toContain(label);
		}
		client.clear();
		}
	);
});
