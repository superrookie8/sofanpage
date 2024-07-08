"use client";

import React, { useState, useEffect } from "react";

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
				const response = await fetch("/api/admin/getstats", {
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

				const data: StatsData[] = await response.json();
				console.log("Fetched data:", data); // 데이터 확인을 위한 로그
				setStats(data);
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
		<table className="min-w-full bg-white">
			<thead>
				<tr>
					<th className="py-2 px-4 border-b-2 border-red-200 bg-red-100 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
						Season
					</th>
					{keys.map((key) => (
						<th
							key={String(key)}
							className="py-2 px-4 border-b-2 border-red-200 bg-red-100 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
						>
							{String(key).replace(/^(Average|Total)/, "")}
						</th>
					))}
				</tr>
			</thead>
			<tbody>
				{data.map((stat) => (
					<tr key={stat.season}>
						<td className="py-2 px-4 border-b border-red-200 text-gray-500">
							{stat.season}
						</td>
						{keys.map((key) => (
							<td
								key={String(key)}
								className="py-2 px-4 border-b border-red-200 text-gray-500"
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
			<div className="mb-4 flex items-center space-x-4">
				<select
					onChange={handleSeasonChange}
					className="py-2 px-4 border border-red-200 text-red-500 rounded"
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
