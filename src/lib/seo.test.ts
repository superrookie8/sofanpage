import { describe, expect, it } from "vitest";
import { PUBLIC_PAGES, SITE_URL, pageMetadata } from "./seo";
import sitemap from "@/app/sitemap";
import robots from "@/app/robots";

describe("public SEO contract", () => {
	it("gives each published page its own canonical and social URL", () => {
		for (const page of PUBLIC_PAGES) {
			const metadata = pageMetadata(page.path);
			expect(metadata.alternates?.canonical).toBe(page.path);
			expect(metadata.openGraph?.url).toBe(page.path);
		}
	});
	it("advertises only canonical public pages, excluding aliases and account URLs", () => {
		const urls = sitemap().map((entry) => entry.url);
		expect(new Set(urls).size).toBe(urls.length);
		expect(urls).toContain(`${SITE_URL}/`);
		for (const path of ["/home", "/login", "/mypage", "/diary", "/unavailable"]) expect(urls).not.toContain(`${SITE_URL}${path}`);
		expect(robots().sitemap).toBe(`${SITE_URL}/sitemap.xml`);
	});
});
