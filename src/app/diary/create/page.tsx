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
		// gameId는 반드시 필요함 (URL 파라미터 또는 draft에서)
		const gameId = gameIdFromUrl || draft.base.gameId;
		
		if (!gameId || !gameId.trim()) {
			alert("경기 정보가 없습니다. 다시 시도해주세요.");
			return;
		}

		// DiaryDraft를 CreateDiaryRequest로 변환
		// 사진 R2 key들을 배열로 합치기 (빈 문자열 제외)
		const photoUrls = [
			draft.ticketPhoto,
			draft.viewPhoto,
			draft.additionalPhoto,
		].filter((url) => url && url.trim() !== "");

		// 날짜와 시간을 합쳐서 date 필드에 저장 (YYYY-MM-DD 형식)
		const dateStr = draft.base.date || undefined;

		// 첫 번째 선수 정보 추출 (백엔드가 단일 선수만 지원하는 경우)
		const firstPlayer =
			draft.players && draft.players.length > 0 ? draft.players[0] : null;

		// 2점 야투율 계산
		const calculateFg2Percent = (made: number | "", att: number | "") => {
			if (typeof made === "number" && typeof att === "number" && att > 0) {
				return Math.round((made / att) * 100);
			}
			return null;
		};

		// 3점 야투율 계산
		const calculateFg3Percent = (made: number | "", att: number | "") => {
			if (typeof made === "number" && typeof att === "number" && att > 0) {
				return Math.round((made / att) * 100);
			}
			return null;
		};

		// 빈 값은 undefined로 처리 (API 문서: 모든 필드 nullable)
		const request: CreateDiaryRequest = {
			// 기본 정보 - gameId는 반드시 전달
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

			// 좌석 정보
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

			// 경기 정보
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

			// MVP 정보
			mvpPlayerName:
				draft.mvp.name && draft.mvp.name.trim() ? draft.mvp.name : undefined,

			// 응원 선수 정보 (첫 번째 선수만)
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
		
		// 백엔드에서 일지 아이디가 반환되는지 확인
		if (!result || !result.id) {
			alert("일지가 생성되었지만 일지 ID를 받지 못했습니다. 일지 목록 페이지로 이동합니다.");
			router.push("/diary/read");
			return;
		}
		
		// 일지 상세 페이지로 이동
		router.push(`/diary/${result.id}`);
	};

	const handleSaveDraft = async (draft: DiaryDraft) => {
		// TODO: 임시저장 로직 구현
		console.log("임시저장:", draft);
	};

	// gameId가 없으면 경고하고 리다이렉트
	if (!gameIdFromUrl) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<p className="text-red-500 text-lg mb-4">
						경기 정보가 없습니다.
					</p>
					<button
						onClick={() => router.push("/schedule")}
						className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
					>
						경기 일정으로 돌아가기
					</button>
				</div>
			</div>
		);
	}

	return (
		<DiaryEditor
			initialDraft={{
				base: {
					gameId: gameIdFromUrl,
				},
			}}
			onSave={handleSave}
			onSaveDraft={handleSaveDraft}
		/>
	);
}
