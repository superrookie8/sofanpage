import { locations } from "./constants";
import type { GameLocation, ScheduleResponse } from "./types";

/**
 * 스케줄 응답을 화면 표시용 값으로 정규화한다.
 *
 * 신규 응답의 opponent/isHome와 구형 응답의 title/location을 함께 지원한다.
 * location은 홈일 때 "Home", 원정일 때 상대팀 또는 경기장 식별값이다.
 */

export const HOME_VENUE = "부산 사직실내체육관";

export function isHomeGame(schedule: ScheduleResponse): boolean {
	return typeof schedule.isHome === "boolean"
		? schedule.isHome
		: schedule.location === "Home";
}

/** "우리은행 우리WON" 같은 상대팀 표시명 */
export function opponentName(schedule: ScheduleResponse): string {
	return schedule.opponent?.trim() || schedule.title?.trim() || "상대팀 미정";
}

/** "vs 우리은행" / "@ KB스타즈" */
export function matchupLabel(schedule: ScheduleResponse): string {
	return `${isHomeGame(schedule) ? "vs" : "@"} ${opponentName(schedule)}`;
}

/** 경기장 표시값. opponent는 상대팀이므로 venue로 사용하지 않는다. */
export function venueName(schedule: ScheduleResponse): string | null {
	const knownLocation = resolveGameLocation(schedule);
	if (knownLocation) return knownLocation.name;

	const locationKey = schedule.location?.trim();
	return locationKey && locationKey !== "Home" ? locationKey : null;
}

/**
 * location의 알려진 팀/경기장 키를 지도에서 쓰는 실제 경기장으로 정규화한다.
 * opponent는 상대팀 표시 필드이며 location의 대체 venue로 사용하지 않는다.
 */
export function resolveGameLocation(
	schedule: ScheduleResponse
): GameLocation | null {
	const locationKey = isHomeGame(schedule)
		? HOME_VENUE
		: schedule.location?.trim();
	if (!locationKey || locationKey === "Home") return null;
	return locations[locationKey] ?? null;
}
