"use client";

import React, { useState, useEffect } from "react";

// 백엔드 PlayerStat 응답 형식
interface PlayerStat {
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

interface AverageStats {
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

interface TotalStats {
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

interface StatsData {
	season: string;
	average: AverageStats;
	total: TotalStats;
}

const Stats: React.FC = () => {
	const [stats, setStats] = useState<StatsData[]>([]);
	const [currentStat, setCurrentStat] = useState<StatsData | null>(null);
	const [selectedTab, setSelectedTab] = useState("average");
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchStats = async () => {
			try {
				const response = await fetch("/api/stats", {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						"Cache-Control": "no-cache",
					},
				});

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.message || "Failed to load stats.");
				}

				const backendData: PlayerStat[] = await response.json();

				// 백엔드 응답을 StatsData 형식으로 변환
				const convertedData: StatsData[] = backendData.map((stat) => ({
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
				}));

				setStats(convertedData);
			} catch (error: any) {
				console.error("Error fetching stats:", error);
				setError("An error occurred while fetching the stats.");
			}
		};

		fetchStats();
	}, []);

	const handleSeasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const selectedSeason = e.target.value;
		const selectedStat = stats.find((stat) => stat.season === selectedSeason);
		setCurrentStat(selectedStat || null);
	};

	const renderTable = <T extends AverageStats | TotalStats>(
		data: StatsData[],
		keys: (keyof T)[],
		type: "average" | "total"
	) => (
		<table className="min-w-full ">
			<thead>
				<tr>
					<th className="py-2 px-4 border-b-2 border-red-200 bg-red-600 text-center text-[10px] lg:text-xs font-semibold text-white uppercase tracking-wider">
						Season
					</th>
					{keys.map((key) => (
						<th
							key={String(key)}
							className="py-2 px-4 border-b-2 border-red-200 bg-red-600 text-center text-[10px] lg:text-xs font-semibold text-white uppercase tracking-wider"
						>
							{String(key).replace(/^(Average|Total)/, "")}
						</th>
					))}
				</tr>
			</thead>
			<tbody>
				{data.map((stat) => (
					<tr key={stat.season}>
						<td className="py-1 px-1 border-b border-red-200 text-gray-500 text-[10px] lg:text-sm text-center">
							{stat.season}
						</td>
						{keys.map((key) => (
							<td
								key={String(key)}
								className="py-1 px-1 border-b border-red-200 text-gray-500 text-[10px] lg:text-sm text-center"
							>
								{(stat[type] as any)[key]}
							</td>
						))}
					</tr>
				))}
			</tbody>
		</table>
	);

	if (error) {
		return <div>Error: {error}</div>;
	}

	if (stats.length === 0) {
		return <div>Loading...</div>;
	}

	const averageKeys: (keyof AverageStats)[] = [
		"G",
		"MPG",
		"2P%",
		"3P%",
		"FT",
		"OFF",
		"DEF",
		"TOT",
		"APG",
		"SPG",
		"BPG",
		"TO",
		"PF",
		"PPG",
	];

	const totalKeys: (keyof TotalStats)[] = [
		"MIN",
		"FGM-A",
		"3PM-A",
		"FTM-A",
		"OFF",
		"DEF",
		"TOT",
		"AST",
		"STL",
		"BLK",
		"TO",
		"PF",
		"PTS",
	];

	const displayStats = currentStat ? [currentStat] : stats;

	return (
		<div className="p-4">
			<div className="mb-4 flex items-center space-x-4 justify-end">
				<select
					onChange={handleSeasonChange}
					className="py-2 px-4 border border-red-200 text-red-500 rounded focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
				>
					<option value="">Select a season</option>
					{stats.map((stat) => (
						<option key={stat.season} value={stat.season}>
							{stat.season}
						</option>
					))}
				</select>

				<button
					onClick={() => setSelectedTab("average")}
					className={`py-2 px-4 border border-red-200 ${
						selectedTab === "average"
							? "bg-red-500 text-white"
							: "bg-white text-red-500"
					} rounded-l`}
				>
					Average Stats
				</button>

				<button
					onClick={() => setSelectedTab("total")}
					className={`py-2 px-4 border border-red-200 ${
						selectedTab === "total"
							? "bg-red-500 text-white"
							: "bg-white text-red-500"
					} rounded-r`}
				>
					Total Stats
				</button>
			</div>

			{selectedTab === "average" && (
				<div>
					<h3 className="text-xl text-gray-500 font-semibold mb-2">
						Average Stats
					</h3>
					{renderTable(displayStats, averageKeys, "average")}
				</div>
			)}
			{selectedTab === "total" && (
				<div>
					<h3 className="text-xl text-gray-500 font-semibold mb-2">
						Total Stats
					</h3>
					{renderTable(displayStats, totalKeys, "total")}
				</div>
			)}
		</div>
	);
};

export default Stats;
