import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import SiteFooter from "./siteFooter";

beforeEach(() => vi.stubGlobal("React", React));
afterEach(() => vi.unstubAllGlobals());

it("renders the public-site credits and an icon-only creator link", () => {
	const html = renderToStaticMarkup(React.createElement(SiteFooter));

	expect(html).toContain("<footer");
	expect(html).toContain("SUPER SOHEE");
	expect(html).toContain("농구선수 이소희 팬페이지");
	expect(html).toContain(
		"이소희 선수를 응원하며 선수 소식, 관련기사, 경기 일정과 팬이벤트를 나눕니다."
	);
	expect(html).toContain(
		"사이트에 사용된 사진, 기사 등 외부 콘텐츠의 권리는 각 원저작자에게 있습니다."
	);
	expect(html).toContain("© 2024–2026 SUPER SOHEE");
	expect(html).toContain("제작자 : ");
	expect(html).toContain('href="https://www.instagram.com/hahanana20C/"');
	expect(html).toContain('aria-label="제작자 소셜 계정"');
	expect(html).toContain('target="_blank"');
	expect(html).toContain('rel="noopener noreferrer"');
	expect(html).not.toContain("@hahanana20C");
	expect(html).not.toContain("<h1");
});
