import type { ScheduleResponse } from "./types";

/**
 * WKBL 시즌은 가을에 시작해 이듬해 봄에 끝난다. 7월을 경계로 삼아,
 * 7월 이후 경기는 그 해 시작 시즌, 6월 이전 경기는 전년도 시작 시즌에 속한다.
 * 백엔드 Schedule.resolveSeason()과 같은 규칙이다.
 */
export const SEASON_START_MONTH = 7;

export function seasonOfDate(date: Date): string {
	const year = date.getFullYear();
	return date.getMonth() + 1 >= SEASON_START_MONTH
		? `${year}-${year + 1}`
		: `${year - 1}-${year}`;
}

/** 응답의 season을 우선 쓰고, 없는 구형 응답은 경기일로 유추한다. */
export function seasonOf(schedule: ScheduleResponse): string | null {
	const declared = schedule.season?.trim();
	if (declared) return declared;
	const date = new Date(schedule.startDateTime);
	return Number.isNaN(date.getTime()) ? null : seasonOfDate(date);
}

/** 경기가 있는 시즌 목록. 최신 시즌이 앞에 온다. */
export function listSeasons(schedules: ScheduleResponse[]): string[] {
	const seasons = new Set<string>();
	for (const schedule of schedules) {
		const season = seasonOf(schedule);
		if (season) seasons.add(season);
	}
	return Array.from(seasons).sort((a, b) => b.localeCompare(a));
}

/**
 * 처음 보여줄 시즌.
 *
 * 비시즌에는 오늘이 속한 시즌에 경기가 하나도 없을 수 있다. 그때 빈 화면을
 * 띄우지 않도록, 경기가 있는 시즌 중 가장 최신을 고른다.
 */
export function defaultSeason(
	schedules: ScheduleResponse[],
	today: Date = new Date()
): string | null {
	const seasons = listSeasons(schedules);
	if (seasons.length === 0) return null;
	const current = seasonOfDate(today);
	return seasons.includes(current) ? current : seasons[0];
}

export function schedulesInSeason(
	schedules: ScheduleResponse[],
	season: string | null
): ScheduleResponse[] {
	if (!season) return schedules;
	return schedules.filter((schedule) => seasonOf(schedule) === season);
}

/** 시즌의 첫 경기가 있는 달. 달력을 그 시즌으로 데려갈 때 쓴다. */
export function firstMonthOfSeason(
	schedules: ScheduleResponse[],
	season: string | null
): Date | null {
	const dates = schedulesInSeason(schedules, season)
		.map((schedule) => new Date(schedule.startDateTime))
		.filter((date) => !Number.isNaN(date.getTime()))
		.sort((a, b) => a.getTime() - b.getTime());
	if (dates.length === 0) return null;
	return new Date(dates[0].getFullYear(), dates[0].getMonth(), 1);
}
