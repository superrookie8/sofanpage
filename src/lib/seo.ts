import type { Metadata } from "next";

// The public host currently redirects www to this apex domain.
export const SITE_URL = "https://supersohee.com";
export const SITE_NAME = "SUPER SOHEE";
export const SITE_TITLE = "슈퍼소희 | 농구선수 이소희 팬페이지 SUPER SOHEE";
export const SITE_DESCRIPTION = "농구선수 이소희를 응원하는 팬페이지 슈퍼소희(SUPER SOHEE). 선수 소식, 관련 기사, 경기 일정과 팬 이벤트를 만나보세요.";
export const SOCIAL_IMAGE = "/images/2026-27_profile.JPG";

export const PUBLIC_PAGES = [
	{ path: "/", title: SITE_TITLE, description: SITE_DESCRIPTION },
	{ path: "/news", title: "이소희 선수 뉴스", description: "점프볼, 루키와 여러 매체의 농구선수 이소희 관련 기사를 모아보세요." },
	{ path: "/schedule", title: "경기 일정", description: "이소희 선수의 경기 일정과 경기 결과를 확인하세요." },
	{ path: "/events", title: "팬 이벤트", description: "이소희 선수와 함께한 팬 이벤트와 응원 기록을 만나보세요." },
	{ path: "/events/5th", title: "5주년 팬 이벤트", description: "이소희 선수의 5주년 팬 이벤트 기록입니다." },
	{ path: "/events/6th", title: "6주년 팬 이벤트", description: "이소희 선수의 6주년 팬 이벤트 기록입니다." },
	{ path: "/arcade", title: "아케이드", description: "SUPER SOHEE 팬페이지의 농구 게임을 즐겨보세요." },
] as const;

export function pageMetadata(path: string): Metadata {
	const page = PUBLIC_PAGES.find((entry) => entry.path === path);
	if (!page) throw new Error("Unknown public page");
	return {
		title: path === "/" ? { absolute: page.title } : page.title,
		description: page.description,
		alternates: { canonical: page.path },
		openGraph: { type: "website", locale: "ko_KR", siteName: SITE_NAME, title: page.title, description: page.description, url: page.path, images: [{ url: SOCIAL_IMAGE, alt: "농구선수 이소희" }] },
		twitter: { card: "summary_large_image", title: page.title, description: page.description, images: [SOCIAL_IMAGE] },
	};
}
