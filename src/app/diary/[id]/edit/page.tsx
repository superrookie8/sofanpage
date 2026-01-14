// src/app/diary/[id]/edit/page.tsx
"use client";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import { DiaryEditor } from "@/features/diary/editor/DiaryEditor";
import { useDiaryQuery } from "@/features/diary/queries";
import { useUpdateDiaryMutation } from "@/features/diary/mutations";
import { diaryEntryToDraft } from "@/features/diary/editor/utils";
import LoadingSpinner from "@/shared/ui/loadingSpinner";
import type { DiaryDraft } from "@/features/diary/editor/types";
import type { CreateDiaryRequest } from "@/features/diary/types";

export default function DiaryEditPage() {
	const params = useParams();
	const router = useRouter();
	const diaryId = params?.id as string;

	const { data: diary, isLoading, error } = useDiaryQuery(diaryId);
	const updateDiaryMutation = useUpdateDiaryMutation();

	// DiaryDraft를 CreateDiaryRequest로 변환하는 함수 (create와 동일)
	const convertDraftToRequest = (draft: DiaryDraft): CreateDiaryRequest => {
		const photoUrls = [
			draft.ticketPhoto,
			draft.viewPhoto,
			draft.additionalPhoto,
		].filter((url) => url && url.trim() !== "");

		const dateStr = draft.base.date || undefined;
		const firstPlayer =
			draft.players && draft.players.length > 0 ? draft.players[0] : null;

		const calculateFg2Percent = (made: number | "", att: number | "") => {
			if (typeof made === "number" && typeof att === "number" && att > 0) {
				return Math.round((made / att) * 100);
			}
			return null;
		};

		const calculateFg3Percent = (made: number | "", att: number | "") => {
			if (typeof made === "number" && typeof att === "number" && att > 0) {
				return Math.round((made / att) * 100);
			}
			return null;
		};

		return {
			gameId:
				draft.base.gameId && draft.base.gameId.trim()
					? draft.base.gameId
					: undefined,
			watchType:
				draft.base.watchType === "직관"
					? "DIRECT"
					: draft.base.watchType === "집관"
					? "HOUSE"
					: undefined,
			date: dateStr || undefined,
			location:
				draft.base.location && draft.base.location.trim()
					? draft.base.location
					: undefined,
			content: draft.memo && draft.memo.trim() ? draft.memo : undefined,
			photoUrls: photoUrls.length > 0 ? photoUrls : undefined,
			seatId:
				draft.base.seatId && draft.base.seatId.trim()
					? draft.base.seatId
					: undefined,
			seatRow:
				draft.base.seatRow && draft.base.seatRow.trim()
					? draft.base.seatRow
					: undefined,
			seatNumber:
				draft.base.seatNumber && draft.base.seatNumber.trim()
					? draft.base.seatNumber
					: undefined,
			gameWinner:
				draft.base.result === "승"
					? "HOME"
					: draft.base.result === "패"
					? "AWAY"
					: undefined,
			companion:
				draft.base.companions && draft.base.companions.trim()
					? draft.base.companions
							.split(",")
							.map((c) => c.trim())
							.filter((c) => c.length > 0)
					: undefined,
			mvpPlayerName:
				draft.mvp.name && draft.mvp.name.trim() ? draft.mvp.name : undefined,
			cheeredPlayerName:
				firstPlayer && firstPlayer.name && firstPlayer.name.trim()
					? firstPlayer.name
					: undefined,
			cheeredPlayerPoints:
				typeof firstPlayer?.stats.pts === "number"
					? firstPlayer.stats.pts
					: undefined,
			cheeredPlayerAssists:
				typeof firstPlayer?.stats.ast === "number"
					? firstPlayer.stats.ast
					: undefined,
			cheeredPlayerRebounds:
				typeof firstPlayer?.stats.rebOff === "number" ||
				typeof firstPlayer?.stats.rebDef === "number"
					? (typeof firstPlayer.stats.rebOff === "number"
							? firstPlayer.stats.rebOff
							: 0) +
					  (typeof firstPlayer.stats.rebDef === "number"
							? firstPlayer.stats.rebDef
							: 0)
					: undefined,
			cheeredPlayerTwoPointMade:
				typeof firstPlayer?.stats.fg2Made === "number"
					? firstPlayer.stats.fg2Made
					: undefined,
			cheeredPlayerTwoPointPercent:
				calculateFg2Percent(
					firstPlayer?.stats.fg2Made || "",
					firstPlayer?.stats.fg2Att || ""
				) ?? undefined,
			cheeredPlayerThreePointMade:
				typeof firstPlayer?.stats.fg3Made === "number"
					? firstPlayer.stats.fg3Made
					: undefined,
			cheeredPlayerThreePointPercent:
				calculateFg3Percent(
					firstPlayer?.stats.fg3Made || "",
					firstPlayer?.stats.fg3Att || ""
				) ?? undefined,
			cheeredPlayerBlocks:
				typeof firstPlayer?.stats.blk === "number"
					? firstPlayer.stats.blk
					: undefined,
			cheeredPlayerTurnovers:
				typeof firstPlayer?.stats.to === "number"
					? firstPlayer.stats.to
					: undefined,
			cheeredPlayerMemo:
				firstPlayer?.team && firstPlayer.team.trim()
					? firstPlayer.team
					: undefined,
		};
	};

	const handleSave = async (draft: DiaryDraft) => {
		const request = convertDraftToRequest(draft);
		await updateDiaryMutation.mutateAsync({
			diaryId,
			data: request,
		});
		router.push(`/diary/${diaryId}`);
	};

	const handleSaveDraft = async (draft: DiaryDraft) => {
		// TODO: 임시저장 로직 구현
		console.log("임시저장:", draft);
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<LoadingSpinner />
			</div>
		);
	}

	if (error || !diary) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<p className="text-lg mb-4">일지를 불러올 수 없습니다.</p>
					<button
						onClick={() => router.push("/diary/read")}
						className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
					>
						목록으로 돌아가기
					</button>
				</div>
			</div>
		);
	}

	const initialDraft = diaryEntryToDraft(diary);

	return (
		<DiaryEditor
			initialDraft={initialDraft}
			onSave={handleSave}
			onSaveDraft={handleSaveDraft}
		/>
	);
}
