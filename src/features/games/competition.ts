export type TeamType = "club" | "national";
export type VenueType = "home" | "away" | "neutral";
export interface CompetitionMetadata {
	competitionKey?: string | null;
	competitionName?: string | null;
	competitionKind?: "league" | "tournament" | "friendly" | "other" | null;
	editionLabel?: string | null;
	teamType?: TeamType | null;
	ourTeamName?: string | null;
	venueType?: VenueType | null;
	venueName?: string | null;
	stadiumId?: string | null;
	stage?: string | null;
}
export interface ScheduleFilters {
	competitionKey?: string;
	editionLabel?: string;
	teamType?: TeamType | "";
	season?: string;
}
export type CompetitionSchedule = CompetitionMetadata & {
	season?: string | null;
	date?: string;
	startDateTime?: string;
	type?: string;
	specialGame?: boolean | string | null;
	isHome?: boolean | null;
	location?: string | null;
};

export const COMPETITION_PRESETS = [
	{ key: "wkbl", name: "WKBL", kind: "league", teamType: "club" },
	{ key: "park-shinja-cup", name: "박신자컵", kind: "tournament", teamType: "club" },
	{ key: "world-cup", name: "월드컵", kind: "tournament", teamType: "national" },
	{ key: "asian-games", name: "아시안게임", kind: "tournament", teamType: "national" },
	{ key: "olympics", name: "올림픽", kind: "tournament", teamType: "national" },
] as const;

/** Presets only assist entry. Any nonempty stable key and display name may be stored. */
export function competitionKeyFromName(name: string) {
	return name.normalize("NFKC").trim().toLowerCase().replace(/\s+/g, "-").slice(0, 100);
}

export function legacySeason(schedule: CompetitionSchedule): string {
	if (schedule.season?.trim()) return schedule.season.trim();
	const value = schedule.startDateTime ?? schedule.date ?? "";
	const calendarDate = /^(\d{4})-(\d{2})-\d{2}(?:T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?)?$/.exec(value);
	let year: number;
	let month: number;
	if (calendarDate) {
		year = Number(calendarDate[1]); month = Number(calendarDate[2]);
	} else {
		const date = new Date(value);
		if (Number.isNaN(date.getTime())) return "미분류";
		const parts = new Intl.DateTimeFormat("en", { timeZone: "Asia/Seoul", year: "numeric", month: "numeric" }).formatToParts(date);
		year = Number(parts.find((part) => part.type === "year")?.value);
		month = Number(parts.find((part) => part.type === "month")?.value);
	}
	return month >= 7 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
}

/** Old responses retain their meaning. Non-game events never acquire a competition. */
export function competitionOf(schedule: CompetitionSchedule): CompetitionMetadata {
	if (schedule.competitionKey) return schedule;
	if (schedule.type && !["game", "specialGame"].includes(schedule.type) && schedule.specialGame !== true) return {};
	const special = schedule.specialGame === true || schedule.type === "specialGame";
	return {
		competitionKey: special ? "legacy-special" : "wkbl",
		competitionName: special ? "미분류 특별경기" : "WKBL",
		competitionKind: special ? "other" : "league",
		editionLabel: legacySeason(schedule),
		teamType: special ? null : "club",
		ourTeamName: special ? null : "BNK 썸",
		venueType: (schedule.isHome ?? schedule.location === "Home") ? "home" : "away",
	};
}

export function competitionLabel(schedule: CompetitionSchedule): string {
	const metadata = competitionOf(schedule);
	return [metadata.competitionName, metadata.editionLabel, metadata.stage].filter(Boolean).join(" · ");
}

export function venueTypeLabel(schedule: CompetitionSchedule): string {
	const value = competitionOf(schedule).venueType;
	return value === "home" ? "홈" : value === "neutral" ? "중립" : value === "away" ? "원정" : "경기장 미정";
}

export function matchesScheduleFilters(schedule: CompetitionSchedule, filters: ScheduleFilters): boolean {
	const metadata = competitionOf(schedule);
	return (!filters.competitionKey || metadata.competitionKey === filters.competitionKey)
		&& (!filters.editionLabel || metadata.editionLabel === filters.editionLabel)
		&& (!filters.teamType || metadata.teamType === filters.teamType)
		&& (!filters.season || (schedule.season?.trim() || (!schedule.competitionKey ? legacySeason(schedule) : "")) === filters.season);
}

export function scheduleFilterParams(filters: ScheduleFilters = {}): URLSearchParams {
	const params = new URLSearchParams();
	for (const key of ["competitionKey", "editionLabel", "teamType", "season"] as const) {
		const value = filters[key]?.trim();
		if (value) params.set(key, value);
	}
	return params;
}

export function scheduleFilterKey(filters: ScheduleFilters = {}): string {
	return scheduleFilterParams(filters).toString();
}

export function selectCompetitionFilter(filters: ScheduleFilters, competitionKey: string): ScheduleFilters {
	return { ...filters, competitionKey, editionLabel: "", season: "" };
}

/** Existing/preset keys are stable. Explicit custom classification generates a key on every name edit. */
export function keyAfterCompetitionNameEdit(name: string, currentKey: string | null | undefined, autoGenerate: boolean) {
	return autoGenerate ? competitionKeyFromName(name) : currentKey;
}
