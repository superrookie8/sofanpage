import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({ params: new URLSearchParams(), query: vi.fn() }));
vi.mock("next/navigation", () => ({ useSearchParams: () => state.params, useRouter: () => ({ replace: vi.fn() }) }));
vi.mock("./queries", () => ({ useNewsPageQuery: state.query }));
import NewsPage from "./components/newsPage";

beforeEach(() => {
	vi.stubGlobal("React", React);
	state.params = new URLSearchParams();
	state.query.mockReturnValue({ isSuccess: true, isError: false, isLoading: false, data: { articles: [{ id: "1", title: "테스트 첫 기사", url: "https://example.com/first", source: "그외", publishedAt: "2026-09-27", imageUrl: "" }, { id: "2", title: "테스트 둘째 기사", url: "https://example.com/second", source: "루키", publishedAt: "2026-09-26", imageUrl: "" }], totalPages: 12, total: 96 }, refetch: vi.fn() });
});
afterEach(() => { vi.unstubAllGlobals(); vi.clearAllMocks(); });
describe("news archive rendering", () => {
	it("features only the first article on page one without duplicating its link", () => {
		const html = renderToStaticMarkup(<NewsPage />);
		expect(html.match(/href="https:\/\/example.com\/first"/g)).toHaveLength(1);
		expect(html).toContain("최신"); expect(html).toContain('rel="next"');
		expect(html).not.toContain('rel="prev"');
	});
	it("restores page two with previous/next links and no repeated featured article", () => {
		state.params = new URLSearchParams("page=2&source=other");
		const html = renderToStaticMarkup(<NewsPage />);
		expect(state.query).toHaveBeenCalledWith("other", 2, 8);
		expect(html.match(/<a[^>]*rel="prev"[^>]*>/)?.[0]).toContain('href="/news?source=other"');
		expect(html.match(/<a[^>]*rel="next"[^>]*>/)?.[0]).toContain('href="/news?source=other&amp;page=3"');
		expect(html).toContain('aria-current="page"');
		expect(html).not.toContain("최신"); expect(html).not.toContain("더 보기");
	});
	it("does not offer a next page beyond the final page", () => {
		state.params = new URLSearchParams("page=12");
		const html = renderToStaticMarkup(<NewsPage />);
		expect(html).toContain('rel="prev"'); expect(html).not.toContain('rel="next"');
	});
});
