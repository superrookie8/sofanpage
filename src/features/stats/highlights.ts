import type { SeasonStats, StatHighlight } from "./types";

/** 시즌 문자열("2025-26")을 내림차순 정렬한다. */
export function sortSeasonsDesc(stats: SeasonStats[]): SeasonStats[] {
	return stats.slice().sort((a, b) => b.season.localeCompare(a.season));
}

function round(value: number) {
	return Number.isFinite(value) ? Math.round(value * 10) / 10 : 0;
}

/**
 * 홈 상단 StatCard 4장(PPG·APG·3P%·RPG). 델타는 직전 시즌 대비 증감이며,
 * 비교할 시즌이 없으면 null로 두어 표기를 생략한다.
 */
export function buildHighlights(stats: SeasonStats[]): {
	season: string;
	highlights: StatHighlight[];
} | null {
	const sorted = sortSeasonsDesc(stats);
	const current = sorted[0];
	if (!current) return null;
	const previous = sorted[1];

	const delta = (get: (s: SeasonStats) => number) =>
		previous ? round(get(current) - get(previous)) : null;

	return {
		season: current.season,
		highlights: [
			{
				label: "PPG",
				value: round(current.average.PPG).toFixed(1),
				delta: delta((s) => s.average.PPG),
			},
			{
				label: "APG",
				value: round(current.average.APG).toFixed(1),
				delta: delta((s) => s.average.APG),
			},
			{
				label: "3P%",
				value: round(current.average["3P%"]).toFixed(1),
				suffix: "%",
				delta: delta((s) => s.average["3P%"]),
			},
			{
				label: "RPG",
				value: round(current.average.TOT).toFixed(1),
				delta: delta((s) => s.average.TOT),
			},
		],
	};
}
