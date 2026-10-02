import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION } from "@/lib/seo";

// 홈 화면에 추가했을 때 주소창 없이 앱처럼 열리게 한다.
export default function manifest(): MetadataRoute.Manifest {
	return {
		id: "/",
		name: "슈퍼소희 SUPER SOHEE",
		short_name: "슈퍼소희",
		description: SITE_DESCRIPTION,
		start_url: "/",
		scope: "/",
		display: "standalone",
		background_color: "#17151a",
		theme_color: "#17151a",
		lang: "ko",
		icons: [
			{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
			{ src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
			{ src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
		],
		shortcuts: [
			{ name: "경기 일정", url: "/schedule", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
			{ name: "뉴스", url: "/news", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
			{ name: "영상", url: "/videos", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
		],
	};
}
