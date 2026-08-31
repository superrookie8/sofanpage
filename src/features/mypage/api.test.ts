import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchUserInfo } from "./api";

afterEach(() => {
	vi.unstubAllGlobals();
});

describe("fetchUserInfo", () => {
	it("users/me의 표준 profileImageUrl 필드를 그대로 소비한다", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(async () =>
				new Response(
					JSON.stringify({
						nickname: "팬",
						profileImageUrl: "https://images.example.test/profile.webp",
						createdAt: "2026-09-01T00:00:00",
					}),
					{ status: 200 }
				)
			)
		);

		await expect(fetchUserInfo()).resolves.toMatchObject({
			nickname: "팬",
			profileImageUrl: "https://images.example.test/profile.webp",
		});
	});
});
