import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({ accessToken: vi.fn(), delete: vi.fn() }));

vi.mock("@/lib/server/http/getRequestAccessToken", () => ({
	getRequestAccessToken: mocks.accessToken,
}));
vi.mock("@/lib/server/http/axiosService", () => ({
	default: { get: vi.fn(), patch: vi.fn(), delete: mocks.delete },
}));

import { DELETE } from "./route";

function request(origin = "https://supersohee.com", confirmation = "회원 탈퇴") {
	return new NextRequest("https://supersohee.com/api/users/me", {
		method: "DELETE",
		headers: { origin, "content-type": "application/json" },
		body: JSON.stringify({ confirmation }),
	});
}

beforeEach(() => {
	mocks.accessToken.mockReset();
	mocks.delete.mockReset();
	mocks.accessToken.mockResolvedValue("backend-token");
	mocks.delete.mockResolvedValue({ data: null, status: 204 });
});

describe("DELETE /api/users/me", () => {
	it("rejects cross-origin requests before reading the session", async () => {
		const response = await DELETE(request("https://attacker.example"));
		expect(response.status).toBe(403);
		expect(mocks.accessToken).not.toHaveBeenCalled();
	});

	it("requires the HttpOnly session token and exact confirmation", async () => {
		mocks.accessToken.mockResolvedValueOnce(null);
		expect((await DELETE(request())).status).toBe(401);
		expect((await DELETE(request(undefined, "탈퇴"))).status).toBe(400);
		expect(mocks.delete).not.toHaveBeenCalled();
	});

	it("forwards only the confirmation with the token from the session", async () => {
		const response = await DELETE(request());
		expect(response.status).toBe(200);
		expect(await response.json()).toEqual({ deleted: true });
		expect(mocks.delete).toHaveBeenCalledWith(
			"/api/users/me",
			{ data: { confirmation: "회원 탈퇴" } },
			"backend-token"
		);
	});

	it("preserves reauthentication status and hides an undeployed backend as 503", async () => {
		mocks.delete.mockRejectedValueOnce({ response: { status: 412 } });
		expect((await DELETE(request())).status).toBe(412);
		mocks.delete.mockRejectedValueOnce({ response: { status: 404 } });
		expect((await DELETE(request())).status).toBe(503);
	});
});
