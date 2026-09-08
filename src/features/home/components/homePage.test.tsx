import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import HomePage from "./homePage";

vi.mock("./hero", () => ({ default: () => null }));
vi.mock("@/features/stats/components/seasonStats", () => ({ default: () => null }));
vi.mock("./nextGameSection", () => ({ default: () => null }));
vi.mock("./latestNewsSection", () => ({
	default: () => null,
	MoreNewsLink: () => null,
}));
vi.mock(
	"@/features/international-results/components/internationalResultsSection",
	() => ({ default: () => null })
);

beforeEach(() => vi.stubGlobal("React", React));
afterEach(() => vi.unstubAllGlobals());

it("keeps one home-only h1 without duplicating the footer introduction", () => {
	const html = renderToStaticMarkup(React.createElement(HomePage));

	expect(html.match(/<h1/g)).toHaveLength(1);
	expect(html).toContain('id="fanpage-title"');
	expect(html).toContain('class="sr-only"');
	expect(html).toContain("농구선수 이소희 팬페이지 슈퍼소희(SUPER SOHEE)");
	expect(html).not.toContain(
		"이소희 선수를 응원하며 선수 소식, 관련기사, 경기 일정과 팬이벤트를 나눕니다."
	);
});
