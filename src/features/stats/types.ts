/** 백엔드 /api/stats 의 PlayerStat 응답 */
export interface PlayerStat {
	id: string;
	playerId: string;
	season: string;
	team: string;
	gamesPlayed: number;
	minutesPerGame: string;
	twoPointPercent: number;
	threePointPercent: number;
	freeThrowPercent: number;
	offensiveRebounds: number;
	defensiveRebounds: number;
	totalRebounds: number;
	ppg: number;
	apg: number;
	spg: number;
	bpg: number;
	turnovers: number;
	fouls: number;
	totalMinutes: string;
	twoPointMade: number;
	twoPointAttempted: number;
	threePointMade: number;
	threePointAttempted: number;
	freeThrowMade: number;
	freeThrowAttempted: number;
	totalOffensiveRebounds: number;
	totalDefensiveRebounds: number;
	totalTotalRebounds: number;
	totalAssists: number;
	totalSteals: number;
	totalBlocks: number;
	totalTurnovers: number;
	totalFouls: number;
	totalPoints: number;
}

export interface AverageStats {
	G: number;
	MPG: string;
	"2P%": number;
	"3P%": number;
	FT: number;
	OFF: number;
	DEF: number;
	TOT: number;
	APG: number;
	SPG: number;
	BPG: number;
	TO: number;
	PF: number;
	PPG: number;
}

export interface TotalStats {
	MIN: string;
	"FGM-A": string;
	"3PM-A": string;
	"FTM-A": string;
	OFF: number;
	DEF: number;
	TOT: number;
	AST: number;
	STL: number;
	BLK: number;
	TO: number;
	PF: number;
	PTS: number;
}

export interface SeasonStats {
	season: string;
	average: AverageStats;
	total: TotalStats;
}

/** 홈 상단 StatCard 4장에 쓰는 요약 */
export interface StatHighlight {
	label: string;
	value: string;
	suffix?: string;
	delta: number | null;
}

export const AVERAGE_KEYS: (keyof AverageStats)[] = [
	"G", "MPG", "2P%", "3P%", "FT", "OFF", "DEF", "TOT",
	"APG", "SPG", "BPG", "TO", "PF", "PPG",
];

export const TOTAL_KEYS: (keyof TotalStats)[] = [
	"MIN", "FGM-A", "3PM-A", "FTM-A", "OFF", "DEF", "TOT",
	"AST", "STL", "BLK", "TO", "PF", "PTS",
];
