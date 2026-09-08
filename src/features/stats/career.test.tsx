import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildCareerStats } from "./career";
import StatsTable from "./components/statsTable";
import type { SeasonStats } from "./types";

function season(
	name: string,
	games: number,
	overrides: Partial<SeasonStats["total"]> = {}
): SeasonStats {
	return {
		season: name,
		average: {
			G: games,
			MPG: "00:00",
			"2P%": 0,
			"3P%": 0,
			FT: 0,
			OFF: 0,
			DEF: 0,
			TOT: 0,
			APG: 0,
			SPG: 0,
			BPG: 0,
			TO: 0,
			PF: 0,
			PPG: 0,
		},
		total: {
			MIN: "300:00",
			"FGM-A": "50-100",
			"3PM-A": "20-50",
			"FTM-A": "10-20",
			OFF: 10,
			DEF: 20,
			TOT: 30,
			AST: 40,
			STL: 10,
			BLK: 2,
			TO: 20,
			PF: 30,
			PTS: 150,
			...overrides,
		},
	};
}

beforeEach(() => vi.stubGlobal("React", React));
afterEach(() => vi.unstubAllGlobals());

describe("career stats", () => {
	it("sums raw totals and weights averages by all games", () => {
		const stats = [
			season("2024-2025", 10),
			season("2025-2026", 20, {
				MIN: "800:00",
				"FGM-A": "100-200",
				"3PM-A": "30-100",
				"FTM-A": "40-50",
				OFF: 40,
				DEF: 80,
				TOT: 120,
				AST: 60,
				STL: 20,
				BLK: 4,
				TO: 30,
				PF: 40,
				PTS: 300,
			}),
		];

		const career = buildCareerStats(stats);
		expect(career?.total).toEqual({
			MIN: "1100:00",
			"FGM-A": "150-300",
			"3PM-A": "50-150",
			"FTM-A": "50-70",
			OFF: 50,
			DEF: 100,
			TOT: 150,
			AST: 100,
			STL: 30,
			BLK: 6,
			TO: 50,
			PF: 70,
			PTS: 450,
		});
		expect(career?.average).toEqual({
			G: 30,
			MPG: "36:40",
			"2P%": 66.7,
			"3P%": 33.3,
			FT: 71.4,
			OFF: 1.7,
			DEF: 3.3,
			TOT: 5,
			APG: 3.3,
			SPG: 1,
			BPG: 0.2,
			TO: 1.7,
			PF: 2.3,
			PPG: 15,
		});
	});

	it("does not invent values when a required raw field is missing", () => {
		const incomplete = season("2025-2026", 20, {
			MIN: "",
			"FGM-A": "",
		});
		const career = buildCareerStats([season("2024-2025", 10), incomplete]);

		expect(career?.total.MIN).toBeNull();
		expect(career?.average.MPG).toBeNull();
		expect(career?.total["FGM-A"]).toBeNull();
		expect(career?.average["2P%"]).toBeNull();
		expect(career?.average["3P%"]).toBe(40);
		expect(career?.total.PTS).toBe(300);
	});

	it("treats a runtime null as unavailable instead of adding a partial total", () => {
		const incomplete = season("2025-2026", 20);
		(incomplete.total.PTS as number | null) = null;

		const career = buildCareerStats([season("2024-2025", 10), incomplete]);

		expect(career?.total.PTS).toBeNull();
		expect(career?.average.PPG).toBeNull();
	});

	it("returns no career row for an empty dataset", () => {
		expect(buildCareerStats([])).toBeNull();
	});

	it.each(["average", "total"] as const)(
		"renders the career row last in the %s table",
		(mode) => {
			const html = renderToStaticMarkup(
				React.createElement(StatsTable, {
					stats: [season("2025-2026", 10)],
					mode,
				})
			);

			expect(html).toContain("통산");
			expect(html.indexOf("통산")).toBeGreaterThan(html.indexOf("2025-2026"));
		}
	);
});
