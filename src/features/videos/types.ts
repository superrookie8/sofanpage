export const VIDEO_CATEGORIES = {
	highlights: "경기 하이라이트", interviews: "인터뷰·뉴스", behind: "현장·시상식", shorts: "쇼츠",
} as const;
export type VideoCategory = keyof typeof VIDEO_CATEGORIES;
export type VideoFilter = VideoCategory | "all";
export type VideoSort = "recent" | "focused";
export interface VideoInput {
	id: string;
	title: string;
	channelName: string;
	category: VideoCategory;
	eventDate: string | null;
	eventKey: string | null;
	eventLabel: string;
	eventDateBasis: string | null;
	leeFocused: boolean;
	displayOrder: number;
	published: boolean;
	duration: string | null;
	badge: string | null;
	verifiedOn: string | null;
	thumbnailUrl: string | null;
}
export interface Video extends VideoInput {
	url: string;
	thumbnailUrl: string;
	createdAt: string;
	updatedAt: string;
}
export interface VideoPage {
	videos: Video[]; total: number; page: number; limit: number; totalPages: number; hasNext: boolean; hasPrevious: boolean;
}
