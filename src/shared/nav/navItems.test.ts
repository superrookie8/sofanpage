import { describe, expect, it } from "vitest";
import {
	getBottomTabs,
	getNavItems,
	isMyPageEnabled,
} from "./navItems";

/**
 * 마이페이지는 getNavItems()에서 일부러 빠진다("계정 영역에서 따로 다룬다").
 * 계정 영역이 그걸 실제로 노출하지 않으면 데스크톱에서 도달할 길이 사라지므로,
 * 두 규칙을 함께 고정한다.
 */
describe("마이페이지 진입점", () => {
	it("메뉴 목록에는 넣지 않는다", () => {
		expect(getNavItems().map((item) => item.href)).not.toContain("/mypage");
	});

	it("계정 영역이 참조할 수 있도록 공개 여부를 알려준다", () => {
		expect(isMyPageEnabled()).toBe(true);
	});

	it("모바일 하단 탭에는 노출한다", () => {
		expect(getBottomTabs().map((item) => item.href)).toContain("/mypage");
	});

	// 데스크톱 헤더와 모바일 햄버거 두 곳 모두에서 도달할 수 있어야 한다.
	it("헤더 계정 영역과 햄버거 메뉴가 모두 마이페이지로 연결한다", async () => {
		const source = await import("node:fs").then((fs) =>
			fs.readFileSync(
				new URL("../ui/shell/header.tsx", import.meta.url),
				"utf-8"
			)
		);
		expect(source).toMatch(/isMyPageEnabled/);
		expect(source.match(/href="\/mypage"/g) ?? []).toHaveLength(2);
	});
});

describe("MVP 비공개 항목", () => {
	it("직관 일기와 방명록은 어느 메뉴에도 나오지 않는다", () => {
		const hrefs = [...getNavItems(), ...getBottomTabs()].map((i) => i.href);
		expect(hrefs.some((href) => href.startsWith("/diary"))).toBe(false);
		expect(hrefs.some((href) => href.startsWith("/guestbooks"))).toBe(false);
	});
});
