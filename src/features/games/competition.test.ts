import { afterEach, describe, expect, it, vi } from "vitest";
import { keyAfterCompetitionNameEdit, legacySeason, competitionKeyFromName, competitionOf, competitionLabel, matchesScheduleFilters, scheduleFilterKey, selectCompetitionFilter, venueTypeLabel } from "./competition";
import { isHomeGame, matchupLabel, venueName, resolveGameLocation } from "./scheduleView";
import { seasonOf } from "./season";
import { findNextGame } from "./nextGame";
import { fetchAllSchedules, fetchSchedulesByDateRange, fetchScheduleDetails } from "./api";
import { legacyScheduleRequest, toLegacySchedule } from "@/lib/admin/adapters";
import type { ScheduleResponse } from "./types";

const legacy: ScheduleResponse = { id: "old-id", title: "우리은행", description: null, startDateTime: "2026-09-10T19:00:00", endDateTime: "2026-09-10T21:00:00", location: "Home", type: "game", color: "#000000", url: null, isActive: true, createdAt: "", updatedAt: "", season: "2026-2027" };
function national(key = "world-cup", name = "월드컵"): ScheduleResponse {
	return { ...legacy, id: key, season: null, opponent: "호주", competitionKey: key, competitionName: name, competitionKind: "tournament", editionLabel: "2026", teamType: "national", ourTeamName: "대한민국", venueType: "neutral", venueName: "", location: null, isHome: false, stage: "조별리그" };
}
afterEach(() => vi.unstubAllGlobals());

describe("competition compatibility and display", () => {
	it("uses Korean calendar dates for the legacy July season boundary", () => {
		expect(legacySeason({ date: "2026-07-01" })).toBe("2026-2027");
		expect(legacySeason({ startDateTime: "2026-06-30T16:00:00Z" })).toBe("2026-2027");
	});
	it("resolves old WKBL games without rewriting their IDs", () => {
		expect(competitionOf(legacy)).toMatchObject({ competitionKey: "wkbl", editionLabel: "2026-2027", teamType: "club", ourTeamName: "BNK 썸" });
		expect(venueName(legacy)).toBe("부산 사직실내체육관");
		expect(matchesScheduleFilters(legacy, { competitionKey: "wkbl", season: "2026-2027" })).toBe(true);
	});
	it("does not classify old special games or non-game events as WKBL", () => {
		expect(competitionOf({ ...legacy, specialGame: true })).toMatchObject({ competitionKey: "legacy-special", teamType: null, ourTeamName: null });
		expect(competitionOf({ ...legacy, type: "event" })).toEqual({});
	});
	it.each([["world-cup", "월드컵"], ["asian-games", "아시안게임"], ["olympics", "올림픽"]])("renders national %s matches without a BNK identity or away badge for neutral venues", (key, name) => {
		const game = national(key, name);
		expect(matchupLabel(game)).toBe("대한민국 vs 호주");
		expect(venueTypeLabel(game)).toBe("중립");
		expect(isHomeGame(game)).toBe(false);
		expect(competitionLabel(game)).toBe(`${name} · 2026 · 조별리그`);
		expect(venueName(game)).toBeNull();
		expect(resolveGameLocation(game)).toBeNull();
		expect(seasonOf(game)).toBeNull();
	});
	it("does not infer Sajik for new home metadata with no known venue", () => {
		const game = { ...national(), venueType: "home" as const, isHome: true, location: "Home" };
		expect(venueName(game)).toBeNull();
		expect(resolveGameLocation(game)).toBeNull();
		expect(venueName({ ...game, venueName: "해외 경기장" })).toBe("해외 경기장");
	});
	it("supports neutral cup matches and arbitrary free edition labels independently of the played year", () => {
		const cup = { ...national("park-shinja-cup", "박신자컵"), teamType: "club" as const, ourTeamName: "BNK 썸", opponent: "해외 초청팀" };
		expect(competitionLabel(cup)).toContain("박신자컵");
		expect(venueTypeLabel(cup)).toBe("중립");
		const custom = { ...cup, competitionKey: competitionKeyFromName("새 초청 대회"), competitionName: "새 초청 대회", editionLabel: "제3회 2024 특별 초청전", startDateTime: "2027-01-01T12:00:00" };
		expect(matchesScheduleFilters(custom, { competitionKey: "새-초청-대회", editionLabel: "제3회 2024 특별 초청전", teamType: "club" })).toBe(true);
		expect(competitionOf(custom).editionLabel).toBe("제3회 2024 특별 초청전");
	});
	it("all competitions are initially visible and a competition switch clears a stale WKBL season and edition", () => {
		expect([legacy, national()].filter((game) => matchesScheduleFilters(game, {}))).toHaveLength(2);
		const changed = selectCompetitionFilter({ competitionKey: "wkbl", season: "2026-2027", editionLabel: "2026-2027" }, "world-cup");
		expect(matchesScheduleFilters(national(), changed)).toBe(true);
	});
	it("includes national fixtures in the next match without a specialGame workaround", () => {
		expect(findNextGame([national()], new Date("2026-09-01"))?.id).toBe("world-cup");
	});
});

