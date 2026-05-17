import type { SeatHierarchyResponse } from "./api";
import type { BaseInfo } from "./types";

/** diary.seat 같은 표시 문자열에서 hierarchy 옵션과 맞는 좌석 필드 추출 */
export function resolveSeatFieldsFromLabel(
	seatLabel: string,
	hierarchy: SeatHierarchyResponse
): Pick<BaseInfo, "seatZone" | "seatBlock" | "seatRow" | "seatNumber"> | null {
	const label = seatLabel.trim();
	if (!label || !hierarchy.zones?.length) return null;

	const zones = [...hierarchy.zones].sort(
		(a, b) => b.zoneName.length - a.zoneName.length
	);
	const zone = zones.find((z) => label.includes(z.zoneName));
	if (!zone) return null;

	let blockName: string | undefined;
	if (zone.blocks?.length) {
		const blocks = [...zone.blocks].sort(
			(a, b) => b.blockName.length - a.blockName.length
		);
		blockName = blocks.find((b) => label.includes(b.blockName))?.blockName;
	}

	const rows =
		zone.blocks?.length && blockName
			? zone.blocks.find((b) => b.blockName === blockName)?.rows ?? []
			: zone.rows ?? [];

	let seatRow: string | undefined;
	let seatNumber: string | undefined;

	for (const row of rows) {
		if (label.includes(row.row)) {
			seatRow = row.row;
			const numbers = [...row.numbers].sort((a, b) => b.length - a.length);
			seatNumber = numbers.find((n) => label.includes(n));
			break;
		}
	}

	if (!seatRow) {
		const rowMatch = label.match(/(\d+)\s*열/);
		if (rowMatch) {
			const candidate = `${rowMatch[1]}열`;
			if (rows.some((r) => r.row === candidate)) seatRow = candidate;
		}
	}
	if (!seatNumber) {
		const numMatch = label.match(/(\d+)\s*번/);
		if (numMatch) {
			const candidate = `${numMatch[1]}번`;
			const row = rows.find((r) => r.row === seatRow);
			if (row?.numbers.includes(candidate)) seatNumber = candidate;
		}
	}

	if (!seatRow || !seatNumber) return null;

	return {
		seatZone: zone.zoneName,
		seatBlock: blockName,
		seatRow,
		seatNumber,
	};
}
