import { atom } from "recoil";

export interface DiaryPhotoData {
	id: string;
	preview: string;
	originalFile: File;
	compressedFile: File;
	uploadTime: string;
	url: string;
}

export const ticketPreviewState = atom<DiaryPhotoData[]>({
	key: "ticketPreviewState",
	default: [],
});

export const viewPreviewState = atom<DiaryPhotoData[]>({
	key: "viewPreviewState",
	default: [],
});

export const additionalPreviewState = atom<DiaryPhotoData[]>({
	key: "additionalPreviewState",
	default: [],
});

export const DiaryPhotoPreviewState = atom<DiaryPhotoData[]>({
	key: "DiaryPhotoPreviewState",
	default: [],
});
