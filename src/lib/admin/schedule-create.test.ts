import { afterEach, expect, it, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";
import { createScheduleDraft } from "./scheduleDraft";

const backend = vi.hoisted(() => vi.fn());
vi.mock("./backend", () => ({ adminBackendFetch: backend }));
import { POST } from "@/app/api/admin/postschedule/route";
afterEach(() => { vi.clearAllMocks(); vi.unstubAllEnvs(); });

it("starts a new default record with no existing match identity or opponent", () => {
	const draft = createScheduleDraft();
	expect(draft).toMatchObject({ _id: "", date: "", time: "", opponent: "", competitionKey: "wkbl", specialGame: false });
});
it("new mode retains a custom competition edition while clearing all edited match fields", () => {
	const old = { ...createScheduleDraft(), _id: "existing-id", id: "alias-id", gameId: "alias-game", isActive: false, specialGame: true, competitionKey: "custom-cup", competitionName: "초청전", editionLabel: "2024 연기 회차", season: "", teamType: "national" as const, ourTeamName: "대한민국", venueType: "neutral" as const, date: "2027-01-01", time: "12:00", opponent: "호주", stage: "결승", stadiumId: "old-stadium" };
	const draft = createScheduleDraft(old);
	expect(draft).toMatchObject({ _id: "", date: "", time: "", opponent: "", stage: "", stadiumId: "", competitionKey: "custom-cup", editionLabel: "2024 연기 회차", teamType: "national", venueType: "neutral", isHome: false });
	expect(old._id).toBe("existing-id");
	expect(draft).not.toHaveProperty("id");
	expect(draft).not.toHaveProperty("gameId");
	expect(draft.specialGame).toBe(false);
	expect(draft).not.toHaveProperty("isActive");
});
it("starts unclassified legacy special matches with safe default competition", () => {
	expect(createScheduleDraft({ _id: "old", competitionKey: "legacy-special", competitionName: "미분류 특별경기", specialGame: true })).toMatchObject({ _id: "", competitionKey: "wkbl", specialGame: false });
});
it.each([["", "POST", "/api/admin/schedules", 201], ["existing-id", "PUT", "/api/admin/schedules/existing-id", 200]] as const)("BFF sends record ID '%s' using %s", async (id, method, path, status) => {
	vi.stubEnv("ADMIN_APP_ORIGIN", "https://supersohee.com");
	const draft = { ...createScheduleDraft(), _id: id, date: "2026-09-10", time: "19:00", opponent: "자유 상대팀" };
	backend.mockResolvedValue(NextResponse.json({ ...draft, id: id || "created-id" }, { status }));
	const result = await POST(new NextRequest("https://supersohee.com/api/admin/postschedule", { method: "POST", headers: { origin: "https://supersohee.com", "content-type": "application/json" }, body: JSON.stringify(draft) }));
	expect(result.status).toBe(status);
	expect(backend).toHaveBeenCalledWith(path, expect.objectContaining({ method }));
	expect(JSON.parse(backend.mock.calls[0][1].body)).toMatchObject({ competitionKey: "wkbl", opponent: "자유 상대팀", isActive: true, specialGame: false });
	expect(JSON.parse(backend.mock.calls[0][1].body)).not.toHaveProperty("id");
	expect(JSON.parse(backend.mock.calls[0][1].body)).not.toHaveProperty("_id");
	expect((await result.json())._id).toBe(id || "created-id");
});
