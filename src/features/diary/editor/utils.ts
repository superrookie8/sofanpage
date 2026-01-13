// src/features/diary/editor/utils.ts
import type { DiaryEntry } from "@/features/diary/types";
import type { DiaryDraft, PlayerStats } from "./types";

export function uid(): string {
	return Math.random().toString(36).slice(2, 9);
}

export function pct(made: number | "", att: number | ""): string {
	if (made === "" || att === "") return "—";
	if (att === 0) return "0%";
	const v = Math.round((made / att) * 100);
	return `${v}%`;
}

// DiaryEntry를 DiaryDraft로 변환하는 함수
export function diaryEntryToDraft(diary: DiaryEntry): Partial<DiaryDraft> {
	// 날짜 파싱 (YYYY-MM-DD 형식에서 date와 time 분리)
	const dateStr = diary.date || diary.createdAt || "";
	const date = dateStr ? dateStr.split("T")[0] : "";
	const time = dateStr && dateStr.includes("T")
		? dateStr.split("T")[1]?.substring(0, 5) || ""
		: "";

	// 사진 URL에서 R2 key 추출 (Presigned URL이면 key만 추출, 아니면 그대로 사용)
	const extractR2Key = (url: string | undefined): string => {
		if (!url) return "";
		// Presigned URL에서 key 추출 또는 그대로 반환
		return url;
	};

	const photoUrls = diary.photoUrls || [];
	const ticketPhoto = extractR2Key(
		photoUrls[0] || diary.diary_photos?.ticket_photo
	);
	const viewPhoto = extractR2Key(
		photoUrls[1] || diary.diary_photos?.view_photo
	);
	const additionalPhoto = extractR2Key(
		photoUrls[2] || diary.diary_photos?.additional_photo
	);

	// 응원 선수 정보를 PlayerStats로 변환
	const players: PlayerStats[] = [];
	if (diary.cheeredPlayerName) {
		// 리바운드를 공격/수비로 분리 (백엔드에는 총합만 있음)
		const totalRebounds = diary.cheeredPlayerRebounds || 0;
		const rebOff = Math.floor(totalRebounds / 2); // 대략적인 분배
		const rebDef = totalRebounds - rebOff;

		// 2점/3점 시도 계산 (야투율과 성공으로 역산)
		const fg2Att =
			diary.cheeredPlayerTwoPointMade !== undefined &&
			diary.cheeredPlayerTwoPointPercent !== undefined &&
			diary.cheeredPlayerTwoPointPercent > 0
				? Math.round(
						(diary.cheeredPlayerTwoPointMade * 100) /
							diary.cheeredPlayerTwoPointPercent
				  )
				: "";

		const fg3Att =
			diary.cheeredPlayerThreePointMade !== undefined &&
			diary.cheeredPlayerThreePointPercent !== undefined &&
			diary.cheeredPlayerThreePointPercent > 0
				? Math.round(
						(diary.cheeredPlayerThreePointMade * 100) /
							diary.cheeredPlayerThreePointPercent
				  )
				: "";

		players.push({
			id: uid(),
			name: diary.cheeredPlayerName,
			team: diary.cheeredPlayerMemo || "",
			stats: {
				pts: diary.cheeredPlayerPoints ?? "",
				fg2Made: diary.cheeredPlayerTwoPointMade ?? "",
				fg2Att: fg2Att,
				fg3Made: diary.cheeredPlayerThreePointMade ?? "",
				fg3Att: fg3Att,
				rebOff: rebOff,
				rebDef: rebDef,
				ast: diary.cheeredPlayerAssists ?? "",
				stl: "",
				blk: diary.cheeredPlayerBlocks ?? "",
				to: diary.cheeredPlayerTurnovers ?? "",
			},
		});
	}

	return {
		base: {
			date,
			time,
			location: diary.location || "",
			stadiumId: diary.gameId || "",
			watchType: diary.watchType === "DIRECT" ? "직관" : "집관",
			companions: diary.companion?.join(", ") || "",
			result: diary.gameWinner === "HOME" ? "승" : "패",
			seatId: diary.seatId || "",
			seatRow: diary.seatRow || diary.seat_info?.row || "",
			seatNumber: diary.seatNumber || diary.seat_info?.number || "",
		},
		mvp: {
			name: diary.mvpPlayerName || "",
			reason: "", // 백엔드에 reason 필드가 없음
		},
		players,
		highlights: {
			overtime: false,
			injury: false,
			referee: false,
			bestMood: false,
			worstMood: false,
			custom: "",
		},
		ticketPhoto,
		viewPhoto,
		additionalPhoto,
		memo: diary.content || diary.diary_message || "",
	};
}
