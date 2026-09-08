import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const mocks = vi.hoisted(() => ({ accessToken: vi.fn(), incomingHeaders: vi.fn(), provider: vi.fn(), notify: vi.fn() }));
vi.mock("@/lib/server/http/getRequestAccessToken", () => ({ getRequestAccessToken: mocks.accessToken }));
vi.mock("next/headers", () => ({ headers: mocks.incomingHeaders }));
vi.mock("./alerts/slack", () => ({ notifyAdminError: mocks.notify }));
vi.mock("./news-search", async (importOriginal) => ({ ...await importOriginal<typeof import("./news-search")>(), fetchSearchPage: mocks.provider }));
import { POST as search } from "@/app/api/admin/articles/search/route";
import { POST as batch } from "@/app/api/admin/articles/batch/route";
import { GET as session } from "@/app/api/admin/session/route";
import { getAdminToken } from "./session";
import { rejectCrossOriginMutation } from "./request";
import { trustedAdminOrigin } from "./origin";

function request(path: string, body: unknown, origin = "https://supersohee.com") {
	return new NextRequest(`https://supersohee.com${path}`, { method: "POST", headers: { origin, "content-type": "application/json" }, body: JSON.stringify(body) });
}

beforeEach(() => {
	vi.stubEnv("NODE_ENV", "production");
	vi.stubEnv("ADMIN_APP_ORIGIN", undefined);
	vi.stubEnv("NEXTAUTH_URL", "https://supersohee.com");
	vi.stubEnv("BACKEND_API_URL", "https://backend.example");
	mocks.incomingHeaders.mockResolvedValue(new Headers({ cookie: "next-auth.session-token=encrypted-session", authorization: "Bearer attacker" }));
	mocks.accessToken.mockResolvedValue("server-backend-token");
	mocks.notify.mockResolvedValue(undefined);
	vi.stubGlobal("fetch", vi.fn());
});
afterEach(() => { vi.clearAllMocks(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe("integrated administrator trust boundary", () => {
	it("uses cookie-only NextAuth decoding and never browser bearer or legacy admin cookie as a token", async () => {
		await expect(getAdminToken()).resolves.toBe("server-backend-token");
		const input = mocks.accessToken.mock.calls[0][0] as NextRequest;
		expect(input.headers.get("authorization")).toBeNull();
		expect(input.headers.get("cookie")).toContain("encrypted-session");
		mocks.incomingHeaders.mockResolvedValue(new Headers({ cookie: "supersohee_admin_session=legacy" }));
		mocks.accessToken.mockResolvedValue(null);
		await expect(getAdminToken()).resolves.toBeNull();
	});
	it("denies anonymous search before backend/provider calls", async () => {
		mocks.accessToken.mockResolvedValue(null);
		const response = await search(request("/api/admin/articles/search", { query: "월드컵 이소희" }));
		expect(response.status).toBe(401);
		expect(fetch).not.toHaveBeenCalled();
		expect(mocks.provider).not.toHaveBeenCalled();
	});
	it.each([401, 403, 503])("backend denial %s prevents provider calls and never clears the public session", async (status) => {
		vi.mocked(fetch).mockResolvedValue(new Response("{}", { status }));
		const response = await search(request("/api/admin/articles/search", { query: "월드컵 이소희" }));
		expect(response.status).toBe(status);
		expect(response.headers.get("set-cookie")).toBeNull();
		expect(mocks.provider).not.toHaveBeenCalled();
	});
	it("rejects cross-origin search and import before authentication/provider/backend calls", async () => {
		for (const handler of [search, batch]) {
			const response = await handler(request("/api/admin/articles/search", { query: "x", articles: [{}] }, "https://evil.example"));
			expect(response.status).toBe(403);
		}
		expect(mocks.accessToken).not.toHaveBeenCalled();
		expect(fetch).not.toHaveBeenCalled();
		expect(mocks.provider).not.toHaveBeenCalled();
	});
	it("rechecks backend authority after a role is revoked and does not leak the backend token", async () => {
		vi.mocked(fetch).mockResolvedValueOnce(new Response("{}", { status: 200 })).mockResolvedValueOnce(new Response("{}", { status: 403 }));
		const allowed = await session();
		expect(await allowed.json()).toEqual({ authenticated: true });
		const denied = await session();
		expect(denied.status).toBe(403);
		expect(denied.headers.get("set-cookie")).toBeNull();
		expect(fetch).toHaveBeenCalledTimes(2);
	});
	it("forwards an authorized selected batch using the server token and preserves the import result", async () => {
		vi.mocked(fetch).mockResolvedValue(new Response(JSON.stringify({ processed: 1, created: 1, existing: 0 })));
		const response = await batch(request("/api/admin/articles/batch", { articles: [{ source: "other", title: "이소희", url: "https://example.com/news/1" }] }));
		expect(await response.json()).toEqual({ processed: 1, created: 1, existing: 0 });
		const [url, init] = vi.mocked(fetch).mock.calls[0];
		expect(url).toBe("https://backend.example/api/admin/articles/batch");
		expect(new Headers(init?.headers).get("authorization")).toBe("Bearer server-backend-token");
		expect(response.headers.get("set-cookie")).toBeNull();
	});
	it("uses the existing canonical origin without requiring another domain and rejects forged forwarded origins", () => {
		expect(trustedAdminOrigin({ NODE_ENV: "production" })).toBe("https://supersohee.com");
		const forged = request("/api/admin/articles/search", {}, "https://evil.example");
		forged.headers.set("x-forwarded-host", "evil.example");
		expect(rejectCrossOriginMutation(forged)?.status).toBe(403);
		expect(() => trustedAdminOrigin({ NODE_ENV: "production", NEXTAUTH_URL: "http://example.com" })).toThrow();
	});
});
