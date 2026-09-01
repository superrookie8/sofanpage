import assert from "node:assert/strict";
import test from "node:test";
import {
	DUPLICATE_STATS_SEASON_MESSAGE,
	emptyStatsDraft,
	hasDuplicateStatsSeason,
	legacyScheduleRequest,
	legacyProfileRequest,
	legacyStatsRequest,
	normalizePhotoIds,
	toAdminPhotoGroups,
	toLegacyAdminGuestbook,
	toLegacyGuestbook,
	toLegacyProfile,
	toLegacySchedule,
	toLegacyStats,
	statsFormDraft,
	StatsValidationError,
} from "../src/lib/admin/adapters.ts";

test("photo adapter creates protected same-origin content URLs", () => {
	assert.deepEqual(toAdminPhotoGroups({
		adminPhotos: [{ id: "admin/id", filename: "admin.png", contentType: "image/png" }],
		userPhotos: [{ id: "user-1", filename: "fan.jpg", contentType: "image/jpeg" }],
	}), {
		adminPhotos: [{
			id: "admin/id", filename: "admin.png", contentType: "image/png",
			contentUrl: "/api/admin/photos/admin%2Fid/content",
		}],
		userPhotos: [{
			id: "user-1", filename: "fan.jpg", contentType: "image/jpeg",
			contentUrl: "/api/admin/photos/user-1/content",
		}],
	});
});

test("photo deletion adapter trims and deduplicates selected IDs", () => {
	assert.deepEqual(normalizePhotoIds([" photo-1 ", "photo-1", "photo-2", "", 3]), [
		"photo-1", "photo-2",
	]);
});

test("schedule adapter preserves every existing admin field", () => {
	const legacy = {
		_id: "schedule-1",
		season: "2026-2027",
		date: "2026-10-12",
		time: "19:00",
		opponent: "KB스타즈",
		isHome: true,
		extraHome: "울산 동천체육관",
		specialGame: true,
		isActive: true,
	};
	assert.deepEqual(legacyScheduleRequest(legacy), {
		season: "2026-2027",
		date: "2026-10-12",
		time: "19:00",
		opponent: "KB스타즈",
		isHome: true,
		extraHome: "울산 동천체육관",
		specialGame: true,
		isActive: true,
	});
	assert.deepEqual(toLegacySchedule({ id: "schedule-1", ...legacy }), legacy);
});

test("guestbook adapter uses the protected entry photo route without exposing photoId", () => {
	const value = toLegacyAdminGuestbook({
		id: "guest/id", name: "팬", message: "응원합니다", date: "2026-08-29T12:00:00",
		photoId: "internal-gridfs-id", hasPhoto: true,
	});
	assert.equal(value.photo_data, "/api/admin/getguestbookphoto?entry_id=guest%2Fid");
});

test("profile adapter preserves jersey numbers and nickname list", () => {
	const legacy = toLegacyProfile({
		name: "이소희", team: "부산 BNK 썸", position: "가드", jerseyNumber: 6,
		nationalTeamJerseyNumber: 9,
		height: "171cm", nicknames: ["슈퍼소닉", "소히힛"], features: "빠른 스피드",
		profileImageUrl: "https://example.com/profile.jpg",
	});
	assert.equal(legacy.number, "6");
	assert.equal(legacy.nationalNumber, "9");
	assert.equal(legacy.nickname, "슈퍼소닉, 소히힛");
	assert.deepEqual(legacyProfileRequest(legacy), {
		name: "이소희", team: "부산 BNK 썸", position: "가드", jerseyNumber: 6,
		nationalTeamJerseyNumber: 9,
		height: "171cm", nicknames: ["슈퍼소닉", "소히힛"], features: "빠른 스피드",
		profileImageUrl: "https://example.com/profile.jpg",
	});
});

test("profile adapter maps a missing national team number to null, not 0", () => {
	const legacy = toLegacyProfile({
		name: "이소희", team: "부산 BNK 썸", position: "가드", jerseyNumber: 6,
		height: "171cm", nicknames: [], features: "",
	});
	assert.equal(legacy.nationalNumber, "");
	assert.equal(legacyProfileRequest(legacy).nationalTeamJerseyNumber, null);
});

test("guestbook adapter preserves legacy id, date and optional photo data", () => {
	assert.deepEqual(toLegacyGuestbook({
		id: "guest-1", name: "팬", message: "응원합니다", date: "2026-08-29T12:00:00",
		photoId: "photo-1", photoData: "base64data", hasPhoto: true,
	}), {
		_id: "guest-1", name: "팬", message: "응원합니다", date: "2026-08-29T12:00:00",
		photo_id: "photo-1", photo_data: "base64data", hasPhoto: true,
	});
});

