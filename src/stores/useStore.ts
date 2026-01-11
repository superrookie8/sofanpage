// Zustand store 예시
// 전역 상태 관리가 필요한 경우 이 파일을 참고하여 사용하세요

import { create } from "zustand";

// 예시: 사진 미리보기 전역 상태가 필요한 경우
interface PhotoPreviewStore {
	photos: string[];
	addPhoto: (photo: string) => void;
	removePhoto: (index: number) => void;
	clearPhotos: () => void;
}

export const usePhotoPreviewStore = create<PhotoPreviewStore>((set) => ({
	photos: [],
	addPhoto: (photo) =>
		set((state) => ({
			photos: [...state.photos, photo],
		})),
	removePhoto: (index) =>
		set((state) => ({
			photos: state.photos.filter((_, i) => i !== index),
		})),
	clearPhotos: () => set({ photos: [] }),
}));

// 예시: 페이지 상태가 전역으로 필요한 경우
type PageState = "default" | "photoAndText";

interface PageStore {
	pageState: PageState;
	setPageState: (state: PageState) => void;
}

export const usePageStore = create<PageStore>((set) => ({
	pageState: "default",
	setPageState: (state) => set({ pageState: state }),
}));

// 사용 예시:
// import { usePhotoPreviewStore } from "@/stores/useStore";
// const { photos, addPhoto, clearPhotos } = usePhotoPreviewStore();

