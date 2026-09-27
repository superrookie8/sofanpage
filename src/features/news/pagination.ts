export type NewsSource = "all" | "jumpball" | "rookie" | "other";

export function parseNewsSource(value: string | null): NewsSource {
	return value === "jumpball" || value === "rookie" || value === "other" ? value : "all";
}

export function parseNewsPage(value: string | null): number {
	return value && /^[1-9]\d*$/.test(value) && Number(value) <= 1_000_000 ? Number(value) : 1;
}

export function newsPageHref(source: NewsSource, page: number): string {
	const params = new URLSearchParams();
	if (source !== "all") params.set("source", source);
	if (page > 1) params.set("page", String(page));
	return `/news${params.size ? `?${params}` : ""}`;
}

export function newsPageNumbers(page: number, total: number): Array<number | "gap"> {
	if (!Number.isInteger(total) || total < 1) return [];
	if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
	const visible = new Set([1, total, page - 1, page, page + 1]);
	if (page <= 3) [2, 3, 4].forEach((n) => visible.add(n));
	if (page >= total - 2) [total - 3, total - 2, total - 1].forEach((n) => visible.add(n));
	const result: Array<number | "gap"> = [];
	let previous = 0;
	for (const n of [...visible].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b)) {
		if (previous && n > previous + 1) result.push("gap");
		result.push(n);
		previous = n;
	}
	return result;
}

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
