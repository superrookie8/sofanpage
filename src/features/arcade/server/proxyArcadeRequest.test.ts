import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { proxyArcadeRequest } from "./proxyArcadeRequest";

describe("proxyArcadeRequest", () => {
	it("인증 환경 없이 공개 backend URL로 익명 랭킹을 전달한다", async () => {
		const fetchImplementation: typeof fetch = vi.fn(async () =>
			new Response(JSON.stringify({ rankings: [], myRank: null }), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			})
		);
		const request = new NextRequest(
			"http://localhost:3000/api/arcade/ranking?limit=10"
		);

		const response = await proxyArcadeRequest({
			request,
			path: "/api/arcade/ranking",
			environment: {
				BACKEND_API_URL: "https://backend.example.test",
			},
			fetchImplementation,
		});

		expect(response.status).toBe(200);
		expect(fetchImplementation).toHaveBeenCalledWith(
			new URL("https://backend.example.test/api/arcade/ranking?limit=10"),
			expect.objectContaining({
				method: "GET",
				headers: { Accept: "application/json" },
			})
		);
		expect(response.headers.get("cache-control")).toBe("no-store");
	});

	it("token이 있을 때만 Authorization 헤더를 전달한다", async () => {
		const fetchImplementation: typeof fetch = vi.fn(async () =>
			new Response(null, { status: 204 })
		);

		await proxyArcadeRequest({
			request: new NextRequest("http://localhost:3000/api/arcade/my-score"),
			path: "/api/arcade/my-score",
			accessToken: "backend-token",
			environment: { BACKEND_API_URL: "https://backend.example.test" },
			fetchImplementation,
		});

		expect(fetchImplementation).toHaveBeenCalledWith(
			new URL("https://backend.example.test/api/arcade/my-score"),
			expect.objectContaining({
				headers: {
					Accept: "application/json",
					Authorization: "Bearer backend-token",
				},
			})
		);
	});

	it("공개 응답 정제가 실패하면 backend 원문을 노출하지 않는다", async () => {
		const reportError = vi.fn(async () => undefined);
		const fetchImplementation: typeof fetch = vi.fn(async () =>
			new Response("private raw response", {
				status: 200,
				headers: { "Content-Type": "application/json" },
			})
		);

		const response = await proxyArcadeRequest({
			request: new NextRequest("http://localhost:3000/api/arcade/ranking"),
			path: "/api/arcade/ranking",
			sanitizeJson: (data) => data,
			reportError,
			environment: { BACKEND_API_URL: "https://backend.example.test" },
			fetchImplementation,
		});

		expect(response.status).toBe(502);
		expect(await response.text()).not.toContain("private raw response");
		expect(reportError).toHaveBeenCalledWith(
			expect.objectContaining({ source: "backend-parse" })
		);
	});

	it("upstream 5xx는 backend 소유로 전달하고 중복 알림하지 않는다", async () => {
		const reportError = vi.fn(async () => undefined);
		const response = await proxyArcadeRequest({
			request: new NextRequest("http://localhost:3000/api/arcade/ranking"),
			path: "/api/arcade/ranking",
			environment: { BACKEND_API_URL: "https://backend.example.test" },
			fetchImplementation: vi.fn(async () =>
				new Response(JSON.stringify({ message: "unavailable" }), { status: 503 })
			),
			reportError,
		});

		expect(response.status).toBe(503);
		expect(reportError).not.toHaveBeenCalled();
	});
});
