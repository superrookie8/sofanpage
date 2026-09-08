import assert from "node:assert/strict";
import { test } from "vitest";
import {
	currentSeason,
	EXTRA_HOME_VENUES,
	isValidSeason,
	locations,
	OPPONENT_TEAMS,
	TIME_PRESETS,
} from "./schedule";

test("currentSeason follows the WKBL autumn-to-spring calendar", () => {
	assert.equal(currentSeason(new Date("2026-09-01")), "2026-2027");
	assert.equal(currentSeason(new Date("2025-11-16")), "2025-2026");
	assert.equal(currentSeason(new Date("2026-03-30")), "2025-2026");
	assert.equal(currentSeason(new Date("2026-06-30")), "2025-2026");
	assert.equal(currentSeason(new Date("2026-07-01")), "2026-2027");
});

test("isValidSeason only accepts two consecutive years", () => {
	assert.equal(isValidSeason("2025-2026"), true);
	assert.equal(isValidSeason(" 2026-2027 "), true);
	assert.equal(isValidSeason("2025-2027"), false);
	assert.equal(isValidSeason("2026-2025"), false);
	assert.equal(isValidSeason("2025"), false);
	assert.equal(isValidSeason("25-26"), false);
	assert.equal(isValidSeason(""), false);
});

test("opponent options are teams only and every one maps to a venue", () => {
	// 체육관 이름이 상대 팀 선택지로 새어 들어오면 안 된다.
	for (const team of OPPONENT_TEAMS) {
		assert.doesNotMatch(team, /체육관|연수원/, team);
		assert.ok(locations[team], `${team} 좌표 누락`);
	}
	// 저장된 경기 데이터가 쓰는 구단명과 일치해야 한다.
	assert.ok(OPPONENT_TEAMS.includes("하나은행"));
	assert.equal(OPPONENT_TEAMS.length, 5);
	// 대체 홈 구장은 상대 팀 목록과 겹치지 않는다.
	for (const venue of EXTRA_HOME_VENUES) {
		assert.ok(locations[venue], `${venue} 좌표 누락`);
		assert.equal(OPPONENT_TEAMS.includes(venue as never), false, venue);
	}
});

test("legacy 하나원큐 key still resolves to the same venue as 하나은행", () => {
	assert.deepEqual(locations["하나원큐"], locations["하나은행"]);
});
