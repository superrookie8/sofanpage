// src/app/diary/create/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { DiaryEditor } from "@/features/diary/editor/DiaryEditor";
import { ExistingDiaryDialog } from "@/features/diary/editor/components/ExistingDiaryDialog";
import { useCreateDiaryMutation } from "@/features/diary/mutations";
import { findExistingDiary } from "@/features/diary/utils/findExistingDiary";
import type { DiaryDraft } from "@/features/diary/editor/types";
import { pickSeatFieldsForRequest } from "@/features/diary/editor/utils";
import type { CreateDiaryRequest } from "@/features/diary/types";
import { getApiErrorMessage } from "@/lib/http/getApiErrorMessage";
import LoadingSpinner from "@/shared/ui/loadingSpinner";
import { isAxiosError } from "axios";

export default function DiaryCreatePage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { data: session } = useSession();
	const createDiaryMutation = useCreateDiaryMutation();

	const gameIdFromUrl = searchParams.get("gameId");
	const [existingDiaryId, setExistingDiaryId] = useState<string | null>(null);
	const [urlCheckDone, setUrlCheckDone] = useState(!gameIdFromUrl);

	useEffect(() => {
		if (!gameIdFromUrl) {
			setUrlCheckDone(true);
			return;
		}
		if (!session) return;

		let cancelled = false;
		(async () => {
			const existing = await findExistingDiary({ gameId: gameIdFromUrl });
			if (!cancelled) {
				if (existing) {
					setExistingDiaryId(existing.diaryId);
				}
				setUrlCheckDone(true);
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [gameIdFromUrl, session]);

	const handleConfirmEdit = () => {
		if (existingDiaryId) {
			router.push(`/diary/${existingDiaryId}/edit`);
		}
		setExistingDiaryId(null);
	};

	const handleCancelEdit = () => {
		setExistingDiaryId(null);
		if (gameIdFromUrl) {
			router.replace("/diary/create");
		}
	};

	const handleSave = async (draft: DiaryDraft) => {
		const gameId = gameIdFromUrl || draft.base.gameId;

		if (!gameId || !gameId.trim()) {
			alert("경기를 선택해주세요.");
			return;
		}

		const trimmedGameId = gameId.trim();
		const dateStr = draft.base.date || undefined;

		const existing = await findExistingDiary({ gameId: trimmedGameId });
		if (existing) {
			setExistingDiaryId(existing.diaryId);
			return;
		}

		const photoUrls = [
			draft.ticketPhoto,
			draft.viewPhoto,
			draft.additionalPhoto,
		].filter((url) => url && url.trim() !== "");

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
			gameId: trimmedGameId,
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
			...pickSeatFieldsForRequest(draft.base),
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

		try {
			const result = await createDiaryMutation.mutateAsync(request);

			if (!result || !result.id) {
				alert(
					"일지가 생성되었지만 일지 ID를 받지 못했습니다. 일지 목록 페이지로 이동합니다."
				);
				router.push("/diary/read");
				return;
			}

			router.push(`/diary/${result.id}`);
		} catch (error) {
			if (isAxiosError(error) && error.response?.status === 409) {
				const again = await findExistingDiary({ gameId: trimmedGameId });
				if (again) {
					setExistingDiaryId(again.diaryId);
					return;
				}
			}
			throw new Error(
				getApiErrorMessage(error, "일지 저장에 실패했습니다.")
			);
		}
	};

	const handleSaveDraft = async (draft: DiaryDraft) => {
		console.log("임시저장:", draft);
	};

	const showEditor =
		urlCheckDone && !(gameIdFromUrl && existingDiaryId);

	if (!urlCheckDone) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<LoadingSpinner />
			</div>
		);
	}

	return (
		<>
			<ExistingDiaryDialog
				open={!!existingDiaryId}
				onConfirm={handleConfirmEdit}
				onCancel={handleCancelEdit}
			/>
			{showEditor && (
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
			)}
		</>
	);
}
