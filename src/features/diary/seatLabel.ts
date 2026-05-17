import type { DiaryEntry } from "./types";
import type { BaseInfo } from "./editor/types";

/** GET 일지 응답 → 화면용 좌석 문구 (diary.seat 우선) */
export function formatDiarySeatLabel(
	diary: Pick<
		DiaryEntry,
		"seat" | "seatInfo" | "seatRow" | "seatNumber" | "seat_info"
	>
): string | null {
	if (diary.seat?.trim()) return diary.seat.trim();

	const info = diary.seatInfo;
	if (info) {
		const parts = [info.zoneName, info.blockName, info.row, info.number].filter(
			Boolean
		);
		if (parts.length > 0) return parts.join(" ");
	}

	if (diary.seatRow?.trim() && diary.seatNumber?.trim()) {
		return `${diary.seatRow.trim()} ${diary.seatNumber.trim()}`;
	}

	if (diary.seat_info) {
		const parts = [
			diary.seat_info.section,
			diary.seat_info.row,
			diary.seat_info.number,
		].filter(Boolean);
		if (parts.length > 0) return parts.join(" ");
	}

	return null;
}

/** 편집 폼 base → 표시용 좌석 문구 */
export function formatBaseSeatLabel(
	base: Pick<
		BaseInfo,
		"seatLabel" | "seatZone" | "seatBlock" | "seatRow" | "seatNumber"
	>
): string | null {
	if (base.seatLabel?.trim()) return base.seatLabel.trim();
	const parts = [
		base.seatZone,
		base.seatBlock,
		base.seatRow,
		base.seatNumber,
	].filter(Boolean);
	return parts.length > 0 ? parts.join(" ") : null;
}
