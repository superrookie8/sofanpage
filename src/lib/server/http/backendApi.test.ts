import { describe, expect, it, vi } from "vitest";
import {
	proxyBackendRequest,
	resolveBackendApiUrl,
} from "./backendApi";

describe("server backend API resolution", () => {
	it("prefers the server-only URL before the legacy compatibility value", () => {
		expect(
			resolveBackendApiUrl({
				BACKEND_API_URL: "http://127.0.0.1:8080/",
				BACKAPI_URL: "https://legacy.example.test",
			})
		).toBe("http://127.0.0.1:8080");

		expect(
			resolveBackendApiUrl({
				BACKAPI_URL: "https://legacy.example.test/",
			})
		).toBe("https://legacy.example.test");
	});

	// NEXT_PUBLIC_ 값은 클라이언트 번들에 인라인되므로 서버 해석에서 제외한다.
	it("rejects the browser-exposed NEXT_PUBLIC_BACKAPI_URL", () => {
		expect(() =>
			resolveBackendApiUrl({
				NEXT_PUBLIC_BACKAPI_URL: "https://public.example.test",
			})
		).toThrow(/Missing server backend API configuration/);
	});
});

describe("backend response proxy", () => {
	it("passes an ordered event array through without reordering and disables cache", async () => {
		const orderedEvents = [
			{ id: "third", title: "세 번째" },
			{ id: "first", title: "첫 번째" },
			{ id: "second", title: "두 번째" },
		];
		const fetchImplementation: typeof fetch = vi.fn(async () =>
			new Response(JSON.stringify(orderedEvents), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			})
		);

		const response = await proxyBackendRequest({
			path: "/api/events",
			requestUrl: "http://localhost:3000/api/events",
			environment: { BACKEND_API_URL: "http://127.0.0.1:8080" },
			fetchImplementation,
		});

		expect(await response.json()).toEqual(orderedEvents);
		expect(fetchImplementation).toHaveBeenCalledOnce();
		expect(fetchImplementation).toHaveBeenCalledWith(
			new URL("http://127.0.0.1:8080/api/events"),
			expect.objectContaining({ cache: "no-store", method: "GET" })
		);
		expect(response.headers.get("cache-control")).toBe("no-store");
	});

	it("preserves an upstream error status and response body", async () => {
		const fetchImplementation: typeof fetch = vi.fn(async () =>
			new Response(JSON.stringify({ message: "temporarily unavailable" }), {
				status: 503,
				headers: { "Content-Type": "application/json" },
			})
		);

		const response = await proxyBackendRequest({
			path: "/api/events/event-6",
			environment: { BACKEND_API_URL: "http://127.0.0.1:8080" },
			fetchImplementation,
		});

		expect(response.status).toBe(503);
		expect(await response.json()).toEqual({
			message: "temporarily unavailable",
		});
	});
});
