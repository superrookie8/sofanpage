"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
	currentSeason,
	EXTRA_HOME_VENUES,
	GameSchedule,
	isValidSeason,
	OPPONENT_TEAMS,
	TIME_PRESETS,
} from "@/data/schedule";
import useAdminAuth from "@/hooks/useAdminAuth";

type Notice = { tone: "error" | "success"; text: string };

const emptyForm = (season: string): GameSchedule => ({
	_id: "",
	date: "",
	opponent: "",
	isHome: false,
	time: "",
	season,
	extraHome: "",
	specialGame: false,
});

function sortSeasonsDesc(values: string[]): string[] {
	return Array.from(new Set(values.filter(Boolean))).sort((a, b) => b.localeCompare(a));
}

function sortSchedulesByDate(values: GameSchedule[]): GameSchedule[] {
	return [...values].sort((a, b) =>
		`${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)
	);
}

async function readErrorMessage(response: Response, fallback: string): Promise<string> {
	try {
		const body = await response.json();
		const message = body?.message ?? body?.error;
		return typeof message === "string" && message ? message : fallback;
	} catch {
		return fallback;
	}
}

const AdminSchedule: React.FC = () => {
	useAdminAuth();
	const [seasons, setSeasons] = useState<string[]>([]);
	const [selectedSeason, setSelectedSeason] = useState<string>("");
	const [seasonDraft, setSeasonDraft] = useState<string>("");
	const [addingSeason, setAddingSeason] = useState<boolean>(false);
	const [scheduleList, setScheduleList] = useState<GameSchedule[]>([]);
	const [listKey, setListKey] = useState<number>(0);
	const [loading, setLoading] = useState<boolean>(false);
	const [saving, setSaving] = useState<boolean>(false);
	const [notice, setNotice] = useState<Notice | null>(null);
	const [form, setForm] = useState<GameSchedule>(() => emptyForm(""));
	const [isEditing, setIsEditing] = useState<boolean>(false);
	const [useCustomTime, setUseCustomTime] = useState<boolean>(false);
	const [showExtraHome, setShowExtraHome] = useState<boolean>(false);
	const [homeFilter, setHomeFilter] = useState<string>("all");

	const fetchSeasons = useCallback(async (): Promise<string[]> => {
		const response = await fetch("/api/admin/getseasons", { cache: "no-store" });
		if (!response.ok) {
			throw new Error(await readErrorMessage(response, "시즌 목록을 불러오지 못했습니다."));
		}
		const data: unknown = await response.json();
		return Array.isArray(data) ? data.filter((value): value is string => typeof value === "string") : [];
	}, []);

	// 최초 진입: 저장된 시즌이 없으면 오늘 기준 시즌 하나를 만들어 화면이 비지 않게 한다.
	useEffect(() => {
		let active = true;
		fetchSeasons()
			.then((fetched) => {
				if (!active) return;
				const merged = sortSeasonsDesc(fetched.length > 0 ? fetched : [currentSeason()]);
				setSeasons(merged);
				setSelectedSeason((current) => current || merged[0]);
			})
			.catch((error: unknown) => {
				if (!active) return;
				const fallback = sortSeasonsDesc([currentSeason()]);
				setSeasons(fallback);
				setSelectedSeason((current) => current || fallback[0]);
				setNotice({
					tone: "error",
					text: error instanceof Error ? error.message : "시즌 목록을 불러오지 못했습니다.",
				});
			});
		return () => {
			active = false;
		};
	}, [fetchSeasons]);

	useEffect(() => {
		if (!selectedSeason) return;
		let active = true;
		setLoading(true);
		fetch(`/api/admin/getschedule?season=${encodeURIComponent(selectedSeason)}`, { cache: "no-store" })
			.then(async (response) => {
				if (!response.ok) {
					throw new Error(await readErrorMessage(response, "경기 일정을 불러오지 못했습니다."));
				}
				return response.json();
			})
			.then((data: unknown) => {
				if (!active) return;
				setScheduleList(sortSchedulesByDate(Array.isArray(data) ? (data as GameSchedule[]) : []));
			})
			.catch((error: unknown) => {
				if (!active) return;
				setScheduleList([]);
				setNotice({
					tone: "error",
					text: error instanceof Error ? error.message : "경기 일정을 불러오지 못했습니다.",
				});
			})
			.finally(() => {
				if (active) setLoading(false);
			});
		return () => {
			active = false;
		};
	}, [selectedSeason, listKey]);

	const filteredScheduleList = useMemo(() => {
		if (homeFilter === "home") return scheduleList.filter((schedule) => schedule.isHome);
		if (homeFilter === "away") return scheduleList.filter((schedule) => !schedule.isHome);
		return scheduleList;
	}, [homeFilter, scheduleList]);

	const resetForm = useCallback(() => {
		setForm(emptyForm(selectedSeason));
		setIsEditing(false);
		setUseCustomTime(false);
		setShowExtraHome(false);
	}, [selectedSeason]);

	// 시즌을 바꾸면 편집 중이던 다른 시즌의 경기가 남지 않도록 폼을 비운다.
	useEffect(() => {
		setForm(emptyForm(selectedSeason));
		setIsEditing(false);
		setUseCustomTime(false);
		setShowExtraHome(false);
	}, [selectedSeason]);

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
	) => {
		const { name, value } = e.target;
		setForm((current) => ({ ...current, [name]: value }));
	};

	const handleHomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const isHome = e.target.checked;
		setForm((current) => ({ ...current, isHome, extraHome: isHome ? current.extraHome : "" }));
		if (!isHome) setShowExtraHome(false);
	};

	const handleExtraHomeToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
		setShowExtraHome(e.target.checked);
		if (!e.target.checked) setForm((current) => ({ ...current, extraHome: "" }));
	};

	const handleTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const { value } = e.target;
		if (value === "custom") {
			setUseCustomTime(true);
			setForm((current) => ({ ...current, time: "" }));
			return;
		}
		setUseCustomTime(false);
		setForm((current) => ({ ...current, time: value }));
	};

	const addSeason = () => {
		const candidate = seasonDraft.trim();
		if (!isValidSeason(candidate)) {
			setNotice({ tone: "error", text: "시즌은 2025-2026처럼 연속한 두 연도로 입력해 주세요." });
			return;
		}
		setSeasons((current) => sortSeasonsDesc([...current, candidate]));
		setSelectedSeason(candidate);
		setSeasonDraft("");
		setAddingSeason(false);
		setNotice({
			tone: "success",
			text: `${candidate} 시즌을 선택했습니다. 첫 경기를 등록하면 시즌이 저장됩니다.`,
		});
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (saving) return;

		if (!form.date) {
			setNotice({ tone: "error", text: "경기 날짜를 선택해 주세요." });
			return;
		}
		if (!form.opponent) {
			setNotice({ tone: "error", text: "상대 팀을 선택해 주세요." });
			return;
		}
		if (!/^\d{2}:\d{2}$/.test(form.time)) {
			setNotice({ tone: "error", text: "경기 시간을 선택하거나 직접 입력해 주세요." });
			return;
		}

		const payload = {
			...form,
			season: selectedSeason,
			extraHome: form.isHome && showExtraHome ? form.extraHome || "" : "",
			specialGame: Boolean(form.specialGame),
		};

		setSaving(true);
		try {
			const response = await fetch("/api/admin/postschedule", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});
			if (!response.ok) {
				throw new Error(await readErrorMessage(
					response,
					isEditing ? "경기 일정을 수정하지 못했습니다." : "경기 일정을 등록하지 못했습니다."
				));
			}
			await response.json();
			resetForm();
			setListKey((value) => value + 1);
			fetchSeasons()
				.then((fetched) => setSeasons((current) => sortSeasonsDesc([...current, ...fetched])))
				.catch(() => undefined);
			setNotice({
				tone: "success",
				text: isEditing ? "경기 일정을 수정했습니다." : "경기 일정을 등록했습니다.",
			});
		} catch (error: unknown) {
			setNotice({
				tone: "error",
				text: error instanceof Error ? error.message : "경기 일정을 저장하지 못했습니다.",
			});
		} finally {
			setSaving(false);
		}
	};

	const handleEdit = (schedule: GameSchedule) => {
		const preset = TIME_PRESETS.includes(schedule.time as (typeof TIME_PRESETS)[number]);
		setForm({
			...schedule,
			season: selectedSeason,
			extraHome: schedule.extraHome ?? "",
			specialGame: Boolean(schedule.specialGame),
		});
		setIsEditing(true);
		setUseCustomTime(!preset);
		setShowExtraHome(Boolean(schedule.isHome && schedule.extraHome));
		setNotice(null);
	};

	const handleDelete = async (schedule: GameSchedule) => {
		try {
			const response = await fetch("/api/admin/deleteschedule", {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ _id: schedule._id }),
			});
			if (!response.ok) {
				throw new Error(await readErrorMessage(response, "경기 일정을 삭제하지 못했습니다."));
			}
			if (form._id === schedule._id) resetForm();
			setListKey((value) => value + 1);
			setNotice({ tone: "success", text: "경기 일정을 삭제했습니다." });
		} catch (error: unknown) {
			setNotice({
				tone: "error",
				text: error instanceof Error ? error.message : "경기 일정을 삭제하지 못했습니다.",
			});
		}
	};

	return (
		<div className="container mx-auto">
			<div className="mb-4 flex flex-wrap items-center gap-2">
				{seasons.map((season) => (
					<button
						key={season}
						type="button"
						onClick={() => {
							setNotice(null);
							setSelectedSeason(season);
						}}
						aria-pressed={selectedSeason === season}
						className={`px-4 py-2 ${
							selectedSeason === season ? "bg-blue-500 text-white" : "bg-gray-300"
						}`}
					>
						{season}
					</button>
				))}
				{addingSeason ? (
					<span className="flex items-center gap-2">
						<input
							type="text"
							value={seasonDraft}
							onChange={(e) => setSeasonDraft(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									e.preventDefault();
									addSeason();
								}
							}}
							placeholder={currentSeason()}
							aria-label="추가할 시즌"
							className="w-40 border px-2 py-1"
						/>
						<button type="button" onClick={addSeason} className="bg-green-500 px-4 py-2 text-white">
							추가
						</button>
						<button
							type="button"
							onClick={() => {
								setAddingSeason(false);
								setSeasonDraft("");
							}}
							className="bg-gray-300 px-4 py-2"
						>
							취소
						</button>
					</span>
				) : (
					<button
						type="button"
						onClick={() => {
							setSeasonDraft(currentSeason());
							setAddingSeason(true);
						}}
						className="bg-green-500 px-4 py-2 text-white"
					>
						New Season
					</button>
				)}
			</div>

			{notice && (
				<p
					role={notice.tone === "error" ? "alert" : "status"}
					className={`mb-4 rounded border px-3 py-2 text-sm ${
						notice.tone === "error"
							? "border-red-300 text-red-700"
							: "border-green-300 text-green-700"
					}`}
				>
					{notice.text}
				</p>
			)}

			{selectedSeason && (
				<>
					<h2 className="mb-4 text-xl font-bold">{selectedSeason} Schedule</h2>
					<form onSubmit={handleSubmit} className="mb-4">
						<h3 className="mb-4 text-lg font-bold">
							{isEditing ? "경기 일정 수정" : "새 경기 일정 등록"}
						</h3>
						<div className="mb-2">
							<label className="block mb-1" htmlFor="schedule-date">Date</label>
							<input
								id="schedule-date"
								type="date"
								name="date"
								value={form.date}
								onChange={handleInputChange}
								required
								className="border px-2 py-1 w-full"
							/>
						</div>
						<div className="mb-2">
							<label className="block mb-1" htmlFor="schedule-opponent">Opponent</label>
							<select
								id="schedule-opponent"
								name="opponent"
								value={form.opponent}
								onChange={handleInputChange}
								required
								className="border px-2 py-1 w-full"
							>
								<option value="">상대 팀 선택</option>
								{OPPONENT_TEAMS.map((team) => (
									<option key={team} value={team}>
										{team}
									</option>
								))}
								{form.opponent && !OPPONENT_TEAMS.includes(form.opponent as (typeof OPPONENT_TEAMS)[number]) && (
									<option value={form.opponent}>{form.opponent} (기존 값)</option>
								)}
							</select>
						</div>
						<div className="mb-2">
							<label className="block mb-1" htmlFor="schedule-special">
								Special Game (올스타전 등)
							</label>
							<input
								id="schedule-special"
								type="checkbox"
								checked={Boolean(form.specialGame)}
								onChange={(e) =>
									setForm((current) => ({ ...current, specialGame: e.target.checked }))
								}
								className="border px-2 py-1"
							/>
						</div>
						<div className="mb-2">
							<label className="block mb-1" htmlFor="schedule-home">Is Home</label>
							<input
								id="schedule-home"
								type="checkbox"
								name="isHome"
								checked={form.isHome}
								onChange={handleHomeChange}
								className="border px-2 py-1"
							/>
						</div>
						{form.isHome && (
							<div className="mb-2">
								<label className="block mb-1" htmlFor="schedule-extra-home-toggle">
									Extra Home Location
								</label>
								<input
									id="schedule-extra-home-toggle"
									type="checkbox"
									checked={showExtraHome}
									onChange={handleExtraHomeToggle}
									className="border px-2 py-1"
								/>
								{showExtraHome && (
									<select
										name="extraHome"
										value={form.extraHome ?? ""}
										onChange={handleInputChange}
										aria-label="대체 홈 구장"
										className="border px-2 py-1 w-full"
									>
										<option value="">사직실내체육관 (기본)</option>
										{EXTRA_HOME_VENUES.map((venue) => (
											<option key={venue} value={venue}>
												{venue}
											</option>
										))}
									</select>
								)}
							</div>
						)}
						<div className="mb-2">
							<label className="block mb-1" htmlFor="schedule-time">Time</label>
							<select
								id="schedule-time"
								name="time"
								value={useCustomTime ? "custom" : form.time}
								onChange={handleTimeChange}
								required
								className="border px-2 py-1 w-full"
							>
								<option value="">경기 시간 선택</option>
								{TIME_PRESETS.map((preset) => (
									<option key={preset} value={preset}>
										{preset}
									</option>
								))}
								<option value="custom">Add Custom Time</option>
							</select>
							{useCustomTime && (
								<input
									type="time"
									name="time"
									value={form.time}
									onChange={handleInputChange}
									aria-label="직접 입력한 경기 시간"
									className="border px-2 py-1 w-full mt-2"
								/>
							)}
						</div>
						<div className="mt-2 flex gap-2">
							<button type="submit" disabled={saving} className="bg-blue-500 px-4 py-2 text-white">
								{saving ? "저장 중..." : isEditing ? "Update Schedule" : "Add Schedule"}
							</button>
							{isEditing && (
								<button type="button" onClick={resetForm} className="bg-gray-300 px-4 py-2">
									수정 취소
								</button>
							)}
						</div>
					</form>

					<div>
						<div className="flex">
							<h2 className="text-xl font-bold mb-2 mr-4">Schedule List</h2>
							<div className="mb-4">
								<select
									value={homeFilter}
									onChange={(e) => setHomeFilter(e.target.value)}
									aria-label="홈/원정 필터"
									className="border px-2 py-1 w-full"
								>
									<option value="all">All</option>
									<option value="home">Home</option>
									<option value="away">Away</option>
								</select>
							</div>
						</div>
						<div className="h-64 overflow-y-auto">
							{loading ? (
								<p role="status">경기 일정을 불러오는 중입니다...</p>
							) : filteredScheduleList.length === 0 ? (
								<p role="status">{selectedSeason} 시즌에 등록된 경기가 없습니다.</p>
							) : (
								<ul>
									{filteredScheduleList.map((schedule) => (
										<li key={schedule._id} className="border p-2 mb-2 flex justify-between">
											<div>
												<span>
													{schedule.date} - {schedule.opponent}
												{schedule.specialGame ? " (특별 경기)" : ""} -{" "}
													{schedule.isHome
														? `Home ${schedule.extraHome ? `(${schedule.extraHome})` : ""}`
														: "Away"}{" "}
													- {schedule.time}
												</span>
											</div>
											<div>
												<button
													type="button"
													onClick={() => handleEdit(schedule)}
													className="bg-yellow-500 text-white px-2 py-1 mr-2"
												>
													Edit
												</button>
												<button
													type="button"
													onClick={() => handleDelete(schedule)}
													className="bg-red-500 text-white px-2 py-1"
												>
													Delete
												</button>
											</div>
										</li>
									))}
								</ul>
							)}
						</div>
					</div>
				</>
			)}
		</div>
	);
};

export default AdminSchedule;
