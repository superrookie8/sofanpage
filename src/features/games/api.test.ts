import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchSchedulesByDateRange, toScheduleDateTime } from "./api";

afterEach(() => {
	vi.unstubAllGlobals();
});

describe("schedule API range", () => {
	it("date-only 범위를 backend LocalDateTime 계약으로 변환한다", () => {
		expect(toScheduleDateTime("2026-09-01", "start")).toBe(
			"2026-09-01T00:00:00"
		);
		expect(toScheduleDateTime("2026-09-30", "end")).toBe(
			"2026-09-30T23:59:59"
		);
	});

	it("이미 LocalDateTime인 범위는 변경하지 않는다", () => {
		expect(toScheduleDateTime("2026-09-01T12:30:00", "start")).toBe(
			"2026-09-01T12:30:00"
		);
	});

	it("정규화한 범위로 공개 schedule BFF를 조회한다", async () => {
		const fetchMock = vi.fn(async () =>
			new Response(JSON.stringify([]), { status: 200 })
		);
		vi.stubGlobal("fetch", fetchMock);

		await expect(
			fetchSchedulesByDateRange("2026-09-01", "2026-09-30")
		).resolves.toEqual([]);
		expect(fetchMock).toHaveBeenCalledWith(
			"/api/schedules?start=2026-09-01T00%3A00%3A00&end=2026-09-30T23%3A59%3A59",
			expect.objectContaining({ method: "GET", cache: "no-store" })
		);
	});
});
