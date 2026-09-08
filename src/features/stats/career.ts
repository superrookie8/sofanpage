import type {
	AverageStats,
	SeasonStats,
	StatsTableRow,
	TotalStats,
} from "./types";

type ShotTotals = { made: number; attempted: number };

function finiteNumber(value: unknown): number | null {
	return typeof value === "number" && Number.isFinite(value) && value >= 0
		? value
		: null;
}

function sumNumbers(
	stats: SeasonStats[],
	read: (stat: SeasonStats) => unknown
): number | null {
	let sum = 0;
	for (const stat of stats) {
		const value = finiteNumber(read(stat));
		if (value === null) return null;
		sum += value;
	}
	return sum;
}

function parseClock(value: unknown): number | null {
	if (typeof value !== "string") return null;
	const match = /^(\d+):([0-5]\d)$/.exec(value.trim());
	if (!match) return null;
	return Number(match[1]) * 60 + Number(match[2]);
}

function formatClock(totalSeconds: number): string {
	const rounded = Math.round(totalSeconds);
	const minutes = Math.floor(rounded / 60);
	const seconds = rounded % 60;
	return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function sumClocks(stats: SeasonStats[]): number | null {
	let seconds = 0;
	for (const stat of stats) {
		const value = parseClock(stat.total.MIN);
		if (value === null) return null;
		seconds += value;
	}
	return seconds;
}

function parseShotTotals(value: unknown): ShotTotals | null {
	if (typeof value !== "string") return null;
	const match = /^(\d+)-(\d+)$/.exec(value.trim());
	if (!match) return null;
	const made = Number(match[1]);
	const attempted = Number(match[2]);
	return made <= attempted ? { made, attempted } : null;
}

function sumShotTotals(
	stats: SeasonStats[],
	read: (stat: SeasonStats) => unknown
): ShotTotals | null {
	let made = 0;
	let attempted = 0;
	for (const stat of stats) {
		const value = parseShotTotals(read(stat));
		if (!value) return null;
		made += value.made;
		attempted += value.attempted;
	}
	return { made, attempted };
}

function formatShotTotals(value: ShotTotals | null): string | null {
	return value ? `${value.made}-${value.attempted}` : null;
}

function roundOne(value: number): number {
	return Math.round((value + Number.EPSILON) * 10) / 10;
}

function perGame(total: number | null, games: number | null): number | null {
	return total !== null && games !== null && games > 0
		? roundOne(total / games)
		: null;
}

function percentage(value: ShotTotals | null): number | null {
	return value && value.attempted > 0
		? roundOne((value.made / value.attempted) * 100)
		: null;
}

export function buildCareerStats(stats: SeasonStats[]): StatsTableRow | null {
	if (stats.length === 0) return null;

	const games = sumNumbers(stats, (stat) => stat.average.G);
	const totalSeconds = sumClocks(stats);
	const fieldGoals = sumShotTotals(stats, (stat) => stat.total["FGM-A"]);
	const threePointers = sumShotTotals(stats, (stat) => stat.total["3PM-A"]);
	const freeThrows = sumShotTotals(stats, (stat) => stat.total["FTM-A"]);
	const twoPointers =
		fieldGoals &&
		threePointers &&
		fieldGoals.made >= threePointers.made &&
		fieldGoals.attempted >= threePointers.attempted
			? {
					made: fieldGoals.made - threePointers.made,
					attempted: fieldGoals.attempted - threePointers.attempted,
				}
			: null;

	const numericTotals = {
		OFF: sumNumbers(stats, (stat) => stat.total.OFF),
		DEF: sumNumbers(stats, (stat) => stat.total.DEF),
		TOT: sumNumbers(stats, (stat) => stat.total.TOT),
		AST: sumNumbers(stats, (stat) => stat.total.AST),
		STL: sumNumbers(stats, (stat) => stat.total.STL),
		BLK: sumNumbers(stats, (stat) => stat.total.BLK),
		TO: sumNumbers(stats, (stat) => stat.total.TO),
		PF: sumNumbers(stats, (stat) => stat.total.PF),
		PTS: sumNumbers(stats, (stat) => stat.total.PTS),
	};

	const average: { [K in keyof AverageStats]: AverageStats[K] | null } = {
		G: games,
		MPG:
			totalSeconds !== null && games !== null && games > 0
				? formatClock(totalSeconds / games)
				: null,
		"2P%": percentage(twoPointers),
		"3P%": percentage(threePointers),
		FT: percentage(freeThrows),
		OFF: perGame(numericTotals.OFF, games),
		DEF: perGame(numericTotals.DEF, games),
		TOT: perGame(numericTotals.TOT, games),
		APG: perGame(numericTotals.AST, games),
		SPG: perGame(numericTotals.STL, games),
		BPG: perGame(numericTotals.BLK, games),
		TO: perGame(numericTotals.TO, games),
		PF: perGame(numericTotals.PF, games),
		PPG: perGame(numericTotals.PTS, games),
	};

	const total: { [K in keyof TotalStats]: TotalStats[K] | null } = {
		MIN: totalSeconds === null ? null : formatClock(totalSeconds),
		"FGM-A": formatShotTotals(fieldGoals),
		"3PM-A": formatShotTotals(threePointers),
		"FTM-A": formatShotTotals(freeThrows),
		...numericTotals,
	};

	return { season: "통산", average, total };
}
