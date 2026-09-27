import { afterEach, describe, expect, it, vi } from "vitest";
import { youtubeId, videoPageHref, videoQuery } from "./links";
import approved from "./approved-videos.json";
import { fetchVideoPage } from "./api";

afterEach(() => vi.unstubAllGlobals());
describe("YouTube links and approved collection", () => {
	it.each(["4ysSdioqf5U", "https://youtu.be/4ysSdioqf5U?t=20", "https://www.youtube.com/watch?v=4ysSdioqf5U&list=123", "https://m.youtube.com/shorts/4ysSdioqf5U", "https://youtube.com/live/4ysSdioqf5U"])("parses %s", (input) => {
		expect(youtubeId(input)).toBe("4ysSdioqf5U");
	});
	it.each(["https://youtube.com.evil.test/watch?v=4ysSdioqf5U", "https://youtube.com@evil.test/watch?v=4ysSdioqf5U", "javascript:alert(1)", "https://youtu.be/4ysSdioqf5U/extra", "https://www.youtube.com/watch?v=short", "https://www.youtube.com:8080/watch?v=4ysSdioqf5U", "https://user@youtube.com/watch?v=4ysSdioqf5U"])("rejects %s", (input) => {
		expect(youtubeId(input)).toBeNull();
	});
	it("keeps the approved 27 and excludes the 12 removed interviews and commentary", () => {
		expect(approved).toHaveLength(27);
		expect(new Set(approved.map((v) => v.id)).size).toBe(27);
		const excludedIds = new Set(["SHTsExQNwDE", "6ht3cK8HhJs", "Uv9ne7b0rWY", "NgXz2aTgL_A", "B5p9eIBYIEA", "18VKUawDbJE", "Gi9dAgJiqc8", "EuO7-yvzgBo", "LzffVRerPwg", "8xrj2L8In0A", "iYJNycqG1LU", "C1K05wKuGxo"]);
		expect(approved.filter((v) => excludedIds.has(v.id))).toEqual([]);
		expect(approved.filter((v) => v.leeFocused)).toHaveLength(6);
		approved.forEach((v, index) => {
			expect(youtubeId(v.id)).toBe(v.id);
			expect(v.displayOrder).toBe(index);
			expect(v.published).toBe(true);
			expect(v.channelName.length).toBeGreaterThan(0);
			expect(v.duration === null || /^(?:[0-9]+:)?[0-9]+:[0-5][0-9]$/.test(v.duration)).toBe(true);
		});
	});
	it("keeps category and sorting on page navigation", () => {
		expect(videoPageHref("highlights", "focused", 2)).toBe("/videos?category=highlights&sort=focused&page=2");
		expect(videoPageHref("all", "recent")).toBe("/videos");
		expect(videoQuery(new URLSearchParams("category=__proto__"))).toBeNull();
		expect(videoQuery(new URLSearchParams("limit=101"))).toBeNull();
	});
	it("keeps public API failure visible instead of using a static fallback", async () => {
		vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 500 })));
		await expect(fetchVideoPage("all", "recent", 1)).rejects.toThrow();
		expect(fetch).toHaveBeenCalledWith("/api/videos?category=all&sort=recent&page=0&limit=12");
	});
});
