// src/app/diary/create/page.tsx
"use client";
import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DiaryEditor } from "@/features/diary/editor/DiaryEditor";
import { useCreateDiaryMutation } from "@/features/diary/mutations";
import type { DiaryDraft } from "@/features/diary/editor/types";
import type { CreateDiaryRequest } from "@/features/diary/types";

export default function DiaryCreatePage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const createDiaryMutation = useCreateDiaryMutation();

	const gameIdFromUrl = searchParams.get("gameId");

	const handleSave = async (draft: DiaryDraft) => {
		const gameId = gameIdFromUrl || draft.base.gameId;

		if (!gameId || !gameId.trim()) {
			alert("경기를 선택해주세요.");
			return;
		}

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

		const request: CreateDiaryRequest = {
			gameId: gameId.trim(),
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

		const result = await createDiaryMutation.mutateAsync(request);

		if (!result || !result.id) {
			alert(
				"일지가 생성되었지만 일지 ID를 받지 못했습니다. 일지 목록 페이지로 이동합니다."
			);
			router.push("/diary/read");
			return;
		}

		router.push(`/diary/${result.id}`);
	};

	const handleSaveDraft = async (draft: DiaryDraft) => {
		console.log("임시저장:", draft);
	};

	return (
		<DiaryEditor
			gameIdLocked={Boolean(gameIdFromUrl)}
			initialDraft={{
				base: {
					...(gameIdFromUrl ? { gameId: gameIdFromUrl } : {}),
				},
			}}
			onSave={handleSave}
			onSaveDraft={handleSaveDraft}
		/>
	);
}
