import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchOtherNews, sourceLabel } from "./api";

afterEach(() => vi.unstubAllGlobals());
describe("other news", () => {
	it("preserves article fields and translates the source and page", async () => {
		const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ articles: [{ id: "n1", title: "이소희 월드컵", source: "other", url: "https://example.com/news/1", publishedAt: "2026-09-08T12:00:00" }], total: 1, totalPages: 1, hasNext: false, hasPrevious: false })));
		vi.stubGlobal("fetch", fetchMock);
		const result = await fetchOtherNews(2, 8);
		expect(fetchMock).toHaveBeenCalledWith("/api/news/other?page=1&limit=8");
		expect(result.articles[0]).toMatchObject({ id: "n1", source: "그외", url: "https://example.com/news/1" });
		expect(result.totalPages).toBe(1);
	});
	it("surfaces unavailable source errors instead of presenting an empty list", async () => {
		vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status: 503 })));
		await expect(fetchOtherNews(1, 8)).rejects.toThrow("503");
		expect(sourceLabel("other")).toBe("그외");
	});
});
