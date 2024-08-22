import { atom } from "recoil";

export interface DiaryPhotoData {
	id: string;
	preview: string;
	originalFile: File;
	compressedFile: File;
	uploadTime: string;
}

export const DiaryPhotoPreviewState = atom<DiaryPhotoData[]>({
	key: "DiaryPhotoPreviewState",
	default: [], // 기본값을 빈 배열로 설정
});
