import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({ accessToken: vi.fn() }));

vi.mock("@/lib/server/http/getRequestAccessToken", () => ({
	getRequestAccessToken: mocks.accessToken,
}));
vi.mock("@/lib/server/http/backendApi", () => ({
	resolveBackendApiUrl: () => "https://backend.example.test",
}));

import { POST } from "./route";

function imageRequest(file = new File([new Uint8Array([1, 2, 3])], "profile.png", { type: "image/png" })) {
	const form = new FormData();
	form.append("file", file);
	return new NextRequest("https://supersohee.com/api/users/me/photo", {
		method: "POST",
		body: form,
	});
}

beforeEach(() => {
	mocks.accessToken.mockReset();
	mocks.accessToken.mockResolvedValue("backend-token");
});
afterEach(() => vi.unstubAllGlobals());

describe("POST /api/users/me/photo", () => {
	it("uses the authenticated owner-safe profile upload contract", async () => {
		const fetchMock = vi.fn(async () =>
			new Response(JSON.stringify({ key: "profile/user-1/photo.png" }), {
				status: 200,
				headers: { "content-type": "application/json" },
			})
		);
		vi.stubGlobal("fetch", fetchMock);

		const response = await POST(imageRequest());

		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({ key: "profile/user-1/photo.png" });
		expect(fetchMock).toHaveBeenCalledWith(
			"https://backend.example.test/api/images/profile",
			expect.objectContaining({
				method: "POST",
				headers: { Authorization: "Bearer backend-token" },
				body: expect.any(FormData),
				cache: "no-store",
			})
		);
	});

	it("does not contact image storage without a session", async () => {
		mocks.accessToken.mockResolvedValue(null);
		const fetchMock = vi.fn();
		vi.stubGlobal("fetch", fetchMock);

		expect((await POST(imageRequest())).status).toBe(401);
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("rejects unsupported files before the backend request", async () => {
		const fetchMock = vi.fn();
		vi.stubGlobal("fetch", fetchMock);
		const file = new File(["gif"], "profile.gif", { type: "image/gif" });

		expect((await POST(imageRequest(file))).status).toBe(400);
		expect(fetchMock).not.toHaveBeenCalled();
	});
});
