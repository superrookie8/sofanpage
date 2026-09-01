import { describe, expect, it } from "vitest";
import {
	defaultSeason,
	firstMonthOfSeason,
	listSeasons,
	schedulesInSeason,
	seasonOf,
	seasonOfDate,
} from "./season";
import type { ScheduleResponse } from "./types";

function game(startDateTime: string, season?: string): ScheduleResponse {
	return {
		id: startDateTime,
		title: "상대",
		description: null,
		startDateTime,
		endDateTime: startDateTime,
		location: "Home",
		type: "game",
		color: "#EF4444",
		url: null,
		isActive: true,
		createdAt: "",
		updatedAt: "",
		season,
	} as ScheduleResponse;
}

// 실제 DB와 같은 모양: 2025-2026 시즌 + 2026-2027 시즌 첫 경기
const SCHEDULES = [
	game("2025-11-16T14:00:00"),
	game("2025-12-01T19:00:00"),
	game("2026-02-25T19:00:00"),
	game("2026-03-30T19:00:00"),
	game("2026-11-01T14:00:00"),
];

describe("시즌 경계", () => {
	it("가을에 시작해 이듬해 봄에 끝난다", () => {
		expect(seasonOfDate(new Date("2025-11-16"))).toBe("2025-2026");
		expect(seasonOfDate(new Date("2026-03-30"))).toBe("2025-2026");
		expect(seasonOfDate(new Date("2026-06-30"))).toBe("2025-2026");
		expect(seasonOfDate(new Date("2026-07-01"))).toBe("2026-2027");
	});

	it("응답의 season을 우선 쓰고 없으면 경기일로 유추한다", () => {
		expect(seasonOf(game("2026-01-04T14:00:00", "2030-2031"))).toBe("2030-2031");
		expect(seasonOf(game("2026-01-04T14:00:00"))).toBe("2025-2026");
	});
});

describe("시즌 목록과 기본 선택", () => {
	it("최신 시즌이 앞에 온다", () => {
		expect(listSeasons(SCHEDULES)).toEqual(["2026-2027", "2025-2026"]);
	});

	// 이전 구현은 "오늘 −6개월" 창을 써서 비시즌에 지난 시즌이 통째로 사라졌다.
	it("비시즌에도 경기가 있는 최신 시즌을 고른다", () => {
		expect(defaultSeason(SCHEDULES, new Date("2026-09-01"))).toBe("2026-2027");
		expect(defaultSeason(SCHEDULES, new Date("2025-12-01"))).toBe("2025-2026");
	});

	it("경기가 하나도 없으면 null", () => {
		expect(defaultSeason([], new Date("2026-09-01"))).toBeNull();
	});

	it("오늘이 속한 시즌에 경기가 없으면 가장 최신 시즌으로 떨어진다", () => {
		const onlyOld = SCHEDULES.slice(0, 4);
		expect(defaultSeason(onlyOld, new Date("2026-09-01"))).toBe("2025-2026");
	});
});

describe("시즌별 조회", () => {
	it("지난 시즌 경기를 전부 돌려준다", () => {
		const past = schedulesInSeason(SCHEDULES, "2025-2026");
		expect(past).toHaveLength(4);
		expect(past[0].startDateTime).toBe("2025-11-16T14:00:00");
	});

	it("달력이 시작할 달은 그 시즌 첫 경기 달이다", () => {
		const month = firstMonthOfSeason(SCHEDULES, "2025-2026");
		expect(month?.getFullYear()).toBe(2025);
		expect(month?.getMonth()).toBe(10); // 11월
		expect(firstMonthOfSeason(SCHEDULES, "1999-2000")).toBeNull();
	});
});
