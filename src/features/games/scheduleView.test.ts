import { describe, expect, it } from "vitest";
import type { ScheduleResponse } from "./types";
import {
	HOME_VENUE,
	isHomeGame,
	matchupLabel,
	opponentName,
	resolveGameLocation,
	venueName,
} from "./scheduleView";
import { isGameSchedule } from "./nextGame";

// 백엔드 응답의 실제 형태. 필드 이름과 의미가 어긋나므로 여기에 고정해 둔다.
function schedule(overrides: Partial<ScheduleResponse> = {}): ScheduleResponse {
	return {
		id: "1",
		title: "우리은행 우리WON",
		description: null,
		startDateTime: "2026-10-14T19:00:00",
		endDateTime: "2026-10-14T21:00:00",
		location: "Home",
		type: "game",
		color: "#E11D33",
		url: null,
		isActive: true,
		createdAt: "",
		updatedAt: "",
		...overrides,
	};
}

describe("scheduleView", () => {
	it("location이 'Home'이면 홈 경기이고 경기장은 사직이다", () => {
		const game = schedule({ location: "Home" });
		expect(isHomeGame(game)).toBe(true);
		expect(venueName(game)).toBe(HOME_VENUE);
		expect(matchupLabel(game)).toBe("vs 우리은행 우리WON");
	});

	it("원정 경기장은 opponent가 아니라 location에서 표시한다", () => {
		const game = schedule({
			location: "청주 체육관",
			opponent: "KB스타즈",
			isHome: false,
		});
		expect(isHomeGame(game)).toBe(false);
		expect(venueName(game)).toBe("청주체육관");
		expect(matchupLabel(game)).toBe("@ KB스타즈");
	});

	it("레거시 location 팀 키는 실제 경기장으로 정규화한다", () => {
		const game = schedule({
			location: "KB스타즈",
			opponent: "우리은행",
			isHome: false,
		});

		expect(venueName(game)).toBe("청주체육관");
		expect(resolveGameLocation(game)).toEqual({
			name: "청주체육관",
			latitude: 36.6365,
			longitude: 127.4734,
		});
		expect(matchupLabel(game)).toBe("@ 우리은행");
	});

	it("location이 없을 때 opponent를 경기장 fallback으로 쓰지 않는다", () => {
		const game = schedule({
			location: null,
			opponent: "KB스타즈",
			isHome: false,
		});

		expect(venueName(game)).toBeNull();
		expect(resolveGameLocation(game)).toBeNull();
	});

	it("상대팀은 신규 opponent를 우선하고 구형 title로 폴백한다", () => {
		expect(
			opponentName(schedule({ opponent: "KB스타즈", title: "구형 제목" }))
		).toBe("KB스타즈");
		expect(opponentName(schedule({ title: "BNK 썸" }))).toBe("BNK 썸");
	});

	it("신규 isHome을 우선하고 없으면 location으로 폴백한다", () => {
		expect(isHomeGame(schedule({ location: "Home", isHome: false }))).toBe(
			false
		);
		expect(isHomeGame(schedule({ location: "Home", isHome: undefined }))).toBe(
			true
		);
	});

	it("원정인데 경기장 정보가 없으면 null을 준다", () => {
		expect(venueName(schedule({ location: "  ", isHome: false }))).toBeNull();
	});

	it("title이 비어도 표시가 깨지지 않는다", () => {
		expect(opponentName(schedule({ title: "" }))).toBe("상대팀 미정");
	});

	it("specialGame 타입과 플래그를 모두 경기 일정으로 포함한다", () => {
		expect(isGameSchedule(schedule({ type: "specialGame" }))).toBe(true);
		expect(
			isGameSchedule(schedule({ type: "other", specialGame: true }))
		).toBe(true);
		expect(isGameSchedule(schedule({ type: "event", specialGame: false }))).toBe(
			false
		);
	});
});
