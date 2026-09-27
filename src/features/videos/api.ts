import type { VideoFilter, VideoPage, VideoSort } from "./types";

export async function fetchVideoPage(category: VideoFilter, sort: VideoSort, page: number): Promise<VideoPage> {
	const query = new URLSearchParams({ category, sort, page: String(page - 1), limit: "12" });
	const response = await fetch(`/api/videos?${query}`);
	if (!response.ok) throw new Error("영상을 불러오지 못했습니다.");
	const body = await response.json();
	if (!Array.isArray(body.videos) || !Number.isInteger(body.totalPages) || body.totalPages < 0) throw new Error("영상 응답을 확인할 수 없습니다.");
	return body;
}
