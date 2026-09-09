import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import SiteFooter from "./siteFooter";

beforeEach(() => vi.stubGlobal("React", React));
afterEach(() => vi.unstubAllGlobals());

function renderFooter(dark = false) {
	return renderToStaticMarkup(React.createElement(SiteFooter, { dark }));
}

it("renders the public-site credits and an icon-only creator link", () => {
	const html = renderFooter();

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
	expect(html).toContain('href="/privacy"');
	expect(html).toContain("개인정보처리방침");
	expect(html).toContain('href="/terms"');
	expect(html).toContain("이용약관");
	expect(html).toContain("제작자 : ");
	expect(html).toContain('href="https://www.instagram.com/hahanana20C/"');
	expect(html).toContain('aria-label="제작자 소셜 계정"');
	expect(html).toContain('target="_blank"');
	expect(html).toContain('rel="noopener noreferrer"');
	expect(html).not.toContain("@hahanana20C");
	expect(html).not.toContain("<h1");
});

it("uses a flat top divider instead of a boxed card", () => {
	const html = renderFooter();
	const footerClasses = html.match(/<footer class="([^"]+)"/)?.[1] ?? "";

	expect(footerClasses).toContain("border-t");
	expect(footerClasses).toContain("border-ink-200");
	expect(footerClasses).not.toContain("rounded");
	expect(footerClasses).not.toContain("bg-white");
	expect(footerClasses).not.toContain("shadow");
	expect(footerClasses).not.toContain("border border-");
});

it("switches text, dividers, and the icon control to dark-shell contrast", () => {
	const html = renderFooter(true);
	const footerClasses = html.match(/<footer class="([^"]+)"/)?.[1] ?? "";

	expect(footerClasses).toContain("border-ink-700");
	expect(html).toContain("text-white");
	expect(html).toContain("text-ink-300");
	expect(html).toContain("bg-transparent");
	expect(html).toContain('href="/privacy"');
	expect(html).toContain('href="/terms"');
	expect(footerClasses).not.toContain("bg-white");
});
