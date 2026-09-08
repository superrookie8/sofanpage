import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";

const backend = vi.hoisted(() => vi.fn());
vi.mock("./backend", () => ({ adminBackendFetch: backend }));

import { GET, POST } from "@/app/api/admin/international-results/route";
import { DELETE, PUT } from "@/app/api/admin/international-results/[id]/route";

const draft = {
	competitionKey: "fiba-wbl-asia-2025",
	competitionName: "FIBA Women's Basketball League Asia",
	editionLabel: "2025",
	category: "CLUB",
	status: "FINAL",
	participationStatus: "CONFIRMED",
	startDate: "2025-09-23",
	endDate: "2025-09-28",
	location: "중국 둥관",
	teamName: "BNK 썸",
	teamResult: "3위",
	teamRecord: "2승 2패",
	gamesPlayed: 4,
	minutesPerGame: "25.5분",
	pointsPerGame: 18.5,
	reboundsPerGame: 2.5,
	assistsPerGame: 2,
	stealsPerGame: 1.8,
	fieldGoalPercent: 45.6,
	threePointPercent: 42.5,
	freeThrowPercent: 83.3,
	highlight: "3위 결정전 30점",
	statsUpdatedThrough: "2025-09-28",
	sources: [{ label: "FIBA", url: "https://www.fiba.basketball/example", type: "OFFICIAL" }],
	published: true,
	displayOrder: 10,
};

function request(path: string, method: string, body?: unknown, origin = "https://supersohee.com") {
	return new NextRequest(`https://supersohee.com${path}`, {
		method,
		headers: { origin, "content-type": "application/json" },
		body: body === undefined ? undefined : JSON.stringify(body),
	});
}

beforeEach(() => {
	vi.stubEnv("ADMIN_APP_ORIGIN", "https://supersohee.com");
	backend.mockResolvedValue(NextResponse.json({ id: "result-id", ...draft }));
});

afterEach(() => { vi.clearAllMocks(); vi.unstubAllEnvs(); });

describe("international result admin BFF", () => {
	it("forwards the administrator list request", async () => {
		await GET();
		expect(backend).toHaveBeenCalledWith("/api/admin/international-results");
	});

	it("forwards create and update payloads with the canonical methods", async () => {
		await POST(request("/api/admin/international-results", "POST", draft));
		expect(backend).toHaveBeenLastCalledWith("/api/admin/international-results", expect.objectContaining({ method: "POST", body: JSON.stringify(draft) }));

		await PUT(request("/api/admin/international-results/result-id", "PUT", draft), { params: Promise.resolve({ id: "result/id" }) });
		expect(backend).toHaveBeenLastCalledWith("/api/admin/international-results/result%2Fid", expect.objectContaining({ method: "PUT", body: JSON.stringify(draft) }));
	});

	it("forwards an explicitly confirmed delete without a body", async () => {
		backend.mockResolvedValueOnce(new NextResponse(null, { status: 204 }));
		const response = await DELETE(request("/api/admin/international-results/result-id", "DELETE"), { params: Promise.resolve({ id: "result-id" }) });
		expect(response.status).toBe(204);
		expect(backend).toHaveBeenCalledWith("/api/admin/international-results/result-id", { method: "DELETE" });
	});

	it.each([POST, async (input: NextRequest) => PUT(input, { params: Promise.resolve({ id: "result-id" }) }), async (input: NextRequest) => DELETE(input, { params: Promise.resolve({ id: "result-id" }) })])("rejects cross-origin mutations before calling the backend", async (handler) => {
		const response = await handler(request("/api/admin/international-results", "POST", draft, "https://evil.example"));
		expect(response.status).toBe(403);
		expect(backend).not.toHaveBeenCalled();
	});
});
