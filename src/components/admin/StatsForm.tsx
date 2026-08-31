"use client";

import useAdminAuth from "@/hooks/useAdminAuth";
import {
	DUPLICATE_STATS_SEASON_MESSAGE,
	emptyStatsDraft,
	hasDuplicateStatsSeason,
	legacyStatsRequest,
	LegacyStats,
	statsFormDraft,
	StatsValidationError,
} from "@/lib/admin/adapters";
import React, { useState, useEffect, useRef } from "react";

type StatsData = LegacyStats;

const averageLabels: Record<string, string> = {
	G: "경기 수 (G)", MPG: "평균 출전 시간 (MPG)", "2P%": "2점슛 성공률 (2P%)",
	"3P%": "3점슛 성공률 (3P%)", FT: "자유투 성공률 (FT)", OFF: "평균 공격 리바운드 (OFF)",
	DEF: "평균 수비 리바운드 (DEF)", TOT: "평균 리바운드 (TOT)", APG: "평균 어시스트 (APG)",
	SPG: "평균 스틸 (SPG)", BPG: "평균 블록 (BPG)", TO: "평균 턴오버 (TO)",
	PF: "평균 파울 (PF)", PPG: "평균 득점 (PPG)",
};

const totalLabels: Record<string, string> = {
	MIN: "총 출전 시간 (MIN)", "FGM-A": "2점슛 성공-시도 (FGM-A)",
	"3PM-A": "3점슛 성공-시도 (3PM-A)", "FTM-A": "자유투 성공-시도 (FTM-A)",
	OFF: "총 공격 리바운드 (OFF)", DEF: "총 수비 리바운드 (DEF)", TOT: "총 리바운드 (TOT)",
	AST: "총 어시스트 (AST)", STL: "총 스틸 (STL)", BLK: "총 블록 (BLK)",
	TO: "총 턴오버 (TO)", PF: "총 파울 (PF)", PTS: "총 득점 (PTS)",
};

const totalTextFields = new Set(["MIN", "FGM-A", "3PM-A", "FTM-A"]);

