import type { ScheduleResponse } from "./types";

/**
 * 스케줄 응답을 화면 표시용 값으로 정규화한다.
 *
 * 백엔드 필드 의미가 이름과 다르므로 반드시 이 헬퍼를 거친다:
 *   - `title`    : 상대팀 이름  (경기 제목이 아님)
 *   - `location` : "Home" 이면 홈, 그 외는 원정  (경기장 이름이 아님)
 *   - `opponent` : 원정 경기장 이름  (상대팀이 아님. locations 조회 키로 쓰인다)
 *   - `isHome`   : 타입에는 있으나 실제 응답에 없다. 판정에 쓰지 않는다.
 */

export const HOME_VENUE = "부산 사직실내체육관";

export function isHomeGame(schedule: ScheduleResponse): boolean {
	return schedule.location === "Home";
}

/** "우리은행 우리WON" 같은 상대팀 표시명 */
export function opponentName(schedule: ScheduleResponse): string {
	return schedule.title?.trim() || "상대팀 미정";
}

/** "vs 우리은행" / "@ 청주체육관" */
export function matchupLabel(schedule: ScheduleResponse): string {
	return `${isHomeGame(schedule) ? "vs" : "@"} ${opponentName(schedule)}`;
}

/** 경기장 이름. 홈은 사직, 원정은 opponent가 경기장 키다. */
export function venueName(schedule: ScheduleResponse): string | null {
	if (isHomeGame(schedule)) return HOME_VENUE;
	return schedule.opponent?.trim() || null;
}
