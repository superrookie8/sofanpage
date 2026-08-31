import type { ScheduleResponse } from "./types";
import { parseDate } from "@/shared/lib/datetime";

export function isGameSchedule(schedule: ScheduleResponse) {
	return schedule.type === "game";
}

/** 오늘 이후의 가장 가까운 경기. 없으면 null. */
export function findNextGame(
	schedules: ScheduleResponse[],
	now: Date = new Date()
): ScheduleResponse | null {
	const upcoming = schedules
		.filter(isGameSchedule)
		.map((schedule) => ({ schedule, date: parseDate(schedule.startDateTime) }))
		.filter(
			(entry): entry is { schedule: ScheduleResponse; date: Date } =>
				entry.date !== null && entry.date.getTime() >= now.getTime()
		)
		.sort((a, b) => a.date.getTime() - b.date.getTime());

	return upcoming[0]?.schedule ?? null;
}

/** "vs 우리은행" 형태의 매치업 라벨 */
export function matchupLabel(schedule: ScheduleResponse) {
	if (schedule.opponent) {
		return `${schedule.isHome ? "vs" : "@"} ${schedule.opponent}`;
	}
	return schedule.title;
}
