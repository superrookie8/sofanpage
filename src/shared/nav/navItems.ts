import { isMvpDisabledPage } from "@/features/mvp/accessPolicy";

export type NavIconName =
	| "home"
	| "news"
	| "events"
	| "arcade"
	| "schedule"
	| "diary"
	| "guestbook"
	| "me";

export interface NavItem {
	href: string;
	label: string;
	icon: NavIconName;
	/** 모바일 하단 탭 후보 우선순위 (낮을수록 우선) */
	tabPriority: number;
}

/**
 * 사이트 전체 내비게이션의 단일 소스.
 *
 * MVP 단계에서 비공개인 항목(직관 일기·방명록·마이페이지 등)은 하드코딩으로
 * 지우지 않고 `accessPolicy`로 걸러낸다. 미들웨어가 막는 경로와 메뉴가
 * 어긋나지 않으며, 공개 시점에 accessPolicy만 고치면 메뉴가 따라온다.
 */
const ALL_NAV_ITEMS: readonly NavItem[] = [
	{ href: "/home", label: "홈", icon: "home", tabPriority: 0 },
	{ href: "/news", label: "뉴스", icon: "news", tabPriority: 1 },
	{ href: "/schedule", label: "스케줄", icon: "schedule", tabPriority: 2 },
	{ href: "/events", label: "이벤트", icon: "events", tabPriority: 4 },
	{ href: "/arcade", label: "아케이드", icon: "arcade", tabPriority: 5 },
	{ href: "/diary/read", label: "직관 일기", icon: "diary", tabPriority: 3 },
	{ href: "/guestbooks/read", label: "방명록", icon: "guestbook", tabPriority: 6 },
	{ href: "/mypage", label: "나", icon: "me", tabPriority: 3 },
] as const;

function enabledItems(): NavItem[] {
	return ALL_NAV_ITEMS.filter((item) => !isMvpDisabledPage(item.href));
}

/** 데스크톱 상단 메뉴 · 모바일 햄버거. 마이페이지는 계정 영역에서 따로 다룬다. */
export function getNavItems(): NavItem[] {
	return enabledItems().filter((item) => item.href !== "/mypage");
}

export function isMyPageEnabled() {
	return enabledItems().some((item) => item.href === "/mypage");
}

/** 모바일 하단 탭. 최대 5개까지만 노출한다. */
export function getBottomTabs(): NavItem[] {
	return enabledItems()
		.slice()
		.sort((a, b) => a.tabPriority - b.tabPriority)
		.slice(0, 5);
}

/**
 * 다크 셸을 쓰는 경로 (이벤트 목록·아케이드).
 * /events/5th, /events/6th는 기존 커스텀 아트워크를 그대로 유지해야 하므로 제외한다.
 */
export function isDarkShellPath(pathname: string | null | undefined) {
	if (!pathname) return false;
	if (/^\/events\/[^/]+/.test(pathname)) return false;
	return pathname.startsWith("/events") || pathname.startsWith("/arcade");
}

export function isNavItemActive(pathname: string | null, href: string) {
	if (!pathname) return false;
	// "/diary/read" 같은 항목은 섹션 루트 기준으로 활성 판정한다.
	const section = `/${href.split("/").filter(Boolean)[0] ?? ""}`;
	return pathname === section || pathname.startsWith(`${section}/`);
}
