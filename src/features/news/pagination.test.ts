import { describe, expect, it } from "vitest";
import { newsPageStatus, resolveNewsTotalPages } from "./pagination";

describe("resolveNewsTotalPages", () => {
	it("uses the selected source total", () => {
		expect(resolveNewsTotalPages("jumpball", 4, 9)).toBe(4);
		expect(resolveNewsTotalPages("rookie", 4, 9)).toBe(9);
	});

	it("uses the longer source for the combined list", () => {
		expect(resolveNewsTotalPages("all", 4, 9)).toBe(9);
	});

	it("falls back to the available source total", () => {
		expect(resolveNewsTotalPages("all", undefined, 3)).toBe(3);
		expect(resolveNewsTotalPages("all", 2, 0)).toBe(2);
	});
});

describe("newsPageStatus", () => {
	it("includes the total when the API provides it", () => {
		expect(newsPageStatus(2, 7)).toBe("2 / 7 페이지");
	});

	it("still identifies the current page without a total", () => {
		expect(newsPageStatus(2)).toBe("2 페이지");
	});
});
