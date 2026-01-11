// src/app/diary/create/page.tsx
"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { DiaryEditor } from "@/features/diary/editor/DiaryEditor";
import { useCreateDiaryMutation } from "@/features/diary/mutations";
import type { DiaryDraft } from "@/features/diary/editor/types";
import type { CreateDiaryRequest } from "@/features/diary/types";

export default function DiaryCreatePage() {
	const router = useRouter();
	const createDiaryMutation = useCreateDiaryMutation();

	const handleSave = async (draft: DiaryDraft) => {
		// DiaryDraft를 CreateDiaryRequest로 변환
		// 사진 R2 key들을 배열로 합치기 (빈 문자열 제외)
		const photoUrls = [
			draft.ticketPhoto,
			draft.viewPhoto,
			draft.additionalPhoto,
		].filter((url) => url && url.trim() !== "");

		const request: CreateDiaryRequest = {
			watchType: draft.base.watchType === "직관" ? "DIRECT" : "HOUSE",
			content: draft.memo,
			photoUrls,
			seatId: draft.base.seatId,
			gameWinner:
				draft.base.result === "승"
					? "HOME"
					: draft.base.result === "패"
					? "AWAY"
					: undefined,
			companion: draft.base.companions
				? draft.base.companions.split(",").map((c) => c.trim())
				: undefined,
			// TODO: gameId 등 추가 필드 매핑 필요
		};

		await createDiaryMutation.mutateAsync(request);
		router.push("/diary/read");
	};

	const handleSaveDraft = async (draft: DiaryDraft) => {
		// TODO: 임시저장 로직 구현
		console.log("임시저장:", draft);
	};

	return <DiaryEditor onSave={handleSave} onSaveDraft={handleSaveDraft} />;
}
