import clientAxiosService from "@/lib/client/http/axiosService";
import type { PlayerStat, SeasonStats } from "./types";

function toSeasonStats(stat: PlayerStat): SeasonStats {
	return {
		season: stat.season,
		average: {
			G: stat.gamesPlayed,
			MPG: stat.minutesPerGame,
			"2P%": stat.twoPointPercent,
			"3P%": stat.threePointPercent,
			FT: stat.freeThrowPercent,
			OFF: stat.offensiveRebounds,
			DEF: stat.defensiveRebounds,
			TOT: stat.totalRebounds,
			APG: stat.apg,
			SPG: stat.spg,
			BPG: stat.bpg,
			TO: stat.turnovers,
			PF: stat.fouls,
			PPG: stat.ppg,
		},
		total: {
			MIN: stat.totalMinutes,
			"FGM-A": `${stat.twoPointMade + stat.threePointMade}-${
				stat.twoPointAttempted + stat.threePointAttempted
			}`,
			"3PM-A": `${stat.threePointMade}-${stat.threePointAttempted}`,
			"FTM-A": `${stat.freeThrowMade}-${stat.freeThrowAttempted}`,
			OFF: stat.totalOffensiveRebounds,
			DEF: stat.totalDefensiveRebounds,
			TOT: stat.totalTotalRebounds,
			AST: stat.totalAssists,
			STL: stat.totalSteals,
			BLK: stat.totalBlocks,
			TO: stat.totalTurnovers,
			PF: stat.totalFouls,
			PTS: stat.totalPoints,
		},
	};
}

export async function fetchSeasonStats(): Promise<SeasonStats[]> {
	const response = await clientAxiosService.get<PlayerStat[]>("/api/stats");
	return (response.data ?? []).map(toSeasonStats);
}
