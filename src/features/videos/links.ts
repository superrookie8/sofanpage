import { VIDEO_CATEGORIES, type VideoFilter, type VideoSort } from "./types";

export function youtubeId(value: string): string | null {
	const input = value.trim();
	if (/^[A-Za-z0-9_-]{11}$/.test(input)) return input;
	try {
		const url = new URL(input);
		if (url.protocol !== "https:" || url.username || url.password || url.port) return null;
		let id: string | null = null;
		if (url.hostname === "youtu.be") id = url.pathname.slice(1);
		if (["www.youtube.com", "youtube.com", "m.youtube.com"].includes(url.hostname)) {
			if (url.pathname === "/watch") id = url.searchParams.get("v");
			else if (/^\/(shorts|embed|live)\/[^/]+\/?$/.test(url.pathname)) id = url.pathname.split("/")[2];
		}
		return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
	} catch { return null; }
}

export function parseVideoFilter(value: string | null): VideoFilter {
	return value && Object.hasOwn(VIDEO_CATEGORIES, value) ? value as VideoFilter : "all";
}

export function videoPageHref(category: VideoFilter, sort: VideoSort, page = 1): string {
	const params = new URLSearchParams();
	if (category !== "all") params.set("category", category);
	if (sort !== "recent") params.set("sort", sort);
	if (page > 1) params.set("page", String(page));
	return `/videos${params.size ? `?${params}` : ""}`;
}

export function videoQuery(params: URLSearchParams): URLSearchParams | null {
	const category = params.get("category") ?? "all";
	const sort = params.get("sort") ?? "recent";
	const page = params.get("page") ?? "0";
	const limit = params.get("limit") ?? "12";
	if ((category !== "all" && !Object.hasOwn(VIDEO_CATEGORIES, category)) || !["recent", "focused"].includes(sort) || !/^\d+$/.test(page) || Number(page) > 999999 || !/^\d+$/.test(limit) || Number(limit) < 1 || Number(limit) > 100) return null;
	return new URLSearchParams({ category, sort, page: String(Number(page)), limit: String(Number(limit)) });
}
