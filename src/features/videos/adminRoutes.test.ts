import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
const mocks = vi.hoisted(() => ({ token: vi.fn(), notify: vi.fn() }));
vi.mock("@/lib/admin/session", () => ({ getAdminToken: mocks.token }));
vi.mock("@/lib/admin/alerts/slack", () => ({ notifyAdminError: mocks.notify }));
import { GET, POST } from "@/app/api/admin/videos/route";
import { PUT, DELETE } from "@/app/api/admin/videos/[id]/route";
import { POST as importVideos } from "@/app/api/admin/videos/import/route";

const context = { params: Promise.resolve({ id: "4ysSdioqf5U" }) };
function request(method = "POST", origin = "https://supersohee.com", body = "{}") {
	return new NextRequest("https://supersohee.com/api/admin/videos", { method, headers: { origin, "content-type": "application/json" }, body: method === "DELETE" ? undefined : body });
}
beforeEach(() => {
	vi.stubEnv("NODE_ENV", "production"); vi.stubEnv("NEXTAUTH_URL", "https://supersohee.com"); vi.stubEnv("ADMIN_APP_ORIGIN", undefined); vi.stubEnv("BACKEND_API_URL", "https://backend.example");
	mocks.token.mockResolvedValue("fixture-admin-token"); mocks.notify.mockResolvedValue(undefined);
	vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}")));
});
afterEach(() => { vi.clearAllMocks(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
describe("video management authorization", () => {
	it("blocks anonymous reads and every mutation before a backend request", async () => {
		mocks.token.mockResolvedValue(null);
		const responses = [await GET(new NextRequest("https://supersohee.com/api/admin/videos")), await POST(request()), await PUT(request("PUT"), context), await DELETE(request("DELETE"), context), await importVideos(request())];
		expect(responses.map((r) => r.status)).toEqual([401, 401, 401, 401, 401]);
		expect(fetch).not.toHaveBeenCalled();
	});
	it("blocks cross-origin writes before reading a session or calling the backend", async () => {
		const responses = [await POST(request("POST", "https://evil.test")), await PUT(request("PUT", "https://evil.test"), context), await DELETE(request("DELETE", "https://evil.test"), context), await importVideos(request("POST", "https://evil.test"))];
		expect(responses.map((r) => r.status)).toEqual([403, 403, 403, 403]);
		expect(mocks.token).not.toHaveBeenCalled(); expect(fetch).not.toHaveBeenCalled();
	});
	it("preserves the server's role denial", async () => {
		vi.mocked(fetch).mockResolvedValue(new Response("{}", { status: 403 }));
		expect((await POST(request())).status).toBe(403);
	});
	it("passes insert-only import counts with server session credentials", async () => {
		vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ processed: 27, created: 25, existing: 2 })));
		const response = await importVideos(request("POST", undefined, '{"videos":[]}'));
		expect(await response.json()).toEqual({ processed: 27, created: 25, existing: 2 });
		const [url, init] = vi.mocked(fetch).mock.calls[0];
		expect(url).toBe("https://backend.example/api/admin/videos/import");
		expect(new Headers(init?.headers).get("authorization")).toBe("Bearer fixture-admin-token");
		expect(response.headers.get("set-cookie")).toBeNull();
	});
	it("rejects malformed input and paths without forwarding", async () => {
		expect((await POST(request("POST", undefined, "{"))).status).toBe(400);
		expect((await DELETE(request("DELETE"), { params: Promise.resolve({ id: "../profile" }) })).status).toBe(400);
		expect(fetch).not.toHaveBeenCalled();
	});
});