describe("filter and metadata round trips", () => {
	it("uses AND filters and distinct query keys per competition/edition/team/season", () => {
		const game = national();
		const filter = { competitionKey: "world-cup", editionLabel: "2026", teamType: "national" as const };
		expect(matchesScheduleFilters(game, filter)).toBe(true);
		expect(matchesScheduleFilters(game, { ...filter, season: "2026-2027" })).toBe(false);
		for (const other of [{ ...filter, competitionKey: "olympics" }, { ...filter, editionLabel: "2024" }, { ...filter, teamType: "club" as const }, { ...filter, season: "2026-2027" }]) expect(scheduleFilterKey(filter)).not.toBe(scheduleFilterKey(other));
	});
	it("sends identical selection filters to list and calendar date-range API calls", async () => {
		const mock = vi.fn().mockImplementation(() => Promise.resolve(new Response(JSON.stringify([national()]))));
		vi.stubGlobal("fetch", mock);
		const filters = { competitionKey: "월드컵 & 예선", editionLabel: "2024 연기 대회", teamType: "national" as const, season: "legacy-season" };
		await fetchAllSchedules(filters); await fetchSchedulesByDateRange("2026-09-01", "2026-09-30", filters);
		const urls = mock.mock.calls.map(([url]) => new URL(url, "https://example.com"));
		for (const [key, value] of Object.entries(filters)) { expect(urls[0].searchParams.get(key)).toBe(value); expect(urls[1].searchParams.get(key)).toBe(value); }
		expect(urls[1].searchParams.get("end")).toBe("2026-09-30T23:59:59");
	});
	it("preserves all additive fields through admin response/edit/request, including explicit optional clears", () => {
		const row = { ...national(), id: "stable-id", season: "", date: "2027-01-01", time: "12:00", opponent: "호주", isHome: false, editionLabel: "2024 연기 대회", venueName: "경기장", stadiumId: "stadium-ref", stage: "결승" };
		const legacyRow = toLegacySchedule({ ...row, season: "", specialGame: false });
		const request = legacyScheduleRequest(legacyRow);
		for (const key of ["competitionKey", "competitionName", "competitionKind", "editionLabel", "teamType", "ourTeamName", "venueType", "venueName", "stadiumId", "stage"] as const) expect(request[key]).toBe(row[key]);
		expect(legacyRow._id).toBe(row.id);
		expect(request.season).toBe("");
		expect(legacyScheduleRequest({ ...legacyRow, venueName: "", stadiumId: null, stage: "" })).toMatchObject({ venueName: "", stadiumId: null, stage: "" });
	});
	it("omits metadata for old clients and unresolved legacy-special edits instead of sending a partial group", () => {
		const row = { _id: "old", season: "2026-2027", date: "2026-09-10", time: "19:00", opponent: "기존 팀", isHome: false };
		expect(legacyScheduleRequest(row)).not.toHaveProperty("competitionKey");
		expect(legacyScheduleRequest({ ...row, specialGame: true, competitionKey: "legacy-special", competitionName: "미분류 특별경기", editionLabel: "2026-2027", teamType: null, ourTeamName: null, venueType: "away" })).not.toHaveProperty("competitionKey");
	});
	it("keeps public/detail metadata and existing game IDs intact", async () => {
		const detail = { ...national(), gameId: "existing-game", stadium: null };
		vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify(detail))));
		const result = await fetchScheduleDetails("world-cup");
		expect(result).toMatchObject({ competitionKey: "world-cup", teamType: "national", venueType: "neutral", gameId: "existing-game" });
	});
});

it("directly classifying an existing unknown game generates and updates its key, but ordinary edits preserve stored keys", () => {
	let key = keyAfterCompetitionNameEdit("새 초청전", "", true);
	expect(key).toBe("새-초청전");
	key = keyAfterCompetitionNameEdit("새 초청전 결선", key, true);
	expect(key).toBe("새-초청전-결선");
	expect(keyAfterCompetitionNameEdit("표시 이름만 수정", "stable-existing-key", false)).toBe("stable-existing-key");
	expect(keyAfterCompetitionNameEdit("월드컵 새 이름", "world-cup", false)).toBe("world-cup");
});
