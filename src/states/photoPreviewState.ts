import { atom } from "recoil";

export interface PhotoData {
	id: string;
	preview: string;
	originalFile: File;
	compressedFile: File;
	uploadTime: string;
}

export const photoPreviewState = atom<PhotoData[]>({
	key: "photoPreviewState",
	default: [], // 기본값을 빈 배열로 설정
});
