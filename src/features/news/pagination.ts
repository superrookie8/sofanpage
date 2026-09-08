export type NewsSource = "all" | "jumpball" | "rookie" | "other";

function validTotalPages(totalPages: number | undefined): number | undefined {
	if (totalPages === undefined || totalPages < 1) return undefined;
	return Math.floor(totalPages);
}

/**
 * "전체"는 각 출처를 같은 페이지 번호로 함께 조회하므로 더 오래 남는
 * 출처의 마지막 페이지를 목록 전체의 마지막 페이지로 사용한다.
 */
export function resolveNewsTotalPages(
	source: NewsSource,
	jumpballTotalPages?: number,
	rookieTotalPages?: number,
	otherTotalPages?: number
): number | undefined {
	const jumpball = validTotalPages(jumpballTotalPages);
	const rookie = validTotalPages(rookieTotalPages);
	const other = validTotalPages(otherTotalPages);

	if (source === "jumpball") return jumpball;
	if (source === "rookie") return rookie;
	if (source === "other") return other;
	const totals = [jumpball, rookie, other].filter((value): value is number => value !== undefined);
	return totals.length ? Math.max(...totals) : undefined;
}

export function newsPageStatus(page: number, totalPages?: number): string {
	return totalPages === undefined
		? `${page} 페이지`
		: `${page} / ${totalPages} 페이지`;
}
