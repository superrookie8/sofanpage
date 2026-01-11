export interface PhotoData {
	id: string;
	preview: string;
	originalFile: File;
	compressedFile: File;
	uploadTime: string;
}

// Recoil atom은 더 이상 사용하지 않음
// export const photoPreviewState = atom<PhotoData[]>({
// 	key: "photoPreviewState",
// 	default: [],
// });
