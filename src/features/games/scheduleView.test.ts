import { describe, expect, it } from "vitest";
import type { ScheduleResponse } from "./types";
import {
	HOME_VENUE,
	isHomeGame,
	matchupLabel,
	opponentName,
	venueName,
} from "./scheduleView";

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

	it("location이 'Home'이 아니면 원정이고 opponent가 경기장 이름이다", () => {
		// opponent는 상대팀이 아니라 원정 경기장 키다 (locations 조회에 쓰인다)
		const game = schedule({ location: "Away", opponent: "청주 체육관" });
		expect(isHomeGame(game)).toBe(false);
		expect(venueName(game)).toBe("청주 체육관");
		expect(matchupLabel(game)).toBe("@ 우리은행 우리WON");
	});

	it("상대팀 이름은 title에서 온다", () => {
		expect(opponentName(schedule({ title: "BNK 썸" }))).toBe("BNK 썸");
	});

	it("isHome 필드는 판정에 쓰지 않는다", () => {
		// 응답에 isHome이 없거나 location과 어긋나도 location이 우선이다.
		const away = schedule({ location: "Away", isHome: true });
		expect(isHomeGame(away)).toBe(false);
	});

	it("원정인데 경기장 정보가 없으면 null을 준다", () => {
		expect(venueName(schedule({ location: "Away", opponent: "  " }))).toBeNull();
	});

	it("title이 비어도 표시가 깨지지 않는다", () => {
		expect(opponentName(schedule({ title: "" }))).toBe("상대팀 미정");
	});
});