test("stats adapter round-trips legacy average and total groups", () => {
	const legacy = {
		_id: "stat-1",
		season: "2026-2027",
		average: { G: 30, MPG: "31:20", "2P%": 48.5, "3P%": 37.2, FT: 80, OFF: 1, DEF: 3, TOT: 4, APG: 4.2, SPG: 1.5, BPG: 0.2, TO: 1.8, PF: 2, PPG: 15 },
		total: { MIN: "940:00", "FGM-A": "120-250", "3PM-A": "60-161", "FTM-A": "90-112", OFF: 30, DEF: 90, TOT: 120, AST: 126, STL: 45, BLK: 6, TO: 54, PF: 60, PTS: 450 },
	};
	const request = legacyStatsRequest(legacy);
	assert.equal(request.twoPointMade, 120);
	assert.equal(request.twoPointAttempted, 250);
	assert.deepEqual(toLegacyStats({ id: legacy._id, ...request }), legacy);
});

function editableStats() {
	return statsFormDraft({
		_id: "stat-1",
		season: "2026-2027",
		average: {
			G: 30, MPG: "31:20", "2P%": 48.5, "3P%": 37.2, FT: 80, OFF: 0.7,
			DEF: 2.8, TOT: 3.5, APG: 4.2, SPG: 1.5, BPG: 0.2, TO: 1.8, PF: 0.7, PPG: 15.2,
		},
		total: {
			MIN: "940:00", "FGM-A": "120-250", "3PM-A": "60-161", "FTM-A": "90-112",
			OFF: 30, DEF: 90, TOT: 120, AST: 126, STL: 45, BLK: 6, TO: 54, PF: 60, PTS: 450,
		},
	});
}

test("stats form draft keeps existing values as freely editable strings", () => {
	const draft = editableStats();
	assert.equal(draft._id, "stat-1");
	assert.equal(draft.average.G, "30");
	assert.equal(draft.average.TOT, "3.5");
	assert.equal(draft.average.PF, "0.7");
	assert.equal(draft.average.PPG, "15.2");
	assert.equal(draft.total.TOT, "120");

	draft.average.PPG = "";
	assert.throws(() => legacyStatsRequest(draft), StatsValidationError);
	draft.average.PPG = "0.";
	assert.equal(legacyStatsRequest(draft).ppg, 0);
	draft.average.PPG = ".5";
	assert.equal(legacyStatsRequest(draft).ppg, 0.5);
});

test("stats submit converts decimal averages and integer games and totals", () => {
	const request = legacyStatsRequest(editableStats());
	assert.equal(request.gamesPlayed, 30);
	assert.equal(request.offensiveRebounds, 0.7);
	assert.equal(request.totalRebounds, 3.5);
	assert.equal(request.fouls, 0.7);
	assert.equal(request.ppg, 15.2);
	assert.equal(request.totalTotalRebounds, 120);
	assert.equal(request.totalFouls, 60);
});

test("stats submit rejects negative, NaN and decimal integer fields", () => {
	const negative = editableStats();
	negative.average.TOT = "-1";
	assert.throws(() => legacyStatsRequest(negative), StatsValidationError);

	const notANumber = editableStats();
	notANumber.average.PF = "NaN";
	assert.throws(() => legacyStatsRequest(notANumber), StatsValidationError);

	const decimalGameCount = editableStats();
	decimalGameCount.average.G = "30.5";
	assert.throws(() => legacyStatsRequest(decimalGameCount), StatsValidationError);

	const decimalTotal = editableStats();
	decimalTotal.total.PF = "2.5";
	assert.throws(() => legacyStatsRequest(decimalTotal), StatsValidationError);
});

test("New Season starts clean and duplicate seasons have a safe conflict message", () => {
	const fresh = emptyStatsDraft();
	assert.equal(fresh._id, undefined);
	assert.equal(fresh.season, "");
	assert.equal(hasDuplicateStatsSeason([editableStats()], "2026-2027"), true);
	assert.equal(hasDuplicateStatsSeason([editableStats()], "2027-2028"), false);
	assert.equal(
		DUPLICATE_STATS_SEASON_MESSAGE,
		"이미 같은 시즌 기록이 있습니다. 기존 시즌을 선택해 수정해 주세요."
	);
});
