import React, { useEffect, useState } from "react";

interface AverageStats {
	G: number;
	MPG: string;
	"2P%": number;
	"3P%": number;
	"FT%": number;
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
	AST: number;
	STL: number;
	BLK: number;
	PTS: number;
}

interface StatsData {
	season: string;
	average: AverageStats;
	total: TotalStats;
}

const Stats: React.FC = () => {
	const [stats, setStats] = useState<StatsData[]>([]);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchStats = async () => {
			try {
				const response = await fetch("/api/admin/getstats", {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
				});

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.message || "Failed to load stats.");
				}

				const data = await response.json();
				console.log("Fetched data:", data);
				setStats(data);
			} catch (error: any) {
				console.error("Error fetching stats:", error);
				setError("An error occurred while fetching the stats.");
			}
		};

		fetchStats();
	}, []);

	if (error) {
		return <div>Error: {error}</div>;
	}

	if (stats.length === 0) {
		return <div>Loading...</div>;
	}

	return (
		<div>
			{stats.map((stat) => (
				<div key={stat.season}>
					<h2>Season: {stat.season}</h2>
					<h3>Average Stats</h3>
					<table>
						<thead>
							<tr>
								<th>G</th>
								<th>MPG</th>
								<th>2P%</th>
								<th>3P%</th>
								<th>FT%</th>
								<th>OFF</th>
								<th>DEF</th>
								<th>TOT</th>
								<th>APG</th>
								<th>SPG</th>
								<th>BPG</th>
								<th>TO</th>
								<th>PF</th>
								<th>PPG</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td>{stat.average.G}</td>
								<td>{stat.average.MPG}</td>
								<td>{stat.average["2P%"]}</td>
								<td>{stat.average["3P%"]}</td>
								<td>{stat.average["FT%"]}</td>
								<td>{stat.average.OFF}</td>
								<td>{stat.average.DEF}</td>
								<td>{stat.average.TOT}</td>
								<td>{stat.average.APG}</td>
								<td>{stat.average.SPG}</td>
								<td>{stat.average.BPG}</td>
								<td>{stat.average.TO}</td>
								<td>{stat.average.PF}</td>
								<td>{stat.average.PPG}</td>
							</tr>
						</tbody>
					</table>

					<h3>Total Stats</h3>
					<table>
						<thead>
							<tr>
								<th>MIN</th>
								<th>FGM-A</th>
								<th>3PM-A</th>
								<th>FTM-A</th>
								<th>AST</th>
								<th>STL</th>
								<th>BLK</th>
								<th>PTS</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td>{stat.total.MIN}</td>
								<td>{stat.total["FGM-A"]}</td>
								<td>{stat.total["3PM-A"]}</td>
								<td>{stat.total["FTM-A"]}</td>
								<td>{stat.total.AST}</td>
								<td>{stat.total.STL}</td>
								<td>{stat.total.BLK}</td>
								<td>{stat.total.PTS}</td>
							</tr>
						</tbody>
					</table>
				</div>
			))}
		</div>
	);
};

export default Stats;