const StatsForm: React.FC = () => {
	useAdminAuth();
	const [stats, setStats] = useState<StatsData[]>([]);
	const [currentStat, setCurrentStat] = useState<StatsData>(emptyStatsDraft);
	const [error, setError] = useState<string | null>(null);
	const [message, setMessage] = useState<string | null>(null);
	const [selectedRecord, setSelectedRecord] = useState("");
	const seasonInputRef = useRef<HTMLInputElement>(null);

	const fetchStats = async () => {
		try {
			const response = await fetch("/api/admin/getstats");
			if (!response.ok) {
				throw new Error("Failed to fetch stats from backend");
			}
			const data = await response.json() as StatsData[];
			setStats(data.map(statsFormDraft));
		} catch (error) {
			console.error("Error fetching stats:", error);
			setError("An error occurred while fetching the stats.");
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setMessage(null);

		try {
			legacyStatsRequest(currentStat);
			if (!currentStat._id && hasDuplicateStatsSeason(stats, currentStat.season)) {
				setError(DUPLICATE_STATS_SEASON_MESSAGE);
				return;
			}
			const response = await fetch("/api/admin/stats", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(currentStat),
			});

			const data = await response.json().catch(() => ({}));
			if (response.ok) {
				await fetchStats();
				setCurrentStat(emptyStatsDraft());
				setSelectedRecord("");
				setMessage("Stats saved successfully!");
			} else {
				setError(
					response.status === 409
						? DUPLICATE_STATS_SEASON_MESSAGE
						: data.message || "Failed to save stats."
				);
			}
		} catch (error) {
			console.error("Error saving stats:", error);
			if (error instanceof StatsValidationError) setError(error.message);
			else setMessage("An error occurred while saving the stats.");
		}
	};

	useEffect(() => {
		fetchStats();
	}, []);

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		const [category, key] = name.split(".");

		setCurrentStat((prevState) => {
			if (category === "average" || category === "total") {
				return {
					...prevState,
					[category]: { ...prevState[category], [key]: value },
				};
			}
			return prevState;
		});
	};

	const handleSeasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const selection = e.target.value;
		setSelectedRecord(selection);
		setError(null);
		setMessage(null);
		if (selection === "__new__") {
			setCurrentStat(emptyStatsDraft());
			requestAnimationFrame(() => seasonInputRef.current?.focus());
			return;
		}
		const selectedStat = stats.find((stat) => stat._id === selection);
		if (selectedStat) {
			setCurrentStat(statsFormDraft(selectedStat));
		} else {
			setCurrentStat(emptyStatsDraft());
		}
	};

	const handleDelete = async (stat: StatsData) => {
		if (!stat._id || !window.confirm(`${stat.season} 기록을 삭제할까요?`)) return;
		setError(null);
		const response = await fetch("/api/admin/stats", {
			method: "DELETE",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ id: stat._id }),
		});
		if (!response.ok) {
			const body = await response.json().catch(() => ({}));
			setError(body.message || body.error || "기록을 삭제하지 못했습니다.");
			return;
		}
		setMessage("기록을 삭제했습니다.");
		await fetchStats();
		if (selectedRecord === stat._id) {
			setSelectedRecord("");
			setCurrentStat(emptyStatsDraft());
		}
	};

	return (
		<div>
			<form onSubmit={handleSubmit}>
				<div>
					<label htmlFor="stats-record-select">시즌 기록 선택:</label>
					<select id="stats-record-select" onChange={handleSeasonChange} value={selectedRecord}>
						<option value="">Select a season</option>
						<option value="__new__">New Season</option>
						{stats.map((stat) => (
							<option key={stat._id} value={stat._id}>
								{stat.season}
							</option>
						))}
					</select>
				</div>
				<div>
					<label htmlFor="stats-season">Season:</label>
					<input
						id="stats-season"
						ref={seasonInputRef}
						name="season"
						value={currentStat.season}
						disabled={!selectedRecord}
						onChange={(e) =>
							setCurrentStat({ ...currentStat, season: e.target.value })
						}
					/>
				</div>
				<h2>Average Records</h2>
				{Object.entries(currentStat.average).map(([key, value]) => {
					const isTime = key === "MPG";
					const isInteger = key === "G";
					const label = averageLabels[key] ?? key;
					return <div key={key}>
						<label htmlFor={`average-${key}`}>{label}:</label>
						<input
							id={`average-${key}`}
							type="text"
							inputMode={isTime ? "text" : isInteger ? "numeric" : "decimal"}
							pattern={isTime ? undefined : isInteger ? "[0-9]*" : "[0-9]*[.]?[0-9]*"}
							aria-label={label}
							name={`average.${key}`}
							value={value}
							onChange={handleChange}
						/>
					</div>;
				})}
				<h2>Total Records</h2>
				{Object.entries(currentStat.total).map(([key, value]) => {
					const isText = totalTextFields.has(key);
					const label = totalLabels[key] ?? key;
					return <div key={key}>
						<label htmlFor={`total-${key}`}>{label}:</label>
						<input
							id={`total-${key}`}
							type="text"
							inputMode={isText ? "text" : "numeric"}
							pattern={isText ? undefined : "[0-9]*"}
							aria-label={label}
							name={`total.${key}`}
							value={value}
							onChange={handleChange}
						/>
					</div>;
				})}
				<button type="submit">Save Stats</button>
				{message && <p>{message}</p>}
				{error && <p>{error}</p>}
			</form>
			<h2>Existing Stats</h2>
			<ul>
				{stats.map((stat) => (
					<li key={stat._id}>
						<button type="button" onClick={() => {
							setSelectedRecord(stat._id ?? "");
							setCurrentStat(statsFormDraft(stat));
						}}>{stat.season}</button>
						<button type="button" onClick={() => handleDelete(stat)}>Delete</button>
					</li>
				))}
			</ul>
		</div>
	);
};

export default StatsForm;
