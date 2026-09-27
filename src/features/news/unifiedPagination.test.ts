import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { fetchNewsPage } from "./api";
import { newsPageHref, newsPageNumbers, parseNewsPage, parseNewsSource } from "./pagination";
import { GET } from "@/app/api/news/route";

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
describe("unified news navigation", () => {
	it("restores source/page from shareable URLs and resets a new source to page one", () => {
		const url = new URL(newsPageHref("other", 23), "https://supersohee.com");
		expect(parseNewsPage(url.searchParams.get("page"))).toBe(23);
		expect(parseNewsSource(url.searchParams.get("source"))).toBe("other");
		expect(newsPageHref("rookie", 1)).toBe("/news?source=rookie");
		expect(newsPageHref("all", 1)).toBe("/news");
		for (const invalid of [null, "0", "-1", "1.5", "Infinity", "1000001"]) expect(parseNewsPage(invalid)).toBe(1);
		expect(parseNewsSource("unknown")).toBe("all");
	});
	it("keeps first/last and neighboring pages reachable on long archives", () => {
		expect(newsPageNumbers(1, 200)).toEqual([1, 2, 3, 4, "gap", 200]);
		expect(newsPageNumbers(80, 200)).toEqual([1, "gap", 79, 80, 81, "gap", 200]);
		expect(newsPageNumbers(200, 200)).toEqual([1, "gap", 197, 198, 199, 200]);
		expect(newsPageNumbers(3, 3)).toEqual([1, 2, 3]);
		expect(newsPageNumbers(1, 0)).toEqual([]);
	});
	it("uses a single global backend page, preserving the exact order and total", async () => {
		vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ articles: [{ id: "a", source: "other" }, { id: "b", source: "jumpball" }], total: 140, totalPages: 18 }))));
		const result = await fetchNewsPage("all", 2, 8);
		expect(fetch).toHaveBeenCalledWith("/api/news?page=1&limit=8");
		expect(result.articles.map((a) => a.id)).toEqual(["a", "b"]);
		expect(result.totalPages).toBe(18);
		expect(result.articles[0].source).toBe("그외");
	});
	it("does not hide failed or malformed responses as empty results", async () => {
		vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(new Response("{}", { status: 503 })).mockResolvedValueOnce(new Response("{}")));
		await expect(fetchNewsPage("all", 1, 8)).rejects.toThrow();
		await expect(fetchNewsPage("other", 1, 8)).rejects.toThrow();
	});
	it("validates BFF parameters before forwarding and preserves backend errors", async () => {
		vi.stubEnv("BACKEND_API_URL", "https://backend.example");
		vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 503 })));
		expect((await GET(new NextRequest("https://supersohee.com/api/news?page=-1"))).status).toBe(400);
		expect(fetch).not.toHaveBeenCalled();
		expect((await GET(new NextRequest("https://supersohee.com/api/news?page=2&limit=8&source=other"))).status).toBe(503);
		expect(fetch).toHaveBeenCalledWith("https://backend.example/api/articles?page=2&limit=8&source=other", expect.objectContaining({ cache: "no-store" }));
	});
});
